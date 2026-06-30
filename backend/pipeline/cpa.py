"""
Stage 5: Causal Prompt Anchoring (CPA).
Constructs the three-block prompt (Graph Serialisation, Root-Cause Evidence,
Generation Constraint) and generates the causally grounded narrative via LLM.
"""

import os
import json
from typing import Dict, Any, Optional


def _build_block_a(dag: Dict[str, Any]) -> str:
    """Block A: Causal Graph Serialisation."""
    lines = ["CAUSAL_GRAPH:"]
    edges = dag.get("edges", [])

    if len(edges) == 0:
        lines.append("  (No causal edges discovered)")
        return "\n".join(lines)

    for edge in sorted(edges, key=lambda e: e["weight"], reverse=True):
        lines.append(
            f"  {edge['source']} -> {edge['target']} "
            f"[weight={edge['weight']}, ace={edge['ace']}]"
        )

    return "\n".join(lines)


def _build_block_b(root_causes: Dict[str, Any]) -> str:
    """Block B: Root-Cause Evidence."""
    summary = root_causes.get("anomaly_summary")
    if summary is None:
        return "ANOMALY: No anomalies detected."

    lines = [
        f"ANOMALY: {summary['metric']} showed a {summary['direction']} "
        f"of {abs(summary['avg_deviation_pct']):.1f}% "
        f"(avg severity: {summary['avg_severity']:.2f}, "
        f"n={summary['n_anomalies']} anomalous points)",
        f"Top anomaly dates: {', '.join(summary['top_dates'][:5])}",
        "",
        "ROOT_CAUSES (ranked by contribution score):",
    ]

    causes = root_causes.get("root_causes", [])
    for i, rc in enumerate(causes[:8], 1):
        lines.append(
            f"  {i}. {rc['variable']} -> {rc['target_node']}"
        )
        lines.append(
            f"     contribution={rc['contribution_score']:.4f}, "
            f"edge_weight={rc['edge_weight']:.4f}, "
            f"deviation={rc['deviation_pct']:+.1f}%"
        )
        lines.append(f"     path: {rc['path']}")

    return "\n".join(lines)


BLOCK_C = """CONSTRAINT: You are an expert business analyst generating an anomaly explanation.

STRICT RULES:
1. Every causal claim you make MUST correspond to an edge listed in CAUSAL_GRAPH above.
2. Do NOT invent causal relationships not present in the graph.
3. Cite edge weights where relevant to show strength of causal effect.
4. If you cannot explain an aspect using the graph, explicitly state "Insufficient causal evidence exists to attribute this to [factor]."
5. Use precise numbers from the ROOT_CAUSES data (deviation percentages, contribution scores).
6. Structure your response as:
   - SUMMARY: One-sentence overview of the anomaly
   - CAUSAL ANALYSIS: Walk through root causes in order of contribution score, citing DAG edges
   - CONFIDENCE: State which attributions are strongest and which have weaker evidence
7. Keep the explanation under 250 words.
8. Write for a business audience: clear, no jargon, actionable insight.
9. Do not use em-dashes; write in plain, direct sentences."""


def build_cpa_prompt(
    dag: Dict[str, Any],
    root_causes: Dict[str, Any],
) -> str:
    """
    Construct the full CPA prompt from three blocks.

    Args:
        dag: Output from discover_causal_dag().
        root_causes: Output from trace_root_causes().

    Returns:
        Complete CPA prompt string.
    """
    block_a = _build_block_a(dag)
    block_b = _build_block_b(root_causes)

    prompt = f"""{block_a}

{block_b}

{BLOCK_C}"""

    return prompt


async def generate_cpa_narrative(
    dag: Dict[str, Any],
    root_causes: Dict[str, Any],
    api_key: Optional[str] = None,
    model: str = "gpt-4o-mini",
) -> Dict[str, Any]:
    """
    Generate a causally grounded narrative using the CPA prompt.

    Args:
        dag: Output from discover_causal_dag().
        root_causes: Output from trace_root_causes().
        api_key: OpenAI API key (falls back to env var).
        model: LLM model to use.

    Returns:
        Dictionary with the generated narrative and metadata.
    """
    prompt = build_cpa_prompt(dag, root_causes)

    key = api_key or os.getenv("OPENAI_API_KEY", "")

    if not key:
        # Fallback: generate a template-based narrative without LLM
        return _fallback_narrative(root_causes, prompt)

    try:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=key)

        response = await client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a business analytics expert. "
                        "Generate anomaly explanations strictly grounded "
                        "in the provided causal graph. Never fabricate "
                        "causal relationships."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=800,
        )

        narrative = response.choices[0].message.content

        return {
            "narrative": narrative,
            "model": model,
            "prompt_tokens": response.usage.prompt_tokens,
            "completion_tokens": response.usage.completion_tokens,
            "cpa_prompt": prompt,
            "method": "llm",
        }

    except Exception as e:
        result = _fallback_narrative(root_causes, prompt)
        result["error"] = str(e)
        return result


def _fallback_narrative(
    root_causes: Dict[str, Any],
    prompt: str,
) -> Dict[str, Any]:
    """Generate a template-based narrative when no LLM API key is available."""
    summary = root_causes.get("anomaly_summary")
    causes = root_causes.get("root_causes", [])

    if summary is None:
        narrative = "No anomalies were detected in the target metric."
        return {
            "narrative": narrative,
            "model": "template-fallback",
            "prompt_tokens": 0,
            "completion_tokens": 0,
            "cpa_prompt": prompt,
            "method": "fallback",
        }

    # Build template narrative
    parts = []

    # Summary
    parts.append(
        f"SUMMARY: {summary['metric']} experienced a significant "
        f"{summary['direction']} of {abs(summary['avg_deviation_pct']):.1f}% "
        f"across {summary['n_anomalies']} data points, with an average "
        f"severity score of {summary['avg_severity']:.2f}."
    )

    # Causal analysis
    parts.append("\nCAUSAL ANALYSIS:")
    if len(causes) == 0:
        parts.append(
            "No validated causal drivers were identified in the discovered "
            "causal graph. Insufficient causal evidence exists to attribute "
            "this anomaly to any specific upstream factor."
        )
    else:
        for i, rc in enumerate(causes[:5], 1):
            direction = "decreased" if rc["deviation_pct"] < 0 else "increased"
            parts.append(
                f"{i}. {rc['variable']} → {rc['target_node']} "
                f"(causal weight: {rc['edge_weight']:.2f}, "
                f"contribution: {rc['contribution_score']:.3f}): "
                f"{rc['variable']} {direction} by {abs(rc['deviation_pct']):.1f}% "
                f"during the anomaly period, exerting a validated causal effect "
                f"on {rc['target_node']}."
            )

    # Confidence
    parts.append("\nCONFIDENCE:")
    if len(causes) >= 2:
        parts.append(
            f"The strongest attribution is {causes[0]['variable']} "
            f"(contribution: {causes[0]['contribution_score']:.3f}). "
            f"Secondary factors have weaker but validated causal evidence."
        )
    elif len(causes) == 1:
        parts.append(
            f"Attribution to {causes[0]['variable']} has moderate confidence "
            f"(contribution: {causes[0]['contribution_score']:.3f})."
        )

    narrative = "\n".join(parts)

    return {
        "narrative": narrative,
        "model": "template-fallback",
        "prompt_tokens": 0,
        "completion_tokens": 0,
        "cpa_prompt": prompt,
        "method": "fallback",
    }
