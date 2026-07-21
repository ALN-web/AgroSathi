"""
python/utils/model_loader.py
─────────────────────────────────────────────────────────────────────────────
Singleton model loader — loads crop_model.pkl exactly once at startup
and keeps the object in memory for all subsequent prediction calls.

Usage:
    from utils.model_loader import get_model
    model = get_model()          # Returns cached instance
    proba = model.predict_proba(X)
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import joblib

# ── Model artifact path ──────────────────────────────────────────────────────
_MODEL_DIR = Path(__file__).parent.parent / "model"
_MODEL_PATH = _MODEL_DIR / "crop_model.pkl"

# ── Singleton cache ───────────────────────────────────────────────────────────
_model_instance: Any = None


def get_model() -> Any:
    """
    Return the loaded RandomForestClassifier instance.
    Loads from disk only on the first call; cached for all subsequent calls.

    Raises:
        FileNotFoundError: if crop_model.pkl is not found
        RuntimeError:      if the file cannot be loaded
    """
    global _model_instance

    if _model_instance is not None:
        return _model_instance

    if not _MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model artifact not found at: {_MODEL_PATH}\n"
            "Place crop_model.pkl inside python/model/ and restart."
        )

    try:
        _model_instance = joblib.load(_MODEL_PATH)
    except Exception as exc:
        raise RuntimeError(f"Failed to load model from {_MODEL_PATH}: {exc}") from exc

    return _model_instance


def get_model_meta() -> dict:
    """
    Return static metadata about the loaded model.
    Does NOT reload the model file.
    """
    model = get_model()
    return {
        "algorithm":    model.__class__.__name__,
        "n_estimators": getattr(model, "n_estimators", None),
        "n_features":   getattr(model, "n_features_in_", 7),
        "classes":      list(model.classes_),
        "model_file":   str(_MODEL_PATH),
    }
