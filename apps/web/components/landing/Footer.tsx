'use client';

export default function Footer() {
  return (
    <footer
      style={{
        background: '#ffffeb',
        borderTop: '2px solid #1a1a1a',
        padding: '56px 24px 40px',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 32,
        }}
      >
        {/* Brand Column */}
        <div style={{ maxWidth: 380 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: 26,
                fontWeight: 600,
                color: '#1a1a1a',
              }}
            >
              Parakh
            </span>
            <span
              style={{
                fontSize: 11,
                fontFamily: "'Archivo', sans-serif",
                fontWeight: 600,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                background: '#e4e4d0',
                border: '1px solid #1a1a1a',
                padding: '2px 8px',
                borderRadius: 9999,
                color: '#1a1a1a',
              }}
            >
              پرکھ
            </span>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.5, color: '#444444', margin: '0 0 16px 0' }}>
            AI-driven customer risk profiling and biometric fraud defense for digital financial onboarding. Pure transparency on warm paper — zero silent scores.
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#e4e4d0',
              border: '1px solid #1a1a1a',
              borderRadius: 9999,
              padding: '4px 12px',
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
              color: '#1a1a1a',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: '#034f46',
                display: 'inline-block',
              }}
            />
            <span>All Engines Operational · Verisys v2.4</span>
          </div>
        </div>

        {/* Quick Links Column */}
        <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                color: '#8a8a80',
                marginBottom: 12,
              }}
            >
              PLATFORM
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
              <li>
                <a href="#simulator" style={{ color: '#1a1a1a', textDecoration: 'none' }}>
                  Risk Profiler
                </a>
              </li>
              <li>
                <a href="#features" style={{ color: '#1a1a1a', textDecoration: 'none' }}>
                  Compliance Pipeline
                </a>
              </li>
              <li>
                <a href="#download" style={{ color: '#1a1a1a', textDecoration: 'none' }}>
                  Mobile APK Suite
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                color: '#8a8a80',
                marginBottom: 12,
              }}
            >
              DESIGN SYSTEM
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
              <li style={{ color: '#444444' }}>Warm Ledger Edition</li>
              <li style={{ color: '#444444' }}>Fraunces + Archivo + Mono</li>
              <li style={{ color: '#444444' }}>2px Ink Borders & Lumen Paper</li>
            </ul>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1200,
          margin: '36px auto 0',
          paddingTop: 20,
          borderTop: '1px solid #e4e4d0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 12,
          color: '#8a8a80',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>© 2026 Parakh AI Risk Profiling Platform. Every judgment, explained.</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace" }}>Light-Only Ledger · Next.js & GSAP ScrollTrigger</div>
      </div>
    </footer>
  );
}
