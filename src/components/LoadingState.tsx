interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Parsing your lab results…' }: LoadingStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 24px',
      gap: 20,
    }}>
      <div style={{ position: 'relative', width: 56, height: 56 }}>
        {/* Spinning ring */}
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          <circle cx="28" cy="28" r="24" stroke="#1f2937" strokeWidth="4" />
          <path d="M28 4a24 24 0 0 1 24 24" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
        </svg>
        {/* Inner dot */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 10, height: 10,
          background: '#3b82f6',
          borderRadius: '50%',
        }} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#e5e7eb', marginBottom: 6 }}>{message}</p>
        <p style={{ fontSize: 13, color: '#4b5563' }}>Claude is reading your PDF and extracting test values</p>
      </div>

      {/* Animated dots */}
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6,
            background: '#3b82f6',
            borderRadius: '50%',
            animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
        <style>{`@keyframes pulse { 0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }`}</style>
      </div>
    </div>
  );
}
