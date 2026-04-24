import { ArrowLeft } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { BiomarkerSeries } from '../types/lab';

interface ChartDetailProps {
  biomarker: BiomarkerSeries;
  onBack: () => void;
}

export function ChartDetail({ biomarker, onBack }: ChartDetailProps) {
  const chart = getChartBounds(biomarker);
  const category = getCategory(biomarker.name);
  const trendTone = getTrendTone(biomarker.trend);
  const trendText = `${biomarker.trendPercent > 0 ? '+' : ''}${biomarker.trendPercent}% over ${getYearSpan(biomarker)}`;

  return (
    <div className="space-y-6">
      <button
        className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-muted-text transition hover:border-accent/50 hover:text-white"
        onClick={onBack}
        type="button"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <section className="rounded-2xl border border-border bg-surface p-8">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-muted-text">
              {category}
            </p>
            <h1 className="font-serif text-5xl font-semibold text-white">
              {biomarker.name}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full border px-4 py-2 text-sm font-semibold ${trendTone}`}>
              {trendText}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300">
              Ref {formatRange(biomarker)}
            </span>
          </div>
        </div>

        <div className="mb-8 flex items-baseline gap-2">
          <span className="font-serif text-6xl font-semibold text-white">
            {biomarker.latestValue}
          </span>
          <span className="text-base text-muted-text">{biomarker.unit}</span>
          <span className="ml-3 text-sm text-muted-text">
            latest on {formatDate(biomarker.latestDate)}
          </span>
        </div>

        <div className="h-[28rem] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={biomarker.dataPoints.map((point) => ({
                ...point,
                label: formatShortDate(point.date),
              }))}
              margin={{ top: 16, right: 20, bottom: 4, left: -10 }}
            >
              <CartesianGrid stroke="#1f1f1f" strokeDasharray="3 3" />
              <XAxis
                axisLine={false}
                dataKey="label"
                stroke="#737373"
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                domain={[chart.min, chart.max]}
                stroke="#737373"
                tickLine={false}
                width={58}
              />
              <ReferenceArea
                fill="#4fd1c5"
                fillOpacity={0.08}
                y1={chart.referenceLow}
                y2={chart.referenceHigh}
              />
              <Tooltip
                contentStyle={{
                  background: '#0f0f0f',
                  border: '1px solid #1f1f1f',
                  borderRadius: 14,
                  color: '#fff',
                }}
                labelStyle={{ color: '#737373' }}
              />
              <Line
                dataKey="value"
                dot={{ r: 5, fill: '#4fd1c5', stroke: '#050505', strokeWidth: 2 }}
                stroke="#4fd1c5"
                strokeWidth={4}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

function getCategory(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('cholesterol') || lower.includes('triglycerides')) return 'Cholesterol';
  if (lower.includes('a1c') || lower.includes('glucose')) return 'Glucose';
  if (lower.includes('vitamin')) return 'Nutrition';
  if (lower.includes('tsh')) return 'Thyroid';
  return 'Biomarker';
}

function getTrendTone(trend: BiomarkerSeries['trend']) {
  if (trend === 'critical') return 'border-red-400/30 bg-red-500/10 text-red-300';
  if (trend === 'concerning') return 'border-orange-300/30 bg-orange-400/10 text-orange-200';
  if (trend === 'improving') return 'border-accent/30 bg-accent/10 text-accent';
  return 'border-white/10 bg-white/5 text-zinc-300';
}

function getYearSpan(biomarker: BiomarkerSeries) {
  const first = biomarker.dataPoints[0]?.date;
  const last = biomarker.dataPoints[biomarker.dataPoints.length - 1]?.date;
  if (!first || !last) return 'this period';

  const years = Math.max(
    1,
    Math.round(
      (new Date(last).getTime() - new Date(first).getTime()) /
        (1000 * 60 * 60 * 24 * 365),
    ),
  );

  return `${years} year${years === 1 ? '' : 's'}`;
}

function getChartBounds(biomarker: BiomarkerSeries) {
  const values = biomarker.dataPoints.map((point) => point.value);
  const finiteHigh =
    biomarker.reference_range.high < 9999
      ? biomarker.reference_range.high
      : Math.max(...values) * 1.12;
  const min = Math.max(0, Math.min(...values, biomarker.reference_range.low) * 0.82);
  const max = Math.max(...values, finiteHigh) * 1.08;

  return {
    min,
    max,
    referenceLow: biomarker.reference_range.low,
    referenceHigh: finiteHigh,
  };
}

function formatRange(biomarker: BiomarkerSeries) {
  const { low, high } = biomarker.reference_range;
  if (low > 0 && high < 9999) return `${low}-${high} ${biomarker.unit}`;
  if (high < 9999) return `<${high} ${biomarker.unit}`;
  if (low > 0) return `>${low} ${biomarker.unit}`;
  return 'not listed';
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

function formatShortDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    year: '2-digit',
  }).format(new Date(date));
}
