// PERSON B — implement this component
// Sparkline grid of all biomarkers; clicking one calls onSelectBiomarker()

import type { BiomarkerSeries } from '../types/lab';

interface DashboardProps {
  biomarkers: BiomarkerSeries[];
  onSelectBiomarker: (name: string) => void;
}

export function Dashboard({ biomarkers, onSelectBiomarker }: DashboardProps) {
  void onSelectBiomarker;

  return (
    <div>
      <p style={{ color: '#6b7280' }}>Person B: implement sparkline dashboard here ({biomarkers.length} biomarkers loaded)</p>
    </div>
  );
}
