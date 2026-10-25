# models/ — Trained Model Directory

This directory will contain trained model artifacts **only if** training succeeds on a real labelled dataset.

## Current Contents

**Empty.** No model has been trained.

## Status: NOT TRAINED

See [MODEL_CARD.md](../MODEL_CARD.md) for the full explanation of why no model has been trained and what data would be required to train one.

## If a Model Is Trained

When `ml/train_when_available.py` is run with a real dataset, it will save:

| File | Contents |
|---|---|
| `saferoute_classifier.joblib` | Trained scikit-learn Pipeline (scaler + model) |
| `label_encoder.joblib` | LabelEncoder for class names |
| `model_metadata.json` | Training date, data source, metrics, classes |

These files are excluded from git by `.gitignore` to avoid committing large binary files. The training script and metadata JSON (but not the binary model) should be committed when training succeeds.
