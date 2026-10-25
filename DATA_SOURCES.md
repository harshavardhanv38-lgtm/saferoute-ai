# DATA_SOURCES.md — SafeRoute AI

All data used in this project comes from documented, publicly available sources.
No synthetic or fabricated data is used anywhere in this project.

---

## 1. Live Geographic Data (Infrastructure Analysis)

### 1.1 OpenStreetMap (OSM)

| Field | Detail |
|---|---|
| **Source** | [https://www.openstreetmap.org/](https://www.openstreetmap.org/) |
| **Licence** | Open Database Licence (ODbL) v1.0 |
| **Attribution** | © OpenStreetMap contributors |
| **Coverage** | Global |
| **Collection date** | Continuously updated by volunteer contributors |
| **Access method** | Overpass API (see §1.2) |
| **Limitations** | Data density varies enormously by region. Rural and low-income areas are often under-mapped. OSM records the *existence* of a feature as mapped by volunteers; it does not verify the feature is currently operational. A mapped street lamp does not confirm the lamp is switched on or functional. Missing data is labelled "not mapped", not "absent". |

**Features retrieved:**

| OSM Tag | Infrastructure Feature |
|---|---|
| `node[highway=street_lamp]` | Street lighting points |
| `way[highway=footway]` | Footways / pedestrian paths |
| `way[highway=path]` | Paths (potentially pedestrian) |
| `way[highway=pedestrian]` | Pedestrian-only streets |
| `node[highway=crossing]` | Pedestrian crossings |
| `node[public_transport=stop_position]` | Public transport stops |
| `node[highway=bus_stop]` | Bus stops |
| `node[railway=tram_stop]` | Tram stops |
| `node[railway=station]` | Rail stations |
| `node[amenity=police]` | Police stations |
| `node[emergency=phone]` | Emergency phones |
| `node[amenity=shelter]` | Public shelters |
| `node[amenity=bench]` | Public benches |
| `node[amenity=toilets]` | Public toilets |

---

### 1.2 Overpass API

| Field | Detail |
|---|---|
| **Source** | [https://overpass-api.de/](https://overpass-api.de/) |
| **Licence** | Free to use; data licence inherited from OSM (ODbL) |
| **Usage policy** | [https://dev.overpass-api.de/overpass-doc/en/](https://dev.overpass-api.de/overpass-doc/en/) — requests must include a User-Agent header; avoid hammering the server |
| **Rate limiting** | Application caches results for 10 minutes and adds a 1-second polite delay between sequential requests |
| **Attribution** | Overpass API by Roland Olbricht; data © OpenStreetMap contributors |

---

### 1.3 OSRM (Open Source Routing Machine) — Public Demo Server

| Field | Detail |
|---|---|
| **Source** | [http://router.project-osrm.org/](http://router.project-osrm.org/) |
| **Licence** | OSRM is MIT licence; routing data © OpenStreetMap contributors (ODbL) |
| **Usage policy** | [https://github.com/Project-OSRM/osrm-backend/wiki/Api-usage-policy](https://github.com/Project-OSRM/osrm-backend/wiki/Api-usage-policy) — demo server is for light, non-commercial, non-automated use only. Heavy users should host their own instance. |
| **Coverage** | Global (walking profile used) |
| **Limitations** | Demo server may be rate-limited or unavailable during high load. Route geometry reflects the OSM road/path network at the time of the server's last data update, which may lag behind the live OSM database. |
| **What it provides** | Walking route geometry (GeoJSON), turn-by-turn steps, distance (metres), duration (seconds), up to 3 alternative routes |

---

### 1.4 Nominatim Geocoding

| Field | Detail |
|---|---|
| **Source** | [https://nominatim.openstreetmap.org/](https://nominatim.openstreetmap.org/) |
| **Licence** | Data © OpenStreetMap contributors (ODbL) |
| **Usage policy** | [https://operations.osmfoundation.org/policies/nominatim/](https://operations.osmfoundation.org/policies/nominatim/) — maximum 1 request per second; must include a valid User-Agent; no bulk geocoding |
| **What it provides** | Forward geocoding (place name → coordinates) for the map search feature |

---

## 2. Machine Learning Training Data

### Status: NOT TRAINED

No ML model has been trained in this project. No labelled dataset was found that satisfies all the following requirements simultaneously:

1. **Route-level or segment-level granularity** (not just point observations)
2. **Genuine human-reported perceived-safety labels** (not crime statistics, not algorithmic labels, not synthetic scores)
3. **Linkable to the specific OSM infrastructure features** retrieved by this application

### Datasets Investigated

All eight datasets below were investigated before this decision was made.

---

#### 2.1 Nairobi Perceived Safety Survey — Harvard Dataverse

| Field | Detail |
|---|---|
| **Source** | Harvard Dataverse, doi:[10.7910/DVN/BJIRBW](https://doi.org/10.7910/DVN/BJIRBW) |
| **Authors** | Wanjiku Mwawasi et al. |
| **Contains labels** | Yes — participant-reported perceived safety ratings |
| **Why not used** | Point-level observations (individual survey locations), not linked to route features or OSM infrastructure; geographic coverage limited to Nairobi; significant domain-shift risk if applied globally |

---

#### 2.2 StreetScore — MIT Media Lab

| Field | Detail |
|---|---|
| **Source** | [http://streetscore.media.mit.edu/](http://streetscore.media.mit.edu/) |
| **Authors** | Nikhil Naik, Jade Philipoom, Ramesh Raskar, César Hidalgo (MIT) |
| **Contains labels** | Yes — crowdsourced pairwise safety perceptions |
| **Why not used** | Features are derived from Google Street View images (visual features); not linked to OSM infrastructure tags; the model predicts visual perception, not route-level infrastructure quality; licence does not permit redistribution of derived data |

---

#### 2.3 UN Women Safe Cities Dataset

| Field | Detail |
|---|---|
| **Source** | [https://www.unwomen.org/en/what-we-do/ending-violence-against-women/creating-safe-public-spaces](https://www.unwomen.org/en/what-we-do/ending-violence-against-women/creating-safe-public-spaces) |
| **Contains labels** | Qualitative assessments only |
| **Why not used** | Data is published in PDF reports; not available in machine-readable form; not linkable to OSM features |

---

#### 2.4 NYC Open Data — Pedestrian Safety

| Field | Detail |
|---|---|
| **Source** | [https://opendata.cityofnewyork.us/](https://opendata.cityofnewyork.us/) |
| **Contains labels** | Crash counts and injury data |
| **Why not used** | Contains crash statistics (not perceived safety ratings); not linked to infrastructure features in OSM; NYC-only coverage |

---

#### 2.5 Walk Score — Pedestrian Infrastructure Index

| Field | Detail |
|---|---|
| **Source** | [https://www.walkscore.com/](https://www.walkscore.com/) |
| **Contains labels** | Walkability scores per address |
| **Why not used** | Commercial service; score methodology is proprietary; no API access for training data; scores are walkability (ease of walking), not perceived safety |

---

#### 2.6 SafeGraph Pedestrian Traffic Data

| Field | Detail |
|---|---|
| **Source** | SafeGraph Places (now Dewey Data) |
| **Contains labels** | Foot traffic counts by location |
| **Why not used** | Foot traffic ≠ perceived safety; no safety labels; commercial licence prohibits redistribution |

---

#### 2.7 Chicago City Open Data — Safety Scores

| Field | Detail |
|---|---|
| **Source** | [https://data.cityofchicago.org/](https://data.cityofchicago.org/) |
| **Contains labels** | Crime incident counts per census tract |
| **Why not used** | Crime counts ≠ perceived safety ratings from infrastructure; crime data contains significant reporting bias; not linked to OSM infrastructure features |

---

#### 2.8 OSM QA Tiles / OSM Feature Completeness

| Field | Detail |
|---|---|
| **Source** | [https://osmlab.github.io/osm-qa-tiles/](https://osmlab.github.io/osm-qa-tiles/) |
| **Contains labels** | No safety labels |
| **Why not used** | Infrastructure feature data only; no human safety perception labels |

---

## 3. Attribution Summary

This application must display the following attribution in the UI and any derivatives:

> Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, [ODbL](https://opendatacommons.org/licenses/odbl/)
> Routing by [OSRM](https://project-osrm.org/) · Geocoding by [Nominatim](https://nominatim.openstreetmap.org/)

---

## 4. What a Suitable ML Dataset Would Look Like

For future contributors: a dataset suitable for training a supervised model would need:

- **Unit of observation:** a walking route segment (e.g., 50–500m), not a point or a city
- **Features:** documented OSM-extractable features (lamp count, footway presence, crossing count, etc.)
- **Labels:** genuine participant-reported perceived-safety ratings collected via structured survey from diverse participants in diverse locations
- **Size:** at minimum several thousand labelled segments across multiple cities
- **Ethics:** informed consent from participants; ethical approval; documented demographic information about participants
- **Licence:** open for research use and redistribution

If such a dataset becomes available, the training scaffold at `ml/train_when_available.py` can be used as a starting point.
