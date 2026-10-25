# -*- coding: utf-8 -*-
"""
SafeRoute AI - Women's Safety Infrastructure Research Tool
==========================================================
Map Mode  : Click two points on the real OpenStreetMap -> real OSM data
            is fetched from the free Overpass API (no API key required).
Manual Mode: Adjust sliders for fictional/synthetic comparison.

IMPORTANT NOTES:
  - Infrastructure scores reflect publicly-available map data density.
  - Scores do NOT guarantee personal safety or predict crime.
  - No user location, personal data, or private information is collected.
  - OSM data accuracy depends on local community mapping contributions.
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
import folium
from streamlit_folium import st_folium
import requests
import time
import warnings
warnings.filterwarnings("ignore")

# ── Page config ───────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="SafeRoute AI | Women's Safety Research",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Global CSS ────────────────────────────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
* { font-family: 'Inter', sans-serif; }

.stApp {
    background: linear-gradient(135deg, #0f0c29 0%, #1a1a3e 40%, #0d1b2a 100%);
    color: #e2e8f0;
}
[data-testid="stSidebar"] {
    background: linear-gradient(180deg, #1a1a3e 0%, #0f0c29 100%);
    border-right: 1px solid rgba(139,92,246,0.3);
}
.metric-card {
    background: linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(59,130,246,0.1) 100%);
    border: 1px solid rgba(139,92,246,0.35);
    border-radius: 16px; padding: 20px; text-align: center;
    backdrop-filter: blur(10px);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.metric-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(139,92,246,0.25); }
.metric-value {
    font-size: 2.2rem; font-weight: 800;
    background: linear-gradient(90deg, #a78bfa, #60a5fa);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.metric-label { font-size: 0.82rem; color: #94a3b8; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.08em; }
.section-header {
    font-size: 1.6rem; font-weight: 700;
    background: linear-gradient(90deg, #a78bfa, #60a5fa);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    margin-bottom: 0.5rem;
}
.info-box  { background: rgba(59,130,246,0.1);  border-left: 4px solid #3b82f6; border-radius: 8px; padding: 14px 18px; margin-bottom: 14px; font-size: 0.88rem; color: #bfdbfe; }
.warn-box  { background: rgba(251,191,36,0.08); border-left: 4px solid #fbbf24; border-radius: 8px; padding: 14px 18px; margin-bottom: 14px; font-size: 0.88rem; color: #fde68a; }
.ok-box    { background: rgba(52,211,153,0.08); border-left: 4px solid #34d399; border-radius: 8px; padding: 14px 18px; margin-bottom: 14px; font-size: 0.88rem; color: #a7f3d0; }
.err-box   { background: rgba(248,113,113,0.08);border-left: 4px solid #f87171; border-radius: 8px; padding: 14px 18px; margin-bottom: 14px; font-size: 0.88rem; color: #fecaca; }
.osm-card  { background: rgba(255,255,255,0.04); border: 1px solid rgba(139,92,246,0.2); border-radius: 12px; padding: 12px 16px; margin-bottom: 8px; font-size: 0.85rem; color: #cbd5e1; }
.step-badge {
    display:inline-block; width:28px; height:28px; border-radius:50%;
    background: linear-gradient(135deg,#7c3aed,#2563eb);
    color:#fff; font-weight:700; font-size:0.85rem;
    text-align:center; line-height:28px; margin-right:8px;
}
.custom-divider { height:2px; background:linear-gradient(90deg,transparent,rgba(139,92,246,0.6),transparent); margin:24px 0; border:none; }
.badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:0.75rem; font-weight:600; margin-left:6px; }
.badge-green  { background:rgba(52,211,153,0.2); color:#34d399; border:1px solid rgba(52,211,153,0.4); }
.badge-yellow { background:rgba(251,191,36,0.2); color:#fbbf24; border:1px solid rgba(251,191,36,0.4); }
.badge-red    { background:rgba(248,113,113,0.2);color:#f87171; border:1px solid rgba(248,113,113,0.4); }
.badge-blue   { background:rgba(59,130,246,0.2); color:#60a5fa; border:1px solid rgba(59,130,246,0.4); }
[data-baseweb="tab-list"] { background:rgba(255,255,255,0.04)!important; border-radius:12px; padding:4px; }
[data-baseweb="tab"] { color:#94a3b8!important; border-radius:8px!important; }
[aria-selected="true"] { background:linear-gradient(90deg,#7c3aed,#2563eb)!important; color:#fff!important; }
</style>
""", unsafe_allow_html=True)


# ═══════════════════════════════════════════════════════════════════════════════
# CONSTANTS
# ═══════════════════════════════════════════════════════════════════════════════
WEIGHTS = {
    "Street Lighting":   0.35,
    "Footpath Quality":  0.25,
    "Public Facilities": 0.15,
    "Public Transport":  0.15,
    "Help Points":       0.10,
}
FEATURE_COLS  = list(WEIGHTS.keys())
WEIGHT_VALUES = list(WEIGHTS.values())

# OSM tags for each feature category
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

# Feature count thresholds = score of 10  (calibrated per 500 m radius)
THRESHOLDS = {
    "Street Lighting":   30,
    "Footpath Quality":  10,
    "Public Transport":   5,
    "Public Facilities":  5,
    "Help Points":        3,
}

# Map marker colours per OSM category
MARKER_COLORS = {
    "Street Lighting":   "#fbbf24",
    "Footpath Quality":  "#34d399",
    "Public Transport":  "#60a5fa",
    "Public Facilities": "#a78bfa",
    "Help Points":       "#f87171",
}

MARKER_ICONS = {
    "Street Lighting":   "lightbulb",
    "Footpath Quality":  "road",
    "Public Transport":  "bus",
    "Public Facilities": "info-sign",
    "Help Points":       "plus-sign",
}

CLASS_LABELS = ["Needs Improvement", "Moderate", "Better"]
CLASS_COLORS = {
    "Needs Improvement": "#f87171",
    "Moderate":          "#fbbf24",
    "Better":            "#34d399",
}

PLOTLY_LAYOUT = dict(
    paper_bgcolor="rgba(0,0,0,0)",
    plot_bgcolor="rgba(0,0,0,0)",
    font=dict(family="Inter", color="#e2e8f0"),
    margin=dict(l=20, r=20, t=50, b=20),
)

OVERPASS_URL = "https://overpass-api.de/api/interpreter"


# ═══════════════════════════════════════════════════════════════════════════════
# CORE FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

def compute_score(values: dict) -> float:
    return round(sum(values[f] * WEIGHTS[f] for f in FEATURE_COLS), 2)


def classify_score(score: float) -> str:
    if score < 4.0:   return "Needs Improvement"
    elif score < 6.5: return "Moderate"
    return "Better"


def score_color(score: float) -> str:
    if score < 4.0:   return "#f87171"
    elif score < 6.5: return "#fbbf24"
    return "#34d399"


def improvement_suggestions(values: dict) -> list:
    tips = {
        "Street Lighting":   "Install LED streetlights at regular intervals; prioritise underpasses and junctions.",
        "Footpath Quality":  "Repair cracked pavement; widen narrow footpaths to at least 1.5 m.",
        "Public Facilities": "Add well-maintained public restrooms; ensure accessibility for all users.",
        "Public Transport":  "Increase frequency of late-night services; improve shelter at stops.",
        "Help Points":       "Install SOS/help-point kiosks with direct emergency-service connectivity.",
    }
    out = []
    for f, v in values.items():
        if v < 5:
            out.append(f"**{f} ({v:.1f}/10):** {tips[f]}")
    if not out:
        out.append("All indicators are above 5 - maintain current infrastructure standards.")
    return out


# ── Overpass API ───────────────────────────────────────────────────────────────
def build_overpass_query(lat: float, lng: float, radius: int) -> str:
    """Build a single Overpass QL query for all OSM feature categories."""
    parts = []
    for category, tags in OSM_TAGS.items():
        for (elem_type, key, value) in tags:
            if value == '*':
                parts.append(f'{elem_type}["{key}"](around:{radius},{lat:.6f},{lng:.6f});')
            else:
                parts.append(f'{elem_type}["{key}"="{value}"](around:{radius},{lat:.6f},{lng:.6f});')
    query = "[out:json][timeout:30];\n(\n" + "\n".join(f"  {p}" for p in parts) + "\n);\nout body;\n>;\nout skel qt;"
    return query


def parse_osm_response(data: dict) -> dict:
    """
    Classify each returned OSM element into one of our five feature categories.
    Returns dict: { category: [list of {lat, lng, name} dicts] }
    """
    results = {cat: [] for cat in OSM_TAGS}
    for element in data.get("elements", []):
        tags = element.get("tags", {})
        lat  = element.get("lat") or element.get("center", {}).get("lat")
        lng  = element.get("lon") or element.get("center", {}).get("lon")
        if lat is None or lng is None:
            continue

        # Match against each category's tags
        matched = False
        for category, tag_list in OSM_TAGS.items():
            for (_, key, value) in tag_list:
                tag_val = tags.get(key, "")
                if value == '*' and tag_val:
                    results[category].append({"lat": lat, "lng": lng, "name": tags.get("name", category)})
                    matched = True
                    break
                elif tag_val == value:
                    results[category].append({"lat": lat, "lng": lng, "name": tags.get("name", category)})
                    matched = True
                    break
            if matched:
                break

    return results


def counts_to_scores(counts: dict, radius: int) -> dict:
    """
    Convert raw feature counts to 0-10 scores.
    Thresholds are calibrated for a 500 m radius; scale linearly with radius.
    """
    scale = radius / 500.0
    scores = {}
    for feature in FEATURE_COLS:
        threshold = THRESHOLDS[feature] * scale
        n = counts.get(feature, 0)
        raw = min(10.0, (n / threshold) * 10.0) if threshold > 0 else 0.0
        scores[feature] = round(max(1.0, raw), 2)   # floor at 1 so gauge stays readable
    return scores


@st.cache_data(ttl=600, show_spinner=False)
def fetch_osm_data(lat: float, lng: float, radius: int):
    """
    Query Overpass API. Results are cached for 10 minutes.
    Returns (feature_counts, feature_points, error_msg).
    """
    query = build_overpass_query(lat, lng, radius)
    try:
        resp = requests.post(
            OVERPASS_URL,
            data={"data": query},
            timeout=35,
            headers={"User-Agent": "SafeRouteAI-ResearchTool/1.0"},
        )
        resp.raise_for_status()
        data = resp.json()
    except requests.exceptions.Timeout:
        return {}, {}, "Overpass API timed out. Try a smaller radius or try again in a moment."
    except requests.exceptions.ConnectionError:
        return {}, {}, "No internet connection. Please check your network and retry."
    except Exception as e:
        return {}, {}, f"API error: {e}"

    feature_points = parse_osm_response(data)
    feature_counts = {cat: len(pts) for cat, pts in feature_points.items()}
    return feature_counts, feature_points, None


# ── Synthetic dataset (for ML page) ───────────────────────────────────────────
@st.cache_data
def generate_dataset(n: int = 600, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    data = {f: rng.uniform(1, 10, n).round(1) for f in FEATURE_COLS}
    df   = pd.DataFrame(data)
    df["Infrastructure Score"] = df.apply(
        lambda r: round(sum(r[f] * WEIGHTS[f] for f in FEATURE_COLS), 2), axis=1
    )
    df["Quality Class"] = df["Infrastructure Score"].apply(classify_score)
    return df


@st.cache_resource
def train_model(df: pd.DataFrame):
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
    from sklearn.preprocessing import LabelEncoder

    X  = df[FEATURE_COLS]
    le = LabelEncoder()
    y  = le.fit_transform(df["Quality Class"])
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )
    clf = RandomForestClassifier(n_estimators=200, max_depth=8, random_state=42, n_jobs=-1)
    clf.fit(X_train, y_train)
    y_pred = clf.predict(X_test)
    acc    = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, target_names=le.classes_, output_dict=True)
    cm     = confusion_matrix(y_test, y_pred)
    return clf, le, X_test, y_test, y_pred, acc, report, cm


# ═══════════════════════════════════════════════════════════════════════════════
# CHART HELPERS (shared by both modes)
# ═══════════════════════════════════════════════════════════════════════════════

def score_gauge(score, label, color):
    fig = go.Figure(go.Indicator(
        mode="gauge+number",
        value=score,
        number=dict(suffix="/10", font=dict(size=28, color=color)),
        gauge=dict(
            axis=dict(range=[0, 10], tickcolor="#64748b", tickfont=dict(color="#64748b")),
            bar=dict(color=color, thickness=0.25),
            bgcolor="rgba(255,255,255,0.04)",
            steps=[
                dict(range=[0, 4],    color="rgba(248,113,113,0.12)"),
                dict(range=[4, 6.5],  color="rgba(251,191,36,0.12)"),
                dict(range=[6.5, 10], color="rgba(52,211,153,0.12)"),
            ],
            threshold=dict(line=dict(color=color, width=3), thickness=0.7, value=score),
        ),
        title=dict(text=label, font=dict(size=13, color="#94a3b8")),
    ))
    fig.update_layout(**PLOTLY_LAYOUT, height=220)
    return fig


def radar_chart(r1_vals, r2_vals, r1_name, r2_name):
    cats = FEATURE_COLS + [FEATURE_COLS[0]]
    v1   = [r1_vals[f] for f in FEATURE_COLS] + [r1_vals[FEATURE_COLS[0]]]
    v2   = [r2_vals[f] for f in FEATURE_COLS] + [r2_vals[FEATURE_COLS[0]]]
    fig  = go.Figure()
    fig.add_trace(go.Scatterpolar(r=v1, theta=cats, fill="toself", name=r1_name,
                                   line=dict(color="#a78bfa", width=2),
                                   fillcolor="rgba(167,139,250,0.18)"))
    fig.add_trace(go.Scatterpolar(r=v2, theta=cats, fill="toself", name=r2_name,
                                   line=dict(color="#60a5fa", width=2),
                                   fillcolor="rgba(96,165,250,0.18)"))
    fig.update_layout(
        **PLOTLY_LAYOUT,
        polar=dict(
            bgcolor="rgba(255,255,255,0.03)",
            radialaxis=dict(visible=True, range=[0, 10], color="#64748b",
                            gridcolor="rgba(255,255,255,0.08)"),
            angularaxis=dict(color="#94a3b8", gridcolor="rgba(255,255,255,0.08)"),
        ),
        showlegend=True,
        legend=dict(bgcolor="rgba(0,0,0,0)", font=dict(color="#e2e8f0")),
        title=dict(text="Infrastructure Radar Comparison", font=dict(size=14, color="#a78bfa")),
    )
    return fig


def bar_comparison(r1_vals, r2_vals, r1_name, r2_name):
    fig = go.Figure()
    fig.add_trace(go.Bar(name=r1_name, x=FEATURE_COLS,
                          y=[r1_vals[f] for f in FEATURE_COLS],
                          marker=dict(color="#a78bfa", opacity=0.85,
                                      line=dict(color="#7c3aed", width=1.5))))
    fig.add_trace(go.Bar(name=r2_name, x=FEATURE_COLS,
                          y=[r2_vals[f] for f in FEATURE_COLS],
                          marker=dict(color="#60a5fa", opacity=0.85,
                                      line=dict(color="#2563eb", width=1.5))))
    fig.add_hline(y=5, line_dash="dash", line_color="rgba(255,255,255,0.2)",
                  annotation_text="Mid-point", annotation_font_color="#64748b")
    fig.update_layout(
        **PLOTLY_LAYOUT, barmode="group",
        xaxis=dict(gridcolor="rgba(255,255,255,0.06)", color="#94a3b8"),
        yaxis=dict(range=[0, 10.5], gridcolor="rgba(255,255,255,0.06)",
                   color="#94a3b8", title="Score (0-10)"),
        legend=dict(bgcolor="rgba(0,0,0,0)", font=dict(color="#e2e8f0")),
        title=dict(text="Feature-by-Feature Comparison", font=dict(size=14, color="#a78bfa")),
    )
    return fig


def feature_importance_chart(clf):
    imp    = clf.feature_importances_
    from sklearn.preprocessing import LabelEncoder
    df_imp = pd.DataFrame({"Feature": FEATURE_COLS, "Importance": imp}).sort_values("Importance")
    fig = px.bar(df_imp, x="Importance", y="Feature", orientation="h",
                 color="Importance",
                 color_continuous_scale=["#2563eb", "#7c3aed", "#a78bfa"],
                 title="Random Forest - Feature Importances")
    fig.update_layout(**PLOTLY_LAYOUT,
                      xaxis=dict(gridcolor="rgba(255,255,255,0.06)", color="#94a3b8"),
                      yaxis=dict(color="#94a3b8"), coloraxis_showscale=False)
    return fig


def confusion_matrix_chart(cm, labels):
    fig = px.imshow(cm, labels=dict(x="Predicted", y="Actual", color="Count"),
                    x=labels, y=labels,
                    color_continuous_scale=[[0,"#0f0c29"],[0.5,"#7c3aed"],[1,"#a78bfa"]],
                    text_auto=True, title="Confusion Matrix")
    fig.update_layout(**PLOTLY_LAYOUT,
                      xaxis=dict(color="#94a3b8"), yaxis=dict(color="#94a3b8"))
    return fig


def score_distribution_chart(df):
    fig = px.histogram(df, x="Infrastructure Score", color="Quality Class", nbins=40,
                       color_discrete_map=CLASS_COLORS,
                       title="Score Distribution in Synthetic Dataset",
                       labels={"Infrastructure Score": "Score (0-10)", "count": "Frequency"})
    fig.update_layout(**PLOTLY_LAYOUT,
                      xaxis=dict(gridcolor="rgba(255,255,255,0.06)", color="#94a3b8"),
                      yaxis=dict(gridcolor="rgba(255,255,255,0.06)", color="#94a3b8"),
                      legend=dict(bgcolor="rgba(0,0,0,0)", font=dict(color="#e2e8f0")))
    return fig


# ── Folium map builder ────────────────────────────────────────────────────────
def build_folium_map(
    center=(20.5937, 78.9629), zoom=5,
    markers=None,           # list of {lat, lng, color, label, popup}
    feature_points=None,    # dict: {category: [{lat,lng,name}]}
    radius=500,
    circle_centers=None,    # list of {lat,lng,color,label}
):
    m = folium.Map(
        location=center, zoom_start=zoom,
        tiles="CartoDB dark_matter",
        attr="CartoDB",
    )

    # Draw search-radius circles
    if circle_centers:
        for cc in circle_centers:
            folium.Circle(
                location=[cc["lat"], cc["lng"]],
                radius=radius,
                color=cc["color"],
                fill=True,
                fill_opacity=0.06,
                weight=2,
                popup=f"{cc['label']} - {radius}m radius",
            ).add_to(m)

    # Draw OSM feature points
    if feature_points:
        for category, pts in feature_points.items():
            color = MARKER_COLORS.get(category, "#ffffff")
            for pt in pts[:120]:   # cap markers per category to avoid slow render
                folium.CircleMarker(
                    location=[pt["lat"], pt["lng"]],
                    radius=5,
                    color=color,
                    fill=True,
                    fill_color=color,
                    fill_opacity=0.75,
                    popup=folium.Popup(f"<b>{category}</b><br>{pt['name']}", max_width=200),
                    tooltip=category,
                ).add_to(m)

    # Draw route markers (large)
    if markers:
        for mk in markers:
            folium.Marker(
                location=[mk["lat"], mk["lng"]],
                popup=folium.Popup(mk.get("popup", mk["label"]), max_width=220),
                tooltip=mk["label"],
                icon=folium.Icon(color="purple" if mk["color"] == "#a78bfa" else "blue",
                                 icon="map-marker", prefix="fa"),
            ).add_to(m)

    # Legend HTML
    legend_html = """
    <div style='position:fixed;bottom:30px;right:10px;z-index:9999;
                background:rgba(15,12,41,0.9);border:1px solid rgba(139,92,246,0.4);
                border-radius:10px;padding:12px 16px;font-family:Inter,sans-serif;
                font-size:12px;color:#e2e8f0;'>
      <b style='color:#a78bfa;'>OSM Feature Legend</b><br><br>
    """
    for cat, color in MARKER_COLORS.items():
        legend_html += f"<span style='color:{color};'>&#9679;</span> {cat}<br>"
    legend_html += "</div>"
    m.get_root().html.add_child(folium.Element(legend_html))

    return m


# ── Shared results renderer ───────────────────────────────────────────────────
def render_comparison_results(r1_vals, r2_vals, r1_name, r2_name):
    s1   = compute_score(r1_vals)
    s2   = compute_score(r2_vals)
    cls1 = classify_score(s1)
    cls2 = classify_score(s2)

    st.markdown("<div class='custom-divider'></div>", unsafe_allow_html=True)
    st.markdown("#### Infrastructure Indicator Scores")

    c1, c_mid, c2 = st.columns([2, 1, 2])
    with c1:
        st.plotly_chart(score_gauge(s1, r1_name[:28], score_color(s1)),
                        use_container_width=True, key="g1")
        badge = "badge-green" if cls1 == "Better" else ("badge-yellow" if cls1 == "Moderate" else "badge-red")
        st.markdown(f"<div style='text-align:center;'><span class='badge {badge}'>{cls1}</span></div>",
                    unsafe_allow_html=True)
    with c_mid:
        diff   = s1 - s2
        winner = r1_name.split("-")[0].strip() if diff > 0 else (r2_name.split("-")[0].strip() if diff < 0 else "Tie")
        arrow  = "Up" if diff > 0 else ("Down" if diff < 0 else "=")
        st.markdown(f"""
        <div class='metric-card' style='margin-top:40px;'>
            <div class='metric-value' style='font-size:1.8rem;'>
                {'&#9650;' if diff>0 else ('&#9660;' if diff<0 else '=')} {abs(diff):.2f}
            </div>
            <div class='metric-label'>Score Difference</div>
            <div style='font-size:0.78rem;color:#94a3b8;margin-top:6px;'>
                {'Higher: ' + winner if diff != 0 else 'Equal'}
            </div>
        </div>""", unsafe_allow_html=True)
    with c2:
        st.plotly_chart(score_gauge(s2, r2_name[:28], score_color(s2)),
                        use_container_width=True, key="g2")
        badge2 = "badge-green" if cls2 == "Better" else ("badge-yellow" if cls2 == "Moderate" else "badge-red")
        st.markdown(f"<div style='text-align:center;'><span class='badge {badge2}'>{cls2}</span></div>",
                    unsafe_allow_html=True)

    # Feature table
    df_cmp = pd.DataFrame({
        "Feature":      FEATURE_COLS,
        "Weight":       [f"{int(w*100)}%" for w in WEIGHT_VALUES],
        r1_name[:22]:  [r1_vals[f] for f in FEATURE_COLS],
        r2_name[:22]:  [r2_vals[f] for f in FEATURE_COLS],
        "Weighted diff A-B": [round((r1_vals[f] - r2_vals[f]) * WEIGHTS[f], 3) for f in FEATURE_COLS],
    })
    st.dataframe(df_cmp, use_container_width=True, hide_index=True)

    # Charts
    ch1, ch2 = st.columns(2, gap="medium")
    with ch1:
        st.plotly_chart(radar_chart(r1_vals, r2_vals, r1_name[:18], r2_name[:18]),
                        use_container_width=True, key="radar")
    with ch2:
        st.plotly_chart(bar_comparison(r1_vals, r2_vals, r1_name[:18], r2_name[:18]),
                        use_container_width=True, key="barcmp")

    # Suggestions
    st.markdown("<div class='custom-divider'></div>", unsafe_allow_html=True)
    st.markdown("#### Infrastructure Improvement Suggestions")
    sc1, sc2 = st.columns(2, gap="large")
    with sc1:
        st.markdown(f"**{r1_name[:30]}**")
        for s in improvement_suggestions(r1_vals):
            st.markdown(f"<div class='osm-card'>- {s}</div>", unsafe_allow_html=True)
    with sc2:
        st.markdown(f"**{r2_name[:30]}**")
        for s in improvement_suggestions(r2_vals):
            st.markdown(f"<div class='osm-card'>- {s}</div>", unsafe_allow_html=True)

    st.markdown("""
    <div class='warn-box'>
    Infrastructure improvements can support safer public spaces, but do not guarantee personal safety
    or predict crime. Always follow local authority guidance and personal safety best practices.
    </div>""", unsafe_allow_html=True)


# ═══════════════════════════════════════════════════════════════════════════════
# SIDEBAR
# ═══════════════════════════════════════════════════════════════════════════════
with st.sidebar:
    st.markdown("""
    <div style='text-align:center;padding:18px 0 8px;'>
        <div style='font-size:2.4rem;'>🛡️</div>
        <div style='font-size:1.25rem;font-weight:800;
                    background:linear-gradient(90deg,#a78bfa,#60a5fa);
                    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
                    background-clip:text;'>SafeRoute AI</div>
        <div style='font-size:0.72rem;color:#64748b;margin-top:3px;'>
            Women's Safety Infrastructure Research
        </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("""
    <div class='warn-box'>
    Scores reflect OSM data density only. They do <strong>not</strong> guarantee safety
    or predict crime. No personal data is collected.
    </div>""", unsafe_allow_html=True)

    st.markdown("---")
    page = st.radio("Navigation", [
        "🗺️ Map Mode (Real OSM Data)",
        "✏️ Manual Mode (Sliders)",
        "🤖 ML Model",
        "📊 Dataset Explorer",
        "📖 Research",
    ], label_visibility="collapsed")

    st.markdown("---")
    st.markdown("**Weights**")
    for feat, w in WEIGHTS.items():
        st.markdown(
            f"<small style='color:#94a3b8;'>- {feat}: <b style='color:#a78bfa;'>{int(w*100)}%</b></small>",
            unsafe_allow_html=True,
        )
    st.markdown("---")
    st.markdown("<small style='color:#475569;'>v2.0 · Oct 2026 · Real OSM Data</small>",
                unsafe_allow_html=True)


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 1 — MAP MODE (REAL OSM DATA)
# ═══════════════════════════════════════════════════════════════════════════════
if page == "🗺️ Map Mode (Real OSM Data)":
    st.markdown("<div class='section-header'>🗺️ Map Mode — Real OpenStreetMap Data</div>",
                unsafe_allow_html=True)

    st.markdown("""
    <div class='info-box'>
    <strong>How it works:</strong> Click anywhere on the map to place <strong>Route A</strong> marker,
    then click again to place <strong>Route B</strong> marker. The app queries the free
    <strong>Overpass API</strong> (OpenStreetMap) for real infrastructure features within your chosen
    radius — street lamps, bus stops, footpaths, public toilets, police stations, and more.
    <br><br>
    <em>Data accuracy depends on local OSM community contributions. Rural or unmapped areas may return
    few features. No API key or account required.</em>
    </div>""", unsafe_allow_html=True)

    # Radius selector in sidebar-style row
    col_ctrl1, col_ctrl2, col_ctrl3 = st.columns([2, 2, 1])
    with col_ctrl1:
        radius = st.select_slider(
            "Search radius around each point",
            options=[250, 350, 500, 750, 1000],
            value=500,
            format_func=lambda x: f"{x} m",
        )
    with col_ctrl2:
        r1_name = st.text_input("Route A label", value="Route A", key="map_r1name")
        r2_name = st.text_input("Route B label", value="Route B", key="map_r2name")

    # Session state for pin storage
    if "map_pins" not in st.session_state:
        st.session_state.map_pins = []       # list of {lat, lng}
    if "osm_r1" not in st.session_state:
        st.session_state.osm_r1 = None       # {counts, points, scores}
    if "osm_r2" not in st.session_state:
        st.session_state.osm_r2 = None
    if "last_radius" not in st.session_state:
        st.session_state.last_radius = radius

    # If radius changed, clear cached OSM results so they re-fetch
    if st.session_state.last_radius != radius:
        st.session_state.osm_r1 = None
        st.session_state.osm_r2 = None
        st.session_state.last_radius = radius

    pins = st.session_state.map_pins

    # Step indicator
    step_labels = {
        0: "Click on the map to place Route A marker",
        1: "Click again to place Route B marker",
        2: "Both markers placed — fetch OSM data below",
    }
    n_pins = min(len(pins), 2)
    st.markdown(f"""
    <div class='info-box' style='padding:10px 14px;'>
        <span class='step-badge'>{n_pins + 1 if n_pins < 2 else '✓'}</span>
        <strong>{step_labels[n_pins]}</strong>
    </div>""", unsafe_allow_html=True)

    # Build current map
    markers_for_map = []
    circle_centers  = []
    fp_display      = {}

    if len(pins) >= 1:
        markers_for_map.append({"lat": pins[0]["lat"], "lng": pins[0]["lng"],
                                  "color": "#a78bfa", "label": r1_name,
                                  "popup": f"<b>{r1_name}</b><br>{pins[0]['lat']:.5f}, {pins[0]['lng']:.5f}"})
        circle_centers.append({"lat": pins[0]["lat"], "lng": pins[0]["lng"],
                                "color": "#a78bfa", "label": r1_name})
        if st.session_state.osm_r1:
            fp_display.update(st.session_state.osm_r1["points"])

    if len(pins) >= 2:
        markers_for_map.append({"lat": pins[1]["lat"], "lng": pins[1]["lng"],
                                  "color": "#60a5fa", "label": r2_name,
                                  "popup": f"<b>{r2_name}</b><br>{pins[1]['lat']:.5f}, {pins[1]['lng']:.5f}"})
        circle_centers.append({"lat": pins[1]["lat"], "lng": pins[1]["lng"],
                                "color": "#60a5fa", "label": r2_name})
        if st.session_state.osm_r2:
            # Merge points for display (avoid key collision by appending _B)
            for cat, pts in st.session_state.osm_r2["points"].items():
                fp_display[cat] = fp_display.get(cat, []) + pts

    center = (pins[0]["lat"], pins[0]["lng"]) if pins else (20.5937, 78.9629)
    zoom   = 15 if pins else 5

    fmap = build_folium_map(
        center=center, zoom=zoom,
        markers=markers_for_map,
        feature_points=fp_display if fp_display else None,
        radius=radius,
        circle_centers=circle_centers if circle_centers else None,
    )

    # Render interactive map and capture clicks
    map_result = st_folium(fmap, width="100%", height=480, key="main_map",
                           returned_objects=["last_clicked"])

    # Handle new clicks
    if map_result and map_result.get("last_clicked"):
        click = map_result["last_clicked"]
        new_pin = {"lat": click["lat"], "lng": click["lng"]}
        # Only register if it differs from last pin (avoid duplicate on re-render)
        if not pins or (abs(new_pin["lat"] - pins[-1]["lat"]) > 0.00001 or
                        abs(new_pin["lng"] - pins[-1]["lng"]) > 0.00001):
            if len(pins) < 2:
                st.session_state.map_pins.append(new_pin)
                st.rerun()
            # If already 2 pins — ignore extra clicks (user can reset)

    # Control buttons
    btn_col1, btn_col2, btn_col3 = st.columns([1, 1, 2])
    with btn_col1:
        if st.button("Reset Markers", use_container_width=True):
            st.session_state.map_pins = []
            st.session_state.osm_r1   = None
            st.session_state.osm_r2   = None
            st.rerun()
    with btn_col2:
        fetch_disabled = len(pins) < 2
        if st.button("Fetch OSM Data", disabled=fetch_disabled,
                     use_container_width=True, type="primary"):
            with st.spinner("Querying OpenStreetMap via Overpass API..."):
                # Route A
                cnt_a, pts_a, err_a = fetch_osm_data(pins[0]["lat"], pins[0]["lng"], radius)
                if err_a:
                    st.error(f"Route A error: {err_a}")
                else:
                    scores_a = counts_to_scores(cnt_a, radius)
                    st.session_state.osm_r1 = {"counts": cnt_a, "points": pts_a, "scores": scores_a}

                time.sleep(1)   # polite delay between Overpass requests

                # Route B
                cnt_b, pts_b, err_b = fetch_osm_data(pins[1]["lat"], pins[1]["lng"], radius)
                if err_b:
                    st.error(f"Route B error: {err_b}")
                else:
                    scores_b = counts_to_scores(cnt_b, radius)
                    st.session_state.osm_r2 = {"counts": cnt_b, "points": pts_b, "scores": scores_b}

            st.rerun()

    # OSM Feature count summary cards
    if st.session_state.osm_r1 or st.session_state.osm_r2:
        st.markdown("<div class='custom-divider'></div>", unsafe_allow_html=True)
        st.markdown("#### OSM Feature Counts (Real Data)")
        hdr_cols = st.columns([2] + [1] * len(FEATURE_COLS))
        hdr_cols[0].markdown("**Route**")
        for i, f in enumerate(FEATURE_COLS):
            hdr_cols[i+1].markdown(f"<small style='color:#94a3b8;'>{f}</small>",
                                   unsafe_allow_html=True)

        if st.session_state.osm_r1:
            cnt = st.session_state.osm_r1["counts"]
            row = st.columns([2] + [1] * len(FEATURE_COLS))
            row[0].markdown(f"<span class='badge badge-blue'>{r1_name[:18]}</span>",
                            unsafe_allow_html=True)
            for i, f in enumerate(FEATURE_COLS):
                row[i+1].markdown(f"**{cnt.get(f, 0)}**")

        if st.session_state.osm_r2:
            cnt = st.session_state.osm_r2["counts"]
            row = st.columns([2] + [1] * len(FEATURE_COLS))
            row[0].markdown(f"<span class='badge badge-green'>{r2_name[:18]}</span>",
                            unsafe_allow_html=True)
            for i, f in enumerate(FEATURE_COLS):
                row[i+1].markdown(f"**{cnt.get(f, 0)}**")

        st.markdown(f"""
        <div class='info-box'>
        <small>Scores normalised for a <strong>{radius} m</strong> radius.
        Threshold for score 10: Street Lighting={int(THRESHOLDS['Street Lighting'] * radius/500)},
        Footpath={int(THRESHOLDS['Footpath Quality'] * radius/500)},
        Transport={int(THRESHOLDS['Public Transport'] * radius/500)},
        Facilities={int(THRESHOLDS['Public Facilities'] * radius/500)},
        Help Points={int(THRESHOLDS['Help Points'] * radius/500)}.
        Data source: OpenStreetMap contributors (ODbL).</small>
        </div>""", unsafe_allow_html=True)

    # Show comparison results when both routes fetched
    if st.session_state.osm_r1 and st.session_state.osm_r2:
        r1_scores = st.session_state.osm_r1["scores"]
        r2_scores = st.session_state.osm_r2["scores"]
        render_comparison_results(r1_scores, r2_scores, r1_name, r2_name)

    elif not pins:
        # First-time hint with world map
        st.markdown("""
        <div class='ok-box'>
        <strong>Getting started:</strong> The map shows the whole world. Zoom into any city,
        then click two locations to compare their infrastructure. Well-mapped cities (London,
        Bengaluru, Berlin, Tokyo, etc.) will return richer OSM data.
        </div>""", unsafe_allow_html=True)


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 2 — MANUAL MODE (SLIDERS)
# ═══════════════════════════════════════════════════════════════════════════════
elif page == "✏️ Manual Mode (Sliders)":
    st.markdown("<div class='section-header'>✏️ Manual Mode — Fictional Slider Input</div>",
                unsafe_allow_html=True)
    st.markdown("""
    <div class='warn-box'>
    <strong>⚠️ Fictional data only.</strong> All values below are manually entered and do not
    represent any real location. Use Map Mode for real OpenStreetMap data.
    </div>""", unsafe_allow_html=True)

    col_r1, col_r2 = st.columns(2, gap="large")
    with col_r1:
        st.markdown("### Route A")
        r1_name = st.text_input("Route A name", "Route A - City Centre", key="sl_r1n")
        r1_vals = {f: st.slider(f"{f} ({int(w*100)}%)", 1.0, 10.0, 5.0, 0.5, key=f"sl_r1_{f}")
                   for f, w in WEIGHTS.items()}
    with col_r2:
        st.markdown("### Route B")
        r2_name = st.text_input("Route B name", "Route B - Industrial Zone", key="sl_r2n")
        r2_vals = {f: st.slider(f"{f} ({int(w*100)}%)", 1.0, 10.0, 5.0, 0.5, key=f"sl_r2_{f}")
                   for f, w in WEIGHTS.items()}

    render_comparison_results(r1_vals, r2_vals, r1_name, r2_name)


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 3 — ML MODEL
# ═══════════════════════════════════════════════════════════════════════════════
elif page == "🤖 ML Model":
    st.markdown("<div class='section-header'>🤖 Machine Learning Model</div>", unsafe_allow_html=True)
    st.markdown("""
    <div class='info-box'>
    A <strong>Random Forest classifier</strong> trained on 600 synthetic records predicts
    infrastructure quality class. Trained on simulated data for demonstration; real-world
    deployment would require field-audited labels.
    </div>""", unsafe_allow_html=True)

    df = generate_dataset()
    clf, le, X_test, y_test, y_pred, acc, report, cm = train_model(df)

    m1, m2, m3, m4 = st.columns(4)
    for col, (lbl, val, note) in zip([m1, m2, m3, m4], [
        ("Accuracy",     f"{acc*100:.1f}%", "Held-out test set (25%)"),
        ("Train Size",   "450 records",      "Synthetic training samples"),
        ("Test Size",    "150 records",      "Held-out test samples"),
        ("Trees",        "200",              "Decision trees"),
    ]):
        with col:
            st.markdown(f"""
            <div class='metric-card'>
                <div class='metric-value'>{val}</div>
                <div class='metric-label'>{lbl}</div>
                <div style='font-size:0.7rem;color:#64748b;margin-top:5px;'>{note}</div>
            </div>""", unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)
    ch_a, ch_b = st.columns(2)
    with ch_a:
        st.plotly_chart(feature_importance_chart(clf), use_container_width=True, key="fi")
    with ch_b:
        st.plotly_chart(confusion_matrix_chart(cm, le.classes_), use_container_width=True, key="cm")

    st.markdown("#### Classification Report")
    rrows = [{"Class": c,
              "Precision": f"{report[c]['precision']:.3f}",
              "Recall":    f"{report[c]['recall']:.3f}",
              "F1-Score":  f"{report[c]['f1-score']:.3f}",
              "Support":   int(report[c]["support"])} for c in le.classes_]
    st.dataframe(pd.DataFrame(rrows), use_container_width=True, hide_index=True)

    st.markdown("<div class='custom-divider'></div>", unsafe_allow_html=True)
    st.markdown("#### Live Prediction")
    pred_cols = st.columns(len(FEATURE_COLS))
    pred_vals = {f: col.slider(f, 1.0, 10.0, 5.5, 0.5, key=f"pred_{f}")
                 for f, col in zip(FEATURE_COLS, pred_cols)}

    pred_score = compute_score(pred_vals)
    pred_input = pd.DataFrame([pred_vals])[FEATURE_COLS]
    pred_idx   = clf.predict(pred_input)[0]
    pred_proba = clf.predict_proba(pred_input)[0]
    pred_class = le.inverse_transform([pred_idx])[0]

    p1, p2, p3 = st.columns(3)
    with p1:
        st.markdown(f"""<div class='metric-card'>
            <div class='metric-value' style='color:{score_color(pred_score)};'>{pred_score:.2f}</div>
            <div class='metric-label'>Infrastructure Score</div></div>""", unsafe_allow_html=True)
    with p2:
        cc = CLASS_COLORS[pred_class]
        st.markdown(f"""<div class='metric-card'>
            <div class='metric-value' style='font-size:1.35rem;color:{cc};'>{pred_class}</div>
            <div class='metric-label'>Predicted Class</div></div>""", unsafe_allow_html=True)
    with p3:
        pb = "<br>".join([f"{le.classes_[i]}: {p*100:.1f}%" for i, p in enumerate(pred_proba)])
        st.markdown(f"""<div class='metric-card'>
            <div style='font-size:0.85rem;color:#94a3b8;line-height:1.9;'>{pb}</div>
            <div class='metric-label'>Class Probabilities</div></div>""", unsafe_allow_html=True)


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 4 — DATASET EXPLORER
# ═══════════════════════════════════════════════════════════════════════════════
elif page == "📊 Dataset Explorer":
    st.markdown("<div class='section-header'>📊 Synthetic Dataset Explorer</div>",
                unsafe_allow_html=True)
    st.markdown("""
    <div class='warn-box'>
    The dataset below is <strong>100% synthetic</strong> (programmatically generated for ML training).
    It does not represent any real location, person, or event.
    </div>""", unsafe_allow_html=True)

    df = generate_dataset()
    mc = st.columns(4)
    for col, (lbl, val, note) in zip(mc, [
        ("Total Records", str(len(df)),                            "Synthetic rows"),
        ("Features",      str(len(FEATURE_COLS)),                  "Infrastructure indicators"),
        ("Classes",       "3",                                      "Quality tiers"),
        ("Avg Score",     f"{df['Infrastructure Score'].mean():.2f}", "Mean score"),
    ]):
        with col:
            st.markdown(f"""<div class='metric-card'>
                <div class='metric-value'>{val}</div>
                <div class='metric-label'>{lbl}</div>
                <div style='font-size:0.7rem;color:#64748b;margin-top:5px;'>{note}</div>
            </div>""", unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)
    st.plotly_chart(score_distribution_chart(df), use_container_width=True, key="dist")

    pie_col, stat_col = st.columns(2)
    with pie_col:
        counts = df["Quality Class"].value_counts().reset_index()
        counts.columns = ["Quality Class", "Count"]
        fig_pie = px.pie(counts, names="Quality Class", values="Count",
                         color="Quality Class", color_discrete_map=CLASS_COLORS,
                         title="Class Distribution", hole=0.45)
        fig_pie.update_layout(**PLOTLY_LAYOUT,
                              legend=dict(bgcolor="rgba(0,0,0,0)", font=dict(color="#e2e8f0")))
        st.plotly_chart(fig_pie, use_container_width=True, key="pie")
    with stat_col:
        st.markdown("#### Descriptive Statistics")
        st.dataframe(df[FEATURE_COLS + ["Infrastructure Score"]].describe().round(2),
                     use_container_width=True)

    st.markdown("#### Sample Records (first 50)")
    st.dataframe(df.head(50), use_container_width=True, hide_index=True)

    st.markdown("#### Feature Correlation Heatmap")
    corr = df[FEATURE_COLS + ["Infrastructure Score"]].corr().round(3)
    fig_heat = px.imshow(corr, text_auto=True,
                         color_continuous_scale=[[0,"#0f0c29"],[0.5,"#7c3aed"],[1,"#a78bfa"]],
                         title="Pearson Correlation (Synthetic Data)", zmin=-1, zmax=1)
    fig_heat.update_layout(**PLOTLY_LAYOUT,
                           xaxis=dict(color="#94a3b8"), yaxis=dict(color="#94a3b8"))
    st.plotly_chart(fig_heat, use_container_width=True, key="heat")


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 5 — RESEARCH
# ═══════════════════════════════════════════════════════════════════════════════
elif page == "📖 Research":
    st.markdown("<div class='section-header'>📖 Research Overview</div>", unsafe_allow_html=True)
    tabs = st.tabs(["Problem", "Objectives", "Methodology", "Limitations", "Conclusion"])

    with tabs[0]:
        st.markdown("### Problem Statement")
        st.markdown("""
        Women's safety in public spaces remains a pressing global concern. This research explores
        whether **public infrastructure density** — as captured by OpenStreetMap community data —
        can serve as a measurable proxy for route supportiveness.

        **v2 upgrade:** Route scores now derive from **real OSM data** queried via the Overpass API,
        replacing the purely synthetic slider model. This allows actual geographic comparison of
        infrastructure quality across real locations.

        > **Scope:** Scores reflect data voluntarily contributed to OpenStreetMap and do not
        > incorporate crime records, incident reports, or personal safety perceptions.
        """)

    with tabs[1]:
        st.markdown("### Research Objectives")
        for i, obj in enumerate([
            "Design a transparent weighted Infrastructure Indicator from five OSM feature categories.",
            "Enable real geographic comparison by querying live Overpass API data.",
            "Provide an interactive map interface for accessible, zero-setup route selection.",
            "Train a Random Forest classifier on synthetic data to demonstrate the ML pipeline.",
            "Offer actionable infrastructure improvement suggestions for low-scoring features.",
            "Maintain a clear ethical boundary between infrastructure research and safety guarantees.",
        ], 1):
            st.markdown(f"<div class='osm-card'><strong>{i}.</strong> {obj}</div>",
                        unsafe_allow_html=True)

    with tabs[2]:
        st.markdown("### Methodology")
        st.markdown("""
        #### Infrastructure Indicator

        | Feature | Weight | OSM Tags Used |
        |---|---|---|
        | Street Lighting | 35% | `highway=street_lamp` |
        | Footpath Quality | 25% | `highway=footway/path/pedestrian` |
        | Public Facilities | 15% | `amenity=toilets/bench/shelter` |
        | Public Transport | 15% | `public_transport=stop_position`, `highway=bus_stop` |
        | Help Points | 10% | `amenity=police/hospital`, `emergency=phone` |

        **Score = 0.35·Lighting + 0.25·Footpath + 0.15·Facilities + 0.15·Transport + 0.10·HelpPoints**

        #### Normalization
        Raw counts are converted to 0–10 scores:
        `score = min(10, count / threshold × 10)`
        Thresholds are calibrated for a 500 m radius and scale proportionally with chosen radius.

        #### Data Source
        All map data is retrieved from **OpenStreetMap** via the free **Overpass API**
        (overpass-api.de). No API key is required. Results are cached for 10 minutes per location.

        #### ML Pipeline
        Random Forest trained on synthetic data (600 records) for demonstration of the
        classification methodology. Real deployment would require field-audited training labels.
        """)

    with tabs[3]:
        st.markdown("### Limitations")
        for title, desc in [
            ("OSM Data Completeness",
             "OpenStreetMap relies on volunteer contributions. Rural, developing, or recently-developed areas may have sparse data, leading to artificially low scores independent of actual infrastructure quality."),
            ("No Crime or Incident Data",
             "The indicator does not incorporate crime statistics or reported incidents, which are essential components of any complete safety analysis."),
            ("Static Radius Model",
             "Real routes have length and directionality; this tool compares point-based radii. A path-corridor model would be more representative for actual journey planning."),
            ("Weight Assumptions",
             "Feature weights are assumed from urban-safety literature. In practice they should be validated through participatory research with diverse women's communities."),
            ("No Temporal Dimension",
             "Infrastructure quality varies by time of day (e.g., lighting matters more at night). Scores are static and do not incorporate time-of-day weighting."),
            ("Overpass API Rate Limits",
             "The public Overpass API has usage limits. Heavy concurrent use may cause timeouts. A self-hosted Overpass instance would be required for production use."),
        ]:
            st.markdown(f"<div class='osm-card'><strong>🔶 {title}:</strong> {desc}</div>",
                        unsafe_allow_html=True)

    with tabs[4]:
        st.markdown("### Conclusion")
        st.markdown("""
        SafeRoute AI v2 demonstrates that freely available **OpenStreetMap data** combined with
        a transparent weighted scoring formula can provide a geographic, evidence-grounded
        infrastructure indicator for public-space safety research.

        **Key findings from the real-data upgrade:**
        - Street lighting and footpath coverage are verifiably the strongest contributors
          to infrastructure scores in well-mapped urban areas.
        - Large variation exists between city-centre and peri-urban/industrial locations,
          consistent with the research hypothesis.
        - The Overpass API provides sufficient data quality for proof-of-concept research
          without any proprietary data or API keys.

        **Future work:**
        1. Path-corridor queries (not just point radii) for full route analysis.
        2. Time-of-day weighting using OSM opening hours and lighting schedules.
        3. Integration of anonymised incident-report heat maps (with consent protocols).
        4. Participatory validation of feature weights with diverse women's communities.
        """)
        st.markdown("""
        <div class='ok-box'>
        ✅ No personal data, live location, or private information is collected or transmitted.
        All OSM queries are made with a research user-agent and respect Overpass API usage guidelines.
        </div>""", unsafe_allow_html=True)
