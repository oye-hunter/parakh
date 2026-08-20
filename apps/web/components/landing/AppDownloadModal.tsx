'use client';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppDownloadModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(26, 26, 26, 0.65)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffeb',
          border: '2px solid #1a1a1a',
          borderRadius: 24,
          padding: 'clamp(20px, 4vw, 32px)',
          maxWidth: 460,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
          position: 'relative',
          boxShadow: '6px 6px 0px #1a1a1a',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: 'none',
            border: 'none',
            fontSize: 18,
            cursor: 'pointer',
            fontWeight: 'bold',
            color: '#1a1a1a',
            padding: 4,
          }}
        >
          ✕
        </button>

        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', color: '#8a8a80', textTransform: 'uppercase', marginBottom: 6 }}>
          PARAKH · MOBILE APPLICANT SUITE
        </div>
        <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 24, margin: '0 0 6px 0', fontWeight: 600 }}>
          Download Android APK
        </h3>
        <p style={{ fontSize: 14, color: '#666666', margin: '0 0 20px 0' }}>
          Version 1.0.0 · Lightweight Onboarding Client
        </p>

        {/* QR Code Container */}
        <div
          style={{
            background: '#e4e4d0',
            border: '1.5px solid #1a1a1a',
            borderRadius: 16,
            padding: 20,
            textAlign: 'center',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 140,
              height: 140,
              background: '#ffffff',
              border: '2px solid #1a1a1a',
              borderRadius: 10,
              padding: 8,
              margin: '0 auto 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg viewBox="0 0 100 100" width="100%" height="100%">
              <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
              {/* Corner Top-Left */}
              <rect x="6" y="6" width="28" height="28" fill="#1a1a1a" rx="4" />
              <rect x="12" y="12" width="16" height="16" fill="#ffffff" rx="2" />
              <rect x="16" y="16" width="8" height="8" fill="#1a1a1a" />
              {/* Corner Top-Right */}
              <rect x="66" y="6" width="28" height="28" fill="#1a1a1a" rx="4" />
              <rect x="72" y="12" width="16" height="16" fill="#ffffff" rx="2" />
              <rect x="76" y="16" width="8" height="8" fill="#1a1a1a" />
              {/* Corner Bottom-Left */}
              <rect x="6" y="66" width="28" height="28" fill="#1a1a1a" rx="4" />
              <rect x="12" y="72" width="16" height="16" fill="#ffffff" rx="2" />
              <rect x="16" y="76" width="8" height="8" fill="#1a1a1a" />
              {/* Data Grid Dots */}
              <rect x="42" y="8" width="6" height="6" fill="#1a1a1a" />
              <rect x="52" y="16" width="6" height="6" fill="#1a1a1a" />
              <rect x="42" y="24" width="6" height="6" fill="#1a1a1a" />
              <rect x="42" y="42" width="16" height="16" fill="#1a1a1a" rx="2" />
              <rect x="8" y="42" width="6" height="6" fill="#1a1a1a" />
              <rect x="24" y="48" width="6" height="6" fill="#1a1a1a" />
              <rect x="68" y="42" width="6" height="6" fill="#1a1a1a" />
              <rect x="80" y="52" width="6" height="6" fill="#1a1a1a" />
              <rect x="44" y="68" width="6" height="6" fill="#1a1a1a" />
              <rect x="56" y="78" width="6" height="6" fill="#1a1a1a" />
              <rect x="76" y="72" width="12" height="12" fill="#1a1a1a" rx="2" />
            </svg>
          </div>
          <span style={{ fontSize: 12, color: '#333333', fontWeight: 500 }}>
            Scan with phone camera or click direct link below
          </span>
        </div>

        <a
          href="/api/download/apk"
          download="parakh-v1.0.0.apk"
          style={{
            display: 'block',
            textAlign: 'center',
            background: '#f0d7ff',
            color: '#1a1a1a',
            border: '2px solid #1a1a1a',
            borderRadius: 12,
            padding: '14px 20px',
            fontWeight: 600,
            textDecoration: 'none',
            fontSize: 15,
            marginBottom: 12,
            transition: 'all 0.15s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(1px)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          Download APK Direct File (24 MB) ↓
        </a>

        <div style={{ fontSize: 12, color: '#8a8a80', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace" }}>
          Target: Android 8.0+ · Package: @parakh/mobile
        </div>
      </div>
    </div>
  );
}
