import { IAssistantModule, ModuleResponse } from './base.module';
import { IntentType } from '../intent.service';
import { knowledgeService } from '../knowledge.service';

export class WebsiteKnowledgeModule implements IAssistantModule {
  public readonly name = 'Website Knowledge Module';
  public readonly priority = 3;
  public readonly intents: IntentType[] = ['website_help'];

  public async handle(message: string, intent: IntentType, conversationId: string): Promise<ModuleResponse | null> {
    const directAnswer = knowledgeService.searchWebsiteKnowledge(message);
    if (directAnswer) {
      return { reply: directAnswer, source: 'static_website_knowledge' };
    }
    return null;
  }
}
