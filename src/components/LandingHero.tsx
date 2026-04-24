import { useState } from 'react';
import type { MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Upload } from 'lucide-react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { MOCK_REPORTS } from '../data/mockData';
import { useMouseTilt } from '../hooks/useMouseTilt';
import { aggregateBiomarkers } from '../utils/trendAnalysis';
import type { PatientData } from '../types';

interface LandingHeroProps {
  onLoadDemo: () => void;
  onGoToUpload: () => void;
}

const demoPatientFromReports: PatientData = {
  patientName: MOCK_REPORTS[0]?.patient_name ?? 'Demo Patient',
  readings: MOCK_REPORTS.flatMap((report) =>
    report.results.map((result) => ({
      testName: result.test_name,
      value: result.value,
      unit: result.unit,
      referenceLow: result.reference_range.low,
      referenceHigh: result.reference_range.high,
      date: result.date || report.date,
      source: result.source_file ?? report.id,
    })),
  ),
};

const ldlSeries = aggregateBiomarkers(demoPatientFromReports).find(
  (series) => series.name === 'LDL Cholesterol',
);

const previewData = ldlSeries?.dataPoints.map((point) => ({
  ...point,
  year: new Date(point.date).getFullYear().toString(),
}));

export function LandingHero({ onLoadDemo, onGoToUpload }: LandingHeroProps) {
  const previewTilt = useMouseTilt<HTMLDivElement>();
  const [parallaxX, setParallaxX] = useState(0);

  const handleHeroMouseMove = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setParallaxX((event.clientX - rect.left) / rect.width - 0.5);
  };

  return (
    <div className="relative left-1/2 -mt-8 w-screen -translate-x-1/2 bg-ink text-white lg:left-[calc(50%-5.5rem)]">
      <section
        className="relative flex min-h-screen overflow-hidden bg-cover bg-center px-6 py-8 sm:px-10"
        onMouseLeave={() => setParallaxX(0)}
        onMouseMove={handleHeroMouseMove}
        style={{
          backgroundImage: 'var(--hero-bg-image)',
          backgroundPosition: `calc(50% + ${parallaxX * -20}px) center`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-ink" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(79,209,197,0.18),transparent_34%)]" />

        <div className="relative z-10 flex w-full flex-col">
          <header className="flex items-center justify-between">
            <div className="font-serif text-sm font-semibold tracking-tight text-white">
              ✱ Lab Trend Tracker
            </div>
            <a
              className="rounded-full border border-white/20 bg-black/30 px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur transition hover:border-accent hover:text-accent"
              href="https://github.com/varunanand2006/550ClaudeHackathon"
              rel="noreferrer"
              target="_blank"
            >
              GitHub
            </a>
          </header>

          <div className="mx-auto flex min-h-[72vh] w-full max-w-6xl flex-1 flex-col items-center justify-center pt-16 text-center">
            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 text-xs font-semibold uppercase tracking-[0.34em] text-muted-text"
              initial={{ opacity: 0, y: 18 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              Personal Health Intelligence
            </motion.p>
            <motion.h1
              animate={{ opacity: 1, y: 0 }}
              className="display-serif max-w-6xl text-5xl sm:text-7xl lg:text-[112px]"
              initial={{ opacity: 0, y: 24 }}
              style={{ x: parallaxX * 10 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              Your bloodwork tells a{' '}
              <span className="italic">story</span> your doctors can't see.
            </motion.h1>
            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 max-w-xl text-base leading-7 text-zinc-300 sm:text-lg"
              initial={{ opacity: 0, y: 18 }}
              transition={{ delay: 0.15, duration: 0.7, ease: 'easeOut' }}
            >
              Upload lab PDFs from any doctor, any year. We extract every value,
              align them on a timeline, and surface the trends that single
              readings hide.
            </motion.p>
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
              initial={{ opacity: 0, y: 18 }}
              transition={{ delay: 0.3, duration: 0.7, ease: 'easeOut' }}
            >
              <button
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition hover:bg-accent"
                onClick={onLoadDemo}
                type="button"
              >
                <Sparkles size={17} />
                Try with demo data
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/35 px-7 py-3 text-sm font-semibold text-white backdrop-blur transition hover:border-accent hover:text-accent"
                onClick={onGoToUpload}
                type="button"
              >
                <Upload size={17} />
                Upload your PDFs
              </button>
            </motion.div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs uppercase tracking-[0.22em] text-muted-text">
              <span>Works with</span>
              <span>Quest</span>
              <span>LabCorp</span>
              <span>Mount Sinai</span>
              <span>Stamford Health</span>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-20 mx-auto -mt-20 max-w-5xl px-6 pb-24">
        <div
          className="rounded-[2rem] border border-white/10 bg-surface/95 p-5 shadow-2xl shadow-black/60 backdrop-blur sm:p-8"
          onMouseLeave={previewTilt.onMouseLeave}
          onMouseMove={previewTilt.onMouseMove}
          ref={previewTilt.ref}
          style={previewTilt.style}
        >
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                Live trend preview
              </p>
              <h2 className="mt-2 font-serif text-3xl font-semibold text-white">
                LDL Cholesterol is drifting upward.
              </h2>
            </div>
            <div className="rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent">
              +47% over 4 years
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={previewData}
                margin={{ top: 8, right: 12, bottom: 0, left: -20 }}
              >
                <CartesianGrid stroke="#252525" strokeDasharray="3 3" />
                <XAxis
                  dataKey="year"
                  stroke="#737373"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#737373"
                  tickLine={false}
                  axisLine={false}
                  width={52}
                />
                {ldlSeries ? (
                  <ReferenceArea
                    y1={ldlSeries.reference_range.low}
                    y2={ldlSeries.reference_range.high}
                    fill="#4fd1c5"
                    fillOpacity={0.08}
                  />
                ) : null}
                <Tooltip
                  contentStyle={{
                    background: '#0f0f0f',
                    border: '1px solid #1f1f1f',
                    borderRadius: 14,
                    color: '#fff',
                  }}
                  labelStyle={{ color: '#737373' }}
                />
                <Area
                  dataKey="value"
                  fill="#4fd1c5"
                  fillOpacity={0.1}
                  stroke="none"
                  type="monotone"
                />
                <Line
                  dataKey="value"
                  dot={{ r: 4, fill: '#4fd1c5', stroke: '#050505', strokeWidth: 2 }}
                  stroke="#4fd1c5"
                  strokeWidth={3}
                  type="monotone"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-4xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            How it works
          </p>
          <h2 className="display-serif text-5xl text-white md:text-7xl">
            From scattered PDFs to a story you can read.
          </h2>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-border bg-border lg:grid-cols-4">
          {[
            {
              number: '01',
              title: 'Upload anything',
              copy: 'Drop PDFs from any lab, any year. No format requirements.',
            },
            {
              number: '02',
              title: 'Claude extracts the values',
              copy: 'Our parser pulls every reading, unit, and reference range.',
            },
            {
              number: '03',
              title: 'Timeline reconciliation',
              copy: 'Readings from different doctors merge into one continuous history.',
            },
            {
              number: '04',
              title: 'Trends surface themselves',
              copy: "See what's drifting before it becomes a problem.",
            },
          ].map((step) => (
            <article className="bg-ink p-8 sm:p-10" key={step.number}>
              <div className="mb-16 font-serif text-6xl text-white/10">
                {step.number}
              </div>
              <h3 className="font-serif text-2xl font-semibold text-white">
                {step.title}
              </h3>
              <p className="mt-5 text-sm leading-6 text-muted-text">
                {step.copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-black">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
          <blockquote className="display-serif text-5xl text-white md:text-7xl">
            A <span className="italic text-accent">23% rise</span> in LDL over
            four years won't show up in any single appointment.
          </blockquote>
          <div className="rounded-3xl border border-border bg-surface p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-text">
              Demo scope
            </p>
            <div className="mt-8 space-y-5">
              {[
                '152 readings analyzed in this demo',
                '7 biomarkers tracked',
                '5 years of history',
              ].map((stat) => (
                <div className="border-t border-border pt-5 text-sm text-zinc-300" key={stat}>
                  {stat}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 py-28 text-center">
        <h2 className="display-serif max-w-4xl text-5xl text-white md:text-7xl">
          See your own trends in the next 60 seconds.
        </h2>
        <button
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-black transition hover:bg-accent"
          onClick={onLoadDemo}
          type="button"
        >
          <Sparkles size={18} />
          Try with demo data
        </button>
      </section>
    </div>
  );
}
