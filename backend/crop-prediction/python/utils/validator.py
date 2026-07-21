"""
python/utils/validator.py
─────────────────────────────────────────────────────────────────────────────
Numeric range validation for all 7 ML model input features.

Ranges are derived from the Crop Recommendation Dataset (Kaggle).
Any value outside these bounds is flagged as invalid before inference.
"""

from __future__ import annotations
from dataclasses import dataclass

# ── Accepted feature ranges ──────────────────────────────────────────────────
# (inclusive min, inclusive max)
FEATURE_RANGES: dict[str, tuple[float, float]] = {
    "N":           (0.0,   140.0),   # Nitrogen      kg/ha
    "P":           (5.0,   145.0),   # Phosphorus    kg/ha
    "K":           (5.0,   205.0),   # Potassium     kg/ha
    "temperature": (8.0,   44.0),    # °C
    "humidity":    (14.0,  100.0),   # %
    "ph":          (3.5,   9.9),     # pH units
    "rainfall":    (20.0,  299.0),   # mm
}

REQUIRED_FEATURES: list[str] = list(FEATURE_RANGES.keys())


@dataclass
class ValidationResult:
    is_valid: bool
    errors: list[str]


def validate_features(features: dict) -> ValidationResult:
    """
    Validate that all required features are present and within range.

    Args:
        features: dict with keys matching REQUIRED_FEATURES

    Returns:
        ValidationResult(is_valid, errors)
    """
    errors: list[str] = []

    # 1. Check for missing keys
    for key in REQUIRED_FEATURES:
        if key not in features:
            errors.append(f"Missing required feature: '{key}'")

    if errors:
        return ValidationResult(is_valid=False, errors=errors)

    # 2. Check numeric type
    for key in REQUIRED_FEATURES:
        val = features[key]
        if not isinstance(val, (int, float)):
            errors.append(f"'{key}' must be a number, got {type(val).__name__}")

    if errors:
        return ValidationResult(is_valid=False, errors=errors)

    # 3. Check value ranges
    for key, (lo, hi) in FEATURE_RANGES.items():
        val = float(features[key])
        if not (lo <= val <= hi):
            errors.append(
                f"'{key}' = {val} is outside valid range [{lo}, {hi}]"
            )

    return ValidationResult(is_valid=len(errors) == 0, errors=errors)
