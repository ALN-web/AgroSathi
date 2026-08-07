/**
 * routes/eligibility.routes.ts
 *
 * Defines routes for the Eligibility Engine.
 *
 * POST /api/government-schemes/eligibility
 *   Accepts a FarmerProfile in the JSON body and returns
 *   eligibility results for all active schemes.
 */

import { Router } from 'express';
import { eligibilityController } from '../controllers/eligibility.controller';

const router = Router();

/**
 * @route  GET /api/government-schemes/eligibility/profile
 * @desc   Get the saved farmer profile to prefill the form
 * @access Public
 */
router.get('/profile', eligibilityController.getProfile);

/**
 * @route  POST /api/government-schemes/eligibility
 * @desc   Check a farmer's eligibility across all active government schemes
 * @access Public
 *
 * @body {FarmerProfile}
 *   state           - State/UT name (string)
 *   farmSize        - Farm size in hectares (number)
 *   farmerType      - "Individual" | "Tenant" | "SHG" | "FPO"
 *   crop            - Crop type (string)
 *   annualIncome    - Annual income in INR (number)
 *   gender          - "Male" | "Female" | "Other"
 *   age             - Age in years (number, min 18)
 *   caste           - "SC" | "ST" | "OBC" | "General"
 *   landOwnership   - "Owned" | "Leased" | "Tenant"
 */
router.post('/', eligibilityController.checkEligibility);

export default router;
