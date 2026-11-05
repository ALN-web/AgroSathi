import { IAssistantModule, ModuleResponse } from './base.module';
import { IntentType } from '../intent.service';
import { logger } from '../../utils/logger';

export class SoilAnalysisModule implements IAssistantModule {
  public readonly name = 'Soil Analysis Module';
  public readonly priority = 7;
  public readonly intents: IntentType[] = ['soil_analysis'];

  public async handle(message: string, intent: IntentType, conversationId: string): Promise<ModuleResponse | null> {
    logger.info('[SoilAnalysisModule] Handling soil analysis query stub', { message });
    return { 
      reply: "The Soil Analysis module will be available soon.", 
      source: 'soil_analysis_service' 
    };
  }
}
