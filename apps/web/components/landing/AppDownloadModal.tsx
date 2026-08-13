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
        backgroundColor: 'rgba(26, 26, 26, 0.6)',
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
          padding: 32,
          maxWidth: 480,
          width: '100%',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            fontSize: 20,
            cursor: 'pointer',
            fontWeight: 'bold',
            color: '#1a1a1a',
          }}
        >
          ✕
        </button>

        <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 24, margin: '0 0 12px 0' }}>
          Download Parakh Android APK
        </h3>
        <p style={{ fontSize: 14, color: '#8a8a80', margin: '0 0 24px 0' }}>
          Version 1.0.0 · Mobile Onboarding & Compliance App
        </p>

        {/* QR Code Container */}
        <div style={{
          background: '#e4e4d0',
          border: '1.5px solid #1a1a1a',
          borderRadius: 16,
          padding: 24,
          textAlign: 'center',
          marginBottom: 24,
        }}>
          <div style={{
            width: 160,
            height: 160,
            background: '#ffffff',
            border: '2px solid #1a1a1a',
            margin: '0 auto 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 8,
          }}>
            [ QR CODE ]
          </div>
          <span style={{ fontSize: 13, color: '#222222' }}>Scan with phone camera to download directly</span>
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
            fontSize: 16,
            marginBottom: 12,
          }}
        >
          Download APK Direct File (24 MB)
        </a>

        <p style={{ fontSize: 12, color: '#8a8a80', margin: 0, textAlign: 'center' }}>
          Requires Android 8.0+. Enable "Install from unknown sources" if prompted.
        </p>
      </div>
    </div>
  );
}
