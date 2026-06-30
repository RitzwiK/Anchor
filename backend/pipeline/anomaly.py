"""
Stage 2: Anomaly Detection using Isolation Forest on STL residuals.
Flags records with anomalous residual patterns and computes severity scores.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from typing import Dict, List, Any


def detect_anomalies(
    decomposition: Dict[str, Any],
    df: pd.DataFrame,
    date_col: str,
    contamination: float = 0.05,
    severity_threshold: float = 1.5,
) -> Dict[str, Any]:
    """
    Detect anomalies in STL residuals using Isolation Forest.

    Args:
        decomposition: Output from decompose_metrics().
        df: Original dataframe.
        date_col: Timestamp column name.
        contamination: Expected fraction of anomalies (default 5%).
        severity_threshold: Minimum severity score to flag.

    Returns:
        Dictionary with detected anomalies per metric.
    """
    anomaly_results = {}

    for col, decomp in decomposition.items():
        residuals = np.array(decomp["residual"])
        dates = decomp["dates"]
        raw_values = np.array(decomp["raw"])

        if len(residuals) < 10:
            anomaly_results[col] = {"anomalies": [], "scores": []}
            continue

        # Reshape for sklearn
        X = residuals.reshape(-1, 1)

        # Remove NaN/Inf
        valid_mask = np.isfinite(X.ravel())
        X_clean = X[valid_mask]

        if len(X_clean) < 10:
            anomaly_results[col] = {"anomalies": [], "scores": []}
            continue

        # Fit Isolation Forest
        iso_forest = IsolationForest(
            contamination=contamination,
            random_state=42,
            n_estimators=200,
        )
        iso_forest.fit(X_clean)

        # Predict on all valid points
        predictions = np.ones(len(residuals), dtype=int)
        scores_raw = np.zeros(len(residuals))

        predictions[valid_mask] = iso_forest.predict(X_clean)
        scores_raw[valid_mask] = -iso_forest.score_samples(X_clean)

        # Compute severity: z-score of residual * anomaly indicator
        mu_r = np.nanmean(residuals[valid_mask])
        sigma_r = np.nanstd(residuals[valid_mask])
        if sigma_r < 1e-10:
            sigma_r = 1.0

        anomalies = []
        all_scores = []

        for i in range(len(residuals)):
            if not valid_mask[i]:
                continue

            is_anomaly = predictions[i] == -1
            z_score = abs(residuals[i] - mu_r) / sigma_r
            severity = z_score if is_anomaly else 0.0
            all_scores.append(float(severity))

            if is_anomaly and severity >= severity_threshold:
                # Calculate percentage deviation from trend
                trend_val = decomp["trend"][i] if decomp["trend"][i] != 0 else 1.0
                pct_deviation = ((raw_values[i] - decomp["trend"][i]) / abs(trend_val)) * 100

                anomalies.append({
                    "index": i,
                    "date": dates[i],
                    "value": float(raw_values[i]),
                    "expected": float(decomp["trend"][i]),
                    "residual": float(residuals[i]),
                    "severity": round(float(severity), 3),
                    "pct_deviation": round(float(pct_deviation), 2),
                    "direction": "drop" if pct_deviation < 0 else "spike",
                })

        # Sort by severity descending
        anomalies.sort(key=lambda x: x["severity"], reverse=True)

        anomaly_results[col] = {
            "anomalies": anomalies,
            "total_flagged": len(anomalies),
            "scores": all_scores,
        }

    return anomaly_results
