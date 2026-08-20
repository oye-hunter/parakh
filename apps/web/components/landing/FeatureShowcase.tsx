'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

interface PipelineStep {
  step: string;
  title: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  desc: string;
  metrics: string;
  detail: string;
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    step: '01',
    title: 'Biometric & Verisys Identity Sync',
    badge: 'KYC VERIFIED',
    badgeBg: '#034f46',
    badgeColor: '#ffffeb',
    desc: 'Applicant captures CNIC front/back and undergoes live selfie liveness detection, validated instantly against national database records.',
    metrics: '99.4% precision · 350ms NADRA lookup',
    detail: 'Cryptographic document OCR extracts 13-digit CNIC and validates expiration, watermarks, and microprint security bands.',
  },
  {
    step: '02',
    title: 'Income-to-Volume Disparity Engine',
    badge: 'HEURISTIC SCORING',
    badgeBg: '#e4e4d0',
    badgeColor: '#1a1a1a',
    desc: 'Heuristic algorithms contrast declared monthly earnings against desired account transaction velocity to uncover synthetic merchants.',
    metrics: 'Threshold bound: > 4.0× ratio flagged',
    detail: 'Flags discrepancy without manual calculation, scoring income tiers from PKR 20k to PKR 2M with dynamic bracket sensitivity.',
  },
  {
    step: '03',
    title: 'Graph Cluster Collision Detection',
    badge: 'GRAPH DEFENSE',
    badgeBg: '#ffa946',
    badgeColor: '#1a1a1a',
    desc: 'Deep hardware fingerprinting detects syndicates sharing physical phones, emulators, or IP ranges across multiple loan accounts.',
    metrics: 'SHA-256(IMEI + MAC + Subnet)',
    detail: 'Surfaces geographic velocity anomalies (e.g. 4 distinct CNICs submitting from 1 phone within 2 hours in Rawalpindi).',
  },
  {
    step: '04',
    title: 'Immutable Explainable Triage',
    badge: 'AUDIT SNAPSHOT',
    badgeBg: '#1a1a1a',
    badgeColor: '#ffffeb',
    desc: 'Automated clear path for pristine scores; high-risk applications route to senior officers with full mathematical evidence snapshots.',
    metrics: 'Zero silent scores · 100% audit trail',
    detail: 'Permanent immutable audit logs capture exact timestamped signals, officer justification notes, and risk badge states.',
  },
];

export default function FeatureShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const clusterBannerRef = useRef<HTMLDivElement>(null);
  const workbenchRef = useRef<HTMLDivElement>(null);

  const [activeStep, setActiveStep] = useState<number>(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!sectionRef.current) return;

      if (clusterBannerRef.current) {
        gsap.fromTo(
          clusterBannerRef.current,
          { y: 15 },
          {
            y: 0,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: clusterBannerRef.current,
              start: 'top 95%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      style={{
        background: '#ffffeb',
        borderBottom: '2px solid #1a1a1a',
        padding: 'clamp(44px, 6vw, 88px) clamp(16px, 4vw, 24px)',
        position: 'relative',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Section Title */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#e4e4d0',
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
            END-TO-END PIPELINE ARCHITECTURE
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
            How Parakh Governs Risk in Real-Time
          </h2>
          <p style={{ fontSize: 15, color: '#444444', margin: 0, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
            Four interconnected inspection layers built for rapid digital customer onboarding and uncompromising compliance governance. Click any stage below to inspect its live operational workbench.
          </p>
        </div>

        {/* Live Cluster Alert Banner Visualizer */}
        <div
          ref={clusterBannerRef}
          style={{
            background: '#ffa946',
            border: '2px solid #1a1a1a',
            borderRadius: 20,
            padding: '16px 22px',
            marginBottom: 36,
            boxShadow: '4px 4px 0 #1a1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#1a1a1a',
                color: '#ffffeb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              ⚠️
            </div>
            <div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  color: '#1a1a1a',
                }}
              >
                LIVE CROSS-APPLICATION GRAPH DEFENSE ALERT
              </span>
              <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2, color: '#1a1a1a' }}>
                4 applications from Rawalpindi Branch (RWP-114) in 2 hours collide on IMEI hash.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{
                fontSize: 12,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                background: '#1a1a1a',
                color: '#ffffeb',
                padding: '6px 14px',
                borderRadius: 9999,
              }}
            >
              CLUSTER REF #RWP-992
            </span>
          </div>
        </div>

        {/* 4-Stage Interactive Selector Grid */}
        <style>{`
          .pipeline-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 16px;
            margin-bottom: 32px;
          }
          .workbench-content-grid {
            display: grid;
            grid-template-columns: 1.1fr 0.9fr;
            gap: 28px;
            align-items: center;
          }
          @media (max-width: 900px) {
            .pipeline-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }
          @media (max-width: 820px) {
            .workbench-content-grid {
              grid-template-columns: 1fr;
              gap: 20px;
            }
          }
          @media (max-width: 540px) {
            .pipeline-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
        <div className="pipeline-grid">
          {PIPELINE_STEPS.map((step, idx) => {
            const isSelected = activeStep === idx;
            return (
              <div
                key={step.step}
                className="pipeline-step-card"
                onClick={() => setActiveStep(idx)}
                style={{
                  background: isSelected ? '#ffffeb' : '#f2efdc',
                  border: isSelected ? '2.5px solid #034f46' : '2px solid #1a1a1a',
                  borderTop: isSelected ? '6px solid #034f46' : '2px solid #1a1a1a',
                  borderRadius: 20,
                  padding: '20px 18px',
                  boxShadow: isSelected ? '4px 4px 0 #034f46' : '3px 3px 0 #1a1a1a',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                  opacity: 1,
                }}
              >
                <div>
                  {/* Step Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 14,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Fraunces', Georgia, serif",
                        fontSize: 28,
                        fontWeight: 600,
                        color: isSelected ? '#034f46' : '#1a1a1a',
                        lineHeight: 1,
                      }}
                    >
                      {step.step}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 700,
                        background: step.badgeBg,
                        color: step.badgeColor,
                        padding: '3px 8px',
                        borderRadius: 9999,
                        border: '1px solid #1a1a1a',
                      }}
                    >
                      {step.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontFamily: "'Fraunces', Georgia, serif",
                      fontSize: 19,
                      fontWeight: 600,
                      margin: '0 0 8px 0',
                      color: '#1a1a1a',
                      lineHeight: 1.25,
                    }}
                  >
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: '#444444',
                      margin: '0 0 16px 0',
                    }}
                  >
                    {step.desc}
                  </p>
                </div>

                {/* Bottom Metric & Active Indicator */}
                <div
                  style={{
                    background: isSelected ? '#e4e4d0' : '#ffffeb',
                    border: '1.5px solid #1a1a1a',
                    borderRadius: 12,
                    padding: '8px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#034f46',
                    }}
                  >
                    {step.metrics}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }}>
                    {isSelected ? 'ACTIVE ▾' : 'INSPECT →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Deep-Dive Interactive Inspection Workbench */}
        <div
          ref={workbenchRef}
          style={{
            background: '#f2efdc',
            border: '2px solid #1a1a1a',
            borderRadius: 24,
            padding: 'clamp(18px, 4vw, 32px)',
            boxShadow: '6px 6px 0 #1a1a1a',
            position: 'relative',
          }}
        >
          {/* Workbench Header Ribbon */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: 16,
              borderBottom: '2px solid #1a1a1a',
              marginBottom: 20,
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: 'clamp(18px, 4vw, 24px)',
                  fontWeight: 600,
                  color: '#1a1a1a',
                }}
              >
                Stage {PIPELINE_STEPS[activeStep]?.step} Inspection: {PIPELINE_STEPS[activeStep]?.title}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600,
                  background: '#1a1a1a',
                  color: '#ffffeb',
                  padding: '4px 10px',
                  borderRadius: 6,
                }}
              >
                ENGINE LATENCY: 24ms
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600,
                  background: '#034f46',
                  color: '#ffffeb',
                  padding: '4px 10px',
                  borderRadius: 6,
                }}
              >
                STATUS: READY
              </span>
            </div>
          </div>

          {/* Dynamic Workbench Content Per Step */}
          {activeStep === 0 && (
            <div className="workbench-content-grid">
              <div>
                <h4 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, margin: '0 0 8px 0' }}>
                  Biometric Facial Liveness & NADRA Verisys Extraction
                </h4>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: '#333333', margin: '0 0 20px 0' }}>
                  The applicant submits a front/back photographic capture of their National Identity Card alongside an active 3D face scan. Parakh executes local microprint analysis before querying the central identity gateway.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ background: '#ffffeb', border: '1.5px solid #1a1a1a', borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 11, color: '#8a8a80', fontWeight: 700, textTransform: 'uppercase' }}>OCR VERIFICATION</div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4, color: '#034f46' }}>✓ 13/13 Digits Matched</div>
                    <div style={{ fontSize: 12, color: '#666666', marginTop: 2 }}>Expiration: Valid through 2031</div>
                  </div>
                  <div style={{ background: '#ffffeb', border: '1.5px solid #1a1a1a', borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 11, color: '#8a8a80', fontWeight: 700, textTransform: 'uppercase' }}>LIVENESS THRESHOLD</div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4, color: '#034f46' }}>✓ 99.4% Vector Confidence</div>
                    <div style={{ fontSize: 12, color: '#666666', marginTop: 2 }}>Zero synthetic mask artifacts</div>
                  </div>
                </div>
              </div>

              {/* Payload Terminal Mock */}
              <div
                style={{
                  background: '#1a1a1a',
                  color: '#ffffeb',
                  borderRadius: 16,
                  padding: 20,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  border: '2px solid #1a1a1a',
                }}
              >
                <div style={{ color: '#8a8a80', marginBottom: 8 }}>// VERISYS GATEWAY RESPONSE</div>
                <div>{`{`}</div>
                <div style={{ paddingLeft: 16, color: '#f0d7ff' }}>{`"cnic": "42101-9876543-1",`}</div>
                <div style={{ paddingLeft: 16, color: '#ffffeb' }}>{`"status": "CITIZEN_ACTIVE",`}</div>
                <div style={{ paddingLeft: 16, color: '#ffa946' }}>{`"biometric_score": 0.994,`}</div>
                <div style={{ paddingLeft: 16, color: '#ffffeb' }}>{`"expiry_valid": true,`}</div>
                <div style={{ paddingLeft: 16, color: '#034f46' }}>{`"verdict": "PASSED_FAST_PATH"`}</div>
                <div>{`}`}</div>
              </div>
            </div>
          )}

          {activeStep === 1 && (
            <div className="workbench-content-grid">
              <div>
                <h4 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, margin: '0 0 8px 0' }}>
                  Heuristic Income-to-Volume Multiplier Evaluation
                </h4>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: '#333333', margin: '0 0 18px 0' }}>
                  Synthetic and mule account creators often declare modest salary income (PKR 30k–50k) while requesting large corporate-scale transaction limits (PKR 400k+). Parakh calculates the dynamic disparity multiplier instantly.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ background: '#ffffeb', borderLeft: '4px solid #034f46', borderRadius: 10, padding: '10px 14px', border: '1px solid #1a1a1a' }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>Ratio ≤ 2.5× : Natural Individual Tier (Low Risk)</span>
                  </div>
                  <div style={{ background: '#ffffeb', borderLeft: '4px solid #b06a0c', borderRadius: 10, padding: '10px 14px', border: '1px solid #1a1a1a' }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>Ratio 2.5× – 4.0× : Secondary Proof Needed (Medium Risk)</span>
                  </div>
                  <div style={{ background: '#ffffeb', borderLeft: '4px solid #a8322a', borderRadius: 10, padding: '10px 14px', border: '1px solid #1a1a1a' }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>Ratio &gt; 4.0× : Mandatory Senior Officer EDD Queue (High Risk)</span>
                  </div>
                </div>
              </div>

              <div style={{ background: '#ffffeb', border: '2px solid #1a1a1a', borderRadius: 16, padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8a8a80', marginBottom: 8 }}>
                  LIVE CALCULATION TRACE
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                  Declared: PKR 45,000 / mo
                  <br />
                  Requested: PKR 400,000 / mo
                </div>
                <div style={{ background: '#e4e4d0', borderRadius: 10, padding: '12px 14px', border: '1.5px solid #1a1a1a' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#a8322a' }}>TRIPPED MULTIPLIER: 8.9×</div>
                  <div style={{ fontSize: 11, color: '#444444', marginTop: 3 }}>Exceeds maximum allowable individual onboarding threshold.</div>
                </div>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="workbench-content-grid">
              <div>
                <h4 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, margin: '0 0 8px 0' }}>
                  Cross-Account Hardware & IP Graph Defense
                </h4>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: '#333333', margin: '0 0 18px 0' }}>
                  Syndicate operators cycle through multiple stolen or fabricated identity credentials on the same physical phone. Parakh extracts a cryptographic hardware hash and checks against a 72-hour sliding window.
                </p>

                <div style={{ background: '#ffffeb', border: '1.5px solid #1a1a1a', borderRadius: 14, padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8a8a80' }}>COLLISION DETECTION CRITERIA</div>
                  <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 13, lineHeight: 1.6 }}>
                    <li>Exact IMEI + Android ID cryptographic fingerprint match</li>
                    <li>Subnet velocity anomaly (&gt; 3 accounts per IP within 4 hours)</li>
                    <li>Geo-velocity impossibility check between consecutive applications</li>
                  </ul>
                </div>
              </div>

              <div style={{ background: '#ffa946', border: '2px solid #1a1a1a', borderRadius: 16, padding: 20, color: '#1a1a1a' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>ACTIVE CLUSTER LINKAGE DETECTED</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, margin: '8px 0 12px' }}>
                  NODE SHA-256: 8f3a9e...c91d44
                </div>
                <div style={{ background: '#ffffeb', borderRadius: 10, padding: 12, border: '1.5px solid #1a1a1a', fontSize: 12 }}>
                  <div>• Application 1: CNIC 42101-9876543-1 (10:14 AM)</div>
                  <div>• Application 2: CNIC 37405-1122334-9 (10:48 AM)</div>
                  <div>• Application 3: CNIC 61101-8899001-3 (11:22 AM)</div>
                  <div>• Application 4: CNIC 42201-5544332-7 (11:58 AM)</div>
                </div>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="workbench-content-grid">
              <div>
                <h4 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, margin: '0 0 8px 0' }}>
                  Immutable Senior Officer Decision Snapshots
                </h4>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: '#333333', margin: '0 0 18px 0' }}>
                  Parakh bans black-box scores. Every automated flag preserves the exact snapshot of rules, metrics, ratios, and officer justification notes for audit regulatory inspections by central banking authorities.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ background: '#ffffeb', border: '1.5px solid #1a1a1a', borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 11, color: '#8a8a80', fontWeight: 700 }}>ZERO SILENT SCORES</div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>Every signal carries mathematical proof</div>
                  </div>
                  <div style={{ background: '#ffffeb', border: '1.5px solid #1a1a1a', borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 11, color: '#8a8a80', fontWeight: 700 }}>AUDIT COMPLIANT</div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>Permanent ledger timestamping</div>
                  </div>
                </div>
              </div>

              <div style={{ background: '#ffffeb', border: '2px solid #1a1a1a', borderRadius: 16, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#8a8a80', textTransform: 'uppercase' }}>OFFICER AUDIT RECORD</span>
                  <span style={{ fontSize: 10, background: '#a8322a', color: '#ffffeb', padding: '2px 8px', borderRadius: 9999, fontWeight: 600 }}>REJECTED</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Senior Officer: Sana Rehman</div>
                <p style={{ fontSize: 12, color: '#444444', lineHeight: 1.5, margin: 0 }}>
                  "Applicant turnover claims incongruent with declared personal trade profile; multi-device syndicate pattern confirmed in RWP cluster. Escalation sustained."
                </p>
                <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#8a8a80', marginTop: 10, borderTop: '1px solid #e4e4d0', paddingTop: 8 }}>
                  SIGNED: SHA-256(AUDIT_TRAIL_PK88412)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
