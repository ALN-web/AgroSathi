import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { logger } from '../utils/logger';
import { conversationService } from '../conversation/conversation.service';
import { cropContextService } from './crop.context.service';
import { apiService } from './api.service';
import fs from 'fs';
import path from 'path';

const SYSTEM_INSTRUCTION = `You are AgroSaathi AI, an expert agricultural assistant for the AgroSaathi platform.
You ONLY answer questions about farming, crop science, soil health, weather, government schemes, and AgroSaathi features.
If a user asks something unrelated (e.g., sports, politics, entertainment), politely refuse by saying:
"I'm AgroSaathi AI. I can assist you with farming, crop prediction, weather analysis, soil analysis, government schemes, and features available in AgroSaathi."

When a CROP PREDICTION CONTEXT is provided below, always refer to that specific data.
Never independently predict a new crop — that is the job of the ML model.
Your role is to advise, explain, and elaborate based on available data.

Return a structured JSON response:
{
  "success": true,
  "reply": "Your detailed response here"
}`;

export interface ChatResponse {
  success: boolean;
  reply: string;
}

export interface GeminiChatOptions {
  /**  If provided, Gemini will be given the stored crop prediction as extra context */
  enrichWithCropContext?: boolean;
  /** Extra system note to prefix to the message (used for crop explanations) */
  systemNote?: string;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private websiteKnowledge: string = '{}';
  private cropProfiles: string = '{}';

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.error('GEMINI_API_KEY is not defined in environment variables');
      throw new Error('GEMINI_API_KEY is missing');
    }

    // Load knowledge files once at startup
    try {
      const kbPath = path.join(__dirname, '../knowledge/websiteKnowledge.json');
      this.websiteKnowledge = fs.readFileSync(kbPath, 'utf8');
    } catch (err) {
      logger.error('Failed to load websiteKnowledge.json', err);
    }

    try {
      const cpPath = path.join(__dirname, '../knowledge/cropProfiles.json');
      this.cropProfiles = fs.readFileSync(cpPath, 'utf8');
    } catch (err) {
      logger.error('Failed to load cropProfiles.json', err);
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Build the Gemini model with full context injected into the system instruction.
   * This is called fresh on each request so we always include current prediction context.
   */
  private buildModel(cropContext?: string) {
    const contextSection = cropContext
      ? `\n\n## Current User's Crop Prediction Result (from ML Model):\n${cropContext}`
      : '';

    const dynamicInstruction = `${SYSTEM_INSTRUCTION}

## AgroSaathi Platform Knowledge:
${this.websiteKnowledge}

## Crop Profiles Reference Data:
${this.cropProfiles}${contextSection}`;

    const tools = [
      {
        functionDeclarations: [
          {
            name: 'get_weather',
            description: 'Get current weather forecast for a location given its latitude and longitude.',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                latitude: { type: SchemaType.NUMBER, description: 'Latitude' },
                longitude: { type: SchemaType.NUMBER, description: 'Longitude' }
              },
              required: ['latitude', 'longitude']
            }
          }
        ]
      }
    ];

    return this.genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction: dynamicInstruction,
      tools: tools as any,
      generationConfig: {}
    });
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);
  }

  public async getChatResponse(
    conversationId: string,
    message: string,
    intent?: string,
    options: GeminiChatOptions = {},
    retries = 3,
    timeoutMs = 15000
  ): Promise<ChatResponse> {
    logger.info(`[Gemini] Request for conversation ${conversationId}`, { intent });

    // Aggregate crop context if available — enriches the fallback Gemini call
    let cropContextStr: string | undefined;
    const stored = cropContextService.get(conversationId);
    if (stored) {
      cropContextStr = JSON.stringify({
        predictedCrop: stored.prediction.crop,
        accuracy: stored.prediction.accuracy,
        alternatives: stored.alternativeCrops,
        metadata: stored.metadata,
        analysis: stored.analysis,
      }, null, 2);
    }

    const model = this.buildModel(cropContextStr);

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        logger.info(`[Gemini] Attempt ${attempt}`);
        const history = conversationService.getHistory(conversationId);

        const chat = model.startChat({ history });
        let result = await this.withTimeout<any>(chat.sendMessage(message), timeoutMs);
        const functionCalls = result.response.functionCalls();

        if (functionCalls && functionCalls.length > 0) {
          const call = functionCalls[0];
          logger.info(`[Gemini] Function call requested: ${call.name}`);

          let apiResult: any = { error: 'Unknown function' };
          if (call.name === 'get_weather') {
            apiResult = await apiService.getWeather(call.args.latitude, call.args.longitude);
          }

          const toolResultText = `[System: Function '${call.name}' executed. Result: ${JSON.stringify(apiResult)}]`;
          result = await this.withTimeout<any>(chat.sendMessage(toolResultText), timeoutMs);
        }

        const responseText = result.response.text();
        const updatedHistory = await chat.getHistory();
        conversationService.updateHistory(conversationId, updatedHistory);

        logger.info('[Gemini] Response received successfully.');

        try {
          const trimmed = responseText.trim();
          const jsonStr = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
          return JSON.parse(jsonStr) as ChatResponse;
        } catch {
          return { success: true, reply: responseText.trim() };
        }

      } catch (error: any) {
        logger.error(`[Gemini] Error on attempt ${attempt}:`, error);
        if (attempt === retries) {
          return { success: false, reply: "I'm currently experiencing high traffic. Please try again later." };
        }
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return { success: false, reply: "An unexpected error occurred." };
  }
}

export const geminiService = new GeminiService();
