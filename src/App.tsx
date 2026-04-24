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
  );
}
