/**
 * controllers/eligibility.controller.ts
 *
 * Handles POST /api/government-schemes/eligibility
 * Validates the incoming farmer profile, delegates to the eligibility service,
 * and returns ranked eligibility results.
 */

import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { eligibilitySchema } from '../schemas/schemes.schema';
import { eligibilityService } from '../services/eligibility.service';
import { farmerProfileService } from '../services/farmerProfile.service';
import { FarmerProfile } from '../types/scheme.types';

export const eligibilityController = {
  /**
   * POST /api/government-schemes/eligibility
   *
   * Body: FarmerProfile (validated by Joi)
   *
   * Returns: Array of EligibilityResult sorted by eligibilityPercentage desc.
   */
  async checkEligibility(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body, allowing unknown fields for extended profile storage
      const { error, value } = eligibilitySchema.validate(req.body, { abortEarly: false, allowUnknown: true });

      if (error) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.details.map((d) => d.message),
        });
        return;
      }

      const profile: FarmerProfile = value;

      const results = eligibilityService.checkEligibility(profile);

      // Save modular profile for future reuse (Crop Prediction, Weather, AI, Prefill)
      farmerProfileService.saveProfile(profile);

      // Save to latestEligibility.json for the AI Assistant to read
      try {
        const dataPath = path.resolve(__dirname, '../../data/latestEligibility.json');
        fs.writeFileSync(dataPath, JSON.stringify({ profile, results, timestamp: new Date().toISOString() }, null, 2));
      } catch (fileErr) {
        console.error('[EligibilityController] Failed to save latest eligibility result:', fileErr);
      }

      res.status(200).json({
        success: true,
        profile,
        total: results.length,
        data: results,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/government-schemes/eligibility/profile
   *
   * Returns: The saved FarmerProfile, if any.
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = farmerProfileService.getProfile();
      if (!profile) {
        res.status(404).json({ success: false, error: 'Profile not found' });
        return;
      }
      res.status(200).json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  }
};
