"""
SafeRoute AI — FastAPI Backend
Provides ML training and prediction endpoints for the frontend.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import os

from ml.train import train_models

app = FastAPI(
    title="SafeRoute AI Backend",
    description="ML training and prediction API for SafeRoute AI research project.",
    version="1.0.0",
)

# Allow frontend dev server and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    street_lighting: float = Field(..., ge=0, le=100)
    footpath_quality: float = Field(..., ge=0, le=100)
    public_facility_access: float = Field(..., ge=0, le=100)
    public_transport_access: float = Field(..., ge=0, le=100)
    public_help_points: float = Field(..., ge=0, le=100)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "SafeRoute AI backend is running."}


@app.post("/train", tags=["ML"])
def train():
    """
    Train Decision Tree and Random Forest classifiers on the synthetic dataset.
    Returns real evaluation metrics from scikit-learn.
    """
    try:
        result = train_models()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")


@app.get("/dataset", tags=["Data"])
def get_dataset():
    """Return the first 20 rows of the synthetic dataset as JSON."""
    import pandas as pd
    csv_path = os.path.join(os.path.dirname(__file__), "ml", "dataset.csv")
    df = pd.read_csv(csv_path)
    return {
        "columns": list(df.columns),
        "rows": df.head(20).to_dict(orient="records"),
        "total_rows": len(df),
        "note": "This is a synthetic dataset generated for research demonstration purposes only.",
    }


@app.post("/predict", tags=["ML"])
def predict(request: PredictRequest):
    """
    Predict infrastructure quality label using pre-trained models.
    Returns predictions from both Decision Tree and Random Forest.
    Note: Models must be trained first via POST /train.
    """
    import pickle
    import numpy as np

    models_dir = os.path.join(os.path.dirname(__file__), "ml", "models")
    dt_path = os.path.join(models_dir, "decision_tree.pkl")
    rf_path = os.path.join(models_dir, "random_forest.pkl")

    if not os.path.exists(dt_path) or not os.path.exists(rf_path):
        raise HTTPException(
            status_code=400,
            detail="Models not trained yet. Call POST /train first."
        )

    with open(dt_path, "rb") as f:
        dt_model = pickle.load(f)
    with open(rf_path, "rb") as f:
        rf_model = pickle.load(f)

    features = np.array([[
        request.street_lighting,
        request.footpath_quality,
        request.public_facility_access,
        request.public_transport_access,
        request.public_help_points,
    ]])

    dt_pred = dt_model.predict(features)[0]
    rf_pred = rf_model.predict(features)[0]
    dt_proba = dt_model.predict_proba(features)[0].tolist()
    rf_proba = rf_model.predict_proba(features)[0].tolist()
    classes = list(dt_model.classes_)

    return {
        "decision_tree": {"prediction": dt_pred, "probabilities": dict(zip(classes, dt_proba))},
        "random_forest": {"prediction": rf_pred, "probabilities": dict(zip(classes, rf_proba))},
        "disclaimer": "This prediction is based on a synthetic training dataset and has no real-world safety validity.",
    }
