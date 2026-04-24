interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'upload' | 'insights';
  onTabChange: (tab: 'dashboard' | 'upload' | 'insights') => void;
  reportCount: number;
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'upload', label: 'Upload Labs' },
  { id: 'insights', label: 'Insights' },
] as const;

const sideNav = [
  { label: 'Overview', tab: 'dashboard' },
  { label: 'Biomarkers', tab: 'dashboard' },
  { label: 'Insights', tab: 'insights' },
] as const;

export function Layout({ children, activeTab, onTabChange, reportCount }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-ink font-sans text-white">
      <header className="sticky top-0 z-50 border-b border-border bg-ink/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-6">
            <button
              className="font-serif text-xl font-semibold tracking-tight text-white"
              onClick={() => onTabChange('dashboard')}
              type="button"
            >
              ✱ Lab Trend Tracker
            </button>

            {reportCount > 0 ? (
              <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent lg:hidden">
                {reportCount} readings
              </span>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-6">
            <nav className="flex gap-7">
              {tabs.map((tab) => {
                const active = activeTab === tab.id;

                return (
                  <button
                    className={`border-b py-2 text-sm transition ${
                      active
                        ? 'border-accent text-white'
                        : 'border-transparent text-muted-text hover:text-white'
                    }`}
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    type="button"
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            {reportCount > 0 ? (
              <span className="hidden rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-xs font-medium text-accent lg:inline-flex">
                {reportCount} readings
              </span>
            ) : null}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1">
        <aside className="hidden w-44 shrink-0 px-6 py-10 lg:block">
          <div className="sticky top-28 flex flex-col gap-4">
            {sideNav.map((item) => {
              const active =
                activeTab === item.tab &&
                (item.label !== 'Biomarkers' || activeTab === 'dashboard');

              return (
                <div
                  className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em]"
                  key={item.label}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      active ? 'bg-accent' : 'bg-white/15'
                    }`}
                  />
                  <span className={active ? 'text-white' : 'text-muted-text'}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-6 py-8 lg:px-8">{children}</main>
      </div>

      <footer className="border-t border-border px-6 py-5 text-center">
        <span className="text-xs text-neutral-700">
          LabTrends — patterns in your health data over time
        </span>
      </footer>
    </div>
  );
}
