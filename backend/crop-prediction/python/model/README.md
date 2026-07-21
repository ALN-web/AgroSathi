# python/model/README.md

# Model Artifacts

Place your trained sklearn model artifacts here:

| File | Description |
|------|-------------|
| `crop_model.pkl` | Trained classifier (e.g. RandomForestClassifier) |
| `scaler.pkl` | StandardScaler / MinMaxScaler fitted on training data |
| `label_encoder.pkl` | LabelEncoder for the 22 crop class labels |

## Expected Feature Order

The model must accept features in exactly this order:

```python
["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
```

## Supported Crops (22 classes)

rice, maize, chickpea, kidneybeans, pigeonpeas, mothbeans, mungbean,
blackgram, lentil, pomegranate, banana, mango, grapes, watermelon,
muskmelon, apple, orange, papaya, coconut, cotton, jute, coffee

## Generating Artifacts

After training your model, save artifacts with joblib:

```python
import joblib

joblib.dump(model,   "crop_model.pkl")
joblib.dump(scaler,  "scaler.pkl")
joblib.dump(encoder, "label_encoder.pkl")
```

## Validating Artifacts

```bash
python python/scripts/validate_model.py
```
