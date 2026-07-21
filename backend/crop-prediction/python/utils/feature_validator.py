"""
python/utils/feature_validator.py
─────────────────────────────────────────────────────────────────────────────
AgroSathi — Feature Range Validator

Validates that incoming feature values fall within the ranges observed
in the training dataset (Crop Recommendation Dataset, Kaggle).

Use this as a second layer of validation after Joi (Node.js).
"""

FEATURE_RANGES = {
    "N":           (0,    140),    # Nitrogen      kg/ha
    "P":           (5,    145),    # Phosphorus    kg/ha
    "K":           (5,    205),    # Potassium     kg/ha
    "temperature": (8.8,  43.7),   # °C
    "humidity":    (14.3, 99.9),   # %
    "ph":          (3.5,  9.9),    # pH units
    "rainfall":    (20.2, 298.6),  # mm
}


def validate_features(features: dict) -> list[str]:
    """
    Returns a list of validation error strings.
    Empty list means all features are valid.
    """
    errors = []
    for feature, (lo, hi) in FEATURE_RANGES.items():
        if feature not in features:
            errors.append(f"Missing feature: {feature}")
            continue
        val = features[feature]
        if not (lo <= val <= hi):
            errors.append(
                f"{feature} = {val} is outside expected range [{lo}, {hi}]"
            )
    return errors


def is_valid(features: dict) -> bool:
    return len(validate_features(features)) == 0
