"""
Stage 1: Seasonal-Trend Decomposition using LOESS (STL).
Decomposes each numerical metric into trend, seasonal, and residual components.
"""

import pandas as pd
import numpy as np
from statsmodels.tsa.seasonal import STL
from typing import Dict, List, Any


def _format_dates(date_series):
    """Convert date series to clean string format."""
    result = []
    for dt in date_series:
        try:
            if hasattr(dt, 'strftime'):
                result.append(dt.strftime("%Y-%m-%d"))
            else:
                p = pd.to_datetime(str(dt), errors="coerce")
                if pd.notna(p) and p.year > 1980:
                    result.append(p.strftime("%Y-%m-%d"))
                else:
                    result.append(str(dt)[:10])
        except:
            result.append(str(dt)[:10])
    return result


def decompose_metrics(
    df: pd.DataFrame,
    date_col: str,
    metric_cols: List[str],
    period: int = 7,
) -> Dict[str, Any]:
    """
    Decompose each metric column via STL.

    Args:
        df: Input dataframe sorted by date.
        date_col: Name of the timestamp column.
        metric_cols: List of numerical metric column names.
        period: Seasonal period (default 7 for weekly).

    Returns:
        Dictionary with per-metric decomposition results.
    """
    df = df.sort_values(date_col).reset_index(drop=True)
    results = {}

    for col in metric_cols:
        series = df[col].dropna()

        if len(series) < period * 2 + 1:
            # Not enough data for STL — return raw as residual
            results[col] = {
                "trend": series.values.tolist(),
                "seasonal": [0.0] * len(series),
                "residual": series.values.tolist(),
                "dates": _format_dates(df[date_col].iloc[series.index]),
                "raw": series.values.tolist(),
            }
            continue

        try:
            stl = STL(series, period=period, robust=True)
            decomp = stl.fit()

            results[col] = {
                "trend": decomp.trend.values.tolist(),
                "seasonal": decomp.seasonal.values.tolist(),
                "residual": decomp.resid.values.tolist(),
                "dates": _format_dates(df[date_col].iloc[series.index]),
                "raw": series.values.tolist(),
            }
        except Exception as e:
            # Fallback: simple moving average decomposition
            window = min(period, len(series) // 2)
            if window < 2:
                window = 2
            trend = series.rolling(window=window, center=True).mean().fillna(method="bfill").fillna(method="ffill")
            residual = series - trend

            results[col] = {
                "trend": trend.values.tolist(),
                "seasonal": [0.0] * len(series),
                "residual": residual.values.tolist(),
                "dates": _format_dates(df[date_col].iloc[series.index]),
                "raw": series.values.tolist(),
            }

    return results
