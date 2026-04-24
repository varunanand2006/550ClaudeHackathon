import { AlertTriangle, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';
import type { TrendInsight, BiomarkerSeries } from '../types/lab';
import { TREND_COLOR, TREND_LABEL } from '../utils/trendAnalysis';

interface InsightsPanelProps {
  insights: TrendInsight[];
  biomarkers: BiomarkerSeries[];
}

export function InsightsPanel({ insights, biomarkers }: InsightsPanelProps) {
  if (biomarkers.length === 0) return null;

  const critical = insights.filter(i => i.severity === 'critical');
  const warnings = insights.filter(i => i.severity === 'warning');
  const infos    = insights.filter(i => i.severity === 'info');

  return (
    <div className="flex flex-col gap-6">
      {/* Summary bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
      }}>
        <StatCard
          label="Action Needed"
          value={critical.length}
          color="#ef4444"
          bg="#1c0a0a"
        />
        <StatCard
          label="Watch"
          value={warnings.length}
          color="#f59e0b"
          bg="#1c1300"
        />
        <StatCard
          label="Improving"
          value={infos.length}
          color="#22c55e"
          bg="#051a0a"
        />
      </div>

      {/* Biomarker status grid */}
      <section>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
          Biomarker Status
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
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
          padding: '24px',
          borderRadius: 10,
          border: '1px solid #1f2937',
          background: '#0d1117',
          textAlign: 'center',
          color: '#6b7280',
        }}>
          <CheckCircle size={28} style={{ margin: '0 auto 8px', color: '#22c55e' }} />
          <p style={{ fontWeight: 600, color: '#d1fae5', marginBottom: 4 }}>All markers look stable</p>
          <p style={{ fontSize: 13 }}>No significant trends detected across your results.</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <div style={{
      background: bg,
      border: `1px solid ${color}33`,
      borderRadius: 10,
      padding: '16px',
      textAlign: 'center',
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

  return (
    <div style={{
      background: '#0d1117',
      border: `1px solid #1f2937`,
      borderRadius: 10,
      padding: '14px',
      borderLeft: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#f9fafb', marginBottom: 6 }}>{b.name}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: inRange ? '#f9fafb' : color }}>
          {b.latestValue}
        </span>
        <span style={{ fontSize: 12, color: '#6b7280' }}>{b.unit}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{
          display: 'inline-block',
          width: 7, height: 7, borderRadius: '50%',
          background: color,
        }} />
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
    critical: {
      icon: <AlertTriangle size={16} />,
      color: '#ef4444',
      bg: '#1c0a0a',
      border: '#ef444433',
    },
    warning: {
      icon: <TrendingUp size={16} />,
      color: '#f59e0b',
      bg: '#1c1300',
      border: '#f59e0b33',
    },
    info: {
      icon: <TrendingDown size={16} />,
      color: '#22c55e',
      bg: '#051a0a',
      border: '#22c55e33',
    },
  };

  const cfg = configs[insight.severity];

  return (
    <div style={{
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderRadius: 10,
      padding: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ color: cfg.color, flexShrink: 0, marginTop: 2 }}>{cfg.icon}</span>
        <div>
          <p style={{ fontWeight: 600, color: '#f9fafb', marginBottom: 4, fontSize: 14 }}>
            {insight.summary}
          </p>
          <p style={{ fontSize: 13, color: '#6b7280' }}>{insight.detail}</p>
        </div>
        <span style={{
          marginLeft: 'auto',
          flexShrink: 0,
          fontSize: 11,
          color: cfg.color,
          background: `${cfg.color}18`,
          padding: '2px 8px',
          borderRadius: 12,
          fontWeight: 500,
        }}>
          {insight.biomarker}
        </span>
      </div>
    </div>
  );
}
