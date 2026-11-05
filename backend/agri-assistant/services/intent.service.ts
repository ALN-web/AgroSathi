/**
 * intent.service.ts
 *
 * A modular, rule-based intent classification service.
 * Classifies incoming user messages without calling Gemini.
 * Returns an intent and confidence score for the controller to route correctly.
 */

export type IntentType =
  | 'crop_prediction'
  | 'crop_explanation'
  | 'soil_analysis'
  | 'weather'
  | 'eligibility_explanation'
  | 'government_schemes'
  | 'market_prediction'
  | 'crop_information'
  | 'website_help'
  | 'general_agriculture'
  | 'unsupported';

export interface DetectedIntent {
  intent: IntentType;
  confidence: number; // 0.0 - 1.0
}

// ─── Keyword Patterns (ordered by specificity) ───────────────────────────────

const INTENT_RULES: Array<{ intent: IntentType; patterns: RegExp[] }> = [
  {
    // Highest priority — user is asking about a prior ML prediction result
    intent: 'crop_explanation',
    patterns: [
      /\b(why|explain|what does|meaning of|understand).{0,30}(predict|recommend|suggest|result|crop)\b/i,
      /\b(what crop|which crop).{0,30}(suggest|recommend|predict|given|result)\b/i,
      /\b(explain my|explain the).{0,20}(crop|prediction|result|recommendation)\b/i,
      /\b(how much water|water need|water require).{0,30}(it|this crop|the crop|recommend)\b/i,
      /\b(what season|which season|when.{0,10}(grow|plant|harvest)).{0,30}(it|this|crop|recommend)\b/i,
      /\b(more (about|info|detail|information)).{0,30}(prediction|crop|recommend|result)\b/i,
      /\b(my (prediction|result|crop|recommendation))\b/i,
      /\b(what was (predicted|recommended|suggested))\b/i,
      /\b(tell me (more|about) (it|this crop|the crop|the result))\b/i,
    ],
  },
  {
    intent: 'crop_prediction',
    patterns: [
      /\b(predict|recommend|suggest|which crop|best crop|what crop)\b/i,
      /\b(nitrogen|phosphorus|potassium|N:\s*\d|P:\s*\d|K:\s*\d)\b/i,
      /\b(soil (param|data|value|reading|test|analysis) (for|to) (predict|grow|plant))\b/i,
      /\b(npk|n-p-k|n,p,k)\b/i,
    ],
  },
  {
    intent: 'soil_analysis',
    patterns: [
      /\b(soil (health|test|quality|analysis|condition|type|pH|nutrient|fertility))\b/i,
      /\b(analyze|analyse|improve|check).{0,20}(soil)\b/i,
      /\b(clay|loam|sandy|black soil|alluvial|regur|laterite|red soil)\b/i,
      /\b(soil pH|ph level|soil nutrient|organic matter|compost)\b/i,
    ],
  },
  {
    intent: 'weather',
    patterns: [
      /\b(weather|forecast|temperature|humidity|rainfall|rain|climate|monsoon|wind|storm|drought)\b/i,
      /\b(will it rain|weather today|weather this week|weather analysis)\b/i,
      /\b(celsius|fahrenheit|humidity|precipitation|cloud|sunny)\b/i,
    ],
  },
  {
    intent: 'eligibility_explanation',
    patterns: [
      /\b(am i eligible|my eligibility|check my eligibility|can i get|do i qualify)\b/i,
      /\b(explain (my )?eligibility)\b/i,
      /\b(why am i (not )?eligible)\b/i,
      /\b(eligibility (result|status))\b/i,
    ],
  },
  {
    intent: 'government_schemes',
    patterns: [
      /\b(government|scheme|subsidy|yojana|PM Kisan|PMKSY|KCC|MNREGA|policy|loan|insurance|benefit|eligib)\b/i,
      /\b(kisan|kisaan|farmer (scheme|benefit|support|loan|insurance))\b/i,
      /\b(pradhan mantri|PM fasal bima|national agriculture)\b/i,
    ],
  },
  {
    intent: 'market_prediction',
    patterns: [
      /\b(market|price|mandi|MSP|minimum support|commodity|selling|buy|profit|revenue|income|cost)\b/i,
      /\b(crop price|vegetable price|grain price|rate today|market rate|current price)\b/i,
      /\b(predict.{0,20}price|price.{0,20}predict|market analysis|market trend)\b/i,
    ],
  },
  {
    intent: 'crop_information',
    patterns: [
      /\b(tell me about|information (about|on)|what is|describe|explain|how to (grow|plant|cultivate|harvest))\b/i,
      /\b(rice|wheat|maize|cotton|sugarcane|mango|banana|tomato|onion|potato|soybean|groundnut|mustard)\b/i,
      /\b(crop (profile|guide|detail|info|tip|care|disease|pest|irrigation|water need|season))\b/i,
      /\b(pest|disease|insect|blight|rot|fungus|weed|pesticide|herbicide|fertilizer)\b/i,
    ],
  },
  {
    intent: 'website_help',
    patterns: [
      /\b(what (can|does) (this|the|agrosaathi|your) (website|app|platform|tool|assistant|service))\b/i,
      /\b(how (do|does|can) (i|it|this|the) (use|work|help|predict|analyze|show))\b/i,
      /\b(feature(s)?|module(s)?|service(s)?|what (is|are) available|dashboard|capability)\b/i,
      /\bagrosaathi\b/i,
    ],
  },
  {
    intent: 'general_agriculture',
    patterns: [
      /\b(farm(ing)?|agriculture|agri|irrigation|harvest|sow(ing)?|planting|crop rotation|organic)\b/i,
      /\b(kharif|rabi|zaid|drip|sprinkler|water saving|mulching|greenhouse|poly(house|tunnel))\b/i,
    ],
  },
];

// ─── Intent Detection Logic ───────────────────────────────────────────────────

class IntentService {
  /**
   * Classifies the user message into a known intent and returns a confidence score.
   * Matching is done by counting pattern matches across intents.
   */
  public detect(message: string): DetectedIntent {
    const scores: Map<IntentType, number> = new Map();

    for (const rule of INTENT_RULES) {
      let matchCount = 0;
      for (const pattern of rule.patterns) {
        if (pattern.test(message)) {
          matchCount++;
        }
      }
      if (matchCount > 0) {
        scores.set(rule.intent, matchCount / rule.patterns.length);
      }
    }

    if (scores.size === 0) {
      return { intent: 'unsupported', confidence: 1.0 };
    }

    // Pick the intent with the highest score
    let bestIntent: IntentType = 'general_agriculture';
    let bestScore = 0;

    for (const [intent, score] of scores.entries()) {
      if (score > bestScore) {
        bestScore = score;
        bestIntent = intent;
      }
    }

    return {
      intent: bestIntent,
      confidence: Math.min(bestScore * 1.5, 1.0), // normalize to [0, 1]
    };
  }
}

export const intentService = new IntentService();
