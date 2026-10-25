"""
ml/train_when_available.py
==========================
SafeRoute AI — ML Training Scaffold

STATUS: NOT RUNNABLE YET — No suitable real-world labelled dataset has been found.

This script is a scaffold for future training. It will be activated only when a
dataset meeting ALL of the following criteria is obtained:

  1. Route-segment-level observations (not point-level or city-level)
  2. Genuine human-reported perceived-safety labels (structured survey data,
     not algorithmic labels, not synthetic scores)
  3. Features extractable from OpenStreetMap (lamp counts, footway coverage, etc.)
  4. Open licence permitting research use
  5. At least several thousand observations across multiple geographically
     diverse cities

DO NOT run this script with synthetic or fabricated data.
The assert statements below will raise an error if you attempt to do so.

See DATA_SOURCES.md §2 for documentation of the datasets that were investigated
and why none of them were suitable.

Usage (once data is available):
    python ml/train_when_available.py --data path/to/real_dataset.csv

Dataset CSV must have these columns:
    - street_lamps_per_km       (float)
    - footway_coverage_pct      (float, 0-100)
    - crossing_count_per_km     (float)
    - transport_stop_m          (float, nearest stop distance in metres)
    - emergency_count           (int)
    - data_completeness_pct     (float, 0-100)
    - city                      (str, for geographic CV split)
    - perceived_safety_label    (str: "Better"|"Moderate"|"Needs Improvement")
    - data_source               (str, must NOT contain "synthetic" or "generated")
    - collection_date           (str, ISO date)
    - participant_id            (str or int, for deduplication)
"""

import argparse
import sys
import warnings
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
)
from sklearn.model_selection import GroupShuffleSplit, StratifiedKFold, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, StandardScaler

warnings.filterwarnings("ignore")

REQUIRED_FEATURE_COLS = [
    "street_lamps_per_km",
    "footway_coverage_pct",
    "crossing_count_per_km",
    "transport_stop_m",
    "emergency_count",
    "data_completeness_pct",
]
REQUIRED_METADATA_COLS = ["city", "perceived_safety_label", "data_source"]
TARGET_COL = "perceived_safety_label"
VALID_LABELS = {"Better", "Moderate", "Needs Improvement"}
MODELS_DIR = Path(__file__).parent.parent / "models"


def validate_dataset(df: pd.DataFrame) -> None:
    """
    Enforce the no-synthetic-data policy by checking dataset provenance.
    Raises ValueError if the dataset fails any check.
    """
    missing_cols = [
        c for c in REQUIRED_FEATURE_COLS + REQUIRED_METADATA_COLS if c not in df.columns
    ]
    if missing_cols:
        raise ValueError(
            f"Dataset is missing required columns: {missing_cols}\n"
            f"See this script's docstring for the required schema."
        )

    # Check data_source column does not indicate synthetic data
    if "data_source" in df.columns:
        synthetic_markers = ["synthetic", "generated", "random", "fabricated", "fake", "mock"]
        for marker in synthetic_markers:
            if df["data_source"].str.lower().str.contains(marker).any():
                raise ValueError(
                    f"DATA POLICY VIOLATION: The 'data_source' column contains the word '{marker}'. "
                    f"This script refuses to train on synthetic or fabricated data. "
                    f"See DATA_SOURCES.md for the project's data policy."
                )

    # Validate labels
    actual_labels = set(df[TARGET_COL].unique())
    invalid_labels = actual_labels - VALID_LABELS
    if invalid_labels:
        raise ValueError(
            f"Invalid labels found: {invalid_labels}. "
            f"Allowed values: {VALID_LABELS}"
        )

    # Minimum size check
    if len(df) < 200:
        raise ValueError(
            f"Dataset has only {len(df)} rows. A minimum of 200 observations is required "
            f"for meaningful train/test splitting. For reliable results, 2000+ is recommended."
        )

    print(f"✓ Dataset validation passed: {len(df)} rows, {df[TARGET_COL].value_counts().to_dict()}")


def build_pipeline(model) -> Pipeline:
    return Pipeline([
        ("scaler", StandardScaler()),
        ("model", model),
    ])


def train(data_path: str) -> None:
    print(f"\n{'='*60}")
    print("SafeRoute AI — ML Training Pipeline")
    print(f"{'='*60}")
    print(f"\nLoading dataset from: {data_path}")

    df = pd.read_csv(data_path)
    print(f"Loaded {len(df)} rows, {len(df.columns)} columns")

    # Enforce data policy
    validate_dataset(df)

    X = df[REQUIRED_FEATURE_COLS]
    le = LabelEncoder()
    y = le.fit_transform(df[TARGET_COL])
    groups = df["city"]

    print(f"\nFeatures: {REQUIRED_FEATURE_COLS}")
    print(f"Target classes: {list(le.classes_)}")

    # Geographic train/test split (prevent leakage between nearby areas)
    gss = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
    train_idx, test_idx = next(gss.split(X, y, groups))
    X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
    y_train, y_test = y[train_idx], y[test_idx]

    train_cities = df["city"].iloc[train_idx].unique()
    test_cities = df["city"].iloc[test_idx].unique()
    print(f"\nTrain cities ({len(train_cities)}): {list(train_cities)}")
    print(f"Test cities  ({len(test_cities)}): {list(test_cities)}")
    print(f"Train samples: {len(X_train)}, Test samples: {len(X_test)}")

    # Models to evaluate
    candidate_models = {
        "Logistic Regression (baseline)": LogisticRegression(max_iter=1000, random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=200, max_depth=8, random_state=42, n_jobs=-1),
        "Gradient Boosting": GradientBoostingClassifier(n_estimators=200, max_depth=4, random_state=42),
    }

    results = {}
    print(f"\n{'─'*60}")
    print("Cross-validation results (5-fold on training set):")
    print(f"{'─'*60}")

    for name, model in candidate_models.items():
        pipe = build_pipeline(model)
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        cv_scores = cross_val_score(pipe, X_train, y_train, cv=cv, scoring="f1_macro")
        pipe.fit(X_train, y_train)
        y_pred = pipe.predict(X_test)
        test_acc = accuracy_score(y_test, y_pred)
        test_f1 = cross_val_score(pipe, X_test, y_test, cv=2, scoring="f1_macro").mean()

        results[name] = {
            "pipeline": pipe,
            "cv_f1_mean": cv_scores.mean(),
            "cv_f1_std": cv_scores.std(),
            "test_accuracy": test_acc,
            "y_pred": y_pred,
        }
        print(f"\n{name}:")
        print(f"  CV F1 (macro): {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")
        print(f"  Test Accuracy: {test_acc:.3f}")
        print(f"  Classification Report:\n{classification_report(y_test, y_pred, target_names=le.classes_, zero_division=0)}")
        print(f"  Confusion Matrix:\n{confusion_matrix(y_test, y_pred)}")

    # Select best model by CV F1
    best_name = max(results, key=lambda k: results[k]["cv_f1_mean"])
    best = results[best_name]
    print(f"\n{'='*60}")
    print(f"Best model: {best_name} (CV F1: {best['cv_f1_mean']:.3f})")
    print(f"{'='*60}")

    # Save best model
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    model_path = MODELS_DIR / "saferoute_classifier.joblib"
    encoder_path = MODELS_DIR / "label_encoder.joblib"
    metadata_path = MODELS_DIR / "model_metadata.json"

    joblib.dump(best["pipeline"], model_path)
    joblib.dump(le, encoder_path)

    import json, datetime
    metadata = {
        "model_name": best_name,
        "training_date": datetime.date.today().isoformat(),
        "data_source": str(data_path),
        "n_train": int(len(X_train)),
        "n_test": int(len(X_test)),
        "train_cities": [str(c) for c in train_cities],
        "test_cities": [str(c) for c in test_cities],
        "cv_f1_mean": float(best["cv_f1_mean"]),
        "cv_f1_std": float(best["cv_f1_std"]),
        "test_accuracy": float(best["test_accuracy"]),
        "classes": list(le.classes_),
        "features": REQUIRED_FEATURE_COLS,
        "note": (
            "Model trained on real labelled data. Predictions represent "
            "infrastructure quality categories, not personal safety guarantees."
        ),
    }
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\nModel saved to: {model_path}")
    print(f"Encoder saved to: {encoder_path}")
    print(f"Metadata saved to: {metadata_path}")
    print("\nDone.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="SafeRoute AI — ML training pipeline (requires real labelled data)"
    )
    parser.add_argument(
        "--data",
        required=True,
        help="Path to the real labelled CSV dataset",
    )
    args = parser.parse_args()

    if not Path(args.data).exists():
        print(f"Error: File not found: {args.data}", file=sys.stderr)
        sys.exit(1)

    train(args.data)
