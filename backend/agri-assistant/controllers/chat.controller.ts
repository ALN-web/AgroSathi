import { Request, Response, NextFunction } from 'express';
import { intentService } from '../services/intent.service';
import { conversationService } from '../conversation/conversation.service';
import { cropContextService } from '../services/crop.context.service';
import { moduleRegistryService } from '../services/moduleRegistry.service';
import { geminiService } from '../services/gemini.service';
import { logger } from '../utils/logger';

export const chatWithAssistant = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { message, conversationId, lastPrediction } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    if (!conversationId) {
      return res.status(400).json({ error: 'conversationId is required' });
    }

    // Cache incoming prediction data (from Crop Prediction page) for context
    if (lastPrediction && lastPrediction.prediction?.crop) {
      cropContextService.save(conversationId, {
        ...lastPrediction,
        storedAt: new Date().toISOString(),
      });
      logger.info(`[Controller] Cached prediction context: ${lastPrediction.prediction.crop} (conv: ${conversationId})`);
    }

    // ── Step 1: Detect Intent ─────────────────────────────────────────────────
    const { intent, confidence } = intentService.detect(message);
    logger.info(`[Controller] Intent: ${intent} (${(confidence * 100).toFixed(0)}%)`);

    // ── Step 2: Dispatch to Module Registry (Priority 1-7) ────────────────────
    let reply: string;
    let source: string;

    const moduleResult = await moduleRegistryService.dispatch(message, intent, conversationId);

    if (moduleResult) {
      // A module handled the request
      reply = moduleResult.reply;
      source = moduleResult.source;
    } else {
      // ── Step 3: Fallback to Gemini (Priority 8) ───────────────────────────
      logger.info(`[Controller] No module handled request. Falling back to Gemini.`);
      const geminiResult = await geminiService.getChatResponse(conversationId, message, intent);
      reply = geminiResult.reply;
      source = 'gemini';
    }

    // ── Step 4: Persist message exchange to conversation history ──────────────
    if (intent !== 'unsupported') {
      const history = conversationService.getHistory(conversationId);
      conversationService.updateHistory(conversationId, [
        ...history,
        { role: 'user' as const, parts: [{ text: message }] },
        { role: 'model' as const, parts: [{ text: reply }] },
      ]);
    }

    return res.status(200).json({ success: true, reply, intent, confidence, source });

  } catch (error) {
    next(error); // Forward to global error handler
  }
};

export const clearChat = (req: Request, res: Response, next: NextFunction): any => {
  try {
    const { conversationId } = req.params;
    if (!conversationId) {
      return res.status(400).json({ error: 'conversationId is required' });
    }
    conversationService.clearHistory(conversationId);
    cropContextService.clear(conversationId);
    return res.status(200).json({ success: true, message: 'Chat history cleared' });
  } catch (error) {
    next(error);
  }
};
