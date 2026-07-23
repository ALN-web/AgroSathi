/**
 * weather.service.ts
 *
 * Future placeholder for Weather Analysis module integration.
 * Currently returns a stub response to bypass Gemini for weather queries.
 */

import { logger } from '../utils/logger';

export class WeatherService {
  /**
   * Process a weather-related query.
   * Currently acts as a stub until the actual Weather API is implemented.
   */
  public async handleWeatherQuery(message: string): Promise<string> {
    logger.info('[WeatherService] Handling weather query stub', { message });
    return "Weather Analysis module is currently unavailable.";
  }
}

export const weatherService = new WeatherService();
