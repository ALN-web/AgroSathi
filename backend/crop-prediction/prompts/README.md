# Crop Prediction Prompt Templates

This directory holds prompt templates used for any LLM-based enrichment
(e.g. generating "Why This Crop?" explanations after ML prediction).

## Files

| File | Purpose |
|------|---------|
| `crop_explanation.md` | Template for generating crop recommendation rationale |
| `alternative_crops.md` | Template for describing alternative crop suggestions |

These prompts are filled at runtime with the prediction result and
soil/weather context, then sent to an LLM API (e.g. Gemini / GPT-4).

**TODO**: Add templates once LLM integration is planned.
