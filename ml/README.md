# ml/ — Machine Learning Directory

## Status: Model NOT Trained

No machine learning model has been trained in this project.

**Reason:** No suitable real-world labelled dataset was found that satisfies all three requirements simultaneously:

1. Route-level or segment-level granularity (not just point observations)
2. Genuine human-reported perceived-safety labels collected by survey
3. Features linkable to OpenStreetMap infrastructure data

Eight candidate datasets were investigated. Full documentation is in [`DATA_SOURCES.md`](../DATA_SOURCES.md) §2.

---

## What's in this directory

| File | Purpose |
|---|---|
| `train_when_available.py` | Training scaffold — will run when real data is obtained |
| `README.md` | This file |

---

## How to activate training

1. Obtain a real labelled dataset meeting the criteria in `train_when_available.py`'s docstring
2. Place it at `data/real_dataset.csv`
3. Run: `python ml/train_when_available.py --data data/real_dataset.csv`
4. The script enforces the data policy and will raise an error if synthetic data is detected

---

## Current scoring approach

Until real labelled data is available, the application uses a **transparent rule-based infrastructure comparison** that users can understand and adjust. This is labelled clearly in the UI as "Rule-Based Infrastructure Comparison", never as an ML prediction.
