import type { PatientData, LabReading } from '../types';
import type { BiomarkerSeries, TrendInsight, TrendStatus } from '../types/lab';

export function aggregateBiomarkers(patient: PatientData): BiomarkerSeries[] {
  const map = new Map<string, BiomarkerSeries>();

  const sorted = [...patient.readings].sort((a, b) => a.date.localeCompare(b.date));

  for (const r of sorted) {
    const low  = r.referenceLow  ?? 0;
    const high = r.referenceHigh ?? 9999;

    if (!map.has(r.testName)) {
      map.set(r.testName, {
        name: r.testName,
        unit: r.unit,
        reference_range: { low, high },
        dataPoints: [],
        trend: 'unknown',
        trendPercent: 0,
        latestValue: r.value,
        latestDate: r.date,
      });
    }

    const series = map.get(r.testName)!;
    series.dataPoints.push({ date: r.date, value: r.value });
    if (r.date >= series.latestDate) {
      series.latestValue = r.value;
      series.latestDate  = r.date;
      // keep reference range from the most recent reading
      series.reference_range = { low, high };
    }
  }

  for (const series of map.values()) {
    if (series.dataPoints.length >= 2) {
      const first = series.dataPoints[0].value;
      const last  = series.dataPoints[series.dataPoints.length - 1].value;
      series.trendPercent = Math.round(((last - first) / first) * 100);
      series.trend = classifyTrend(series);
    }
  }

  const ORDER = [
    'LDL Cholesterol', 'Total Cholesterol', 'Hemoglobin A1C', 'Triglycerides',
    'HDL Cholesterol', 'Vitamin D, 25-Hydroxy', 'TSH', 'Glucose',
  ];

  return Array.from(map.values()).sort((a, b) => {
    const ai = ORDER.indexOf(a.name);
    const bi = ORDER.indexOf(b.name);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.name.localeCompare(b.name);
  });
}

function classifyTrend(series: BiomarkerSeries): TrendStatus {
  const { low, high } = series.reference_range;
  const latest = series.latestValue;
  const pct    = series.trendPercent;
  const hasLow  = low  > 0;
  const hasHigh = high < 9999;

  const tooHigh = hasHigh && latest > high;
  const tooLow  = hasLow  && latest < low;

  const isInverseMarker = series.name.toLowerCase().includes('hdl') ||
                          series.name.toLowerCase().includes('vitamin d');

  if (isInverseMarker) {
    if (tooLow && pct <= -10) return 'critical';
    if (tooLow)               return 'concerning';
    return pct >= 5 ? 'improving' : 'stable';
  }

  if ((tooHigh || tooLow) && Math.abs(pct) >= 15) return 'critical';
  if (tooHigh || tooLow)                           return 'concerning';
  if (pct >= 15)  return 'concerning';
  if (pct <= -10) return 'improving';
  return 'stable';
}

export function generateInsights(biomarkers: BiomarkerSeries[]): TrendInsight[] {
  const insights: TrendInsight[] = [];

  for (const b of biomarkers) {
    if (b.dataPoints.length < 2) continue;

    const { low, high } = b.reference_range;
    const hasLow  = low  > 0;
    const hasHigh = high < 9999;
    const latest  = b.latestValue;
    const absPct  = Math.abs(b.trendPercent);
    const direction = b.trendPercent > 0 ? 'risen' : 'fallen';
    const years  = yearSpan(b.dataPoints[0].date, b.dataPoints[b.dataPoints.length - 1].date);
    const span   = years < 1 ? 'recent readings' : `${years} year${years !== 1 ? 's' : ''}`;
    const rangeStr = hasLow && hasHigh ? `${low}–${high} ${b.unit}`
                   : hasHigh ? `<${high} ${b.unit}`
                   : hasLow  ? `>${low} ${b.unit}`
                   : '';

    if (b.trend === 'critical') {
      insights.push({
        biomarker: b.name,
        summary: `${b.name} has ${direction} ${absPct}% over ${span} and is now outside normal range`,
        detail: `Current: ${latest} ${b.unit}${rangeStr ? ` (normal: ${rangeStr})` : ''}. This trend warrants attention.`,
        severity: 'critical',
      });
    } else if (b.trend === 'concerning') {
      const msg = (hasHigh && latest > high)
        ? `${b.name} is above the normal range at ${latest} ${b.unit}`
        : (hasLow && latest < low)
        ? `${b.name} is below the normal range at ${latest} ${b.unit}`
        : `${b.name} has ${direction} ${absPct}% over ${span}`;
      insights.push({
        biomarker: b.name,
        summary: msg,
        detail: `${rangeStr ? `Normal range: ${rangeStr}. ` : ''}Consistently ${direction === 'risen' ? 'rising' : 'falling'} over ${span}.`,
        severity: 'warning',
      });
    } else if (b.trend === 'improving' && absPct >= 10) {
      insights.push({
        biomarker: b.name,
        summary: `${b.name} has improved ${absPct}% over ${span}`,
        detail: `Current: ${latest} ${b.unit}${rangeStr ? ` — within normal range (${rangeStr})` : ''}.`,
        severity: 'info',
      });
    } else if (isConsistentlyOutOfRange(b)) {
      insights.push({
        biomarker: b.name,
        summary: `${b.name} consistently outside normal range across ${b.dataPoints.length} readings`,
        detail: `All readings outside normal${rangeStr ? ` (${rangeStr})` : ''}. Current: ${latest} ${b.unit}.`,
        severity: 'warning',
      });
    }
  }

  const order: Record<TrendInsight['severity'], number> = { critical: 0, warning: 1, info: 2 };
  return insights.sort((a, b) => order[a.severity] - order[b.severity]);
}

function isConsistentlyOutOfRange(b: BiomarkerSeries): boolean {
  const { low, high } = b.reference_range;
  return b.dataPoints.every(p => p.value < low || p.value > high);
}

function yearSpan(dateA: string, dateB: string): number {
  const ms = new Date(dateB).getTime() - new Date(dateA).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24 * 365));
}

export const TREND_COLOR: Record<TrendStatus, string> = {
  improving: '#22c55e',
  stable:    '#60a5fa',
  concerning:'#f59e0b',
  critical:  '#ef4444',
  unknown:   '#6b7280',
};

export const TREND_LABEL: Record<TrendStatus, string> = {
  improving: 'Improving',
  stable:    'Stable',
  concerning:'Watch',
  critical:  'Action needed',
  unknown:   'Insufficient data',
};

// Adapter: converts PatientData to the shape ChartsPanel / Person B may need
export function readingsByMarker(patient: PatientData): Record<string, LabReading[]> {
  const out: Record<string, LabReading[]> = {};
  for (const r of patient.readings) {
    (out[r.testName] ??= []).push(r);
  }
  for (const arr of Object.values(out)) {
    arr.sort((a, b) => a.date.localeCompare(b.date));
  }
  return out;
}
