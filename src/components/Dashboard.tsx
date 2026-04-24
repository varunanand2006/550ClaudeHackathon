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
import { useMouseTilt } from '../hooks/useMouseTilt';
import type { BiomarkerSeries } from '../types/lab';

interface DashboardProps {
  biomarkers: BiomarkerSeries[];
  onSelectBiomarker: (name: string) => void;
}

export function Dashboard({ biomarkers, onSelectBiomarker }: DashboardProps) {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            Overview
          </p>
          <h1 className="display-serif max-w-3xl text-5xl text-white md:text-6xl">
            The trend line is the vital sign.
          </h1>
        </div>
        <p className="max-w-sm text-sm leading-6 text-muted-text">
          Every biomarker below is reconciled across uploaded reports, with
          the latest value, reference range, and long-range movement in one
          place.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        {biomarkers.map((biomarker) => (
          <BiomarkerCard
            biomarker={biomarker}
            key={biomarker.name}
            onSelect={() => onSelectBiomarker(biomarker.name)}
          />
        ))}
      </div>
    </div>
  );
}

function BiomarkerCard({
  biomarker,
  onSelect,
}: {
  biomarker: BiomarkerSeries;
  onSelect: () => void;
}) {
  const tilt = useMouseTilt<HTMLButtonElement>();
  const category = getCategory(biomarker.name);
  const chart = getChartBounds(biomarker);
  const trendTone = getTrendTone(biomarker.trend);
  const years = getYearSpan(biomarker);
  const trendText = `${biomarker.trendPercent > 0 ? '+' : ''}${biomarker.trendPercent}% over ${years}`;

  return (
    <button
      className="group rounded-2xl border border-border bg-surface p-8 text-left transition duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/5"
      onClick={onSelect}
      onMouseLeave={tilt.onMouseLeave}
      onMouseMove={tilt.onMouseMove}
      ref={tilt.ref}
      style={tilt.style}
      type="button"
    >
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-text">
            {category}
          </p>
          <h2 className="font-serif text-2xl font-semibold text-white">
            {biomarker.name}
          </h2>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${trendTone}`}>
          {trendText}
        </span>
      </div>

      <div className="mb-6 flex items-baseline gap-2">
        <span className="font-serif text-5xl font-semibold text-white">
          {biomarker.latestValue}
        </span>
        <span className="text-sm text-muted-text">{biomarker.unit}</span>
      </div>

      <div className="h-44 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={biomarker.dataPoints.map((point) => ({
              ...point,
              label: new Date(point.date).getFullYear().toString(),
            }))}
            margin={{ top: 8, right: 4, bottom: 0, left: -24 }}
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
              width={48}
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
              dot={{ r: 3, fill: '#4fd1c5', stroke: '#050505', strokeWidth: 2 }}
              stroke="#4fd1c5"
              strokeWidth={3}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </button>
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
