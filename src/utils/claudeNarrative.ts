import type { PatientData } from '../types';
import type { BiomarkerSeries, TrendInsight } from '../types/lab';

const NARRATIVE_PROMPT = `You are a health data analyst helping a patient understand their lab trends over time.

Given the lab data below, write a 3-4 sentence plain-English summary directly to the patient.
- Lead with the most significant finding (good or bad)
- Mention 2-3 specific markers by name with context
- End with the overall trajectory (improving, stable, or needs attention)

Rules:
- Write in second person ("Your cholesterol...")
- Be informative but not alarmist
- Do not give medical advice or tell them to see a doctor
- No bullet points, just flowing sentences
- Keep it under 80 words

Return ONLY the summary paragraph, nothing else.`;

export async function generateNarrative(
  _patient: PatientData,
  biomarkers: BiomarkerSeries[],
  insights: TrendInsight[],
): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string;
  if (!apiKey) throw new Error('VITE_ANTHROPIC_API_KEY not set');

  const dataPayload = biomarkers.map(b => ({
    name: b.name,
    unit: b.unit,
    latestValue: b.latestValue,
    referenceRange: b.reference_range,
    trendPercent: b.trendPercent,
    trend: b.trend,
    readings: b.dataPoints.length,
    dateRange: b.dataPoints.length >= 2
      ? `${b.dataPoints[0].date} to ${b.dataPoints[b.dataPoints.length - 1].date}`
      : b.latestDate,
  }));

  const criticalCount = insights.filter(i => i.severity === 'critical').length;
  const warningCount  = insights.filter(i => i.severity === 'warning').length;

  const userMessage = `Lab data summary:\n${JSON.stringify(dataPayload, null, 2)}\n\nFlags: ${criticalCount} critical, ${warningCount} warnings.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      system: NARRATIVE_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error: ${err}`);
  }

  const data = await response.json();
  return (data.content[0].text as string).trim();
}
