export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(500).json({ error: 'OPENAI_API_KEY is not configured on the server.' });
  try {
    const { image } = req.body || {};
    if (typeof image !== 'string' || !image.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Please upload an image.' });
    }
    if (image.length > 6_000_000) return res.status(413).json({ error: 'Image is too large. Please choose a smaller photo.' });

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.OPENAI_VISION_MODEL || 'gpt-5.6',
        input: [{
          role: 'user',
          content: [
            { type: 'input_text', text: `You are SoleCheck's visual product-review assistant. Analyze ONLY what is visibly supported by this photo. Do not claim certainty or invent brand/model details. This is not a forensic authentication service and you do not have a verified manufacturer catalog in this request.

Return ONLY valid JSON with this exact shape:
{
  "assessment": "Likely authentic" | "Likely counterfeit" | "Needs expert review",
  "confidence": number,
  "summary": string,
  "findings": [
    {"label": string, "status": "consistent" | "concern" | "unclear", "summary": string}
  ],
  "disclaimer": string
}

Use "Needs expert review" whenever the photo is insufficient to support a directional assessment. Confidence is confidence in the visual assessment, not a guarantee. Mention missing angles or unreadable labels when relevant. Include 3-6 findings covering logo/branding, construction/stitching, labels/text, shape/materials, and packaging if visible.` },
            { type: 'input_image', image_url: image, detail: 'high' }
          ]
        }]
      })
    });
    const body = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: body?.error?.message || 'OpenAI analysis failed.' });
    const text = body.output_text || '';
    let result;
    try { result = JSON.parse(text); } catch { return res.status(502).json({ error: 'The AI returned an unreadable result.' }); }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Unexpected server error.' });
  }
}
