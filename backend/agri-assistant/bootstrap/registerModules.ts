/**
 * registerModules.ts
 *
 * Bootstrap file that registers all assistant modules into the registry.
 * To add a new module to the assistant, simply import and register it here.
 * No other files need to be modified (Open-Closed Principle).
 */

import { moduleRegistryService } from '../services/moduleRegistry.service';
import { CropExplanationModule } from '../services/modules/cropExplanation.module';
import { StaticKnowledgeModule } from '../services/modules/staticKnowledge.module';
import { WebsiteKnowledgeModule } from '../services/modules/websiteKnowledge.module';
import { WeatherModule } from '../services/modules/weather.module';
import { GovernmentSchemesModule } from '../services/modules/governmentSchemes.module';
import { MarketPredictionModule } from '../services/modules/marketPrediction.module';
import { SoilAnalysisModule } from '../services/modules/soilAnalysis.module';
import { logger } from '../utils/logger';

export function registerAllModules() {
  moduleRegistryService.register(new CropExplanationModule());  // Priority 1
  moduleRegistryService.register(new StaticKnowledgeModule());  // Priority 2
  moduleRegistryService.register(new WebsiteKnowledgeModule()); // Priority 3
  moduleRegistryService.register(new WeatherModule());          // Priority 4
  moduleRegistryService.register(new GovernmentSchemesModule());// Priority 5
  moduleRegistryService.register(new MarketPredictionModule()); // Priority 6
  moduleRegistryService.register(new SoilAnalysisModule());     // Priority 7
  // Priority 8 (Gemini) is handled automatically by the controller as the final fallback.

  logger.info('[Bootstrap] All assistant modules registered successfully.');
}
