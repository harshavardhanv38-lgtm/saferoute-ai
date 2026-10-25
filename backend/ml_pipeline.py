"""
SafeRoute AI — ML Pipeline
Trains Decision Tree and Random Forest classifiers on synthetic infrastructure data.
All data is SYNTHETIC. Results measure performance on synthetic data only.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import os
import json

FEATURES = [
    "street_lighting",
    "footpath_quality",
    "public_facility_access",
    "public_transport_access",
    "public_help_points",
]

LABEL = "infrastructure_quality_label"
RANDOM_STATE = 42
DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "sample_dataset.csv")


def load_dataset(path: str = DATA_PATH) -> pd.DataFrame:
    df = pd.read_csv(path)
    # Input validation
    for col in FEATURES:
        if col not in df.columns:
            raise ValueError(f"Missing required column: {col}")
        df[col] = pd.to_numeric(df[col], errors="coerce")
        df[col] = df[col].clip(0, 100)
    df = df.dropna(subset=FEATURES + [LABEL])
    return df


def train_and_evaluate() -> dict:
    df = load_dataset()

    X = df[FEATURES].values
    y = df[LABEL].values

    # Train/test split BEFORE any fitting (prevents data leakage)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )

    # Fit scaler on train only, transform both
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    results = {
        "data_info": {
            "total_samples": int(len(df)),
            "train_samples": int(len(X_train)),
            "test_samples": int(len(X_test)),
            "features": FEATURES,
            "label_distribution": {
                str(k): int(v) for k, v in pd.Series(y).value_counts().items()
            },
            "data_type": "SYNTHETIC — for demonstration only",
        },
        "models": {},
    }

    # ── Decision Tree ──────────────────────────────────────────────────────────
    dt = DecisionTreeClassifier(random_state=RANDOM_STATE, max_depth=5)
    dt.fit(X_train_scaled, y_train)
    dt_pred = dt.predict(X_test_scaled)
    dt_report = classification_report(y_test, dt_pred, output_dict=True, zero_division=0)
    dt_cm = confusion_matrix(y_test, dt_pred).tolist()
    dt_labels = list(dt.classes_)

    results["models"]["decision_tree"] = {
        "name": "Decision Tree",
        "accuracy": round(float(accuracy_score(y_test, dt_pred)), 4),
        "classification_report": dt_report,
        "confusion_matrix": dt_cm,
        "confusion_matrix_labels": dt_labels,
        "hyperparameters": {"max_depth": 5, "random_state": RANDOM_STATE},
    }

    # ── Random Forest ──────────────────────────────────────────────────────────
    rf = RandomForestClassifier(
        n_estimators=100, random_state=RANDOM_STATE, max_depth=5
    )
    rf.fit(X_train_scaled, y_train)
    rf_pred = rf.predict(X_test_scaled)
    rf_report = classification_report(y_test, rf_pred, output_dict=True, zero_division=0)
    rf_cm = confusion_matrix(y_test, rf_pred).tolist()
    rf_labels = list(rf.classes_)

    feature_importances = {
        FEATURES[i]: round(float(v), 4)
        for i, v in enumerate(rf.feature_importances_)
    }

    results["models"]["random_forest"] = {
        "name": "Random Forest",
        "accuracy": round(float(accuracy_score(y_test, rf_pred)), 4),
        "classification_report": rf_report,
        "confusion_matrix": rf_cm,
        "confusion_matrix_labels": rf_labels,
        "feature_importances": feature_importances,
        "hyperparameters": {
            "n_estimators": 100,
            "max_depth": 5,
            "random_state": RANDOM_STATE,
        },
    }

    # ── Winner ─────────────────────────────────────────────────────────────────
    dt_acc = results["models"]["decision_tree"]["accuracy"]
    rf_acc = results["models"]["random_forest"]["accuracy"]
    if rf_acc > dt_acc:
        results["better_model"] = "random_forest"
        results["comparison_note"] = (
            f"Random Forest achieved higher test accuracy ({rf_acc:.1%}) "
            f"than Decision Tree ({dt_acc:.1%}) on the synthetic dataset."
        )
    elif dt_acc > rf_acc:
        results["better_model"] = "decision_tree"
        results["comparison_note"] = (
            f"Decision Tree achieved higher test accuracy ({dt_acc:.1%}) "
            f"than Random Forest ({rf_acc:.1%}) on the synthetic dataset."
        )
    else:
        results["better_model"] = "tie"
        results["comparison_note"] = (
            f"Both models achieved equal test accuracy ({dt_acc:.1%}) on the synthetic dataset."
        )

    results["disclaimer"] = (
        "All results are based on SYNTHETIC data generated for demonstration. "
        "These metrics do not reflect real-world predictive performance."
    )

    return results


def get_sample_rows(n: int = 20) -> list:
    df = load_dataset()
    sample = df.head(n)
    return sample.to_dict(orient="records")


if __name__ == "__main__":
    results = train_and_evaluate()
    print(json.dumps(results, indent=2))
