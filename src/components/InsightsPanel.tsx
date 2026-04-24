import {
  AlertTriangle,
  CheckCircle,
  Loader,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type { BiomarkerSeries, TrendInsight } from '../types/lab';
import { TREND_LABEL } from '../utils/trendAnalysis';

interface InsightsPanelProps {
  insights: TrendInsight[];
  biomarkers: BiomarkerSeries[];
  narrative: string | null;
  narrativeLoading: boolean;
}

export function InsightsPanel({
  insights,
  biomarkers,
  narrative,
  narrativeLoading,
}: InsightsPanelProps) {
  if (biomarkers.length === 0) return null;

  const critical = insights.filter((i) => i.severity === 'critical');
  const warnings = insights.filter((i) => i.severity === 'warning');
  const infos = insights.filter((i) => i.severity === 'info');

  return (
    <div className="space-y-8">
      {(narrativeLoading || narrative) && (
        <section className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/10 to-surface p-8">
          <div className="flex gap-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-black">
              {narrativeLoading ? (
                <Loader className="animate-spin" size={18} />
              ) : (
                <Sparkles size={18} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                AI Summary
              </p>
              {narrativeLoading ? (
                <div className="space-y-3">
                  {[100, 84, 58].map((width) => (
                    <div
                      className="h-3 animate-pulse rounded-full bg-white/10"
                      key={width}
                      style={{ width: `${width}%` }}
                    />
                  ))}
                </div>
              ) : (
                <p className="max-w-4xl text-base leading-7 text-zinc-200">
                  {narrative}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Action Needed" tone="critical" value={critical.length} />
        <StatCard label="Watch" tone="warning" value={warnings.length} />
        <StatCard label="Improving" tone="info" value={infos.length} />
      </div>

      <section className="rounded-2xl border border-border bg-surface p-8">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-text">
              Biomarkers
            </p>
            <h2 className="font-serif text-3xl font-semibold text-white">
              Current status
            </h2>
          </div>
          <p className="text-sm text-muted-text">
            {biomarkers.length} markers tracked across the timeline
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {biomarkers.map((biomarker) => (
            <BiomarkerCard biomarker={biomarker} key={biomarker.name} />
          ))}
        </div>
      </section>

      {insights.length > 0 ? (
        <section className="rounded-2xl border border-border bg-surface p-8">
          <div className="mb-7">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-text">
              Pattern recognition
            </p>
            <h2 className="font-serif text-3xl font-semibold text-white">
              Trend analysis
            </h2>
          </div>
          <div className="space-y-4">
            {insights.map((insight) => (
              <InsightCard insight={insight} key={`${insight.biomarker}-${insight.summary}`} />
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-border bg-surface p-10 text-center">
          <CheckCircle className="mx-auto mb-4 text-accent" size={36} />
          <h2 className="font-serif text-3xl font-semibold text-white">
            All markers look stable
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-text">
            No significant trends were detected across the uploaded results.
          </p>
        </section>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'critical' | 'warning' | 'info';
}) {
  const toneClass = {
    critical: 'border-red-400/20 bg-red-500/10 text-red-300',
    warning: 'border-orange-300/20 bg-orange-400/10 text-orange-200',
    info: 'border-accent/20 bg-accent/10 text-accent',
  }[tone];

  return (
    <div className={`rounded-2xl border p-8 text-center ${toneClass}`}>
      <div className="font-serif text-6xl font-semibold leading-none">{value}</div>
      <div className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted-text">
        {label}
      </div>
    </div>
  );
}

function BiomarkerCard({ biomarker }: { biomarker: BiomarkerSeries }) {
  const label = TREND_LABEL[biomarker.trend];
  const inRange =
    biomarker.latestValue >= biomarker.reference_range.low &&
    biomarker.latestValue <= biomarker.reference_range.high;
  const range = getRangeBar(biomarker);

  return (
    <article className="rounded-2xl border border-border bg-ink p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-text">
            {getCategory(biomarker.name)}
          </p>
          <h3 className="font-serif text-2xl font-semibold text-white">
            {biomarker.name}
          </h3>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getTrendTone(biomarker.trend)}`}>
          {label}
        </span>
      </div>

      <div className="mb-5 flex items-baseline gap-2">
        <span className={`font-serif text-5xl font-semibold ${inRange ? 'text-white' : 'text-orange-200'}`}>
          {biomarker.latestValue}
        </span>
        <span className="text-sm text-muted-text">{biomarker.unit}</span>
      </div>

      <div className="relative mb-4 h-2 rounded-full bg-white/10">
        <div
          className="absolute top-0 h-full rounded-full bg-accent/20"
          style={{ left: `${range.refLeft}%`, width: `${range.refWidth}%` }}
        />
        <div
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink bg-accent shadow-[0_0_0_4px_rgba(79,209,197,0.16)]"
          style={{ left: `${range.dotLeft}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-text">
        <span>Ref {formatRange(biomarker)}</span>
        <span>
          {biomarker.trendPercent > 0 ? '+' : ''}
          {biomarker.trendPercent}%
        </span>
      </div>
    </article>
  );
}

function InsightCard({ insight }: { insight: TrendInsight }) {
  const cfg = {
    critical: {
      icon: AlertTriangle,
      className: 'border-red-400/20 bg-red-500/10 text-red-300',
    },
    warning: {
      icon: TrendingUp,
      className: 'border-orange-300/20 bg-orange-400/10 text-orange-200',
    },
    info: {
      icon: TrendingDown,
      className: 'border-accent/20 bg-accent/10 text-accent',
    },
  }[insight.severity];
  const Icon = cfg.icon;

  return (
    <article className={`rounded-2xl border p-6 ${cfg.className}`}>
      <div className="flex gap-4">
        <Icon className="mt-1 shrink-0" size={18} />
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h3 className="font-serif text-2xl font-semibold text-white">
              {insight.biomarker}
            </h3>
            <span className="rounded-full bg-black/25 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
              {insight.severity}
            </span>
          </div>
          <p className="text-sm font-semibold leading-6 text-white">
            {insight.summary}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {insight.detail}
          </p>
        </div>
      </div>
    </article>
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

function getRangeBar(biomarker: BiomarkerSeries) {
  const { low, high } = biomarker.reference_range;
  const finiteHigh = high < 9999 ? high : Math.max(biomarker.latestValue, low) * 1.3;
  const span = Math.max(1, finiteHigh - low);
  const padding = span * 0.5;
  const visMin = Math.max(0, low - padding);
  const visMax = finiteHigh + padding;
  const pct = (value: number) => ((value - visMin) / (visMax - visMin)) * 100;
  const dot = Math.min(Math.max(biomarker.latestValue, visMin), visMax);

  return {
    refLeft: pct(low),
    refWidth: Math.max(4, pct(finiteHigh) - pct(low)),
    dotLeft: pct(dot),
  };
}

function formatRange(biomarker: BiomarkerSeries) {
  const { low, high } = biomarker.reference_range;
  if (low > 0 && high < 9999) return `${low}-${high} ${biomarker.unit}`;
  if (high < 9999) return `<${high} ${biomarker.unit}`;
  if (low > 0) return `>${low} ${biomarker.unit}`;
  return 'not listed';
}
