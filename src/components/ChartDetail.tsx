// PERSON B — implement this component
// Full time-series chart for a single biomarker with reference range band

import type { BiomarkerSeries } from '../types/lab';

interface ChartDetailProps {
  biomarker: BiomarkerSeries;
  onBack: () => void;
}

export function ChartDetail({ biomarker, onBack }: ChartDetailProps) {
  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: 16, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
        ← Back
      </button>
      <p style={{ color: '#6b7280' }}>Person B: implement detailed chart for "{biomarker.name}" here</p>
    </div>
  );
}
