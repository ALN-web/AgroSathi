/**
 * crop.context.service.ts
 *
 * Stores the last crop prediction result per conversationId in memory.
 * This allows the AI Assistant to explain a prediction without re-running the ML model.
 *
 * Only the agri-assistant module reads/writes this cache.
 * It is NOT shared with the crop-prediction backend.
 */

export interface StoredPrediction {
  prediction: {
    crop: string;
    accuracy: number;
  };
  analysis: {
    whyThisCrop?: string;
    recommendedPractices?: string[];
    fertilizerRecommendation?: string;
    soilSuitability?: string;
    commonDiseases?: string[];
    harvestTips?: string;
  };
  alternativeCrops: Array<{
    crop: string;
    score: number;
    image?: string;
  }>;
  metadata: {
    season?: string;
    category?: string;
    growthDuration?: any;
    waterRequirement?: any;
    generatedAt?: string;
    modelVersion?: string;
    geminiVersion?: string;
    responseTime?: string;
  };
  inputs?: {
    N?: number;
    P?: number;
    K?: number;
    temperature?: number;
    humidity?: number;
    ph?: number;
    rainfall?: number;
  };
  storedAt: string;
}

class CropContextService {
  private store: Map<string, StoredPrediction> = new Map();

  /** Save the last crop prediction result for a conversation */
  public save(conversationId: string, prediction: StoredPrediction): void {
    this.store.set(conversationId, prediction);
  }

  /** Retrieve the last stored prediction for a conversation (or null if none) */
  public get(conversationId: string): StoredPrediction | null {
    return this.store.get(conversationId) ?? null;
  }

  /** Clear the stored prediction when a conversation ends */
  public clear(conversationId: string): void {
    this.store.delete(conversationId);
  }
}

export const cropContextService = new CropContextService();
