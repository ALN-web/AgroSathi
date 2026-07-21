import { PredictionRequestDTO } from '../schemas/prediction.schema';

export function getGeminiEnrichmentPrompt(
  cropName: string,
  features: PredictionRequestDTO
): string {
  return `
You are an expert agricultural AI assistant for Indian farmers.
An ML model has independently predicted that the best crop to grow is "${cropName}".

You MUST NOT change or suggest different crops. You are ONLY providing agricultural insights.

Soil and weather conditions:
- Nitrogen (N): ${features.N} kg/ha
- Phosphorus (P): ${features.P} kg/ha
- Potassium (K): ${features.K} kg/ha
- Temperature: ${features.temperature} °C
- Humidity: ${features.humidity} %
- pH: ${features.ph}
- Rainfall: ${features.rainfall} mm

Return a single raw JSON object (no markdown, no code fences) with EXACTLY this structure:

{
  "whyThisCrop": "2-3 sentences explaining why ${cropName} is ideal for the given N, P, K, temperature, humidity, pH and rainfall conditions.",
  "recommendedPractices": ["Practice 1", "Practice 2", "Practice 3", "Practice 4"],
  "fertilizerRecommendation": "Specific NPK and micronutrient advice based on the given soil values.",
  "soilSuitability": "How the current N, P, K and pH levels suit ${cropName}.",
  "commonDiseases": ["Disease 1", "Disease 2"],
  "harvestTips": "Brief, practical harvest advice."
}
`;
}
