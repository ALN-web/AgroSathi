/**
 * services/responseBuilder.service.ts
 *
 * Orchestrator — The ONLY entry point for the prediction controller.
 *
 * Flow:
 *   User Input
 *     ↓
 *   prediction.service  (Module 1 — ML: crop, accuracy, alternatives)
 *     ↓
 *   metadata.service    (Module 3 — static: image, scientific name, profile)
 *     ↓
 *   gemini.service      (Module 2 — AI: why, practices, soil, diseases, tips)
 *     ↓
 *   responseBuilder     (assembles unified response)
 *     ↓
 *   Controller → Frontend
 *
 * Design notes:
 *  - growthDuration and waterRequirement come ONLY from cropProfiles.json
 *  - Gemini NEVER generates static numeric properties
 *  - estimatedYield and estimatedProfit are REMOVED from the response
 */

import { PredictionRequestDTO } from '../schemas/prediction.schema';
import { PredictionResult, AlternativeCrop } from '../schemas/response.schema';
import { predictionService } from './prediction.service';
import { geminiService } from './gemini.service';
import { metadataService } from './metadata.service';

const GEMINI_VERSION = 'gemini-1.5-flash';
const MODEL_VERSION  = 'crop_model_v1';

export const responseBuilderService = {
  /**
   * Build the full unified API response.
   * The controller calls ONLY this method.
   */
  async build(features: PredictionRequestDTO): Promise<PredictionResult> {
    const totalStart = Date.now();

    // ── STEP 1: ML Prediction ─────────────────────────────────────────────
    const mlStart = Date.now();
    const mlResult = await predictionService.runPrediction(features);
    const mlTime = Date.now() - mlStart;

    console.log(`[ResponseBuilder] ✅ ML Prediction: "${mlResult.crop}" | Accuracy: ${(mlResult.accuracy * 100).toFixed(2)}% | Time: ${mlTime}ms`);

    // ── STEP 2: Static metadata (image) + crop profile (duration/water) ───
    const mainMeta    = metadataService.getCropMeta(mlResult.crop);
    const cropProfile = metadataService.getCropProfile(mlResult.crop);

    console.log(`[ResponseBuilder] 📖 Crop Profile: duration="${cropProfile.growthDuration}" water="${cropProfile.waterRequirement}"`);

    // ── STEP 3: Gemini Analysis (reasoning only) ──────────────────────────
    const geminiStart = Date.now();
    const { result: geminiResult, status: geminiStatus } = await geminiService.getAnalysis(
      mlResult.crop,
      features
    );
    const geminiTime = Date.now() - geminiStart;

    console.log(`[ResponseBuilder] ${geminiStatus === 'success' ? '✅' : '⚠️ '} Gemini Status: ${geminiStatus} | Time: ${geminiTime}ms`);

    // ── STEP 4: Assemble alternative crops (image only — no yield/profit) ─
    const alternativeCrops: AlternativeCrop[] = mlResult.alternatives.map(alt => {
      const altMeta = metadataService.getCropMeta(alt.crop);
      return {
        crop:  alt.crop.charAt(0).toUpperCase() + alt.crop.slice(1),
        score: parseFloat((alt.score * 100).toFixed(1)),
        image: altMeta.image,
      };
    });

    // ── STEP 5: Assemble final unified response ───────────────────────────
    const totalTime = Date.now() - totalStart;
    console.log(`[ResponseBuilder] 🏁 Total Response Time: ${totalTime}ms`);

    return {
      prediction: {
        crop:     mlResult.crop.charAt(0).toUpperCase() + mlResult.crop.slice(1),
        accuracy: parseFloat((mlResult.accuracy * 100).toFixed(2)),
      },
      analysis: {
        // From Gemini (reasoning)
        whyThisCrop:             geminiResult.whyThisCrop,
        recommendedPractices:    geminiResult.recommendedPractices,
        fertilizerRecommendation:geminiResult.fertilizerRecommendation,
        soilSuitability:         geminiResult.soilSuitability,
        commonDiseases:          geminiResult.commonDiseases,
        harvestTips:             geminiResult.harvestTips,
      },
      alternativeCrops,
      metadata: {
        season:           cropProfile.season,
        category:         cropProfile.category,
        growthDuration:   cropProfile.growthDuration,
        waterRequirement: cropProfile.waterRequirement,
        generatedAt:      new Date().toISOString(),
        modelVersion:     MODEL_VERSION,
        geminiVersion:    geminiStatus === 'success' ? GEMINI_VERSION : 'fallback',
        responseTime:     `${totalTime}ms`,
      },
    };
  },
};
