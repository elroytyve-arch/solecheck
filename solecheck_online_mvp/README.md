# SoleCheck Online MVP

SoleCheck is a Vercel-ready web app for visual product review.

## AI image analysis
The Scan page sends a resized product photo to `/api/analyze`, which calls the OpenAI Responses API with image input. The API key is server-side only.

### Vercel setup
1. Open Project → Settings → Environment Variables.
2. Add `OPENAI_API_KEY` with your OpenAI API key.
3. Optionally add `OPENAI_VISION_MODEL` (default: `gpt-5.6`).
4. Redeploy.

The AI result is a visual assessment, not a guaranteed authenticity decision. Real authentication requires verified product references, multiple angles, and potentially expert review.
