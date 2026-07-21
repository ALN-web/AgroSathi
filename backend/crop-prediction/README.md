# AgroSathi — Crop Prediction Service

Isolated backend module for AI-powered crop prediction.

Accepts **7 soil & weather features** and returns the best crop recommendation using a trained scikit-learn model.

---

## Accepted ML Features

| Feature | Unit | Description |
|---------|------|-------------|
| `N` | kg/ha | Nitrogen content in soil |
| `P` | kg/ha | Phosphorus content in soil |
| `K` | kg/ha | Potassium content in soil |
| `temperature` | °C | Ambient temperature |
| `humidity` | % | Relative humidity |
| `ph` | — | Soil pH (0–14) |
| `rainfall` | mm | Annual rainfall |

---

## Folder Structure

```
crop-prediction/
├── src/
│   ├── server.ts                     # Express app entry point
│   ├── config/
│   │   └── index.ts                  # Typed environment config
│   ├── controllers/
│   │   └── prediction.controller.ts  # Request handlers
│   ├── routes/
│   │   └── prediction.routes.ts      # Express router
│   ├── services/
│   │   ├── prediction.service.ts     # Business logic
│   │   └── pythonBridge.service.ts   # Node ↔ Python IPC
│   ├── middleware/
│   │   ├── validate.middleware.ts    # Joi request validation
│   │   ├── error.middleware.ts       # Global error handler
│   │   ├── logger.middleware.ts      # Request logging
│   │   └── rateLimiter.middleware.ts # Rate limiting
│   ├── schemas/
│   │   ├── prediction.schema.ts      # Joi schema + DTO type
│   │   └── response.schema.ts        # Response type definitions
│   ├── constants/
│   │   ├── crops.ts                  # 22 supported crop labels
│   │   └── api.ts                    # Endpoints, status codes, error codes
│   └── helpers/
│       ├── response.helper.ts        # API response builders
│       └── featureVector.helper.ts   # DTO → ordered feature array
│
├── python/
│   ├── scripts/
│   │   ├── predict.py                # ML inference via stdin/stdout JSON
│   │   └── validate_model.py         # Artifact smoke-test script
│   ├── utils/
│   │   ├── feature_validator.py      # Training-range validation
│   │   └── response_builder.py       # Python JSON response builder
│   ├── model/
│   │   └── README.md                 # Where to place .pkl artifacts
│   └── requirements.txt              # numpy, scikit-learn, joblib, pandas
│
├── prompts/
│   └── README.md                     # LLM prompt templates (future)
│
├── tests/
│   ├── prediction.test.ts            # Jest unit tests (Node)
│   └── test_predict.py               # pytest unit tests (Python)
│
├── logs/                             # Runtime log files (gitignored)
├── temp/                             # Temporary inference files (gitignored)
├── uploads/                          # Future: uploaded soil reports (gitignored)
├── responses/                        # Persisted prediction responses (gitignored)
│
├── .env.example                      # Environment variable template
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/crop-prediction/health` | Service health check |
| `POST` | `/api/v1/crop-prediction/predict` | Single prediction *(TODO)* |
| `POST` | `/api/v1/crop-prediction/predict/batch` | Batch predictions *(TODO)* |
| `GET` | `/api/v1/crop-prediction/history` | Prediction history *(TODO)* |

---

## Setup

```bash
# 1. Copy env file
cp .env.example .env

# 2. Install Node dependencies
npm install

# 3. Install Python dependencies
pip install -r python/requirements.txt

# 4. Place model artifacts in python/model/
#    crop_model.pkl | scaler.pkl | label_encoder.pkl

# 5. Validate model
python python/scripts/validate_model.py

# 6. Run development server
npm run dev
```

---

## Port

Default: **8010** (configurable via `CROP_PREDICTION_PORT` in `.env`)
