import fs from 'fs';
import path from 'path';
import { FarmerProfile } from '../types/scheme.types';

const PROFILE_FILE_PATH = path.resolve(__dirname, '../../data/farmerProfile.json');

export const farmerProfileService = {
  /**
   * Saves the farmer profile to the data store.
   * This allows pre-filling forms and sharing profile data across modules (AI, prediction, etc.).
   */
  saveProfile(profile: FarmerProfile): void {
    try {
      const data = {
        ...profile,
        lastUpdated: new Date().toISOString()
      };
      // Ensure directory exists
      const dir = path.dirname(PROFILE_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(PROFILE_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[FarmerProfileService] Failed to save profile:', err);
    }
  },

  /**
   * Retrieves the saved farmer profile.
   * Returns null if no profile has been saved yet.
   */
  getProfile(): FarmerProfile | null {
    try {
      if (fs.existsSync(PROFILE_FILE_PATH)) {
        const raw = fs.readFileSync(PROFILE_FILE_PATH, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('[FarmerProfileService] Failed to read profile:', err);
    }
    return null;
  }
};
