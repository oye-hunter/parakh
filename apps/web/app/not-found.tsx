'use client';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f2efdc',
        color: '#1a1a1a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily: "'Archivo', sans-serif",
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          backgroundColor: '#ffffeb',
          borderRadius: 24,
          border: '2px solid #1a1a1a',
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#8a8a80',
            fontWeight: 700,
          }}
        >
          PARAKH · COMPLIANCE ADMIN
        </span>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, margin: 0, fontWeight: 600 }}>
          404 - Page Not Found
        </h2>
        <p style={{ fontSize: 14, color: '#8a8a80', margin: 0 }}>
          The compliance console resource you requested could not be located.
        </p>
        <a
          href="/"
          style={{
            backgroundColor: '#034f46',
            color: '#ffffeb',
            border: '2px solid #1a1a1a',
            borderRadius: 12,
            padding: '10px 20px',
            fontWeight: 600,
            fontSize: 14,
            textDecoration: 'none',
            marginTop: 8,
          }}
        >
          Return to Console
        </a>
      </div>
    </div>
  );
}
