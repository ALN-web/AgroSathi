"""
python/utils/predictor.py
─────────────────────────────────────────────────────────────────────────────
Core inference logic.

Transforms a validated feature dict into the ordered numpy array the
model expects, runs predict_proba, and returns:

    {
        "cropName":      str,   # e.g. "rice"
        "modelAccuracy": float  # top-class probability, 0.0 – 1.0
    }

This module has NO side effects — it only reads the cached model.
"""

from __future__ import annotations

import numpy as np

from .model_loader import get_model

# Feature order MUST match the order used during training
# (confirmed from model.feature_names_in_)
FEATURE_ORDER: list[str] = [
    "N",
    "P",
    "K",
    "temperature",
    "humidity",
    "ph",
    "rainfall",
]


def _build_feature_array(features: dict) -> np.ndarray:
    """
    Convert the feature dict into a 2-D numpy array shaped (1, 7).
    Order strictly follows FEATURE_ORDER.
    """
    vector = [float(features[key]) for key in FEATURE_ORDER]
    return np.array([vector])


def run_prediction(features: dict) -> dict:
    """
    Run inference on the cached RandomForestClassifier.

    Args:
        features: Validated dict with keys N, P, K, temperature,
                  humidity, ph, rainfall

    Returns:
        {
            "cropName":      str,
            "modelAccuracy": float   # rounded to 4 decimal places
        }

    Raises:
        RuntimeError: if inference fails for any reason
    """
    model = get_model()

    X = _build_feature_array(features)

    try:
        # predict_proba → shape (1, n_classes)
        probabilities: np.ndarray = model.predict_proba(X)[0]
    except Exception as exc:
        raise RuntimeError(f"Model inference failed: {exc}") from exc

    # Get the indices of the top 5 probabilities sorted descending
    top_5_indices = np.argsort(probabilities)[::-1][:5]
    
    top_index: int = int(top_5_indices[0])
    predicted_crop: str = model.classes_[top_index]
    confidence: float = round(float(probabilities[top_index]), 4)
    
    alternative_crops = []
    for idx in top_5_indices[1:]:
        alt_crop = model.classes_[idx]
        alt_prob = round(float(probabilities[idx]), 4)
        alternative_crops.append({
            "cropName": alt_crop,
            "suitabilityScore": alt_prob
        })

    return {
        "predictedCrop": {
            "cropName": predicted_crop,
            "modelAccuracy": confidence
        },
        "alternativeCrops": alternative_crops
    }
