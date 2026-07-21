/**
 * constants/crops.ts
 *
 * All 22 crop labels that the trained ML model can predict.
 * These must stay in sync with the label_encoder used during training.
 */

export const SUPPORTED_CROPS = [
  'rice',
  'maize',
  'chickpea',
  'kidneybeans',
  'pigeonpeas',
  'mothbeans',
  'mungbean',
  'blackgram',
  'lentil',
  'pomegranate',
  'banana',
  'mango',
  'grapes',
  'watermelon',
  'muskmelon',
  'apple',
  'orange',
  'papaya',
  'coconut',
  'cotton',
  'jute',
  'coffee',
] as const;

export type SupportedCrop = (typeof SUPPORTED_CROPS)[number];

/** Human-readable display names for each crop label */
export const CROP_DISPLAY_NAMES: Record<SupportedCrop, string> = {
  rice: 'Rice (Paddy)',
  maize: 'Maize (Corn)',
  chickpea: 'Chickpea',
  kidneybeans: 'Kidney Beans',
  pigeonpeas: 'Pigeon Peas',
  mothbeans: 'Moth Beans',
  mungbean: 'Mung Bean',
  blackgram: 'Black Gram',
  lentil: 'Lentil',
  pomegranate: 'Pomegranate',
  banana: 'Banana',
  mango: 'Mango',
  grapes: 'Grapes',
  watermelon: 'Watermelon',
  muskmelon: 'Musk Melon',
  apple: 'Apple',
  orange: 'Orange',
  papaya: 'Papaya',
  coconut: 'Coconut',
  cotton: 'Cotton',
  jute: 'Jute',
  coffee: 'Coffee',
};
