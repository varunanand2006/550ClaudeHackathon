<<<<<<< HEAD
import { useState } from 'react';
import { Layout } from './components/Layout';
import { EmptyState } from './components/EmptyState';
import { LoadingState } from './components/LoadingState';
import { InsightsPanel } from './components/InsightsPanel';
import { Dashboard } from './components/Dashboard';
import { ChartDetail } from './components/ChartDetail';
import { UploadZone } from './components/UploadZone';
import { MOCK_REPORTS } from './data/mockData';
import { aggregateBiomarkers, generateInsights } from './utils/trendAnalysis';
import type { LabReport, BiomarkerSeries, TrendInsight } from './types/lab';

type Tab = 'dashboard' | 'upload' | 'insights';

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [reports, setReports] = useState<LabReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBiomarker, setSelectedBiomarker] = useState<string | null>(null);

  const biomarkers: BiomarkerSeries[] = aggregateBiomarkers(reports);
  const insights: TrendInsight[] = generateInsights(biomarkers);

  function handleLoadDemo() {
    setReports(MOCK_REPORTS);
    setTab('dashboard');
  }

  function handleReportParsed(report: LabReport) {
    setReports(prev => [...prev, report]);
    setTab('dashboard');
  }

  const hasData = reports.length > 0;
  const selected = selectedBiomarker ? biomarkers.find(b => b.name === selectedBiomarker) : null;

  return (
    <Layout activeTab={tab} onTabChange={setTab} reportCount={reports.length}>
      {isLoading && <LoadingState />}

      {!isLoading && tab === 'dashboard' && (
        <>
          {!hasData ? (
            <EmptyState onLoadDemo={handleLoadDemo} onGoToUpload={() => setTab('upload')} />
          ) : selected ? (
            <ChartDetail biomarker={selected} onBack={() => setSelectedBiomarker(null)} />
          ) : (
            <Dashboard biomarkers={biomarkers} onSelectBiomarker={setSelectedBiomarker} />
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
          <UploadZone onReportParsed={handleReportParsed} onLoadingChange={setIsLoading} />
          {!hasData && (
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <span style={{ fontSize: 13, color: '#4b5563' }}>No PDFs yet? </span>
              <button
                onClick={handleLoadDemo}
                style={{ fontSize: 13, color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Load demo data instead
              </button>
            </div>
          )}
        </div>
      )}

      {!isLoading && tab === 'insights' && (
        <div>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f9fafb', marginBottom: 6 }}>Trend Insights</h1>
            <p style={{ fontSize: 14, color: '#6b7280' }}>
              What's actually changing in your bloodwork over time.
            </p>
          </div>
          {!hasData ? (
            <EmptyState onLoadDemo={handleLoadDemo} onGoToUpload={() => setTab('upload')} />
          ) : (
            <InsightsPanel insights={insights} biomarkers={biomarkers} />
          )}
        </div>
      )}
    </Layout>
=======
import { useState } from "react";
import { ChartsPanel } from "./components/ChartsPanel";
import { PdfUpload } from "./components/PdfUpload";
import { samplePatient } from "./mockData";
import type { LabReading, PatientData } from "./types";

export type CurrentPatientState = PatientData;

function sortReadingsByDate(a: LabReading, b: LabReading) {
  return a.date.localeCompare(b.date) || a.testName.localeCompare(b.testName);
}

function readingKey(reading: LabReading) {
  return `${reading.testName}::${reading.date}`;
}

function mergePatientData(
  currentPatient: PatientData,
  newPatient: PatientData,
): PatientData {
  if (currentPatient === samplePatient) {
    return {
      ...newPatient,
      readings: [...newPatient.readings].sort(sortReadingsByDate),
    };
  }

  const readingsByKey = new Map<string, LabReading>();

  currentPatient.readings.forEach((reading) => {
    readingsByKey.set(readingKey(reading), reading);
  });

  newPatient.readings.forEach((reading) => {
    readingsByKey.set(readingKey(reading), reading);
  });

  const newPatientName = newPatient.patientName.trim();

  return {
    patientName:
      newPatientName && newPatientName !== "Unknown"
        ? newPatient.patientName
        : currentPatient.patientName,
    readings: Array.from(readingsByKey.values()).sort(sortReadingsByDate),
  };
}

function App() {
  const [patient, setPatient] = useState<PatientData>(samplePatient);

  const handleParsed = (data: PatientData) => {
    console.log("Parsed lab PDF", data);
    setPatient((currentPatient) => mergePatientData(currentPatient, data));
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <section className="mx-auto flex max-w-4xl flex-col gap-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">
          Hackathon prototype
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Lab Trend Tracker
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-300">
          Upload bloodwork PDFs, extract structured lab readings with Claude,
          and visualize long-term trends across doctors and years.
        </p>
        <div className="flex flex-wrap gap-3 pt-4">
          <button
            type="button"
            className="rounded-md border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-300 hover:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-slate-950"
            onClick={() => setPatient(samplePatient)}
          >
            Reset to demo data
          </button>
        </div>
        <div className="pt-6">
          <PdfUpload onParsed={handleParsed} />
        </div>
        <div className="pt-6">
          <ChartsPanel patient={patient} />
        </div>
      </section>
    </main>
>>>>>>> 156d195 (Add multi-file merge logic and demo fallback)
  );
}
