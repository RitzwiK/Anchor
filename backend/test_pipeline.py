"""Quick end-to-end test of the CPA pipeline."""
import asyncio
import pandas as pd
import json

from pipeline.decomposition import decompose_metrics
from pipeline.anomaly import detect_anomalies
from pipeline.causal import discover_causal_dag
from pipeline.tracing import trace_root_causes
from pipeline.cpa import generate_cpa_narrative
from pipeline.cgr import compute_cgr

async def main():
    df = pd.read_csv("sample_retail_data.csv")
    df["Date"] = pd.to_datetime(df["Date"])
    metrics = ["Revenue", "Profit", "Inventory", "CustomerDemand", "CompetitorPrice", "OperatingCost"]

    print("=== Stage 1: STL Decomposition ===")
    decomp = decompose_metrics(df, "Date", metrics, period=7)
    print(f"  Decomposed {len(decomp)} metrics")

    print("\n=== Stage 2: Anomaly Detection ===")
    anomalies = detect_anomalies(decomp, df, "Date")
    for col, data in anomalies.items():
        print(f"  {col}: {data['total_flagged']} anomalies")

    print("\n=== Stage 3: Causal DAG Discovery ===")
    dag = discover_causal_dag(df, metrics)
    print(f"  Nodes: {dag['nodes']}")
    print(f"  Edges ({dag['n_edges']}):")
    for e in dag["edges"]:
        print(f"    {e['source']} -> {e['target']}  w={e['weight']}  ace={e['ace']}")

    print("\n=== Stage 4: Root-Cause Tracing (target=Revenue) ===")
    rc = trace_root_causes(dag, anomalies, df, "Revenue")
    print(f"  Anomaly: {rc['anomaly_summary']}")
    for cause in rc["root_causes"][:5]:
        print(f"  #{cause['variable']} -> {cause['target_node']}  "
              f"score={cause['contribution_score']}  dev={cause['deviation_pct']}%")

    print("\n=== Stage 5: CPA Narrative (template fallback) ===")
    narr = await generate_cpa_narrative(dag, rc)
    print(f"  Method: {narr['method']}")
    print(f"  Narrative:\n{narr['narrative'][:500]}")

    print("\n=== CGR Verification ===")
    cgr = compute_cgr(narr["narrative"], dag)
    print(f"  CGR: {cgr['cgr']}")
    print(f"  Assertions: {cgr['total_assertions']} total, {cgr['grounded']} grounded")
    for d in cgr["details"]:
        print(f"    {d['cause']} -> {d['effect']}: {d['match_type']}")

    print("\n✓ Pipeline completed successfully!")

asyncio.run(main())
