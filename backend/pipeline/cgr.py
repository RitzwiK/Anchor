"""
Causal Grounding Rate (CGR) Verification.
Extracts causal assertions from generated narratives and checks
them against the discovered causal DAG.
"""

import re
from typing import Dict, List, Any, Tuple
from difflib import SequenceMatcher


# Causal linguistic patterns: (regex, cause_group, effect_group)
CAUSAL_PATTERNS = [
    (r"(\w[\w\s]*?)\s+(?:caused|causes)\s+(?:a\s+)?(?:the\s+)?(\w[\w\s]*?)(?:\.|,|;)", 1, 2),
    (r"(\w[\w\s]*?)\s+(?:led to|leads to)\s+(?:a\s+)?(?:the\s+)?(\w[\w\s]*?)(?:\.|,|;)", 1, 2),
    (r"(\w[\w\s]*?)\s+(?:drove|drives|driving)\s+(?:a\s+)?(?:the\s+)?(\w[\w\s]*?)(?:\.|,|;)", 1, 2),
    (r"(?:due to|because of)\s+(\w[\w\s]*?),?\s+(\w[\w\s]*?)(?:\s+(?:decreased|increased|dropped|rose|fell|spiked))", 1, 2),
    (r"(\w[\w\s]*?)\s*(?:→|->)\s*(\w[\w\s]*?)(?:\s|,|\.|;|\()", 1, 2),
    (r"(\w[\w\s]*?)\s+(?:contributed to|contributes to)\s+(?:a\s+)?(?:the\s+)?(\w[\w\s]*?)(?:\.|,|;)", 1, 2),
    (r"(\w[\w\s]*?)\s+(?:resulted in|results in)\s+(?:a\s+)?(?:the\s+)?(\w[\w\s]*?)(?:\.|,|;)", 1, 2),
    (r"(\w[\w\s]*?)\s+(?:impacted|impacts|affecting|affected)\s+(?:the\s+)?(\w[\w\s]*?)(?:\.|,|;)", 1, 2),
    (r"(\w[\w\s]*?)\s+(?:exerting a.*?causal effect on)\s+(\w[\w\s]*?)(?:\.|,|;)", 1, 2),
    (r"(\w[\w\s]*?)\s+(?:is a.*?driver of|is the.*?driver of)\s+(\w[\w\s]*?)(?:\.|,|;)", 1, 2),
]


def _fuzzy_match(text: str, candidates: List[str], threshold: float = 0.6) -> str | None:
    """Find best matching node name from candidates."""
    text_lower = text.strip().lower()

    # Exact substring match first
    for c in candidates:
        if c.lower() in text_lower or text_lower in c.lower():
            return c

    # Fuzzy match
    best_match = None
    best_score = 0.0

    for c in candidates:
        # Compare with different representations
        score = SequenceMatcher(None, text_lower, c.lower()).ratio()

        # Also try without underscores/spaces
        c_clean = c.lower().replace("_", " ").replace("-", " ")
        t_clean = text_lower.replace("_", " ").replace("-", " ")
        score2 = SequenceMatcher(None, t_clean, c_clean).ratio()

        best_s = max(score, score2)
        if best_s > best_score and best_s >= threshold:
            best_score = best_s
            best_match = c

    return best_match


def extract_causal_assertions(
    narrative: str,
    node_names: List[str],
) -> List[Dict[str, str]]:
    """
    Extract causal assertions from narrative text.

    Args:
        narrative: Generated text to analyze.
        node_names: List of valid node names from the DAG.

    Returns:
        List of extracted assertions as {cause, effect, raw_text}.
    """
    assertions = []
    seen = set()

    for pattern, cause_grp, effect_grp in CAUSAL_PATTERNS:
        matches = re.finditer(pattern, narrative, re.IGNORECASE)

        for match in matches:
            cause_text = match.group(cause_grp).strip()
            effect_text = match.group(effect_grp).strip()

            # Map to DAG nodes
            cause_node = _fuzzy_match(cause_text, node_names)
            effect_node = _fuzzy_match(effect_text, node_names)

            if cause_node and effect_node and cause_node != effect_node:
                key = (cause_node, effect_node)
                if key not in seen:
                    seen.add(key)
                    assertions.append({
                        "cause": cause_node,
                        "effect": effect_node,
                        "raw_text": match.group(0).strip(),
                    })

    return assertions


def _has_directed_path(
    adjacency: Dict[str, Any],
    source: str,
    target: str,
    max_depth: int = 3,
) -> bool:
    """Check if a directed path exists from source to target in the DAG."""
    visited = set()

    def _dfs(node: str, depth: int) -> bool:
        if depth > max_depth:
            return False
        if node == target:
            return True
        if node in visited:
            return False

        visited.add(node)
        children = adjacency.get(node, {}).get("children", [])
        for child in children:
            if _dfs(child, depth + 1):
                return True
        return False

    return _dfs(source, 0)


def compute_cgr(
    narrative: str,
    dag: Dict[str, Any],
    max_path_depth: int = 3,
) -> Dict[str, Any]:
    """
    Compute Causal Grounding Rate for a generated narrative.

    Args:
        narrative: The generated text to evaluate.
        dag: Output from discover_causal_dag().
        max_path_depth: Maximum path length for indirect matches.

    Returns:
        CGR score and detailed assertion-level results.
    """
    node_names = dag.get("nodes", [])
    edges = dag.get("edges", [])
    adjacency = dag.get("adjacency", {})

    # Build edge set for direct matching
    edge_set = set()
    for edge in edges:
        edge_set.add((edge["source"], edge["target"]))

    # Extract assertions
    assertions = extract_causal_assertions(narrative, node_names)

    if len(assertions) == 0:
        return {
            "cgr": 1.0,  # No claims made = vacuously grounded
            "total_assertions": 0,
            "grounded": 0,
            "ungrounded": 0,
            "details": [],
            "note": "No causal assertions detected in narrative.",
        }

    grounded = 0
    details = []

    for assertion in assertions:
        cause = assertion["cause"]
        effect = assertion["effect"]

        # Check direct edge
        is_direct = (cause, effect) in edge_set

        # Check indirect path
        is_indirect = False
        if not is_direct:
            is_indirect = _has_directed_path(
                adjacency, cause, effect, max_path_depth
            )

        is_grounded = is_direct or is_indirect

        if is_grounded:
            grounded += 1

        details.append({
            "cause": cause,
            "effect": effect,
            "raw_text": assertion["raw_text"],
            "grounded": is_grounded,
            "match_type": "direct" if is_direct else ("indirect" if is_indirect else "ungrounded"),
        })

    cgr = grounded / len(assertions) if len(assertions) > 0 else 1.0

    return {
        "cgr": round(cgr, 4),
        "total_assertions": len(assertions),
        "grounded": grounded,
        "ungrounded": len(assertions) - grounded,
        "details": details,
    }
