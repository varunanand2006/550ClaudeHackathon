// PERSON A — implement this component
// Drop zone that accepts PDFs, calls parsePdfWithClaude(), calls onReportParsed()

import type { LabReport } from '../types/lab';

interface UploadZoneProps {
  onReportParsed: (report: LabReport) => void;
  onLoadingChange: (loading: boolean) => void;
}

export function UploadZone({ onReportParsed, onLoadingChange }: UploadZoneProps) {
  void onReportParsed;
  void onLoadingChange;

  return (
    <div style={{
      border: '2px dashed #374151',
      borderRadius: 12,
      padding: '60px 24px',
      textAlign: 'center',
      color: '#6b7280',
    }}>
      <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Person A: implement PDF upload here</p>
      <p style={{ fontSize: 13 }}>Use react-dropzone + parsePdfWithClaude() from utils/claudeApi.ts</p>
    </div>
  );
}
