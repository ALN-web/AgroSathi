import { IAssistantModule, ModuleResponse } from './base.module';
import { IntentType } from '../intent.service';
import { cropContextService } from '../crop.context.service';
import { geminiService } from '../gemini.service';

export class CropExplanationModule implements IAssistantModule {
  public readonly name = 'Crop Explanation Module';
  public readonly priority = 1;
  public readonly intents: IntentType[] = ['crop_explanation'];

  public async handle(message: string, intent: IntentType, conversationId: string): Promise<ModuleResponse | null> {
    const stored = cropContextService.get(conversationId);
    
    if (!stored) {
      return {
        reply: "Please use the **Crop Prediction** feature first so I can explain your recommendation.",
        source: 'crop_prediction'
      };
    }
    
    const predictionContext = `
The user is asking about a previous crop prediction result from the ML model. 
Do NOT predict a new crop. Only explain and elaborate on the data below.

PREDICTION RESULT FROM ML MODEL:
- Predicted Crop: ${stored.prediction.crop}
- Model Accuracy: ${stored.prediction.accuracy}%
- Alternative Crops: ${stored.alternativeCrops.map(a => `${a.crop} (${a.score}%)`).join(', ')}

CROP METADATA:
- Season: ${stored.metadata.season}
- Category: ${stored.metadata.category}
- Growth Duration: ${JSON.stringify(stored.metadata.growthDuration)}
- Water Requirement: ${JSON.stringify(stored.metadata.waterRequirement)}

GEMINI ANALYSIS:
- Why This Crop: ${stored.analysis.whyThisCrop || 'N/A'}
- Soil Suitability: ${stored.analysis.soilSuitability || 'N/A'}
- Fertilizer: ${stored.analysis.fertilizerRecommendation || 'N/A'}
- Common Diseases: ${(stored.analysis.commonDiseases || []).join(', ')}
- Harvest Tips: ${stored.analysis.harvestTips || 'N/A'}

USER QUESTION: ${message}

Answer the user's specific question using the data above. Be helpful, specific, and cite actual numbers from the data where relevant.`;

    const response = await geminiService.getChatResponse(conversationId, predictionContext, intent);
    return { reply: response.reply, source: 'gemini_crop_explanation' };
  }
}
