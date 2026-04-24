import { AlertTriangle, TrendingUp, TrendingDown, CheckCircle, Sparkles, Loader } from 'lucide-react';
import type { TrendInsight, BiomarkerSeries } from '../types/lab';
import { TREND_COLOR, TREND_LABEL } from '../utils/trendAnalysis';

interface InsightsPanelProps {
  insights: TrendInsight[];
  biomarkers: BiomarkerSeries[];
  narrative: string | null;
  narrativeLoading: boolean;
}

export function InsightsPanel({ insights, biomarkers, narrative, narrativeLoading }: InsightsPanelProps) {
  if (biomarkers.length === 0) return null;

  const critical = insights.filter(i => i.severity === 'critical');
  const warnings = insights.filter(i => i.severity === 'warning');
  const infos    = insights.filter(i => i.severity === 'info');

  return (
    <div className="flex flex-col gap-6">

      {/* AI Narrative */}
      {(narrativeLoading || narrative) && (
        <div style={{
          background: 'linear-gradient(135deg, #0f1f3d 0%, #0d1f2d 100%)',
          border: '1px solid #1e3a5f',
          borderRadius: 12,
          padding: '20px 22px',
          display: 'flex',
          gap: 14,
          alignItems: 'flex-start',
        }}>
          <div style={{
            flexShrink: 0,
            width: 32, height: 32,
            background: '#1d4ed8',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {narrativeLoading
              ? <Loader size={15} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
              : <Sparkles size={15} color="#fff" />
            }
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              AI Summary
            </div>
            {narrativeLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[100, 85, 60].map((w, i) => (
                  <div key={i} style={{
                    height: 12, width: `${w}%`,
                    background: '#1e3a5f',
                    borderRadius: 6,
                    animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
                <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }`}</style>
              </div>
            ) : (
              <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.65, margin: 0 }}>{narrative}</p>
            )}
          </div>
        </div>
      )}

      {/* Summary counts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <StatCard label="Action Needed" value={critical.length} color="#ef4444" bg="#1c0a0a" />
        <StatCard label="Watch"         value={warnings.length} color="#f59e0b" bg="#1c1300" />
        <StatCard label="Improving"     value={infos.length}    color="#22c55e" bg="#051a0a" />
      </div>

      {/* Biomarker cards with range bars */}
      <section>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
          Biomarker Status
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 10 }}>
          {biomarkers.map(b => (
            <BiomarkerCard key={b.name} biomarker={b} />
          ))}
        </div>
      </section>

      {/* Insight cards */}
      {insights.length > 0 && (
        <section>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            Trend Analysis
          </h2>
          <div className="flex flex-col gap-3">
            {insights.map((insight, i) => (
              <InsightCard key={i} insight={insight} />
            ))}
          </div>
        </section>
      )}

      {insights.length === 0 && (
        <div style={{
          padding: '24px', borderRadius: 10,
          border: '1px solid #1f2937', background: '#0d1117',
          textAlign: 'center', color: '#6b7280',
        }}>
          <CheckCircle size={28} style={{ margin: '0 auto 8px', color: '#22c55e' }} />
          <p style={{ fontWeight: 600, color: '#d1fae5', marginBottom: 4 }}>All markers look stable</p>
          <p style={{ fontSize: 13 }}>No significant trends detected across your results.</p>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <div style={{
      background: bg, border: `1px solid ${color}33`,
      borderRadius: 10, padding: '16px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 32, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function BiomarkerCard({ biomarker: b }: { biomarker: BiomarkerSeries }) {
  const color = TREND_COLOR[b.trend];
  const label = TREND_LABEL[b.trend];
  const { low, high } = b.reference_range;
  const inRange = b.latestValue >= low && b.latestValue <= high;

  // Range bar math — build a visual window around the reference range
  const span = high - low;
  const padding = span * 0.4;
  const visMin = Math.max(0, low - padding);
  const visMax = high + padding;
  const clampedVal = Math.min(Math.max(b.latestValue, visMin), visMax);
  const pct = (val: number) => ((val - visMin) / (visMax - visMin)) * 100;

  const refLeft  = pct(low);
  const refWidth = pct(high) - pct(low);
  const dotLeft  = pct(clampedVal);
  const overHigh = b.latestValue > visMax;
  const underLow = b.latestValue < visMin;

  return (
    <div style={{
      background: '#0d1117', border: '1px solid #1f2937',
      borderRadius: 10, padding: '14px',
      borderLeft: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#f9fafb', marginBottom: 6 }}>{b.name}</div>

      {/* Value + unit */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: inRange ? '#f9fafb' : color }}>
          {b.latestValue}
        </span>
        <span style={{ fontSize: 12, color: '#6b7280' }}>{b.unit}</span>
        <span style={{ fontSize: 11, color: '#374151', marginLeft: 'auto' }}>
          {low}–{high}
        </span>
      </div>

      {/* Range bar */}
      <div style={{ position: 'relative', height: 6, background: '#1f2937', borderRadius: 3, marginBottom: 8 }}>
        {/* Normal range band */}
        <div style={{
          position: 'absolute',
          left: `${refLeft}%`,
          width: `${refWidth}%`,
          height: '100%',
          background: '#16a34a44',
          borderRadius: 3,
        }} />
        {/* Value dot */}
        <div style={{
          position: 'absolute',
          left: `${dotLeft}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 10, height: 10,
          background: color,
          borderRadius: '50%',
          border: '2px solid #0d1117',
          boxShadow: `0 0 0 2px ${color}55`,
        }} />
        {/* Out-of-range arrows */}
        {overHigh && (
          <div style={{ position: 'absolute', right: -14, top: '50%', transform: 'translateY(-50%)', color, fontSize: 10 }}>▶</div>
        )}
        {underLow && (
          <div style={{ position: 'absolute', left: -14, top: '50%', transform: 'translateY(-50%)', color, fontSize: 10 }}>◀</div>
        )}
      </div>

      {/* Status row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: color }} />
        <span style={{ fontSize: 11, color }}>{label}</span>
        {b.dataPoints.length >= 2 && (
          <span style={{ fontSize: 11, color: '#4b5563', marginLeft: 'auto' }}>
            {b.trendPercent > 0 ? '+' : ''}{b.trendPercent}%
          </span>
        )}
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: TrendInsight }) {
  const configs = {
    critical: { icon: <AlertTriangle size={16} />, color: '#ef4444', bg: '#1c0a0a', border: '#ef444433' },
    warning:  { icon: <TrendingUp size={16} />,    color: '#f59e0b', bg: '#1c1300', border: '#f59e0b33' },
    info:     { icon: <TrendingDown size={16} />,  color: '#22c55e', bg: '#051a0a', border: '#22c55e33' },
  };
  const cfg = configs[insight.severity];

  return (
    <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 10, padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ color: cfg.color, flexShrink: 0, marginTop: 2 }}>{cfg.icon}</span>
        <div>
          <p style={{ fontWeight: 600, color: '#f9fafb', marginBottom: 4, fontSize: 14 }}>{insight.summary}</p>
          <p style={{ fontSize: 13, color: '#6b7280' }}>{insight.detail}</p>
        </div>
        <span style={{
          marginLeft: 'auto', flexShrink: 0, fontSize: 11, color: cfg.color,
          background: `${cfg.color}18`, padding: '2px 8px', borderRadius: 12, fontWeight: 500,
        }}>
          {insight.biomarker}
        </span>
      </div>
    </div>
  );
}
