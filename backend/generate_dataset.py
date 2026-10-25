"""Script to generate the synthetic dataset for SafeRoute AI."""
import numpy as np
import pandas as pd
import os

np.random.seed(42)
N = 150

street_lighting        = np.random.randint(10, 100, N)
footpath_quality       = np.random.randint(10, 100, N)
public_facility_access = np.random.randint(10, 100, N)
public_transport_access= np.random.randint(10, 100, N)
public_help_points     = np.random.randint(10, 100, N)

# Weighted score (same formula as frontend)
score = (
    street_lighting * 0.35 +
    footpath_quality * 0.25 +
    public_facility_access * 0.15 +
    public_transport_access * 0.15 +
    public_help_points * 0.10
)

def label(s):
    if s < 45:
        return "Needs Improvement"
    elif s < 68:
        return "Moderate Infrastructure"
    else:
        return "Better Infrastructure"

labels = [label(s) for s in score]

df = pd.DataFrame({
    "street_lighting": street_lighting,
    "footpath_quality": footpath_quality,
    "public_facility_access": public_facility_access,
    "public_transport_access": public_transport_access,
    "public_help_points": public_help_points,
    "infrastructure_quality_label": labels,
})

out = os.path.join(os.path.dirname(__file__), "data", "sample_dataset.csv")
os.makedirs(os.path.dirname(out), exist_ok=True)
df.to_csv(out, index=False)
print(f"Generated {N} rows -> {out}")
print(df["infrastructure_quality_label"].value_counts())
