import { logger } from '../utils/logger';

export class ApiService {
  private cropApiUrl = 'http://localhost:8010/api/crop-prediction/predict';

  /**
   * Calls the Crop Prediction backend to predict the crop.
   */
  public async predictCrop(N: number, P: number, K: number, temperature: number, humidity: number, ph: number, rainfall: number): Promise<any> {
    try {
      logger.info('Calling Crop Prediction API with params', { N, P, K, temperature, humidity, ph, rainfall });
      
      const response = await fetch(this.cropApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ N, P, K, temperature, humidity, ph, rainfall }),
      });

      if (!response.ok) {
        throw new Error(`Crop Prediction API responded with status ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      logger.error('Error calling Crop Prediction API:', error);
      return { error: 'Failed to predict crop. The Crop Prediction service might be down.' };
    }
  }

  /**
   * Calls the Open-Meteo Weather API to get current weather for coordinates.
   */
  public async getWeather(latitude: number, longitude: number): Promise<any> {
    try {
      logger.info(`Calling Weather API for lat: ${latitude}, lon: ${longitude}`);
      
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);

      if (!response.ok) {
        throw new Error(`Weather API responded with status ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      logger.error('Error calling Weather API:', error);
      return { error: 'Failed to fetch weather data.' };
    }
  }
}

export const apiService = new ApiService();
