'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

interface Props {
  onOpenDownload: () => void;
}

export default function HeroSection({ onOpenDownload }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const ctaGroupRef = useRef<HTMLDivElement>(null);
  const squiggleRef = useRef<SVGPathElement>(null);
  const cardWrapperRef = useRef<HTMLDivElement>(null);
  const badgePillRef = useRef<HTMLDivElement>(null);

  const [activeSignal, setActiveSignal] = useState<number>(0);

  const signals = [
    {
      title: 'Income–volume mismatch',
      evidence: 'declared 45,000/mo · expects 400,000/mo · 8.9×',
      severity: 'high',
      weight: 'contributed 48%',
    },
    {
      title: 'Device cluster hash collision',
      evidence: 'SHA-256(IMEI+MAC) matches 3 flagged RWP apps',
      severity: 'high',
      weight: 'contributed 32%',
    },
    {
      title: 'CNIC biometric liveness check',
      evidence: 'Verisys NADRA match confirmed · 99.4% confidence',
      severity: 'low',
      weight: 'contributed 20%',
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Main entrance timeline
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          gsap.set(
            [
              eyebrowRef.current,
              headlineRef.current,
              subtextRef.current,
              ctaGroupRef.current,
              cardWrapperRef.current,
              badgePillRef.current,
            ].filter(Boolean),
            { clearProps: 'opacity,transform' }
          );
        },
      });

      tl.from(eyebrowRef.current, {
        opacity: 0.2,
        y: 20,
        duration: 0.5,
      })
        .from(
          headlineRef.current,
          {
            opacity: 0.2,
            y: 30,
            duration: 0.7,
          },
          '-=0.3'
        )
        .from(
          subtextRef.current,
          {
            opacity: 0.2,
            y: 20,
            duration: 0.6,
          },
          '-=0.4'
        )
        .from(
          ctaGroupRef.current,
          {
            opacity: 0.2,
            y: 15,
            duration: 0.5,
          },
          '-=0.3'
        )
        .from(
          cardWrapperRef.current,
          {
            opacity: 0.2,
            y: 40,
            duration: 0.8,
          },
          '-=0.5'
        )
        .from(
          badgePillRef.current,
          {
            scale: 0.5,
            opacity: 0.2,
            duration: 0.4,
            ease: 'back.out(1.7)',
          },
          '-=0.3'
        );

      // Squiggle draw
      if (squiggleRef.current) {
        const length = squiggleRef.current.getTotalLength();
        gsap.set(squiggleRef.current, { strokeDasharray: length, strokeDashoffset: length });
        tl.to(
          squiggleRef.current,
          {
            strokeDashoffset: 0,
            duration: 1.2,
            ease: 'power2.inOut',
          },
          '-=0.8'
        );
      }

      // Parallax scroll effect on hero card
      if (cardWrapperRef.current && containerRef.current) {
        gsap.to(cardWrapperRef.current, {
          y: 40,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
          },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      style={{
        background: '#ffffeb',
        borderBottom: '2px solid #1a1a1a',
        padding: '72px 24px 88px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Background ledger grid lines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(#e4e4d0 1px, transparent 1px), radial-gradient(#e4e4d0 1px, #ffffeb 1px)',
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px',
          opacity: 0.45,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: 56,
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Left Editorial Copy */}
        <div>
          {/* Eyebrow badge */}
          <div
            ref={eyebrowRef}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#e4e4d0',
              border: '1.5px solid #1a1a1a',
              borderRadius: 9999,
              padding: '4px 12px',
              marginBottom: 20,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#034f46',
                display: 'inline-block',
                boxShadow: '0 0 0 2px rgba(3, 79, 70, 0.2)',
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontFamily: "'Archivo', sans-serif",
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#1a1a1a',
              }}
            >
              PARAKH · DIGITAL ONBOARDING RISK ENGINE
            </span>
          </div>

          {/* Headline */}
          <h1
            ref={headlineRef}
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 56,
              fontWeight: 600,
              lineHeight: 1.04,
              letterSpacing: '-1.2px',
              color: '#1a1a1a',
              margin: '0 0 24px 0',
              position: 'relative',
            }}
          >
            Every judgment,{' '}
            <span style={{ position: 'relative', display: 'inline-block' }}>
              explained.
              <svg
                viewBox="0 0 160 16"
                fill="none"
                style={{
                  position: 'absolute',
                  bottom: -8,
                  left: 0,
                  width: '100%',
                  height: 14,
                  overflow: 'visible',
                }}
              >
                <path
                  ref={squiggleRef}
                  d="M 5 8 Q 40 2, 80 8 T 155 8"
                  stroke="#f0d7ff"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </span>
          </h1>

          {/* Subtext */}
          <p
            ref={subtextRef}
            style={{
              fontSize: 18,
              lineHeight: 1.5,
              color: '#222222',
              margin: '0 0 32px 0',
              maxWidth: 520,
            }}
          >
            Transparent customer risk profiling for digital financial onboarding. Pure clarity on
            warm paper — zero silent scores, zero black boxes, instant explainability.
          </p>

          {/* CTAs */}
          <div
            ref={ctaGroupRef}
            style={{
              display: 'flex',
              gap: 14,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <button
              onClick={onOpenDownload}
              style={{
                background: '#f0d7ff',
                color: '#1a1a1a',
                border: '2px solid #1a1a1a',
                borderRadius: 12,
                padding: '14px 26px',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '3px 3px 0 #1a1a1a')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
            >
              Download Mobile App (APK)
            </button>
            <a
              href="#simulator"
              style={{
                background: '#ffffeb',
                color: '#1a1a1a',
                border: '2px solid #1a1a1a',
                borderRadius: 12,
                padding: '14px 24px',
                fontSize: 15,
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '3px 3px 0 #1a1a1a')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
            >
              <span>Simulate Risk Engine</span>
              <span>↓</span>
            </a>
          </div>

          {/* Telemetry Micro-Pills */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginTop: 36,
              paddingTop: 24,
              borderTop: '1px solid #e4e4d0',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#8a8a80' }}>
              <span style={{ color: '#034f46', fontWeight: 700 }}>✓</span>
              <span>Verisys 99.4% precision</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#8a8a80' }}>
              <span style={{ color: '#034f46', fontWeight: 700 }}>✓</span>
              <span>32ms median appraisal</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#8a8a80' }}>
              <span style={{ color: '#034f46', fontWeight: 700 }}>✓</span>
              <span>Immutable audit log</span>
            </div>
          </div>
        </div>

        {/* Right Hero Live Appraisal Card Showcase */}
        <div
          ref={cardWrapperRef}
          style={{
            background: '#f2efdc',
            border: '2px solid #1a1a1a',
            borderRadius: 24,
            padding: 24,
            boxShadow: '8px 8px 0px #1a1a1a',
            position: 'relative',
          }}
        >
          {/* Card Top Telemetry Ribbon */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: 14,
              borderBottom: '1px solid #e4e4d0',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#a8322a',
                  display: 'inline-block',
                }}
              />
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#1a1a1a',
                }}
              >
                LIVE CASE APPRAISAL #PK-88412
              </span>
            </div>
            <span
              style={{
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                color: '#8a8a80',
              }}
            >
              EVAL: 28ms
            </span>
          </div>

          {/* Applicant Info Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 18,
            }}
          >
            <div>
              <h3
                style={{
                  margin: '0 0 4px 0',
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: 22,
                  fontWeight: 600,
                  color: '#1a1a1a',
                }}
              >
                Tariq H. Al-Mansoor
              </h3>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  color: '#8a8a80',
                }}
              >
                CNIC: 42101-9876543-1 · RWP Branch
              </div>
            </div>

            <div
              ref={badgePillRef}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span
                style={{
                  background: '#a8322a',
                  color: '#ffffeb',
                  padding: '6px 14px',
                  borderRadius: 9999,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                HIGH
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#8a8a80',
                }}
              >
                0.87
              </span>
            </div>
          </div>

          {/* Interactive Evidence Signal Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            <div
              style={{
                fontSize: 11,
                fontFamily: "'Archivo', sans-serif",
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#8a8a80',
              }}
            >
              TRIPPED SIGNAL EVIDENCE ({signals.length})
            </div>

            {signals.map((sig, idx) => (
              <div
                key={sig.title}
                onClick={() => setActiveSignal(idx)}
                style={{
                  background: activeSignal === idx ? '#ffffeb' : '#e4e4d0',
                  border: `1.5px solid ${activeSignal === idx ? '#1a1a1a' : 'transparent'}`,
                  borderLeft: `4px solid ${sig.severity === 'high' ? '#a8322a' : '#034f46'}`,
                  borderRadius: 12,
                  padding: '10px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: '#1a1a1a' }}>
                    {sig.title}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: '#8a8a80',
                    }}
                  >
                    {sig.weight}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    color: '#444444',
                    marginTop: 3,
                  }}
                >
                  {sig.evidence}
                </div>
              </div>
            ))}
          </div>

          {/* AI Explainability Reasoning Box */}
          <div
            style={{
              background: '#ffffeb',
              border: '1.5px solid #1a1a1a',
              borderRadius: 16,
              padding: 16,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: '#8a8a80',
                  textTransform: 'uppercase',
                }}
              >
                AI EXPLAINABILITY JUSTIFICATION
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  background: '#e4e4d0',
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontWeight: 600,
                }}
              >
                RULE-ID: EDD-402
              </span>
            </div>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.55,
                margin: 0,
                color: '#1a1a1a',
              }}
            >
              Applicant declared personal earnings of 45k PKR but requested merchant-tier volume (400k PKR). Coupled with an identical device signature shared by 3 recently escalated accounts, automated triage routed this case directly to the Senior Officer EDD queue.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
