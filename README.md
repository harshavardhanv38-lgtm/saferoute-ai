# 🛡️ SafeRoute AI

**A Real-Data-Based Machine Learning System for Route Infrastructure Analysis and Perceived-Safety Recommendations**

> **Research Prototype — Women's Safety Infrastructure Analysis**

[![Data Policy](https://img.shields.io/badge/Data%20Policy-No%20Synthetic%20Data-red)](./DATA_SOURCES.md)
[![ML Status](https://img.shields.io/badge/ML%20Model-Not%20Trained%20(No%20suitable%20dataset)-orange)](./MODEL_CARD.md)
[![OSM](https://img.shields.io/badge/Map%20Data-OpenStreetMap%20(ODbL)-brightgreen)](https://www.openstreetmap.org/copyright)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

---

## ⚠️ Critical Disclaimers

1. **Infrastructure scores ≠ personal safety.** This tool analyses mapped infrastructure features. A higher score does not mean a route is safe for any individual person. Time of day, foot traffic, social context, and many other factors are not captured.
2. **OSM data ≠ operational infrastructure.** A mapped street lamp does not confirm it is switched on or functional. Missing data is labelled "not mapped", never "absent."
3. **ML model: NOT TRAINED.** No suitable real-world labelled dataset was found. See [MODEL_CARD.md](./MODEL_CARD.md) and [DATA_SOURCES.md](./DATA_SOURCES.md) for details. The scoring system is a transparent rule-based comparison.
4. **No synthetic data anywhere** in this project. See [DATA_SOURCES.md](./DATA_SOURCES.md).

---

## 🗂️ Project Structure

```
saferoute-ai/
├── frontend/               React + Vite + Leaflet + Recharts
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.tsx           Landing page
│   │   │   ├── ComparePage.tsx        Side-by-side route comparison
│   │   │   ├── MLResearchPage.tsx     Honest ML status + dataset investigation
│   │   │   ├── ResearchPage.tsx       Research background
│   │   │   └── AboutPage.tsx          About page
│   │   └── components/
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   └── package.json
│
├── backend/                FastAPI + Overpass API + OSRM
│   ├── main.py             API entry point
│   ├── ml/
│   │   ├── train.py        Training pipeline
│   │   └── dataset.csv     Dataset
│   └── requirements.txt
│
├── ml/                     ML training scaffold (not yet runnable)
│   ├── train_when_available.py
│   └── README.md
│
├── data/                   (empty — real data fetched live from OSM)
├── models/                 (empty — no model trained yet)
│
├── app.py                  Streamlit single-file prototype
├── test_core.py            Core unit tests
│
├── README.md               ← this file
├── DATA_SOURCES.md         All data sources, licences, dataset investigation
├── MODEL_CARD.md           ML model status and limitations
└── .env.example            Environment variable template
```

---

## 🚀 Quick Start

### Option A — Streamlit Prototype (single file, fastest to run)

```powershell
cd saferoute-ai
pip install -r requirements.txt
streamlit run app.py
```

Opens at **http://localhost:8501**

### Option B — React + FastAPI Stack

**Backend:**
```powershell
cd saferoute-ai/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```powershell
cd saferoute-ai/frontend
npm install
npm run dev
```

Opens at **http://localhost:5173**

---

## ✨ Features

### 🗺️ Interactive Map (Real OSM Data)
- Click two points on the map to place Route A and Route B markers
- Queries the **Overpass API** (OpenStreetMap) in real time
- Displays real infrastructure counts: street lamps, bus stops, footpaths, crossings, police stations
- Adjustable search radius (250m – 1000m)
- All data labelled as "mapped" or "not mapped" — never "absent"

### 📊 Route Infrastructure Dashboard
For each route displays:
- Distance and estimated walking time
- Mapped streetlight count and density (per km)
- Footway/pedestrian path coverage (%)
- Public transport stop proximity
- Pedestrian crossing count
- Missing-data indicators
- Rule-based infrastructure score (0–100) with factor breakdown
- Label: **"Best match for your selected infrastructure preferences"**

### ⚖️ Rule-Based Scoring
- Transparent weighted formula (not ML)
- User-adjustable preference weights
- Score breakdown by infrastructure category
- Explicit labels on all outputs: "Rule-Based Infrastructure Comparison"

### 🔬 ML Research Section
- Honest "Not Trained" status
- Full table of 8 datasets investigated
- Documented reasons why each was unsuitable
- Description of what a valid dataset would require
- Training scaffold ready for when real data is available

---

## 📡 Data Sources

All data sources are documented in [DATA_SOURCES.md](./DATA_SOURCES.md).

| Source | Used for | Licence |
|---|---|---|
| OpenStreetMap | Infrastructure features | ODbL |
| Overpass API | OSM data access | Free (ODbL data) |
| OSRM Public Demo Server | Walking route calculation | MIT / ODbL |
| Nominatim | Place-name geocoding | ODbL |

**Required attribution in any derivative work:**
> Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, ODbL · Routing by [OSRM](https://project-osrm.org/) · Geocoding by [Nominatim](https://nominatim.openstreetmap.org/)

---

## 🤖 ML Status

**No ML model has been trained.** See [MODEL_CARD.md](./MODEL_CARD.md) for the full explanation.

The ML training scaffold (`ml/train_when_available.py`) will be used when a dataset meeting all these criteria is found:
- Route-segment-level granularity
- Genuine human-reported perceived-safety labels
- OSM-linkable features
- Open licence
- Geographic diversity

---

## 🧪 Running Tests

```powershell
cd saferoute-ai
pip install pytest
pytest test_core.py -v
```

---

## 📦 Requirements

### Python (Streamlit / Backend)

```
streamlit>=1.35.0
pandas>=2.0.0
numpy>=1.24.0
scikit-learn>=1.3.0
plotly>=5.18.0
folium>=0.15.0
streamlit-folium>=0.15.0
requests>=2.31.0
fastapi>=0.109.0
uvicorn>=0.27.0
```

### Node.js (Frontend)

See `frontend/package.json`. Main dependencies:
- `react` ^18
- `react-leaflet` ^4
- `leaflet` ^1.9
- `recharts` ^2.12
- `react-router-dom` ^6

---

## ⚖️ Ethical Notes

- **No real-world safety guarantee.** Infrastructure indicators are not validated predictors of personal safety.
- **No user data collected.** No GPS, no cookies, no accounts, no tracking.
- **No personal data transmitted.** Only query parameters (coordinates for map requests) leave the browser, to OSM/OSRM/Nominatim — the same as using any OpenStreetMap-based app.
- **No synthetic data.** All infrastructure data is retrieved live from OpenStreetMap.
- **Honest about limitations.** Every score, chart, and prediction is labelled with its method and caveats.

---

## 🔑 API Keys

No API keys are required for the default configuration (Overpass API, OSRM public demo server, Nominatim — all free).

If you want to use openrouteservice instead of OSRM (for higher rate limits), copy `.env.example` to `.env` and add your key.

---

## 📄 Licence

MIT — free to use, modify, and distribute with attribution.

Map data © OpenStreetMap contributors, [ODbL](https://opendatacommons.org/licenses/odbl/).
