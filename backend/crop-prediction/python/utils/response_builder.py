"""
python/utils/response_builder.py
─────────────────────────────────────────────────────────────────────────────
AgroSathi — Python Response Builder

Constructs the JSON response object that predict.py writes to stdout.
Node.js pythonBridgeService parses this output.
"""

import json
from typing import Any


def build_prediction_response(
    predicted_crop: str,
    confidence: float,
    alternatives: list[dict],
    model_version: str = "1.0.0",
) -> str:
    """
    Serialises the prediction result to a JSON string for stdout.

    Args:
        predicted_crop: Top predicted crop label (e.g. "rice")
        confidence:     Probability of top prediction (0.0 – 1.0)
        alternatives:   List of dicts: [{"crop": str, "confidence": float}]
        model_version:  Version string of the loaded model artifact

    Returns:
        JSON string ready to print to stdout
    """
    payload: dict[str, Any] = {
        "predicted_crop": predicted_crop,
        "confidence":     round(confidence, 4),
        "alternatives":   [
            {"crop": a["crop"], "confidence": round(a["confidence"], 4)}
            for a in alternatives
        ],
        "model_version":  model_version,
    }
    return json.dumps(payload)


def build_error_response(message: str) -> str:
    """
    Serialises an error payload to JSON for stderr.
    """
    return json.dumps({"error": message})
