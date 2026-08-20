'use client';

import { useState, useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

interface ScenarioPreset {
  name: string;
  badge: string;
  color: string;
  income: number;
  volume: number;
  devices: number;
  cnic: boolean;
}

const PRESETS: ScenarioPreset[] = [
  {
    name: 'Standard Salaried',
    badge: 'LOW RISK',
    color: '#034f46',
    income: 150000,
    volume: 200000,
    devices: 0,
    cnic: true,
  },
  {
    name: 'Freelance Volume Surge',
    badge: 'MEDIUM RISK',
    color: '#b06a0c',
    income: 80000,
    volume: 550000,
    devices: 1,
    cnic: true,
  },
  {
    name: 'Syndicate Smurf Collision',
    badge: 'HIGH RISK',
    color: '#a8322a',
    income: 35000,
    volume: 450000,
    devices: 3,
    cnic: false,
  },
];

export default function RiskSimulator() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftCardRef = useRef<HTMLDivElement>(null);
  const rightCardRef = useRef<HTMLDivElement>(null);

  const [declaredIncome, setDeclaredIncome] = useState<number>(50000);
  const [expectedVolume, setExpectedVolume] = useState<number>(350000);
  const [deviceMatches, setDeviceMatches] = useState<number>(2);
  const [cnicValid, setCnicValid] = useState<boolean>(true);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Risk Math Engine
  const ratio = declaredIncome > 0 ? expectedVolume / declaredIncome : 10;
  let riskScore = 0.15;
  if (ratio > 4) riskScore += 0.30;
  if (deviceMatches > 0) riskScore += deviceMatches * 0.18;
  if (!cnicValid) riskScore += 0.35;
  riskScore = Math.min(0.99, Math.max(0.06, riskScore));

  const riskLevel = riskScore >= 0.7 ? 'HIGH' : riskScore >= 0.4 ? 'MEDIUM' : 'LOW';
  const badgeColor = riskLevel === 'HIGH' ? '#a8322a' : riskLevel === 'MEDIUM' ? '#b06a0c' : '#034f46';
  const gaugeDegree = Math.round(riskScore * 180);

  const applyPreset = (preset: ScenarioPreset) => {
    setDeclaredIncome(preset.income);
    setExpectedVolume(preset.volume);
    setDeviceMatches(preset.devices);
    setCnicValid(preset.cnic);
    setActivePreset(preset.name);
  };

  useEffect(() => {
    // Keep React rendering pure without DOM inline style wipes
  }, []);

  return (
    <section
      id="simulator"
      ref={sectionRef}
      style={{
        background: '#f2efdc',
        borderBottom: '2px solid #1a1a1a',
        padding: 'clamp(44px, 6vw, 88px) clamp(16px, 4vw, 24px)',
        position: 'relative',
      }}
    >
      <style>{`
        .simulator-split-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          align-items: stretch;
        }
        .simulator-card {
          background-color: #ffffeb !important;
          border: 2px solid #1a1a1a !important;
          border-radius: 24px !important;
          box-shadow: 4px 4px 0 #1a1a1a !important;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-sizing: border-box;
        }
        @media (max-width: 860px) {
          .simulator-split-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#ffffeb',
              border: '1.5px solid #1a1a1a',
              borderRadius: 9999,
              padding: '4px 14px',
              fontSize: 11,
              fontFamily: "'Archivo', sans-serif",
              fontWeight: 600,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              marginBottom: 14,
            }}
          >
            INTERACTIVE BENCHMARK
          </div>
          <h2
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 'clamp(28px, 6vw, 40px)',
              fontWeight: 600,
              color: '#1a1a1a',
              margin: '0 0 12px 0',
              letterSpacing: '-0.5px',
            }}
          >
            Real-Time Risk Profiling Engine
          </h2>
          <p style={{ fontSize: 15, color: '#444444', margin: 0, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
            Adjust onboarding signals or trigger scenario presets below to observe Parakh's instantaneous mathematical evidence extraction and explainable reasoning.
          </p>

          {/* Scenario Preset Selector Pills */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 10,
              marginTop: 20,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                alignSelf: 'center',
                fontSize: 12,
                fontWeight: 600,
                color: '#8a8a80',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Test Scenarios:
            </span>
            {PRESETS.map((p) => {
              const isSelected = activePreset === p.name;
              return (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  style={{
                    background: isSelected ? p.color : '#ffffeb',
                    color: isSelected ? '#ffffeb' : '#1a1a1a',
                    border: '2px solid #1a1a1a',
                    borderRadius: 9999,
                    padding: '8px 16px',
                    minHeight: 40,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '2px 2px 0 #1a1a1a' : 'none',
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: isSelected ? '#ffffeb' : p.color,
                    }}
                  />
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Simulator Split Grid */}
        <div className="simulator-split-grid">
          {/* Left Controls Card */}
          <div
            ref={leftCardRef}
            className="simulator-card"
            style={{
              padding: 'clamp(18px, 4vw, 32px)',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 24,
                  paddingBottom: 12,
                  borderBottom: '1.5px solid #e4e4d0',
                }}
              >
                <h3 style={{ fontSize: 20, fontWeight: 600, margin: 0, fontFamily: "'Fraunces', serif" }}>
                  Applicant Signal Inputs
                </h3>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: '#8a8a80',
                    background: '#e4e4d0',
                    padding: '2px 8px',
                    borderRadius: 6,
                  }}
                >
                  STEP 2 OF 5
                </span>
              </div>

              {/* Slider 1: Declared Income */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#444444',
                    }}
                  >
                    Declared Monthly Income
                  </label>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 600,
                      fontSize: 14,
                      color: '#1a1a1a',
                    }}
                  >
                    PKR {declaredIncome.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="500000"
                  step="5000"
                  value={declaredIncome}
                  onChange={(e) => {
                    setDeclaredIncome(Number(e.target.value));
                    setActivePreset(null);
                  }}
                  style={{
                    width: '100%',
                    height: 8,
                    borderRadius: 4,
                    accentColor: '#034f46',
                    cursor: 'pointer',
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 11,
                    color: '#8a8a80',
                    fontFamily: "'JetBrains Mono', monospace",
                    marginTop: 4,
                  }}
                >
                  <span>PKR 20,000</span>
                  <span>PKR 500,000</span>
                </div>
              </div>

              {/* Slider 2: Expected Volume */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#444444',
                    }}
                  >
                    Expected Monthly Volume
                  </label>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 600,
                      fontSize: 14,
                      color: '#1a1a1a',
                    }}
                  >
                    PKR {expectedVolume.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="2000000"
                  step="25000"
                  value={expectedVolume}
                  onChange={(e) => {
                    setExpectedVolume(Number(e.target.value));
                    setActivePreset(null);
                  }}
                  style={{
                    width: '100%',
                    height: 8,
                    borderRadius: 4,
                    accentColor: '#034f46',
                    cursor: 'pointer',
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 11,
                    color: '#8a8a80',
                    fontFamily: "'JetBrains Mono', monospace",
                    marginTop: 4,
                  }}
                >
                  <span>PKR 50,000</span>
                  <span>PKR 2,000,000</span>
                </div>
              </div>

              {/* Slider 3: Device Matches */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#444444',
                    }}
                  >
                    Device Collision Count (Graph)
                  </label>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 600,
                      fontSize: 14,
                      color: deviceMatches > 0 ? '#a8322a' : '#034f46',
                    }}
                  >
                    {deviceMatches} {deviceMatches === 1 ? 'device match' : 'device matches'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={deviceMatches}
                  onChange={(e) => {
                    setDeviceMatches(Number(e.target.value));
                    setActivePreset(null);
                  }}
                  style={{
                    width: '100%',
                    height: 8,
                    borderRadius: 4,
                    accentColor: deviceMatches > 0 ? '#a8322a' : '#034f46',
                    cursor: 'pointer',
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 11,
                    color: '#8a8a80',
                    fontFamily: "'JetBrains Mono', monospace",
                    marginTop: 4,
                  }}
                >
                  <span>0 (Unique hardware)</span>
                  <span>5 (Cluster anomaly)</span>
                </div>
              </div>
            </div>

            {/* Checkbox: CNIC Match */}
            <div
              style={{
                background: '#e4e4d0',
                borderRadius: 14,
                padding: '14px 18px',
                border: '1.5px solid #1a1a1a',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#1a1a1a',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={cnicValid}
                  onChange={(e) => {
                    setCnicValid(e.target.checked);
                    setActivePreset(null);
                  }}
                  style={{
                    width: 18,
                    height: 18,
                    accentColor: '#034f46',
                    cursor: 'pointer',
                  }}
                />
                <span>CNIC Verisys Identity Match Confirmed</span>
              </label>
            </div>
          </div>

          {/* Right Live Judgment & Visual Gauge Card */}
          <div
            ref={rightCardRef}
            className="simulator-card"
            style={{
              padding: 'clamp(18px, 4vw, 32px)',
            }}
          >
            <div>
              {/* Header with Risk Badge */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20,
                  paddingBottom: 12,
                  borderBottom: '1.5px solid #e4e4d0',
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      margin: 0,
                      fontFamily: "'Fraunces', serif",
                    }}
                  >
                    Automated Risk Verdict
                  </h3>
                  <div
                    style={{
                      fontSize: 12,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: '#8a8a80',
                      marginTop: 2,
                    }}
                  >
                    STATUS: {riskLevel === 'HIGH' ? 'EDD_QUEUE' : riskLevel === 'MEDIUM' ? 'OFFICER_REVIEW' : 'AUTO_APPROVED'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      background: badgeColor,
                      color: '#ffffeb',
                      padding: '6px 14px',
                      borderRadius: 9999,
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    {riskLevel}
                  </span>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 16,
                      fontWeight: 700,
                      color: '#1a1a1a',
                    }}
                  >
                    {riskScore.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Visual Meter Bar */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#8a8a80', marginBottom: 6 }}>
                  <span>Composite Risk Gauge</span>
                  <span>{((riskScore) * 100).toFixed(0)}% severity</span>
                </div>
                <div
                  style={{
                    height: 12,
                    background: '#e4e4d0',
                    border: '1.5px solid #1a1a1a',
                    borderRadius: 9999,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${riskScore * 100}%`,
                      background: badgeColor,
                      transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease',
                    }}
                  />
                </div>
              </div>

              {/* Dynamic Evidence Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#8a8a80',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  MATHEMATICAL EVIDENCE ROWS
                </div>

                {/* Evidence 1: Income Volume */}
                <div
                  style={{
                    background: '#e4e4d0',
                    borderLeft: `4px solid ${ratio > 4 ? '#a8322a' : '#034f46'}`,
                    borderRadius: 12,
                    padding: '10px 14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: '#1a1a1a' }}>
                      Income-to-Volume Multiplier
                    </span>
                    <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#8a8a80' }}>
                      {ratio > 4 ? 'FLAGGED' : 'NORMAL'}
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12,
                      color: '#333333',
                      marginTop: 2,
                    }}
                  >
                    income PKR {declaredIncome.toLocaleString()} · volume PKR {expectedVolume.toLocaleString()} · {ratio.toFixed(1)}× ratio
                  </div>
                </div>

                {/* Evidence 2: Device collisions */}
                {deviceMatches > 0 && (
                  <div
                    style={{
                      background: '#e4e4d0',
                      borderLeft: '4px solid #a8322a',
                      borderRadius: 12,
                      padding: '10px 14px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: '#1a1a1a' }}>
                        Cross-Account Cluster Detection
                      </span>
                      <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#a8322a', fontWeight: 600 }}>
                        COLLISION ALERT
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 12,
                        color: '#333333',
                        marginTop: 2,
                      }}
                    >
                      {deviceMatches} accounts share device hardware hash SHA-256(IMEI+MAC)
                    </div>
                  </div>
                )}

                {/* Evidence 3: Verisys */}
                <div
                  style={{
                    background: '#e4e4d0',
                    borderLeft: `4px solid ${cnicValid ? '#034f46' : '#a8322a'}`,
                    borderRadius: 12,
                    padding: '10px 14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: '#1a1a1a' }}>
                      CNIC NADRA Database Verification
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: cnicValid ? '#034f46' : '#a8322a',
                        fontWeight: 600,
                      }}
                    >
                      {cnicValid ? 'VERIFIED' : 'UNMATCHED'}
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12,
                      color: '#333333',
                      marginTop: 2,
                    }}
                  >
                    {cnicValid
                      ? 'Identity record and biometric facial score pass Verisys threshold'
                      : 'Identity mismatch detected in NADRA database lookup'}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Reasoning Panel */}
            <div
              style={{
                background: '#f2efdc',
                border: '1.5px solid #1a1a1a',
                borderRadius: 16,
                padding: 16,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.10em',
                  color: '#8a8a80',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                AI EXPLAINABILITY REASONING
              </div>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  margin: 0,
                  color: '#1a1a1a',
                }}
              >
                {riskLevel === 'HIGH'
                  ? `Critical disparity detected: expected volume of PKR ${expectedVolume.toLocaleString()} is ${ratio.toFixed(1)}× declared income, exacerbated by ${deviceMatches} multi-account device collisions. Mandatory EDD escalated.`
                  : riskLevel === 'MEDIUM'
                  ? `Elevated transaction volume ratio (${ratio.toFixed(1)}×) requires secondary officer verification before activation.`
                  : 'Applicant metrics demonstrate consistent income-to-volume ratio and verified identity credentials. Automated fast-path clearance granted.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
