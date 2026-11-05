import { IAssistantModule, ModuleResponse } from './base.module';
import { IntentType } from '../intent.service';
import { marketPredictionService } from '../marketPrediction.service';

export class MarketPredictionModule implements IAssistantModule {
  public readonly name = 'Market Prediction Module';
  public readonly priority = 6;
  public readonly intents: IntentType[] = ['market_prediction'];

  public async handle(message: string, intent: IntentType, conversationId: string): Promise<ModuleResponse | null> {
    const marketReply = await marketPredictionService.handleMarketQuery(message);
    return { reply: marketReply, source: 'market_prediction_service' };
  }
}
