"""
Stage 4: Backward Root-Cause Tracing.
Given an anomalous target node, walks backward through DAG parents
to identify and rank root causes by contribution score.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Any


def _compute_deviation(
    df: pd.DataFrame,
    col: str,
    anomaly_indices: List[int],
    window: int = 30,
) -> float:
    """Compute percentage deviation of a variable during anomaly window vs baseline."""
    values = df[col].values

    if len(anomaly_indices) == 0:
        return 0.0

    # Anomaly window values
    anom_vals = values[anomaly_indices]
    anom_mean = np.nanmean(anom_vals)

    # Baseline: everything outside anomaly window
    all_indices = set(range(len(values)))
    baseline_indices = list(all_indices - set(anomaly_indices))

    if len(baseline_indices) == 0:
        return 0.0

    baseline_mean = np.nanmean(values[baseline_indices])

    if abs(baseline_mean) < 1e-10:
        return 0.0

    deviation = ((anom_mean - baseline_mean) / abs(baseline_mean)) * 100
    return float(deviation)


def trace_root_causes(
    dag: Dict[str, Any],
    anomalies: Dict[str, Any],
    df: pd.DataFrame,
    target_metric: str,
    max_depth: int = 3,
) -> Dict[str, Any]:
    """
    Backward root-cause tracing through the causal DAG.

    Args:
        dag: Output from discover_causal_dag().
        anomalies: Output from detect_anomalies().
        df: Original dataframe.
        target_metric: The anomalous KPI to trace from.
        max_depth: Maximum backward tracing depth.

    Returns:
        Ranked root causes with causal paths and contribution scores.
    """
    adjacency = dag.get("adjacency", {})
    edges = dag.get("edges", [])

    # Build weight lookup
    weight_lookup = {}
    for edge in edges:
        key = (edge["source"], edge["target"])
        weight_lookup[key] = edge["weight"]

    # Get anomaly indices for the target metric
    target_anomalies = anomalies.get(target_metric, {}).get("anomalies", [])
    anomaly_indices = [a["index"] for a in target_anomalies]

    if len(anomaly_indices) == 0:
        return {
            "target": target_metric,
            "root_causes": [],
            "paths": [],
            "anomaly_summary": None,
        }

    # Summarize the anomaly
    severities = [a["severity"] for a in target_anomalies]
    deviations = [a["pct_deviation"] for a in target_anomalies]
    anomaly_summary = {
        "metric": target_metric,
        "n_anomalies": len(target_anomalies),
        "avg_severity": round(float(np.mean(severities)), 3),
        "avg_deviation_pct": round(float(np.mean(deviations)), 2),
        "direction": "drop" if np.mean(deviations) < 0 else "spike",
        "top_dates": [a["date"] for a in target_anomalies[:5]],
    }

    # Backward BFS through parents
    root_causes = []
    paths = []
    visited = set()

    def _trace(node: str, current_path: List[str], depth: int):
        if depth > max_depth:
            return
        if node in visited:
            return

        visited.add(node)
        parents = adjacency.get(node, {}).get("parents", [])

        if len(parents) == 0 and len(current_path) > 1:
            # Leaf node in backward direction — this is a root cause
            paths.append(list(current_path))
            return

        for parent in parents:
            edge_weight = weight_lookup.get((parent, node), 0.0)
            deviation = _compute_deviation(df, parent, anomaly_indices)

            # Contribution score = causal weight * normalized deviation
            all_parent_devs = []
            for p in parents:
                d = abs(_compute_deviation(df, p, anomaly_indices))
                all_parent_devs.append(d)

            total_dev = sum(all_parent_devs)
            norm_dev = abs(deviation) / total_dev if total_dev > 0 else 0.0

            contribution = edge_weight * norm_dev

            root_causes.append({
                "variable": parent,
                "target_node": node,
                "edge_weight": round(edge_weight, 4),
                "deviation_pct": round(deviation, 2),
                "contribution_score": round(contribution, 4),
                "path": " → ".join(current_path + [parent]),
                "depth": depth,
            })

            _trace(parent, current_path + [parent], depth + 1)

        visited.discard(node)

    _trace(target_metric, [target_metric], 1)

    # Deduplicate and rank by contribution score
    seen = set()
    unique_causes = []
    for rc in root_causes:
        key = (rc["variable"], rc["target_node"])
        if key not in seen:
            seen.add(key)
            unique_causes.append(rc)

    unique_causes.sort(key=lambda x: x["contribution_score"], reverse=True)

    # Collect unique paths
    unique_paths = []
    path_set = set()
    for p in paths:
        p_str = " → ".join(p)
        if p_str not in path_set:
            path_set.add(p_str)
            unique_paths.append(p)

    return {
        "target": target_metric,
        "root_causes": unique_causes[:10],  # Top 10
        "paths": unique_paths,
        "anomaly_summary": anomaly_summary,
    }
