"""
python/scripts/predict.py
─────────────────────────────────────────────────────────────────────────────
AgroSathi — Crop Prediction ML Inference Script

Called by Node.js pythonBridgeService via child_process.spawn.
The model is loaded once when this process starts; subsequent calls
to this script in the same process reuse the cached model object.

─── stdin / stdout Protocol ─────────────────────────────────────────────────

  INPUT  (stdin)   JSON object with exactly 7 numeric features:
  ───────────────────────────────────────────────────────────────
  {
    "N":           <float>,   // Nitrogen       kg/ha
    "P":           <float>,   // Phosphorus     kg/ha
    "K":           <float>,   // Potassium      kg/ha
    "temperature": <float>,   // °C
    "humidity":    <float>,   // %
    "ph":          <float>,   // pH units
    "rainfall":    <float>    // mm
  }

  OUTPUT (stdout)  JSON object on success:
  ───────────────────────────────────────────────────────────────
  {
    "cropName":      <string>,   // e.g. "rice"
    "modelAccuracy": <float>     // top-class probability, 0.0–1.0
  }

  ERROR  (stderr)  Plain-text error message. stdout is empty.
  ───────────────────────────────────────────────────────────────

  Exit codes:
    0 → success
    1 → input / validation error
    2 → model / inference error
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

# ── Make utils importable when script is called from any working directory ───
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.validator    import validate_features
from utils.model_loader import get_model          # loads & caches model on first import
from utils.predictor    import run_prediction


# ── Pre-load model at startup (fail fast if artifact missing) ────────────────
try:
    get_model()
except FileNotFoundError as exc:
    sys.stderr.write(f"STARTUP ERROR: {exc}\n")
    sys.exit(2)
except RuntimeError as exc:
    sys.stderr.write(f"STARTUP ERROR: {exc}\n")
    sys.exit(2)


def main() -> None:
    # ── 1. Read stdin ────────────────────────────────────────────────────────
    raw = sys.stdin.read().strip()
    if not raw:
        sys.stderr.write("ERROR: No input received on stdin\n")
        sys.exit(1)

    # ── 2. Parse JSON ────────────────────────────────────────────────────────
    try:
        features: dict = json.loads(raw)
    except json.JSONDecodeError as exc:
        sys.stderr.write(f"ERROR: Invalid JSON — {exc}\n")
        sys.exit(1)

    # ── 3. Validate feature ranges ───────────────────────────────────────────
    validation = validate_features(features)
    if not validation.is_valid:
        error_list = "; ".join(validation.errors)
        sys.stderr.write(f"VALIDATION ERROR: {error_list}\n")
        sys.exit(1)

    # ── 4. Run inference ─────────────────────────────────────────────────────
    try:
        result: dict = run_prediction(features)
    except RuntimeError as exc:
        sys.stderr.write(f"INFERENCE ERROR: {exc}\n")
        sys.exit(2)

    # ── 5. Write result to stdout ────────────────────────────────────────────
    print(json.dumps(result))
    sys.exit(0)


if __name__ == "__main__":
    main()
