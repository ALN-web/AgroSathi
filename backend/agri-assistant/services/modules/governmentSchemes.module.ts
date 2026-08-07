/**
 * governmentSchemes.module.ts
 *
 * Module that intercepts 'government_schemes' intent and routes it through
 * the Government Schemes Service, which grounds all responses in the
 * real governmentSchemes.json database before handing off to Gemini.
 *
 * This prevents Gemini from fabricating any government scheme information.
 */

import { IAssistantModule, ModuleResponse } from './base.module';
import { IntentType } from '../intent.service';
import { governmentSchemesService } from '../governmentSchemes.service';
import { logger } from '../../utils/logger';

export class GovernmentSchemesModule implements IAssistantModule {
  public readonly name = 'Government Schemes Module';
  public readonly priority = 5;
  public readonly intents: IntentType[] = ['government_schemes'];

  public async handle(message: string, intent: IntentType, conversationId: string): Promise<ModuleResponse | null> {
    logger.info('[GovernmentSchemesModule] Handling government_schemes intent');
    
    const reply = await governmentSchemesService.handleSchemesQuery(message, conversationId);
    
    return { reply, source: 'government_schemes_db+gemini' };
  }
}
