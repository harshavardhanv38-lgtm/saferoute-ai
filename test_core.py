# -*- coding: utf-8 -*-
"""
SafeRoute AI v2 - Logic & OSM Integration Tests
Runs without Streamlit. Tests core functions + one live Overpass API query.
"""
import sys, requests, json
import numpy as np
import pandas as pd

# ── replicate constants from app.py ──────────────────────────────────────────
WEIGHTS = {
    "Street Lighting":   0.35,
    "Footpath Quality":  0.25,
    "Public Facilities": 0.15,
    "Public Transport":  0.15,
    "Help Points":       0.10,
}
FEATURE_COLS = list(WEIGHTS.keys())

OSM_TAGS = {
    "Street Lighting": [
        ('node', 'highway', 'street_lamp'),
        ('node', 'light:street', '*'),
    ],
    "Footpath Quality": [
        ('way',  'highway', 'footway'),
        ('way',  'highway', 'path'),
        ('way',  'highway', 'pedestrian'),
        ('way',  'foot',    'designated'),
    ],
    "Public Transport": [
        ('node', 'public_transport', 'stop_position'),
        ('node', 'highway',          'bus_stop'),
        ('node', 'railway',          'tram_stop'),
        ('node', 'railway',          'station'),
    ],
    "Public Facilities": [
        ('node', 'amenity', 'toilets'),
        ('node', 'amenity', 'bench'),
        ('node', 'amenity', 'drinking_water'),
        ('node', 'amenity', 'shelter'),
        ('node', 'amenity', 'pharmacy'),
    ],
    "Help Points": [
        ('node', 'amenity',   'police'),
        ('node', 'emergency', 'phone'),
        ('node', 'emergency', 'ambulance_station'),
        ('node', 'amenity',   'hospital'),
        ('node', 'amenity',   'fire_station'),
    ],
}
THRESHOLDS = {
    "Street Lighting":   30,
    "Footpath Quality":  10,
    "Public Transport":   5,
    "Public Facilities":  5,
    "Help Points":        3,
}
OVERPASS_URL = "https://overpass-api.de/api/interpreter"

def compute_score(values):
    return round(sum(values[f] * WEIGHTS[f] for f in FEATURE_COLS), 2)

def classify_score(score):
    if score < 4.0:   return "Needs Improvement"
    elif score < 6.5: return "Moderate"
    return "Better"

def build_overpass_query(lat, lng, radius):
    parts = []
    for category, tags in OSM_TAGS.items():
        for (elem_type, key, value) in tags:
            if value == '*':
                parts.append(f'{elem_type}["{key}"](around:{radius},{lat:.6f},{lng:.6f});')
            else:
                parts.append(f'{elem_type}["{key}"="{value}"](around:{radius},{lat:.6f},{lng:.6f});')
    return "[out:json][timeout:30];\n(\n" + "\n".join(f"  {p}" for p in parts) + "\n);\nout body;\n>;\nout skel qt;"

def parse_osm_response(data):
    results = {cat: [] for cat in OSM_TAGS}
    for element in data.get("elements", []):
        tags = element.get("tags", {})
        lat  = element.get("lat") or element.get("center", {}).get("lat")
        lng  = element.get("lon") or element.get("center", {}).get("lon")
        if lat is None or lng is None:
            continue
        matched = False
        for category, tag_list in OSM_TAGS.items():
            for (_, key, value) in tag_list:
                tag_val = tags.get(key, "")
                if value == '*' and tag_val:
                    results[category].append({"lat": lat, "lng": lng, "name": tags.get("name", category)})
                    matched = True; break
                elif tag_val == value:
                    results[category].append({"lat": lat, "lng": lng, "name": tags.get("name", category)})
                    matched = True; break
            if matched: break
    return results

def counts_to_scores(counts, radius):
    scale = radius / 500.0
    scores = {}
    for feature in FEATURE_COLS:
        threshold = THRESHOLDS[feature] * scale
        n = counts.get(feature, 0)
        raw = min(10.0, (n / threshold) * 10.0) if threshold > 0 else 0.0
        scores[feature] = round(max(1.0, raw), 2)
    return scores

# ─────────────────────────────────────────────────────────────────────────────
PASS = 0; FAIL = 0

def ok(msg):
    global PASS; PASS += 1; print(f"[PASS] {msg}")

def fail(msg):
    global FAIL; FAIL += 1; print(f"[FAIL] {msg}", file=sys.stderr)

# Test 1: compute_score
s = compute_score({f: 5.0 for f in FEATURE_COLS})
if abs(s - 5.0) < 0.001: ok(f"compute_score(all 5.0) = {s}")
else: fail(f"compute_score returned {s}")

# Test 2: weights sum
if abs(sum(WEIGHTS.values()) - 1.0) < 1e-9: ok("Weights sum to 1.0")
else: fail("Weights do not sum to 1.0")

# Test 3: classify_score boundaries
tests = [(3.9, "Needs Improvement"), (4.0, "Moderate"), (6.5, "Better"), (10.0, "Better")]
all_ok = all(classify_score(s) == c for s, c in tests)
if all_ok: ok("classify_score boundaries correct")
else: fail("classify_score boundary failure")

# Test 4: counts_to_scores
counts_good = {"Street Lighting": 30, "Footpath Quality": 10, "Public Transport": 5,
               "Public Facilities": 5, "Help Points": 3}
scores = counts_to_scores(counts_good, 500)
if all(abs(v - 10.0) < 0.01 for v in scores.values()): ok("counts_to_scores at threshold -> all 10.0")
else: fail(f"counts_to_scores threshold mapping wrong: {scores}")

counts_zero = {f: 0 for f in FEATURE_COLS}
scores_zero = counts_to_scores(counts_zero, 500)
if all(v == 1.0 for v in scores_zero.values()): ok("counts_to_scores with zeros -> all floored at 1.0")
else: fail(f"zero-count floor wrong: {scores_zero}")

# Test 5: overpass query builder
query = build_overpass_query(51.5074, -0.1278, 500)
if "street_lamp" in query and "bus_stop" in query and "toilets" in query:
    ok("Overpass query contains expected OSM tags")
else: fail("Overpass query missing tags")

# Test 6: parse_osm_response with mock data
mock_data = {
    "elements": [
        {"type": "node", "id": 1, "lat": 51.50, "lon": -0.12, "tags": {"highway": "street_lamp"}},
        {"type": "node", "id": 2, "lat": 51.51, "lon": -0.13, "tags": {"highway": "bus_stop"}},
        {"type": "node", "id": 3, "lat": 51.52, "lon": -0.11, "tags": {"amenity": "toilets"}},
        {"type": "node", "id": 4, "lat": 51.53, "lon": -0.10, "tags": {"amenity": "police"}},
        {"type": "way",  "id": 5, "center": {"lat": 51.54, "lon": -0.09}, "tags": {"highway": "footway"}},
    ]
}
parsed = parse_osm_response(mock_data)
counts = {cat: len(pts) for cat, pts in parsed.items()}
expected = {"Street Lighting": 1, "Footpath Quality": 1, "Public Transport": 1,
            "Public Facilities": 1, "Help Points": 1}
if counts == expected: ok(f"parse_osm_response classifies 5 mock elements correctly: {counts}")
else: fail(f"parse_osm_response wrong: got {counts}, expected {expected}")

# Test 7: LIVE Overpass API call (London, 250m radius to stay lightweight)
print("\n[LIVE] Querying Overpass API: London (51.5074, -0.1278), radius=250m ...")
try:
    q = build_overpass_query(51.5074, -0.1278, 250)
    resp = requests.post(OVERPASS_URL, data={"data": q}, timeout=35,
                         headers={"User-Agent": "SafeRouteAI-Test/2.0"})
    resp.raise_for_status()
    data = resp.json()
    n_elements = len(data.get("elements", []))
    pts = parse_osm_response(data)
    cnt = {cat: len(v) for cat, v in pts.items()}
    sc  = counts_to_scores(cnt, 250)
    total_score = compute_score(sc)
    ok(f"Live Overpass API returned {n_elements} elements")
    ok(f"Feature counts: {cnt}")
    ok(f"Derived scores: {sc}")
    ok(f"Infrastructure score for London (City): {total_score}/10 -> '{classify_score(total_score)}'")
except Exception as e:
    fail(f"Live Overpass API query failed: {e}")

# ─────────────────────────────────────────────────────────────────────────────
print()
print("=" * 48)
print(f"  RESULTS: {PASS} passed, {FAIL} failed")
print("=" * 48)
sys.exit(0 if FAIL == 0 else 1)
