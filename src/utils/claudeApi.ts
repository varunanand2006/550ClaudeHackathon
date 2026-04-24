// PERSON A — implement this
// Takes a PDF file, returns parsed LabReport

import type { LabReport } from '../types/lab';

const PARSE_PROMPT = `You are a medical lab result parser. Extract all lab test results from this PDF and return ONLY a JSON array.

Each item must have exactly these fields:
{
  "test_name": string,   // e.g. "LDL Cholesterol"
  "value": number,       // numeric value only
  "unit": string,        // e.g. "mg/dL"
  "reference_range": { "low": number, "high": number },
  "date": string         // ISO 8601 date of the test, e.g. "2024-03-15"
}

If a reference range has no lower bound (e.g. "<200"), use 0. If no upper bound, use 9999.
Return ONLY the JSON array, no explanation.`;

export async function parsePdfWithClaude(file: File): Promise<LabReport> {
  // TODO Person A: read VITE_ANTHROPIC_API_KEY from import.meta.env
  // NOTE: In production this key should be server-side. Fine for hackathon demo.
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string;
  if (!apiKey) throw new Error('VITE_ANTHROPIC_API_KEY not set in .env');

  const base64 = await fileToBase64(file);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: base64 },
            },
            { type: 'text', text: PARSE_PROMPT },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error: ${err}`);
  }

  const data = await response.json();
  const text = data.content[0].text as string;
  const results = JSON.parse(text);

  return {
    id: `report-${Date.now()}`,
    patient_name: 'Uploaded Patient',
    date: results[0]?.date ?? new Date().toISOString().slice(0, 10),
    results,
  };
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
