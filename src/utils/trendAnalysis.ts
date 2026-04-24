import type { LabReport, BiomarkerSeries, TrendInsight, TrendStatus } from '../types/lab';

export function aggregateBiomarkers(reports: LabReport[]): BiomarkerSeries[] {
  const map = new Map<string, BiomarkerSeries>();

  const sorted = [...reports].sort((a, b) => a.date.localeCompare(b.date));

  for (const report of sorted) {
    for (const result of report.results) {
      if (!map.has(result.test_name)) {
        map.set(result.test_name, {
          name: result.test_name,
          unit: result.unit,
          reference_range: result.reference_range,
          dataPoints: [],
          trend: 'unknown',
          trendPercent: 0,
          latestValue: result.value,
          latestDate: result.date,
        });
      }
      const series = map.get(result.test_name)!;
      series.dataPoints.push({ date: result.date, value: result.value });
      if (result.date >= series.latestDate) {
        series.latestValue = result.value;
        series.latestDate = result.date;
      }
    }
  }

  for (const series of map.values()) {
    if (series.dataPoints.length >= 2) {
      const first = series.dataPoints[0].value;
      const last = series.dataPoints[series.dataPoints.length - 1].value;
      series.trendPercent = Math.round(((last - first) / first) * 100);
      series.trend = classifyTrend(series);
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const order = ['LDL Cholesterol', 'Total Cholesterol', 'HbA1c', 'Triglycerides', 'HDL Cholesterol', 'Vitamin D', 'TSH'];
    const ai = order.indexOf(a.name);
    const bi = order.indexOf(b.name);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.name.localeCompare(b.name);
  });
}

function classifyTrend(series: BiomarkerSeries): TrendStatus {
  const { low, high } = series.reference_range;
  const latest = series.latestValue;
  const pct = series.trendPercent;

  // Outside range = at least concerning
  const outOfRange = latest < low || latest > high;

  // HDL is "higher is better" — flip the logic
  const isInverseMarker = series.name.toLowerCase().includes('hdl');

  if (isInverseMarker) {
    if (latest < low) return pct <= -10 ? 'critical' : 'concerning';
    return pct >= 5 ? 'improving' : 'stable';
  }

  if (outOfRange && Math.abs(pct) >= 15) return 'critical';
  if (outOfRange) return 'concerning';
  if (pct >= 15) return 'concerning';   // trending toward out-of-range
  if (pct <= -10) return 'improving';
  return 'stable';
}

export function generateInsights(biomarkers: BiomarkerSeries[]): TrendInsight[] {
  const insights: TrendInsight[] = [];

  for (const b of biomarkers) {
    if (b.dataPoints.length < 2) continue;

    const { low, high } = b.reference_range;
    const latest = b.latestValue;
    const absPct = Math.abs(b.trendPercent);
    const direction = b.trendPercent > 0 ? 'risen' : 'fallen';
    const years = yearSpan(b.dataPoints[0].date, b.dataPoints[b.dataPoints.length - 1].date);
    const span = years < 1 ? 'recent readings' : `${years} year${years !== 1 ? 's' : ''}`;

    if (b.trend === 'critical') {
      insights.push({
        biomarker: b.name,
        summary: `${b.name} has ${direction} ${absPct}% over ${span} and is now outside normal range`,
        detail: `Current: ${latest} ${b.unit} (normal: ${low}–${high} ${b.unit}). This trend warrants attention.`,
        severity: 'critical',
      });
    } else if (b.trend === 'concerning') {
      const msg = latest > high
        ? `${b.name} is above the normal range at ${latest} ${b.unit}`
        : latest < low
        ? `${b.name} is below the normal range at ${latest} ${b.unit}`
        : `${b.name} has ${direction} ${absPct}% over ${span}`;
      insights.push({
        biomarker: b.name,
        summary: msg,
        detail: `Normal range: ${low}–${high} ${b.unit}. Consistently ${direction === 'risen' ? 'rising' : 'falling'} over ${span}.`,
        severity: 'warning',
      });
    } else if (b.trend === 'improving' && absPct >= 10) {
      insights.push({
        biomarker: b.name,
        summary: `${b.name} has improved ${absPct}% over ${span}`,
        detail: `Current: ${latest} ${b.unit} — within normal range (${low}–${high} ${b.unit}).`,
        severity: 'info',
      });
    } else if (isConsistentlyLow(b)) {
      insights.push({
        biomarker: b.name,
        summary: `${b.name} consistently below normal across ${b.dataPoints.length} readings`,
        detail: `All readings below ${low} ${b.unit}. Current: ${latest} ${b.unit}.`,
        severity: 'warning',
      });
    }
  }

  // Sort: critical first, then warning, then info
  const order = { critical: 0, warning: 1, info: 2 };
  return insights.sort((a, b) => order[a.severity] - order[b.severity]);
}

function isConsistentlyLow(b: BiomarkerSeries): boolean {
  return b.dataPoints.every(p => p.value < b.reference_range.low);
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
