"""
Stage 3: Causal DAG Discovery.
  - Skeleton recovery via conditional independence tests (simplified PC)
  - Edge orientation via Granger causality
  - Edge weight estimation via Average Causal Effect (back-door adjustment)
"""

import numpy as np
import pandas as pd
from scipy import stats
from itertools import combinations
from typing import Dict, List, Any, Tuple, Set
import networkx as nx


def _partial_correlation(data: np.ndarray, i: int, j: int, cond: List[int]) -> Tuple[float, float]:
    """Compute partial correlation between columns i and j given conditioning set."""
    if len(cond) == 0:
        r, p = stats.spearmanr(data[:, i], data[:, j])
        return float(r), float(p)

    # Regress out conditioning variables
    X_cond = data[:, cond]

    # Residualize i
    from numpy.linalg import lstsq
    coef_i, _, _, _ = lstsq(X_cond, data[:, i], rcond=None)
    res_i = data[:, i] - X_cond @ coef_i

    # Residualize j
    coef_j, _, _, _ = lstsq(X_cond, data[:, j], rcond=None)
    res_j = data[:, j] - X_cond @ coef_j

    r, p = stats.spearmanr(res_i, res_j)
    return float(r), float(p)


def _pc_skeleton(data: np.ndarray, col_names: List[str], alpha: float = 0.05) -> nx.Graph:
    """Recover undirected skeleton using PC algorithm with conditional independence tests."""
    n_vars = data.shape[1]
    G = nx.complete_graph(n_vars)

    # Iteratively test conditional independence at increasing depths
    max_depth = min(3, n_vars - 2)

    for depth in range(max_depth + 1):
        edges_to_remove = []

        for i, j in list(G.edges()):
            # Get adjacency set (neighbors minus i and j)
            adj_i = set(G.neighbors(i)) - {j}

            if len(adj_i) < depth:
                continue

            # Test all conditioning subsets of size `depth`
            from itertools import combinations as comb
            found_independent = False

            subsets = list(comb(adj_i, depth)) if depth > 0 else [()]
            for subset in subsets:
                cond = list(subset)
                r, p = _partial_correlation(data, i, j, cond)

                if p > alpha:
                    edges_to_remove.append((i, j))
                    found_independent = True
                    break

            if found_independent:
                continue

        for edge in edges_to_remove:
            if G.has_edge(*edge):
                G.remove_edge(*edge)

    # Relabel nodes
    mapping = {i: col_names[i] for i in range(n_vars)}
    G = nx.relabel_nodes(G, mapping)

    return G


def _granger_test(x: np.ndarray, y: np.ndarray, max_lag: int = 5) -> Tuple[float, float, int]:
    """
    Test if x Granger-causes y.
    Returns (F-statistic, p-value, best_lag).
    """
    n = len(x)
    if n < max_lag * 3:
        max_lag = max(1, n // 3)

    best_p = 1.0
    best_f = 0.0
    best_lag = 1

    for lag in range(1, max_lag + 1):
        if n - lag < lag * 2 + 2:
            continue

        # Restricted model: y_t ~ y_{t-1}, ..., y_{t-lag}
        Y = y[lag:]
        X_restricted = np.column_stack([y[lag - k: n - k] for k in range(1, lag + 1)])

        # Unrestricted model: y_t ~ y_{t-1},...,y_{t-lag}, x_{t-1},...,x_{t-lag}
        X_unrestricted = np.column_stack([
            X_restricted,
            *[x[lag - k: n - k].reshape(-1, 1) for k in range(1, lag + 1)]
        ])

        # Add intercept
        ones = np.ones((len(Y), 1))
        X_r = np.hstack([ones, X_restricted])
        X_u = np.hstack([ones, X_unrestricted])

        try:
            from numpy.linalg import lstsq

            beta_r, _, _, _ = lstsq(X_r, Y, rcond=None)
            rss_r = np.sum((Y - X_r @ beta_r) ** 2)

            beta_u, _, _, _ = lstsq(X_u, Y, rcond=None)
            rss_u = np.sum((Y - X_u @ beta_u) ** 2)

            df1 = lag
            df2 = len(Y) - X_u.shape[1]

            if df2 <= 0 or rss_u <= 0:
                continue

            f_stat = ((rss_r - rss_u) / df1) / (rss_u / df2)
            p_value = 1 - stats.f.cdf(f_stat, df1, df2)

            if p_value < best_p:
                best_p = p_value
                best_f = f_stat
                best_lag = lag
        except Exception:
            continue

    return float(best_f), float(best_p), best_lag


def _estimate_ace(
    data: pd.DataFrame,
    cause: str,
    effect: str,
    adjustment_set: List[str],
) -> float:
    """
    Estimate Average Causal Effect via back-door adjustment
    using linear regression with the adjustment set.
    """
    if len(adjustment_set) == 0:
        # Simple regression
        x = data[cause].values
        y = data[effect].values
        valid = np.isfinite(x) & np.isfinite(y)
        if valid.sum() < 5:
            return 0.0
        r, _ = stats.pearsonr(x[valid], y[valid])
        # Standardized effect
        return float(r)

    # Multiple regression: effect ~ cause + adjustment_set
    cols = [cause] + adjustment_set
    sub = data[cols + [effect]].dropna()

    if len(sub) < len(cols) + 2:
        return 0.0

    X = sub[cols].values
    y = sub[effect].values

    # Standardize
    X_std = (X - X.mean(axis=0)) / (X.std(axis=0) + 1e-10)
    y_std = (y - y.mean()) / (y.std() + 1e-10)

    ones = np.ones((len(y_std), 1))
    X_full = np.hstack([ones, X_std])

    try:
        from numpy.linalg import lstsq
        beta, _, _, _ = lstsq(X_full, y_std, rcond=None)
        # The coefficient for the cause variable (index 1)
        return float(beta[1])
    except Exception:
        return 0.0


def discover_causal_dag(
    df: pd.DataFrame,
    metric_cols: List[str],
    alpha: float = 0.05,
) -> Dict[str, Any]:
    """
    Discover causal DAG from data.

    Args:
        df: Input dataframe.
        metric_cols: Numerical columns to include in the DAG.
        alpha: Significance level for independence tests.

    Returns:
        Dictionary with nodes, edges (with weights), and adjacency info.
    """
    # Prepare clean data matrix
    data = df[metric_cols].dropna()
    if len(data) < 20:
        return {"nodes": metric_cols, "edges": [], "adjacency": {}}

    data_matrix = data.values

    # Standardize
    means = data_matrix.mean(axis=0)
    stds = data_matrix.std(axis=0)
    stds[stds < 1e-10] = 1.0
    data_std = (data_matrix - means) / stds

    # Stage 1: PC Skeleton
    skeleton = _pc_skeleton(data_std, metric_cols, alpha=alpha)

    # Stage 2: Orient edges via Granger causality
    directed_edges = []
    for u, v in skeleton.edges():
        u_idx = metric_cols.index(u)
        v_idx = metric_cols.index(v)

        x_u = data_std[:, u_idx]
        x_v = data_std[:, v_idx]

        f_uv, p_uv, lag_uv = _granger_test(x_u, x_v)
        f_vu, p_vu, lag_vu = _granger_test(x_v, x_u)

        if p_uv < alpha and p_vu >= alpha:
            # u -> v
            directed_edges.append((u, v, p_uv, lag_uv))
        elif p_vu < alpha and p_uv >= alpha:
            # v -> u
            directed_edges.append((v, u, p_vu, lag_vu))
        elif p_uv < alpha and p_vu < alpha:
            # Both significant — pick stronger
            if f_uv > f_vu:
                directed_edges.append((u, v, p_uv, lag_uv))
            else:
                directed_edges.append((v, u, p_vu, lag_vu))
        else:
            # Neither significant — use correlation direction
            r, _ = stats.pearsonr(data[u].values, data[v].values)
            if abs(r) > 0.1:
                directed_edges.append((u, v, 0.1, 1))

    # Build directed graph and check for cycles
    dag = nx.DiGraph()
    dag.add_nodes_from(metric_cols)

    for cause, effect, p_val, lag in directed_edges:
        if not nx.has_path(dag, effect, cause):  # Prevent cycles
            dag.add_edge(cause, effect, p_value=p_val, lag=lag)

    # Stage 3: Estimate ACE weights
    edges_with_weights = []
    for cause, effect in dag.edges():
        # Adjustment set: parents of effect in DAG, excluding cause
        parents = list(dag.predecessors(effect))
        adjustment = [p for p in parents if p != cause]

        ace = _estimate_ace(data, cause, effect, adjustment)
        dag[cause][effect]["weight"] = abs(ace)
        dag[cause][effect]["ace"] = ace

        edges_with_weights.append({
            "source": cause,
            "target": effect,
            "weight": round(abs(float(ace)), 4),
            "ace": round(float(ace), 4),
            "p_value": round(float(dag[cause][effect].get("p_value", 0)), 6),
        })

    # Build adjacency for frontend
    adjacency = {}
    for node in metric_cols:
        adjacency[node] = {
            "parents": list(dag.predecessors(node)),
            "children": list(dag.successors(node)),
        }

    return {
        "nodes": metric_cols,
        "edges": edges_with_weights,
        "adjacency": adjacency,
        "n_edges": len(edges_with_weights),
    }
