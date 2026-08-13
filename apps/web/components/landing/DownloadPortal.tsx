'use client';

interface Props {
  onOpenDownload: () => void;
}

export default function DownloadPortal({ onOpenDownload }: Props) {
  return (
    <section id="download" style={{ background: '#f2efdc', borderBottom: '2px solid #1a1a1a', padding: '80px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.10em', color: '#8a8a80', textTransform: 'uppercase' }}>
            MOBILE APPLICATION
          </span>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 40, fontWeight: 600, margin: '12px 0 20px 0' }}>
            Onboard Applicants on Mobile
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.5, color: '#222222', margin: '0 0 28px 0' }}>
            The Parakh Mobile APK brings the 5-step applicant onboarding flow directly to Android devices with offline draft support, document camera verification, and light-only paper UI.
          </p>

          <div style={{ display: 'flex', gap: 16 }}>
            <button
              onClick={onOpenDownload}
              style={{
                background: '#f0d7ff',
                color: '#1a1a1a',
                border: '2px solid #1a1a1a',
                borderRadius: 12,
                padding: '16px 28px',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Download Android APK (v1.0.0)
            </button>
          </div>
        </div>

        <div style={{ background: '#ffffeb', border: '2px solid #1a1a1a', borderRadius: 24, padding: 32 }}>
          <h4 style={{ fontSize: 18, margin: '0 0 16px 0' }}>App Specification</h4>
          <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 1.8, fontSize: 15 }}>
            <li>Build Target: Android 8.0+ APK preview</li>
            <li>Package Name: <code>@parakh/mobile</code></li>
            <li>Design Tokens: Parakh Cream & Ink design system</li>
            <li>Offline Buffer: Secure Store CNIC draft cache</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
