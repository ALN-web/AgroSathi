/**
 * marketPrediction.service.ts
 *
 * Future placeholder for Market Prediction module integration.
 * Currently returns a stub response to bypass Gemini.
 */

import { logger } from '../utils/logger';

export class MarketPredictionService {
  public async handleMarketQuery(message: string): Promise<string> {
    logger.info('[MarketPredictionService] Handling market query stub', { message });
    return "The Market Price Prediction module will be available soon.";
  }
}

export const marketPredictionService = new MarketPredictionService();
