'use client';

export default function Footer() {
  return (
    <footer style={{ background: '#ffffeb', padding: '48px 24px 32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, fontWeight: 600 }}>Parakh</div>
          <p style={{ fontSize: 13, color: '#8a8a80', margin: '4px 0 0 0' }}>
            Every judgment, explained. © 2026 Parakh Risk Profiling Platform.
          </p>
        </div>
        <div style={{ fontSize: 13, color: '#8a8a80' }}>
          Light Theme Ledger Edition · Built with Next.js & GSAP
        </div>
      </div>
    </footer>
  );
}
