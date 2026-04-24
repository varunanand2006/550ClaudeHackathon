import { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { EmptyState } from './components/EmptyState';
import { LandingHero } from './components/LandingHero';
import { LoadingState } from './components/LoadingState';
import { InsightsPanel } from './components/InsightsPanel';
import { Dashboard } from './components/Dashboard';
import { ChartDetail } from './components/ChartDetail';
import { PdfUpload } from './components/PdfUpload';
import { samplePatient } from './mockData';
import { aggregateBiomarkers, generateInsights } from './utils/trendAnalysis';
import { generateNarrative } from './utils/claudeNarrative';
import type { PatientData } from './types';

type Tab = 'dashboard' | 'upload' | 'insights';

function mergePatient(current: PatientData, incoming: PatientData): PatientData {
  // If we're on the demo data, replace entirely with the first real upload
  if (current === samplePatient) {
    return { ...incoming, readings: [...incoming.readings].sort((a, b) => a.date.localeCompare(b.date)) };
  }
  // Otherwise deduplicate by testName+date and merge
  const key = (r: PatientData['readings'][number]) => `${r.testName}::${r.date}`;
  const byKey = new Map(current.readings.map(r => [key(r), r]));
  incoming.readings.forEach(r => byKey.set(key(r), r));
  const name = incoming.patientName.trim() && incoming.patientName !== 'Unknown'
    ? incoming.patientName : current.patientName;
  return {
    patientName: name,
    readings: Array.from(byKey.values()).sort((a, b) => a.date.localeCompare(b.date)),
  };
}

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [patient, setPatient] = useState<PatientData>(samplePatient);
  const [isLoading] = useState(false);
  const [demoLoaded, setDemoLoaded] = useState(false);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const [selectedBiomarker, setSelectedBiomarker] = useState<string | null>(null);
  const narrativeFetchedFor = useRef<number>(0);

  const biomarkers = aggregateBiomarkers(patient);
  const insights   = generateInsights(biomarkers);
  const hasRealData = patient !== samplePatient;
  const hasLoadedData = hasRealData || demoLoaded;
  const selected = selectedBiomarker
    ? biomarkers.find((b) => b.name === selectedBiomarker) ?? null
    : null;

  // Trigger narrative when patient data changes and API key is available
  useEffect(() => {
    const count = patient.readings.length;
    if (count === 0 || count === narrativeFetchedFor.current) return;
    if (!import.meta.env.VITE_ANTHROPIC_API_KEY) return;

    narrativeFetchedFor.current = count;
    setNarrative(null);
    setNarrativeLoading(true);
    const bio = aggregateBiomarkers(patient);
    const ins = generateInsights(bio);
    generateNarrative(patient, bio, ins)
      .then(text => setNarrative(text))
      .catch(() => setNarrative(null))
      .finally(() => setNarrativeLoading(false));
  }, [patient]);

  function handleLoadDemo() {
    setPatient(samplePatient);
    setDemoLoaded(true);
    setSelectedBiomarker(null);
    setTab('dashboard');
  }

  function handleParsed(data: PatientData) {
    setPatient(prev => mergePatient(prev, data));
    setDemoLoaded(true);
    setSelectedBiomarker(null);
    setTab('insights');
  }

  return (
    <Layout
      activeTab={tab}
      onTabChange={setTab}
      reportCount={hasLoadedData ? patient.readings.length : 0}
    >
      {isLoading && <LoadingState />}

      {!isLoading && tab === 'dashboard' && (
        <>
          {!hasLoadedData ? (
            <LandingHero
              onGoToUpload={() => setTab('upload')}
              onLoadDemo={handleLoadDemo}
            />
          ) : selected ? (
            <ChartDetail
              biomarker={selected}
              onBack={() => setSelectedBiomarker(null)}
            />
          ) : (
            <Dashboard
              biomarkers={biomarkers}
              onSelectBiomarker={setSelectedBiomarker}
            />
          )}
        </>
      )}

      {!isLoading && tab === 'upload' && (
        <div>
          <div className="mb-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Upload
            </p>
            <h1 className="font-serif text-4xl font-semibold text-white">
              Upload Lab Results
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-text">
              Drop any bloodwork PDF — Quest, LabCorp, hospital portals. Claude will extract the values.
            </p>
          </div>
          <PdfUpload onParsed={handleParsed} />
          <div className="mt-8 text-center">
            <span className="text-sm text-muted-text">No PDFs? </span>
            <button
              className="text-sm font-medium text-accent underline underline-offset-4"
              onClick={handleLoadDemo}
              type="button"
            >
              Load demo data instead
            </button>
          </div>
        </div>
      )}

      {!isLoading && tab === 'insights' && (
        <div>
          <div className="mb-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Intelligence
            </p>
            <h1 className="font-serif text-4xl font-semibold text-white">
              Trend Insights
              {patient.patientName && (
                <span className="ml-3 font-sans text-sm font-normal text-muted-text">
                  {patient.patientName}
                </span>
              )}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-text">
              What's actually changing in your bloodwork over time.
            </p>
          </div>
          {!hasLoadedData || biomarkers.length === 0 ? (
            <EmptyState onLoadDemo={handleLoadDemo} onGoToUpload={() => setTab('upload')} />
          ) : (
            <InsightsPanel
              insights={insights}
              biomarkers={biomarkers}
              narrative={narrative}
              narrativeLoading={narrativeLoading}
            />
          )}
        </div>
      )}
    </Layout>
  );
}
