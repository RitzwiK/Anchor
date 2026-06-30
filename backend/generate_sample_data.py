"""
Generate a sample retail business dataset with known causal structure
for testing the CPA pipeline.

Ground-truth causal DAG:
  Promotion -> CustomerDemand
  Inventory -> Revenue
  CustomerDemand -> Revenue
  CompetitorPrice -> CustomerDemand
  Season -> CustomerDemand
  Revenue -> Profit

Injected anomalies:
  - Week 30-33: Inventory drops sharply (stockout event)
  - This causally propagates to Revenue drop
"""

import numpy as np
import pandas as pd

np.random.seed(42)

n_days = 365
dates = pd.date_range("2024-01-01", periods=n_days, freq="D")

# Seasonal component
day_of_year = np.arange(n_days)
season = 20 * np.sin(2 * np.pi * day_of_year / 365) + 10 * np.sin(2 * np.pi * day_of_year / 7)

# Exogenous variables
competitor_price = 50 + 5 * np.random.randn(n_days).cumsum() * 0.05
competitor_price = np.clip(competitor_price, 30, 80)

promotion = np.zeros(n_days)
# Promotions on certain weeks
for w in [5, 12, 20, 28, 40, 48]:
    start = w * 7
    end = min(start + 7, n_days)
    promotion[start:end] = 1

# Causal chain
customer_demand = (
    100
    + 0.4 * season
    + 15 * promotion
    - 0.3 * competitor_price
    + 3 * np.random.randn(n_days)
)
customer_demand = np.clip(customer_demand, 10, 200)

inventory = 500 + 2 * np.random.randn(n_days).cumsum()
# Inject stockout anomaly weeks 30-33
anomaly_start = 30 * 7
anomaly_end = min(33 * 7, n_days)
inventory[anomaly_start:anomaly_end] -= 200
inventory = np.clip(inventory, 50, 1000)

revenue = (
    0.6 * inventory * 0.1
    + 0.55 * customer_demand * 5
    + 2 * np.random.randn(n_days)
)
# Revenue drops when inventory is low
revenue[anomaly_start:anomaly_end] *= 0.75

profit = revenue * 0.3 - 500 + np.random.randn(n_days) * 10

operating_cost = 200 + 0.1 * customer_demand + np.random.randn(n_days) * 5

df = pd.DataFrame({
    "Date": dates,
    "Revenue": np.round(revenue, 2),
    "Profit": np.round(profit, 2),
    "Inventory": np.round(inventory, 2),
    "CustomerDemand": np.round(customer_demand, 2),
    "CompetitorPrice": np.round(competitor_price, 2),
    "Promotion": promotion.astype(int),
    "OperatingCost": np.round(operating_cost, 2),
})

df.to_csv("sample_retail_data.csv", index=False)
print(f"Generated sample_retail_data.csv: {len(df)} rows, {len(df.columns)} columns")
print(f"Anomaly window: rows {anomaly_start}-{anomaly_end} (inventory stockout)")
print(f"\nGround-truth causal edges:")
print("  Promotion -> CustomerDemand")
print("  CompetitorPrice -> CustomerDemand")
print("  Inventory -> Revenue")
print("  CustomerDemand -> Revenue")
print("  Revenue -> Profit")
