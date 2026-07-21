"""
python/scripts/validate_model.py
─────────────────────────────────────────────────────────────────────────────
AgroSathi — Model Validation / Smoke-test Script

Run this script after placing model artifacts in python/model/ to verify:
  ✓ All required .pkl files are present and loadable
  ✓ Model accepts the expected 7 features in the correct order
  ✓ Output shape and labels are valid

Usage:
    python python/scripts/validate_model.py

TODO: Implement when model artifacts are placed in python/model/
"""

from pathlib import Path

MODEL_DIR = Path(__file__).parent.parent / "model"

REQUIRED_ARTIFACTS = [
    "crop_model.pkl",
    "scaler.pkl",
    "label_encoder.pkl",
]

FEATURE_ORDER = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]

SAMPLE_INPUT = {
    "N": 90,
    "P": 42,
    "K": 43,
    "temperature": 20.8,
    "humidity": 82.0,
    "ph": 6.5,
    "rainfall": 202.9,
}


def check_artifacts():
    print("Checking model artifacts...")
    for artifact in REQUIRED_ARTIFACTS:
        path = MODEL_DIR / artifact
        if not path.exists():
            print(f"  ✗ MISSING: {artifact}")
        else:
            print(f"  ✓ Found:   {artifact} ({path.stat().st_size:,} bytes)")


def run_smoke_test():
    print("\nRunning smoke test...")
    print("  TODO: load model and run SAMPLE_INPUT through predict()")
    print(f"  Sample input: {SAMPLE_INPUT}")
    print("  Expected output: rice (or similar based on these values)")


if __name__ == "__main__":
    check_artifacts()
    run_smoke_test()
    print("\nDone. Replace TODO sections after adding model artifacts.")
