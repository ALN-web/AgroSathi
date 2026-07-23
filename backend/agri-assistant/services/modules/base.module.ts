/**
 * base.module.ts
 *
 * Defines the contract for all intelligent assistant modules.
 */

import { IntentType } from '../intent.service';

export interface ModuleResponse {
  reply: string;
  source: string;
}

export interface IAssistantModule {
  /**
   * The human-readable name of the module (e.g., 'Crop Explanation Module')
   */
  readonly name: string;

  /**
   * Priority determines the order in which modules are evaluated.
   * Lower number = higher priority.
   */
  readonly priority: number;

  /**
   * The intents this module claims to be able to handle.
   */
  readonly intents: IntentType[];

  /**
   * Process the request. If the module cannot handle it, it should return null.
   * 
   * @param message The user's original message
   * @param intent The detected intent
   * @param conversationId The ID of the current conversation
   * @returns ModuleResponse if handled, or null if it decides to pass.
   */
  handle(message: string, intent: IntentType, conversationId: string): Promise<ModuleResponse | null>;
}
