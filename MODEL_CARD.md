# MODEL_CARD.md — SafeRoute AI

## Model Overview

| Field | Detail |
|---|---|
| **Model name** | SafeRoute AI Infrastructure Classifier |
| **Version** | N/A — not trained |
| **Status** | **NOT TRAINED** |
| **Intended use** | If trained: classify a walking route segment into one of three infrastructure quality categories based on OSM-derived features |
| **Out-of-scope uses** | Predicting personal safety, predicting crime likelihood, making safety guarantees, replacing professional safety assessments |
| **Developers** | SafeRoute AI Research Project |
| **Training date** | N/A |
| **Model type** | Planned: Random Forest Classifier (scikit-learn); Logistic Regression baseline |

---

## Training Status: NOT TRAINED

No model has been trained because **no suitable labelled training dataset was found** that satisfies the project's data-policy requirements.

### Requirements for training

A model will be trained only when **all** of the following are met:

1. A real dataset exists with:
   - Observations at **route segment level** (50–500m granularity)
   - **Genuine human-reported perceived-safety labels** (structured survey, not algorithmic)
   - Features extractable from **OpenStreetMap** (lamp counts, footway presence, crossing counts, etc.)
2. The dataset has a documented source, licence permitting research use, and ethical approval
3. The dataset contains at minimum several thousand observations across geographically diverse locations
4. Labels have been collected from demographically diverse participants

### Datasets investigated

See [DATA_SOURCES.md](./DATA_SOURCES.md) §2 for full investigation results. Eight candidate datasets were reviewed; none met all requirements.

---

## Intended Model Behaviour (When Trained)

### Input features

| Feature | Source | Unit |
|---|---|---|
| Street lamps per km | OSM via Overpass API | count/km |
| Footway coverage | OSM way lengths vs route length | % |
| Pedestrian crossings | OSM nodes | count |
| Transport stop proximity | OSM nodes | nearest distance (m) |
| Public shelters/benches | OSM nodes | count |
| Emergency infrastructure | OSM nodes | count |
| Data completeness | Overpass API | % of features with data |

### Planned output

- **Classification target:** 3-class — `Better Infrastructure`, `Moderate Infrastructure`, `Needs Improvement`
- **Labels source (required):** genuine participant-reported perceived safety ratings
- **Output:** predicted class + class probabilities (if model supports calibrated probabilities)

### Probability disclaimer

Model output probabilities (if ever produced) represent the **probability of the predicted infrastructure class label** in the training dataset. They do NOT represent:
- The probability that a route is personally safe for any individual
- The probability of crime occurring on a route
- A guarantee of any real-world safety outcome

---

## Planned Evaluation Methodology

When a suitable dataset is obtained:

- **Train/test split:** 80/20 with geographic separation (training on cities A–C, testing on city D) to prevent spatial autocorrelation leakage
- **Metrics:** Accuracy, macro-averaged F1, per-class precision/recall, confusion matrix
- **Baseline comparison:** Logistic Regression baseline for comparison with Random Forest
- **Cross-validation:** 5-fold stratified CV on training set

---

## Current Alternative: Rule-Based Scoring

In the absence of a trained model, the application uses a **transparent rule-based infrastructure scoring system**:

```
Infrastructure Score = 
    (street_lamps_per_km     × weight_lighting)  +
    (footway_coverage_%      × weight_footway)   +
    (crossing_count_per_km   × weight_crossings) +
    (transport_proximity_inv × weight_transport) +
    (data_completeness_%     × weight_completeness)
```

User-adjustable weights. Default weights are documented in the UI.

This score is labelled **"Rule-Based Infrastructure Comparison"**, never as an ML prediction.

---

## Limitations

- The application retrieves OSM data, which reflects volunteer mapping contributions. Coverage varies greatly by region.
- Infrastructure features retrieved from OSM are **as-mapped**, not verified to be operational.
- The scoring system is a research prototype; it has not been validated against real-world safety outcomes.
- No causal relationship between infrastructure scores and personal safety has been established.
- Time-of-day, weather, foot traffic, and social factors are not captured.
- The tool is **not a navigation safety app** and should not be used as one.

---

## Ethical Considerations

- No user location data is stored or transmitted beyond what is needed to query Overpass and OSRM APIs for the requested analysis.
- Infrastructure scores are presented with explicit disclaimers.
- The tool explicitly rejects the framing that higher scores equal "safer" routes.
- The label used in the UI is **"Best match for your selected infrastructure preferences"**, not "safest route".

---

## Contact and Contributions

If you have access to a real labelled dataset suitable for training, please open an issue on the project GitHub. See `ml/train_when_available.py` for the training scaffold that will be used when data becomes available.
