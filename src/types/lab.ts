// Shared types — all three team members build against these

export interface LabResult {
  test_name: string;
  value: number;
  unit: string;
  reference_range: { low: number; high: number };
  date: string; // ISO 8601: "2024-03-15"
  source_file?: string; // original PDF filename
}

export interface LabReport {
  id: string;
  patient_name?: string;
  date: string; // report date
  results: LabResult[];
}

// Aggregated view per biomarker across all reports
export interface BiomarkerSeries {
  name: string;
  unit: string;
  reference_range: { low: number; high: number };
  dataPoints: Array<{
    date: string;
    value: number;
  }>;
  trend: TrendStatus;
  trendPercent: number; // % change from first to last reading
  latestValue: number;
  latestDate: string;
}

export type TrendStatus = 'improving' | 'stable' | 'concerning' | 'critical' | 'unknown';

export interface TrendInsight {
  biomarker: string;
  summary: string;     // "Your LDL has risen 23% over 4 years"
  detail: string;      // more context
  severity: 'info' | 'warning' | 'critical';
}

export interface AppState {
  reports: LabReport[];
  biomarkers: BiomarkerSeries[];
  insights: TrendInsight[];
  isLoading: boolean;
  error: string | null;
}
