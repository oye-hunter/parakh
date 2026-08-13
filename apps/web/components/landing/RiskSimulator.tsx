'use client';

import { useState } from 'react';

export default function RiskSimulator() {
  const [declaredIncome, setDeclaredIncome] = useState<number>(50000);
  const [expectedVolume, setExpectedVolume] = useState<number>(350000);
  const [deviceMatches, setDeviceMatches] = useState<number>(2);
  const [cnicValid, setCnicValid] = useState<boolean>(true);

  // Risk Math Engine
  const ratio = declaredIncome > 0 ? expectedVolume / declaredIncome : 10;
  let riskScore = 0.15;
  if (ratio > 5) riskScore += 0.35;
  if (deviceMatches > 0) riskScore += deviceMatches * 0.2;
  if (!cnicValid) riskScore += 0.4;
  riskScore = Math.min(0.99, Math.max(0.05, riskScore));

  const riskLevel = riskScore >= 0.7 ? 'HIGH' : riskScore >= 0.4 ? 'MEDIUM' : 'LOW';
  const badgeColor = riskLevel === 'HIGH' ? '#a8322a' : riskLevel === 'MEDIUM' ? '#b06a0c' : '#034f46';

  return (
    <section id="simulator" style={{ background: '#f2efdc', borderBottom: '2px solid #1a1a1a', padding: '80px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 36, fontWeight: 600, margin: '0 0 12px 0' }}>
            Interactive Risk Profiling Engine
          </h2>
          <p style={{ fontSize: 16, color: '#8a8a80', margin: 0 }}>
            Adjust onboarding signals below to observe Parakh's real-time evidence generation and AI reasoning.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
          {/* Left Controls */}
          <div style={{ background: '#ffffeb', border: '2px solid #1a1a1a', borderRadius: 24, padding: 28 }}>
            <h3 style={{ fontSize: 20, margin: '0 0 24px 0' }}>Onboarding Input Signals</h3>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', color: '#8a8a80', marginBottom: 8 }}>
                Declared Monthly Income (PKR): <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1a1a1a' }}>{declaredIncome.toLocaleString()}</span>
              </label>
              <input
                type="range"
                min="20000"
                max="500000"
                step="10000"
                value={declaredIncome}
                onChange={(e) => setDeclaredIncome(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', color: '#8a8a80', marginBottom: 8 }}>
                Expected Monthly Volume (PKR): <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1a1a1a' }}>{expectedVolume.toLocaleString()}</span>
              </label>
              <input
                type="range"
                min="50000"
                max="2000000"
                step="50000"
                value={expectedVolume}
                onChange={(e) => setExpectedVolume(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', color: '#8a8a80', marginBottom: 8 }}>
                Device Fingerprint Share Count: <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1a1a1a' }}>{deviceMatches}</span>
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={deviceMatches}
                onChange={(e) => setDeviceMatches(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontSize: 15, fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={cnicValid}
                  onChange={(e) => setCnicValid(e.target.checked)}
                />
                CNIC Verisys Identity Match Confirmed
              </label>
            </div>
          </div>

          {/* Right Live Result */}
          <div style={{ background: '#ffffeb', border: '2px solid #1a1a1a', borderRadius: 24, padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 20, margin: 0 }}>Generated Risk Judgment</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  background: badgeColor,
                  color: '#ffffeb',
                  padding: '6px 14px',
                  borderRadius: 9999,
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                }}>
                  {riskLevel}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: '#8a8a80' }}>
                  {riskScore.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Evidence Rows */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#8a8a80', textTransform: 'uppercase', marginBottom: 8 }}>
                SEVERITY EVIDENCE ROWS
              </div>

              <div style={{ background: '#e4e4d0', borderLeft: `3px solid ${ratio > 5 ? '#a8322a' : '#034f46'}`, borderRadius: 12, padding: '12px 16px', marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Income-to-Volume Multiplier</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, marginTop: 4 }}>
                  income PKR {declaredIncome.toLocaleString()} · volume PKR {expectedVolume.toLocaleString()} · {ratio.toFixed(1)}×
                </div>
              </div>

              {deviceMatches > 0 && (
                <div style={{ background: '#e4e4d0', borderLeft: '3px solid #b06a0c', borderRadius: 12, padding: '12px 16px', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Cross-Account Device Clustering</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, marginTop: 4 }}>
                    {deviceMatches} active applications share device fingerprint hash
                  </div>
                </div>
              )}
            </div>

            {/* AI Reasoning */}
            <div style={{ background: '#f2efdc', border: '1.5px solid #1a1a1a', borderRadius: 16, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.10em', color: '#8a8a80', textTransform: 'uppercase' }}>
                EXPLAINABILITY REASONING
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.6, margin: '8px 0 0 0' }}>
                {riskLevel === 'HIGH'
                  ? 'High disparity between declared personal income and transaction expectations coupled with multi-account device sharing triggers mandatory EDD review.'
                  : riskLevel === 'MEDIUM'
                  ? 'Moderate transaction volume variance requires secondary compliance officer verification before account activation.'
                  : 'Application meets automated clear criteria with consistent declared metrics and verified identity credentials.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
