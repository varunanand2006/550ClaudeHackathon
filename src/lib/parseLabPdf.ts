import type { LabReading, PatientData } from "../types";

const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";

const PARSING_PROMPT = `Parse this bloodwork PDF into structured lab data.

Return ONLY valid JSON matching this TypeScript shape:
{
  "patientName": "string",
  "readings": [
    {
      "testName": "string",
      "value": number,
      "unit": "string",
      "referenceLow": number | null,
      "referenceHigh": number | null,
      "date": "YYYY-MM-DD",
      "source": "string"
    }
  ]
}

Only include these canonical test names when present:
- "LDL Cholesterol"
- "HDL Cholesterol"
- "Total Cholesterol"
- "Triglycerides"
- "Hemoglobin A1C"
- "Vitamin D, 25-Hydroxy"
- "TSH"
- "Glucose"

Use the canonical names exactly. For example, convert "LDL-C" to "LDL Cholesterol".

Reference range parsing rules:
- "< 100" means "referenceLow": null and "referenceHigh": 100
- "> 40" means "referenceLow": 40 and "referenceHigh": null
- "4.0-5.6" means "referenceLow": 4.0 and "referenceHigh": 5.6

Dates must be ISO format YYYY-MM-DD. Numeric lab values must be numbers, not strings. If the lab source is visible, include it in source. Do not include markdown, comments, or explanatory text.`;

type AnthropicTextBlock = {
  type: "text";
  text: string;
};

type AnthropicMessagesResponse = {
  content?: AnthropicTextBlock[];
};

function stripJsonFences(text: string) {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Could not read PDF as base64."));
        return;
      }

      const [, base64 = ""] = reader.result.split(",");
      resolve(base64);
    };

    reader.onerror = () => {
      reject(reader.error ?? new Error("Could not read PDF file."));
    };

    reader.readAsDataURL(file);
  });
}

function isNumberOrNull(value: unknown): value is number | null {
  return typeof value === "number" || value === null;
}

function isLabReading(value: unknown): value is LabReading {
  if (!value || typeof value !== "object") {
    return false;
  }

  const reading = value as Record<string, unknown>;

  return (
    typeof reading.testName === "string" &&
    typeof reading.value === "number" &&
    typeof reading.unit === "string" &&
    isNumberOrNull(reading.referenceLow) &&
    isNumberOrNull(reading.referenceHigh) &&
    typeof reading.date === "string" &&
    (reading.source === undefined || typeof reading.source === "string")
  );
}

function validatePatientData(value: unknown): PatientData {
  if (!value || typeof value !== "object") {
    throw new Error("Claude returned invalid patient data.");
  }

  const data = value as Record<string, unknown>;

  if (typeof data.patientName !== "string") {
    throw new Error("Claude response is missing patientName.");
  }

  if (!Array.isArray(data.readings) || !data.readings.every(isLabReading)) {
    throw new Error("Claude response contains invalid lab readings.");
  }

  return {
    patientName: data.patientName,
    readings: data.readings,
  };
}

export async function parseLabPdf(file: File): Promise<PatientData> {
  const base64Pdf = await readFileAsBase64(file);

  const response = await fetch(ANTHROPIC_MESSAGES_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "anthropic-version": "2023-06-01",
      "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY as string,
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64Pdf,
              },
            },
            {
              type: "text",
              text: PARSING_PROMPT,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API request failed: ${response.status}`);
  }

  const payload = (await response.json()) as AnthropicMessagesResponse;
  const text = payload.content?.find((block) => block.type === "text")?.text;

  if (!text) {
    throw new Error("Claude response did not include JSON text.");
  }

  const parsedJson = JSON.parse(stripJsonFences(text)) as unknown;
  return validatePatientData(parsedJson);
}
