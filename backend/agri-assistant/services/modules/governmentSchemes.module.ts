import { IAssistantModule, ModuleResponse } from './base.module';
import { IntentType } from '../intent.service';
import { governmentSchemesService } from '../governmentSchemes.service';

export class GovernmentSchemesModule implements IAssistantModule {
  public readonly name = 'Government Schemes Module';
  public readonly priority = 5;
  public readonly intents: IntentType[] = ['government_schemes'];

  public async handle(message: string, intent: IntentType, conversationId: string): Promise<ModuleResponse | null> {
    const schemesReply = await governmentSchemesService.handleSchemesQuery(message);
    return { reply: schemesReply, source: 'government_schemes_service' };
  }
}
