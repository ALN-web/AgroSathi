import { IAssistantModule, ModuleResponse } from './base.module';
import { IntentType } from '../intent.service';
import { weatherService } from '../weather.service';

export class WeatherModule implements IAssistantModule {
  public readonly name = 'Weather Module';
  public readonly priority = 4;
  public readonly intents: IntentType[] = ['weather'];

  public async handle(message: string, intent: IntentType, conversationId: string): Promise<ModuleResponse | null> {
    const weatherReply = await weatherService.handleWeatherQuery(message);
    return { reply: weatherReply, source: 'weather_service' };
  }
}
