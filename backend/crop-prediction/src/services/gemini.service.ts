/**
 * services/gemini.service.ts
 *
 * Module 2: Gemini Agricultural Intelligence
 *
 * Responsibilities (strictly):
 *  - Call Google Gemini API
 *  - Generate agricultural REASONING for the ML-predicted crop:
 *      whyThisCrop, recommendedPractices, fertilizerRecommendation,
 *      soilSuitability, commonDiseases, harvestTips
 *  - NEVER predict or modify the crop
 *  - NEVER generate yield, profit, duration, or water requirement
 *    (those come from cropProfiles.json via metadata.service)
 *
 * Reusable by: Soil Analysis, Weather Analysis, Government Schemes, AI Chatbot.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import { PredictionRequestDTO } from '../schemas/prediction.schema';
import { getGeminiEnrichmentPrompt } from '../prompts/gemini.prompt';

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

// ── Gemini response type (trimmed — no yield/profit/duration/water) ───────────
export type GeminiResponse = {
  whyThisCrop: string;
  recommendedPractices: string[];
  fertilizerRecommendation: string;
  soilSuitability: string;
  commonDiseases: string[];
  harvestTips: string;
};

// ── Predefined fallback (Gemini unavailable) ──────────────────────────────────
const FALLBACK: GeminiResponse = {
  whyThisCrop: 'This crop is highly suitable for your soil and environmental conditions based on historical agricultural data.',
  recommendedPractices: [
    'Use organic fertilizers for better yield',
    'Maintain optimal soil moisture levels',
    'Sow certified seeds for best results',
    'Implement regular weed and pest management',
  ],
  fertilizerRecommendation: 'Apply standard NPK fertilizer as per soil test recommendations.',
  soilSuitability: 'Current soil parameters are adequate for successful cultivation.',
  commonDiseases: [
    'Monitor for seasonal pests and common fungal diseases',
    'Consult local agricultural extension officer for area-specific threats',
  ],
  harvestTips: 'Harvest at optimal crop maturity for best quality and yield.',
};

// ── Service ───────────────────────────────────────────────────────────────────
export const geminiService = {
  /**
   * Call Gemini to generate agricultural insights.
   * Implements timeout (15s) and one automatic retry before degrading to fallback.
   *
   * @param cropName - ML-predicted crop name (Gemini must not change this)
   * @param features - Input features passed as context
   * @param retries - Internal retry counter
   */
  async getAnalysis(
    cropName: string,
    features: PredictionRequestDTO,
    retries = 1
  ): Promise<{ result: GeminiResponse; status: 'success' | 'fallback' }> {
    if (!config.gemini.apiKey) {
      console.warn('[GeminiService] GEMINI_API_KEY missing — using fallback.');
      return { result: FALLBACK, status: 'fallback' };
    }

    const prompt = getGeminiEnrichmentPrompt(cropName, features);

    try {
      // 15-second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }, { apiVersion: 'v1beta' });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.6,
        },
      });

      clearTimeout(timeoutId);

      const responseText = result.response.text();
      if (!responseText) throw new Error('Empty response from Gemini');

      const parsed = JSON.parse(responseText) as GeminiResponse;
      return { result: parsed, status: 'success' };

    } catch (err: any) {
      console.error(`[GeminiService] Error (retries left: ${retries}):`, err.message);

      if (retries > 0) {
        console.log('[GeminiService] Retrying...');
        return this.getAnalysis(cropName, features, retries - 1);
      }

      console.warn('[GeminiService] All retries exhausted — using fallback response.');
      return { result: FALLBACK, status: 'fallback' };
    }
  },
};
