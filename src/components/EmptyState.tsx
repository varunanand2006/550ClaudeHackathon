import { Upload, FileText } from 'lucide-react';

interface EmptyStateProps {
  onLoadDemo: () => void;
  onGoToUpload: () => void;
}

export function EmptyState({ onLoadDemo, onGoToUpload }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 24px',
      textAlign: 'center',
    }}>
      {/* Icon cluster */}
      <div style={{ position: 'relative', marginBottom: 32 }}>
        <div style={{
          width: 80, height: 80,
          background: '#0f172a',
          border: '1px solid #1e3a5f',
          borderRadius: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FileText size={36} color="#3b82f6" />
        </div>
        <div style={{
          position: 'absolute', bottom: -8, right: -8,
          width: 32, height: 32,
          background: '#0f2a1e',
          border: '1px solid #166534',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Upload size={14} color="#22c55e" />
        </div>
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f9fafb', marginBottom: 12, letterSpacing: '-0.3px' }}>
        Track your health over time
      </h1>
      <p style={{ fontSize: 15, color: '#6b7280', maxWidth: 420, lineHeight: 1.6, marginBottom: 32 }}>
        Upload bloodwork PDFs from any doctor, any year. We'll parse and compare them so
        you can see what's actually changing — not just a single snapshot.
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={onGoToUpload}
          style={{
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Upload size={15} />
          Upload a PDF
        </button>
        <button
          onClick={onLoadDemo}
          style={{
            background: 'transparent',
            color: '#9ca3af',
            border: '1px solid #374151',
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Load demo data
        </button>
      </div>

      <div style={{
        marginTop: 48,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        maxWidth: 560,
        width: '100%',
      }}>
        {[
          { label: 'Any PDF format', desc: 'Quest, LabCorp, hospital portals' },
          { label: 'Years of history', desc: 'Trends that span multiple doctors' },
          { label: 'Plain-English insights', desc: 'What the numbers actually mean' },
        ].map(f => (
          <div key={f.label} style={{
            background: '#0d1117',
            border: '1px solid #1f2937',
            borderRadius: 10,
            padding: '14px',
            textAlign: 'left',
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb', marginBottom: 4 }}>{f.label}</div>
            <div style={{ fontSize: 12, color: '#4b5563' }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
