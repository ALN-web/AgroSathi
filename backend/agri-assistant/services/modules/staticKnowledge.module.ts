import { IAssistantModule, ModuleResponse } from './base.module';
import { IntentType } from '../intent.service';
import { knowledgeService } from '../knowledge.service';

export class StaticKnowledgeModule implements IAssistantModule {
  public readonly name = 'Static Knowledge Module';
  public readonly priority = 2;
  public readonly intents: IntentType[] = ['crop_information', 'general_agriculture'];

  public async handle(message: string, intent: IntentType, conversationId: string): Promise<ModuleResponse | null> {
    const directAnswer = knowledgeService.searchDirectAnswer(message);
    if (directAnswer) {
      return { reply: directAnswer, source: 'static_crop_knowledge' };
    }
    return null;
  }
}
