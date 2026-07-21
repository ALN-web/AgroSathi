/**
 * schemas/response.schema.ts
 *
 * TypeScript types for all API response shapes returned by this service.
 * Aligned with the unified modular architecture:
 *   - prediction  → ML module output
 *   - analysis    → Gemini agricultural intelligence
 *   - alternativeCrops → ML probabilities + Gemini enrichment + metadata
 *   - metadata    → request tracing & versioning
 */

// ── ML Prediction (Module 1) ─────────────────────────────────────────────────

export type MLPredictionResult = {
  crop: string;
  accuracy: number;
  alternatives: { crop: string; score: number }[];
};

// ── Gemini Analysis (Module 2) + Metadata Properties ───────────────────────────

export type AnalysisResult = {
  whyThisCrop: string;
  recommendedPractices: string[];
  fertilizerRecommendation: string | string[];
  soilSuitability: string;
  commonDiseases: string[];
  harvestTips: string | string[];
};

// ── Crop Profile (Module 3 — from cropProfiles.json) ─────────────────────────

export type CropProfile = {
  season: string;
  category: string;
  growthDuration: string;
  waterRequirement: string;
};

// ── Crop Metadata (Module 3) ─────────────────────────────────────────────────

export type CropMeta = {
  image: string;
  scientificName: string;
  season: string;
  category: string;
  color: string;
  icon: string;
};

// ── Alternative Crop (combined) ──────────────────────────────────────────────

export type AlternativeCrop = {
  crop: string;
  score: number;
  image: string;
};

// ── Response Metadata ────────────────────────────────────────────────────────

export type ResponseMetadata = {
  season: string;
  category: string;
  growthDuration: {
    minDays: number;
    maxDays: number;
  };
  waterRequirement: {
    min: number;
    max: number;
    unit: string;
  };
  generatedAt: string;
  modelVersion: string;
  geminiVersion: string;
  responseTime: string;
};

// ── Final Unified Response ───────────────────────────────────────────────────

export type PredictionResult = {
  prediction: {
    crop: string;
    accuracy: number;
  };
  analysis: AnalysisResult;
  alternativeCrops: AlternativeCrop[];
  metadata: ResponseMetadata;
};

// ── HTTP Response Wrappers ───────────────────────────────────────────────────

export type CropPredictionResponse = {
  success: true;
  requestId: string;
  timestamp: string;
  data: PredictionResult;
};

export type ErrorResponse = {
  success: false;
  requestId: string;
  timestamp: string;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};
