/**
 * modules/eligibilityExplanation.module.ts
 *
 * Explains government scheme eligibility results for a farmer.
 * Reads the latest result from government-schemes data directory.
 */

import fs from 'fs';
import path from 'path';
import { IAssistantModule, ModuleResponse } from './base.module';
import { IntentType } from '../intent.service';
import { logger } from '../../utils/logger';
import { geminiService } from '../gemini.service';

export class EligibilityExplanationModule implements IAssistantModule {
  public name = 'EligibilityExplanationModule';
  public priority = 3; // High priority, similar to cropExplanation
  public intents: IntentType[] = ['eligibility_explanation'];

  public async handle(message: string, intent: IntentType, conversationId: string): Promise<ModuleResponse | null> {
    logger.info('[EligibilityExplanationModule] Processing request');

    const dataPath = path.resolve(__dirname, '../../../government-schemes/data/latestEligibility.json');
    const schemesPath = path.resolve(__dirname, '../../../government-schemes/data/governmentSchemes.json');

    let eligibilityData = null;
    let schemesStore: any[] = [];
    try {
      if (fs.existsSync(dataPath)) {
        const raw = fs.readFileSync(dataPath, 'utf-8');
        eligibilityData = JSON.parse(raw);
      }
      if (fs.existsSync(schemesPath)) {
        const rawSchemes = fs.readFileSync(schemesPath, 'utf-8');
        schemesStore = JSON.parse(rawSchemes);
      }
    } catch (err) {
      logger.error('[EligibilityExplanationModule] Failed to read JSON files:', err);
    }

    if (!eligibilityData || !eligibilityData.profile || !eligibilityData.results) {
      // "If the backend has no result, request the farmer to complete the eligibility form first."
      return {
        reply: "I couldn't find your recent eligibility check. Please complete the eligibility form on the Government Schemes page first so I can analyze your profile.",
        source: this.name,
      };
    }

    // Format context for Gemini
    const { profile, results, timestamp } = eligibilityData;

    const profileContext = `
Farmer Profile:
- State: ${profile.state}
- Farm Size: ${profile.farmSize} hectares
- Farmer Type: ${profile.farmerType}
- Crop: ${profile.crop}
- Annual Income: ₹${profile.annualIncome}
- Gender: ${profile.gender}
- Age: ${profile.age}
- Caste: ${profile.caste}
- Land Ownership: ${profile.landOwnership}
- Checked At: ${new Date(timestamp).toLocaleString()}
`;

    // Only include top 5 schemes to keep context concise
    const topResults = results.slice(0, 5);
    
    // Enrich top results with full scheme metadata from governmentSchemes.json
    const enrichedResults = topResults.map((r: any) => {
      const schemeMetadata = schemesStore.find((s: any) => s.id === r.schemeId);
      
      let extraInfo = '';
      if (schemeMetadata) {
        extraInfo = `
  Scheme Full Description: ${schemeMetadata.fullDescription || schemeMetadata.shortDescription}
  Benefits:
  ${schemeMetadata.benefits ? schemeMetadata.benefits.map((b: string) => `  * ${b}`).join('\n') : '  None listed'}
  Required Documents:
  ${schemeMetadata.requiredDocuments ? schemeMetadata.requiredDocuments.map((d: string) => `  * ${d}`).join('\n') : '  None listed'}
  Official Website: ${schemeMetadata.officialWebsite || 'Not available'}
  Application Mode: ${schemeMetadata.applicationMode || 'Not available'}`;
      }

      return `
- Scheme: ${r.schemeName}
  Status: ${r.eligibilityStatus} (${r.eligibilityPercentage}% match)
  Backend Evaluated Reasons (Why it matches):
  ${r.reasons.map((reason: string) => `  * ${reason}`).join('\n')}
  ${extraInfo}`;
    });

    const resultsContext = enrichedResults.join('\n');

    const groundedPrompt = `
The user is asking about their government scheme eligibility.
User Message: "${message}"

IMPORTANT INSTRUCTIONS:
1. Explain their eligibility results in simple, easy-to-understand language.
2. ONLY use the backend eligibility data and scheme metadata provided below. Do NOT invent, guess, or fabricate any eligibility statuses, reasons, benefits, or documents.
3. The backend remains the source of truth.
4. For every recommended scheme, you MUST clearly explain:
   - Why it matches (based on the Backend Evaluated Reasons)
   - Benefits (based on the provided metadata)
   - Required documents (based on the provided metadata)
   - Important application tips
   - Common mistakes while applying
5. Format your response cleanly (use bullet points and bold text for readability).

--- BACKEND ELIGIBILITY DATA & SCHEME METADATA ---
${profileContext}

Top Scheme Results:
${resultsContext}
--------------------------------

Provide your helpful, accurate, and structured response below:
`.trim();

    const geminiResponse = await geminiService.getChatResponse(conversationId, groundedPrompt, intent);

    return {
      reply: geminiResponse.reply,
      source: this.name,
    };
  }
}

export const eligibilityExplanationModule = new EligibilityExplanationModule();
