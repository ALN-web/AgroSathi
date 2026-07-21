/**
 * services/metadata.service.ts
 *
 * Module 3: Crop Metadata Layer
 *
 * Responsibilities:
 *  - Load and cache crop metadata from data/crops.json
 *  - Resolve crop image, scientific name, season, category, color, icon
 *  - No AI calls. Pure data resolution.
 *
 * Reusable by: Soil Analysis, Market Prediction, Government Schemes modules.
 */

import * as fs from 'fs';
import * as path from 'path';
import { CropMeta } from '../schemas/response.schema';

// ── Default fallback metadata ────────────────────────────────────────────────
const DEFAULT_META: CropMeta = {
  image: '/images/service_crop.png',
  scientificName: 'Unknown',
  season: 'Varies',
  category: 'Crop',
  color: '#65b23d',
  icon: '🌱',
};

// ── Lazy-load and cache the crops.json and cropProfiles.json ─────────────────
let _cropsCache: Record<string, CropMeta> | null = null;
let _profilesCache: Record<string, any> | null = null;

function loadCropsData(): Record<string, CropMeta> {
  if (_cropsCache) return _cropsCache;

  try {
    const dataPath = path.resolve(__dirname, '../../data/crops.json');
    const raw = fs.readFileSync(dataPath, 'utf-8');
    _cropsCache = JSON.parse(raw) as Record<string, CropMeta>;
    console.log(`[MetadataService] Loaded metadata for ${Object.keys(_cropsCache).length} crops.`);
  } catch (err) {
    console.error('[MetadataService] Failed to load crops.json. Using defaults.', err);
    _cropsCache = {};
  }

  return _cropsCache;
}

function loadProfilesData(): Record<string, any> {
  if (_profilesCache !== null) return _profilesCache;

  let loaded: Record<string, any> = {};
  try {
    const dataPath = path.resolve(__dirname, '../../data/cropProfiles.json');
    const raw = fs.readFileSync(dataPath, 'utf-8');
    loaded = JSON.parse(raw);
    console.log(`[MetadataService] Loaded profiles for ${Object.keys(loaded).length} crops.`);
  } catch (err) {
    console.error('[MetadataService] Failed to load cropProfiles.json.', err);
  }
  _profilesCache = loaded;
  return _profilesCache;
}

// ── Public API ────────────────────────────────────────────────────────────────
export const metadataService = {
  /**
   * Resolve full metadata for a given crop name.
   * Falls back to DEFAULT_META if the crop is not found in the data file.
   */
  getCropMeta(cropName: string): CropMeta {
    const crops = loadCropsData();
    const key = cropName.toLowerCase().trim();
    return crops[key] ?? DEFAULT_META;
  },

  /**
   * Resolve just the image path for a crop.
   */
  getCropImage(cropName: string): string {
    return this.getCropMeta(cropName).image;
  },

  /**
   * Resolve the display name (capitalised) and scientific name.
   */
  getCropNames(cropName: string): { displayName: string; scientificName: string } {
    const meta = this.getCropMeta(cropName);
    const displayName = cropName.charAt(0).toUpperCase() + cropName.slice(1).toLowerCase();
    return { displayName, scientificName: meta.scientificName };
  },

  /**
   * Return all crop metadata (for admin/debug endpoints).
   */
  getAllCrops(): Record<string, CropMeta> {
    return loadCropsData();
  },

  /**
   * Get agricultural static properties for a crop.
   */
  getCropProfile(cropName: string): any {
    const profiles = loadProfilesData();
    const key = cropName.toLowerCase().trim();
    
    // Exact mapping for names like "kidneybeans" vs "kidney beans"
    let cleanKey = key.replace(/\s+/g, '');
    if (cleanKey === 'pigeonpeas') cleanKey = 'pigeonpeas';
    else if (cleanKey === 'kidneybeans') cleanKey = 'kidneybeans';
    else if (cleanKey === 'mothbeans') cleanKey = 'mothbeans';
    else if (cleanKey === 'mungbean') cleanKey = 'mungbeans';
    
    const profile = profiles[cleanKey] || profiles[key];
    
    if (!profile) {
      return { 
        season: 'Unknown', 
        category: 'Unknown',
        growthDuration: { minDays: 0, maxDays: 0 },
        waterRequirement: { min: 0, max: 0, unit: 'mm' }
      };
    }

    return {
      season: profile.season || 'Unknown',
      category: profile.category || 'Unknown',
      growthDuration: profile.growthDuration || { minDays: 0, maxDays: 0 },
      waterRequirement: profile.waterRequirement || { min: 0, max: 0, unit: 'mm' }
    };
  },
};
