"""
SafeRoute AI — ML Training Pipeline
Generates a synthetic dataset and trains Decision Tree + Random Forest classifiers.

IMPORTANT: All data is synthetic and generated algorithmically.
Results are for research demonstration only and do not represent real-world
infrastructure quality or personal safety assessments.
"""

import os
import pickle
import json
import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

RANDOM_SEED = 42
DATASET_PATH = os.path.join(os.path.dirname(__file__), "dataset.csv")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
LABELS = ["Needs Improvement", "Moderate Infrastructure", "Better Infrastructure"]
FEATURES = [
    "street_lighting",
    "footpath_quality",
    "public_facility_access",
    "public_transport_access",
    "public_help_points",
]


def load_or_generate_dataset() -> pd.DataFrame:
    """Load dataset.csv or generate synthetic data if it doesn't exist."""
    if os.path.exists(DATASET_PATH):
        df = pd.read_csv(DATASET_PATH)
        # Validate columns
        required_cols = FEATURES + ["infrastructure_quality_label"]
        missing = [c for c in required_cols if c not in df.columns]
        if missing:
            raise ValueError(f"Dataset is missing columns: {missing}")
        return df
    else:
        return generate_synthetic_dataset()


def generate_synthetic_dataset(n: int = 120) -> pd.DataFrame:
    """
    Generate a synthetic dataset for research demonstration.
    Labels are assigned based on a weighted sum of features to simulate
    a plausible relationship — not from real-world measurements.
    """
    rng = np.random.default_rng(RANDOM_SEED)

    data = {
        "street_lighting": rng.integers(15, 100, n).astype(float),
        "footpath_quality": rng.integers(15, 100, n).astype(float),
        "public_facility_access": rng.integers(10, 100, n).astype(float),
        "public_transport_access": rng.integers(10, 100, n).astype(float),
        "public_help_points": rng.integers(10, 100, n).astype(float),
    }

    df = pd.DataFrame(data)

    # Weighted score to derive label (mirrors frontend formula)
    score = (
        df["street_lighting"] * 0.35
        + df["footpath_quality"] * 0.25
        + df["public_facility_access"] * 0.15
        + df["public_transport_access"] * 0.15
        + df["public_help_points"] * 0.10
    )

    # Add small noise so labels aren't perfectly linear
    noise = rng.normal(0, 4, n)
    score_noisy = score + noise

    def assign_label(s: float) -> str:
        if s >= 66:
            return "Better Infrastructure"
        elif s >= 48:
            return "Moderate Infrastructure"
        else:
            return "Needs Improvement"

    df["infrastructure_quality_label"] = score_noisy.apply(assign_label)
    df.to_csv(DATASET_PATH, index=False)
    return df


def train_models() -> dict:
    """
    Train Decision Tree and Random Forest on the synthetic dataset.
    Returns a dict with metrics from both models.
    """
    os.makedirs(MODELS_DIR, exist_ok=True)

    df = load_or_generate_dataset()

    # Drop rows with any missing values
    df = df.dropna(subset=FEATURES + ["infrastructure_quality_label"])

    # Validate ranges
    for col in FEATURES:
        df = df[(df[col] >= 0) & (df[col] <= 100)]

    X = df[FEATURES].values
    y = df["infrastructure_quality_label"].values

    # Split BEFORE any fitting to prevent data leakage
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_SEED, stratify=y
    )

    results = {}

    for name, clf in [
        ("Decision Tree", DecisionTreeClassifier(max_depth=5, random_state=RANDOM_SEED)),
        ("Random Forest", RandomForestClassifier(n_estimators=100, max_depth=5, random_state=RANDOM_SEED)),
    ]:
        clf.fit(X_train, y_train)
        y_pred = clf.predict(X_test)

        acc = accuracy_score(y_test, y_pred)
        report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)
        cm = confusion_matrix(y_test, y_pred, labels=LABELS).tolist()

        # Persist model
        model_file = "decision_tree.pkl" if "Tree" in name else "random_forest.pkl"
        with open(os.path.join(MODELS_DIR, model_file), "wb") as f:
            pickle.dump(clf, f)

        key = "decision_tree" if "Tree" in name else "random_forest"
        results[key] = {
            "model_name": name,
            "accuracy": round(acc, 4),
            "report": report,
            "confusion_matrix": cm,
            "train_samples": int(len(X_train)),
            "test_samples": int(len(X_test)),
        }

    results["labels"] = LABELS
    results["note"] = (
        f"Models trained on {len(df)} synthetic samples ({len(X_train)} train / {len(X_test)} test). "
        "Results reflect synthetic dataset performance only."
    )

    return results


if __name__ == "__main__":
    import pprint
    print("Training models on synthetic dataset...")
    result = train_models()
    for model_key in ["decision_tree", "random_forest"]:
        m = result[model_key]
        print(f"\n{m['model_name']}: accuracy={m['accuracy']:.4f}")
    print("\nNote:", result["note"])
