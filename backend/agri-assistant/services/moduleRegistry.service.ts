/**
 * moduleRegistry.service.ts
 *
 * The core orchestrator that holds registered modules and routes requests 
 * through them in priority order.
 */

import { IAssistantModule, ModuleResponse } from './modules/base.module';
import { IntentType } from './intent.service';
import { logger } from '../utils/logger';

export class ModuleRegistryService {
  private modules: IAssistantModule[] = [];

  /**
   * Register a new module into the orchestration pipeline.
   * It automatically sorts the registry by priority (lowest number first).
   */
  public register(module: IAssistantModule) {
    this.modules.push(module);
    this.modules.sort((a, b) => a.priority - b.priority);
    logger.info(`[ModuleRegistry] Registered module: ${module.name} (Priority: ${module.priority})`);
  }

  /**
   * Dispatches the request through the registered modules in priority order.
   * The first module that returns a response short-circuits the chain.
   */
  public async dispatch(message: string, intent: IntentType, conversationId: string): Promise<ModuleResponse | null> {
    
    // Quick reject for completely unsupported intents before hitting any module
    if (intent === 'unsupported') {
      return {
        reply: "I'm AgroSaathi AI. I can assist you with farming, crop prediction, weather analysis, soil analysis, government schemes, and features available in AgroSaathi.",
        source: 'orchestrator_rejection'
      };
    }

    for (const mod of this.modules) {
      if (mod.intents.includes(intent) || mod.intents.length === 0) { // Empty intents array could mean catch-all
        try {
          const result = await mod.handle(message, intent, conversationId);
          if (result !== null) {
            logger.info(`[ModuleRegistry] Handled by ${mod.name}`);
            return result;
          }
        } catch (error) {
          logger.error(`[ModuleRegistry] Error executing module ${mod.name}:`, error);
          // Depending on design, we might want to throw here, but continuing allows fallback to Gemini
          // Throwing ensures global error handler catches it if it's a critical module error.
          throw error; 
        }
      }
    }

    // If no module handles it, return null to signal fallback (Gemini)
    return null;
  }
}

export const moduleRegistryService = new ModuleRegistryService();
