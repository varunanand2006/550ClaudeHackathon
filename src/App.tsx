import { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { EmptyState } from './components/EmptyState';
import { LoadingState } from './components/LoadingState';
import { InsightsPanel } from './components/InsightsPanel';
import { ChartsPanel } from './components/ChartsPanel';
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
  const [narrative, setNarrative] = useState<string | null>(null);
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const narrativeFetchedFor = useRef<number>(0);

  const biomarkers = aggregateBiomarkers(patient);
  const insights   = generateInsights(biomarkers);
  const hasRealData = patient !== samplePatient;

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
    setTab('insights');
  }

  function handleParsed(data: PatientData) {
    setPatient(prev => mergePatient(prev, data));
    setTab('insights');
  }

  return (
    <Layout activeTab={tab} onTabChange={setTab} reportCount={patient.readings.length}>
      {isLoading && <LoadingState />}

      {!isLoading && tab === 'dashboard' && (
        <>
          {!hasRealData && patient === samplePatient ? (
            // Show charts on demo data too — just with a subtle indicator
            <div>
              <div style={{
                marginBottom: 16, padding: '10px 14px',
                background: '#1c1f2e', border: '1px solid #2d3561',
                borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 12, color: '#818cf8' }}>Demo data — Sarah Chen</span>
                <button
                  onClick={() => setTab('upload')}
                  style={{ marginLeft: 'auto', fontSize: 12, color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Upload your own →
                </button>
              </div>
              <ChartsPanel patient={patient} />
            </div>
          ) : (
            <ChartsPanel patient={patient} />
          )}
        </>
      )}

      {!isLoading && tab === 'upload' && (
        <div>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f9fafb', marginBottom: 6 }}>Upload Lab Results</h1>
            <p style={{ fontSize: 14, color: '#6b7280' }}>
              Drop any bloodwork PDF — Quest, LabCorp, hospital portals. Claude will extract the values.
            </p>
          </div>
          <PdfUpload onParsed={handleParsed} />
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <span style={{ fontSize: 13, color: '#4b5563' }}>No PDFs? </span>
            <button
              onClick={handleLoadDemo}
              style={{ fontSize: 13, color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Load demo data instead
            </button>
          </div>
        </div>
      )}

      {!isLoading && tab === 'insights' && (
        <div>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f9fafb', marginBottom: 6 }}>
              Trend Insights
              {patient.patientName && (
                <span style={{ fontSize: 14, fontWeight: 400, color: '#6b7280', marginLeft: 10 }}>
                  {patient.patientName}
                </span>
              )}
            </h1>
            <p style={{ fontSize: 14, color: '#6b7280' }}>
              What's actually changing in your bloodwork over time.
            </p>
          </div>
          {biomarkers.length === 0 ? (
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
