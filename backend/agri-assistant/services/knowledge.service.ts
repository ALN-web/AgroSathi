/**
 * knowledge.service.ts
 *
 * Direct-answer mechanism for simple crop metadata questions.
 * Skips Gemini entirely to save tokens and improve response time.
 */

import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

export class KnowledgeService {
  private cropProfiles: Record<string, any> = {};
  private websiteKnowledge: any = null;
  private cropsLoaded: boolean = false;
  private websiteLoaded: boolean = false;

  constructor() {
    this.loadProfiles();
    this.loadWebsiteKnowledge();
  }

  private loadProfiles() {
    try {
      const dataPath = path.resolve(__dirname, '../../crop-prediction/data/cropProfiles.json');
      const raw = fs.readFileSync(dataPath, 'utf-8');
      this.cropProfiles = JSON.parse(raw);
      this.cropsLoaded = true;
      logger.info(`[KnowledgeService] Loaded static crop profiles for ${Object.keys(this.cropProfiles).length} crops.`);
    } catch (err) {
      logger.error('[KnowledgeService] Failed to load cropProfiles.json', err);
      this.cropProfiles = {};
    }
  }

  private loadWebsiteKnowledge() {
    try {
      const dataPath = path.resolve(__dirname, '../knowledge/websiteKnowledge.json');
      const raw = fs.readFileSync(dataPath, 'utf-8');
      this.websiteKnowledge = JSON.parse(raw);
      this.websiteLoaded = true;
      logger.info(`[KnowledgeService] Loaded website knowledge base.`);
    } catch (err) {
      logger.error('[KnowledgeService] Failed to load websiteKnowledge.json', err);
      this.websiteKnowledge = null;
    }
  }

  /**
   * Search for a direct answer to a static crop question.
   * If a match is found, returns the formatted string answer.
   * If not, returns null (meaning fallback to Gemini is required).
   */
  public searchDirectAnswer(message: string): string | null {
    if (!this.cropsLoaded) return null;

    const lowerMessage = message.toLowerCase();

    // 1. Identify which crop they are asking about
    let matchedCropKey: string | null = null;
    let matchedCropData: any = null;

    for (const [key, data] of Object.entries(this.cropProfiles)) {
      // Check key, display name, scientific name
      const names = [
        key,
        data.displayName.toLowerCase(),
        data.hindiName,
        data.kannadaName
      ];

      if (names.some(name => name && lowerMessage.includes(name))) {
        matchedCropKey = key;
        matchedCropData = data;
        break;
      }
    }

    if (!matchedCropKey || !matchedCropData) {
      return null; // No specific crop identified, fallback to Gemini
    }

    const cropName = matchedCropData.displayName;

    // 2. Identify the specific property they are asking for

    // Scientific name
    if (/\b(scientific name|botanical name)\b/i.test(lowerMessage)) {
      return `The scientific name of ${cropName} is **${matchedCropData.scientificName}**.`;
    }

    // Season
    if (/\b(what season|which season|when to grow|when is it grown)\b/i.test(lowerMessage)) {
      return `${cropName} is primarily a **${matchedCropData.season}** crop.`;
    }

    // Water requirement
    if (/\b(how much water|water requirement|water needed|water does it need)\b/i.test(lowerMessage)) {
      const req = matchedCropData.waterRequirement;
      return `${cropName} requires approximately **${req.min} to ${req.max} ${req.unit}** of water during its growth cycle.`;
    }

    // Category
    if (/\b(what category|which category|crop type|what type of crop)\b/i.test(lowerMessage)) {
      return `${cropName} belongs to the **${matchedCropData.category}** category.`;
    }

    // Growth Duration
    if (/\b(growth duration|how many days|how long (does|to)|harvest time)\b/i.test(lowerMessage)) {
      const dur = matchedCropData.growthDuration;
      return `${cropName} typically takes **${dur.minDays} to ${dur.maxDays} days** to grow and be ready for harvest.`;
    }

    // Names in other languages
    if (/\b(hindi name|in hindi|call it in hindi)\b/i.test(lowerMessage)) {
      return `${cropName} is called **${matchedCropData.hindiName}** in Hindi.`;
    }
    if (/\b(kannada name|in kannada|call it in kannada)\b/i.test(lowerMessage)) {
      return `${cropName} is called **${matchedCropData.kannadaName}** in Kannada.`;
    }

    // If no direct static property was matched exactly, fallback to Gemini for a richer explanation
    return null;
  }

  /**
   * Search for a direct answer to a website/module question.
   * Uses websiteKnowledge.json. Returns formatted string if found, else null.
   */
  public searchWebsiteKnowledge(message: string): string | null {
    if (!this.websiteLoaded || !this.websiteKnowledge) return null;

    const lowerMessage = message.toLowerCase();

    // Specific Module Explanations
    if (/\b(crop prediction|predict crop)\b/i.test(lowerMessage)) {
      return `**Crop Prediction**: ${this.websiteKnowledge.howItWorks.cropPrediction}`;
    }
    if (/\b(soil analysis|analyze soil|soil health)\b/i.test(lowerMessage)) {
      return `**Soil Analysis**: ${this.websiteKnowledge.howItWorks.soilAnalysis}`;
    }
    
    // Exact FAQ Matches (by partial question or exact keyword combo)
    if (/\b(what (can|does) this website do|features|modules)\b/i.test(lowerMessage)) {
      const faq = this.websiteKnowledge.frequentlyAskedQuestions.find((q: any) => q.question.toLowerCase().includes('what can this website do'));
      if (faq) return faq.answer;
      return `AgroSaathi supports: ${this.websiteKnowledge.availableModules.join(', ')}.`;
    }
    if (/\b(government scheme|subsidy)\b/i.test(lowerMessage)) {
      const faq = this.websiteKnowledge.frequentlyAskedQuestions.find((q: any) => q.question.toLowerCase().includes('government schemes'));
      if (faq) return faq.answer;
    }
    if (/\b(what is agrosaathi)\b/i.test(lowerMessage)) {
      const faq = this.websiteKnowledge.frequentlyAskedQuestions.find((q: any) => q.question.toLowerCase().includes('what is agrosaathi'));
      if (faq) return faq.answer;
      return `${this.websiteKnowledge.projectName} is ${this.websiteKnowledge.description}`;
    }

    // Market prediction stub (since not explicitly defined in howItWorks in the JSON, but in modules)
    if (/\b(market prediction|market price)\b/i.test(lowerMessage)) {
      return `The **Market Price Prediction** module provides estimated future prices for crops based on current trends and historical market data to help you maximize your profit.`;
    }

    return null;
  }
}

export const knowledgeService = new KnowledgeService();
