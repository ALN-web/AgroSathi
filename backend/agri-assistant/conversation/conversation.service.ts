import { logger } from '../utils/logger';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export class ConversationService {
  private conversations: Record<string, ChatMessage[]> = {};
  private readonly MAX_HISTORY_LENGTH = 10; // Limits to last 10 messages (5 turns)

  public getHistory(conversationId: string): ChatMessage[] {
    if (!this.conversations[conversationId]) {
      this.conversations[conversationId] = [];
    }
    return this.conversations[conversationId];
  }

  public updateHistory(conversationId: string, history: ChatMessage[]) {
    // Keep only the last MAX_HISTORY_LENGTH messages
    if (history.length > this.MAX_HISTORY_LENGTH) {
      history = history.slice(history.length - this.MAX_HISTORY_LENGTH);
    }
    
    // Ensure the history starts with a user message if truncated, as Gemini requires
    // But since it's just raw context, it usually works. To be safe, if the first is 'model', we can drop it.
    if (history.length > 0 && history[0].role === 'model') {
      history = history.slice(1);
    }

    this.conversations[conversationId] = history;
    logger.info(`Updated history for conversation ${conversationId}, length: ${history.length}`);
  }

  public clearHistory(conversationId: string) {
    if (this.conversations[conversationId]) {
      delete this.conversations[conversationId];
      logger.info(`Cleared conversation history for ${conversationId}`);
    }
  }
}

export const conversationService = new ConversationService();
