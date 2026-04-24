import { Activity } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'upload' | 'insights';
  onTabChange: (tab: 'dashboard' | 'upload' | 'insights') => void;
  reportCount: number;
}

export function Layout({ children, activeTab, onTabChange, reportCount }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#030712' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #1f2937' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{ background: '#1d4ed8', borderRadius: 10, padding: 8 }}>
              <Activity size={20} color="#fff" />
            </div>
            <div>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#f9fafb', letterSpacing: '-0.3px' }}>
                LabTrends
              </span>
              <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>
                Bloodwork over time
              </span>
            </div>
          </div>

          {reportCount > 0 && (
            <span style={{
              background: '#1e3a5f',
              color: '#60a5fa',
              fontSize: 12,
              padding: '3px 10px',
              borderRadius: 20,
              fontWeight: 500,
            }}>
              {reportCount} report{reportCount !== 1 ? 's' : ''} loaded
            </span>
          )}
        </div>

        {/* Nav tabs */}
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex gap-1" style={{ marginBottom: -1 }}>
            {(['dashboard', 'upload', 'insights'] as const).map((tab) => {
              const labels = { dashboard: 'Dashboard', upload: 'Upload Labs', insights: 'Insights' };
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => onTabChange(tab)}
                  style={{
                    padding: '10px 16px',
                    fontSize: 14,
                    fontWeight: active ? 600 : 400,
                    color: active ? '#f9fafb' : '#6b7280',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: active ? '2px solid #3b82f6' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'color 0.15s',
                  }}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        {children}
      </main>

      <footer style={{ borderTop: '1px solid #1f2937', padding: '16px 24px', textAlign: 'center' }}>
        <span style={{ fontSize: 12, color: '#374151' }}>
          LabTrends — patterns in your health data over time
        </span>
      </footer>
    </div>
  );
}
