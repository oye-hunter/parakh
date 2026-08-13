'use client';

export default function FeatureShowcase() {
  return (
    <section id="features" style={{ background: '#ffffeb', borderBottom: '2px solid #1a1a1a', padding: '80px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 36, fontWeight: 600, margin: '0 0 12px 0' }}>
            Built for Compliance Officers & Digital Applicants
          </h2>
          <p style={{ fontSize: 16, color: '#8a8a80', margin: 0 }}>
            Two distinct ground depths: calm 5-step applicant flow vs ink-bordered officer console.
          </p>
        </div>

        {/* Cluster Alert Banner Demo */}
        <div style={{
          background: '#ffa946',
          border: '2px solid #1a1a1a',
          borderRadius: 16,
          padding: '16px 24px',
          marginBottom: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1a1a1a' }}>
              LIVE CROSS-APPLICATION ALERT PATTERN
            </span>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4, color: '#1a1a1a' }}>
              4 applications from RWP-114 in 2 hours share a device fingerprint.
            </div>
          </div>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            background: '#1a1a1a',
            color: '#ffffeb',
            padding: '6px 12px',
            borderRadius: 8,
          }}>
            CLUSTER REF #RWP-992
          </span>
        </div>

        {/* Grid Features */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          <div style={{ background: '#f2efdc', border: '2px solid #1a1a1a', borderRadius: 24, padding: 24 }}>
            <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, margin: '0 0 12px 0' }}>
              1. Signal Evidence Rows
            </h3>
            <p style={{ fontSize: 15, lineHeight: 1.5, color: '#222222', margin: 0 }}>
              Never a silent score. Every alert presents explicit mathematical metrics with 3px severity edge stripes.
            </p>
          </div>

          <div style={{ background: '#f2efdc', border: '2px solid #1a1a1a', borderRadius: 24, padding: 24 }}>
            <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, margin: '0 0 12px 0' }}>
              2. Immutable Audit Snapshots
            </h3>
            <p style={{ fontSize: 15, lineHeight: 1.5, color: '#222222', margin: 0 }}>
              Every officer verdict snapshots decision-time risk badges, reasoning text, and officer IDs permanently.
            </p>
          </div>

          <div style={{ background: '#f2efdc', border: '2px solid #1a1a1a', borderRadius: 24, padding: 24 }}>
            <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, margin: '0 0 12px 0' }}>
              3. Tabular Num Rigor
            </h3>
            <p style={{ fontSize: 15, lineHeight: 1.5, color: '#222222', margin: 0 }}>
              All identity codes, CNIC digits, currency figures, and timestamps set in JetBrains Mono tabular type.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
