/**
 * schemas/prediction.schema.ts
 *
 * Joi validation schema for the crop prediction request body.
 *
 * ML Model accepted features:
 *   N (Nitrogen)    — kg/ha
 *   P (Phosphorus)  — kg/ha
 *   K (Potassium)   — kg/ha
 *   temperature     — °C
 *   humidity        — %
 *   ph              — pH value
 *   rainfall        — mm
 *
 * TODO: plug this schema into the request validation middleware.
 */

import Joi from 'joi';

export const predictionRequestSchema = Joi.object({
  /** Nitrogen content in soil (kg/ha) */
  N: Joi.number().min(0).max(140).required().messages({
    'number.base': 'Nitrogen (N) must be a number',
    'number.min': 'Nitrogen (N) must be ≥ 0',
    'number.max': 'Nitrogen (N) must be ≤ 140',
    'any.required': 'Nitrogen (N) is required',
  }),

  /** Phosphorus content in soil (kg/ha) */
  P: Joi.number().min(0).max(145).required().messages({
    'number.base': 'Phosphorus (P) must be a number',
    'number.min': 'Phosphorus (P) must be ≥ 0',
    'number.max': 'Phosphorus (P) must be ≤ 145',
    'any.required': 'Phosphorus (P) is required',
  }),

  /** Potassium content in soil (kg/ha) */
  K: Joi.number().min(0).max(205).required().messages({
    'number.base': 'Potassium (K) must be a number',
    'number.min': 'Potassium (K) must be ≥ 0',
    'number.max': 'Potassium (K) must be ≤ 205',
    'any.required': 'Potassium (K) is required',
  }),

  /** Ambient temperature (°C) */
  temperature: Joi.number().min(0).max(60).required().messages({
    'number.base': 'Temperature must be a number',
    'number.min': 'Temperature must be ≥ 0°C',
    'number.max': 'Temperature must be ≤ 60°C',
    'any.required': 'Temperature is required',
  }),

  /** Relative humidity (%) */
  humidity: Joi.number().min(0).max(100).required().messages({
    'number.base': 'Humidity must be a number',
    'number.min': 'Humidity must be ≥ 0%',
    'number.max': 'Humidity must be ≤ 100%',
    'any.required': 'Humidity is required',
  }),

  /** Soil pH */
  ph: Joi.number().min(0).max(14).required().messages({
    'number.base': 'pH must be a number',
    'number.min': 'pH must be ≥ 0',
    'number.max': 'pH must be ≤ 14',
    'any.required': 'pH is required',
  }),

  /** Annual rainfall (mm) */
  rainfall: Joi.number().min(0).max(3000).required().messages({
    'number.base': 'Rainfall must be a number',
    'number.min': 'Rainfall must be ≥ 0 mm',
    'number.max': 'Rainfall must be ≤ 3000 mm',
    'any.required': 'Rainfall is required',
  }),
});

export type PredictionRequestDTO = {
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
};
