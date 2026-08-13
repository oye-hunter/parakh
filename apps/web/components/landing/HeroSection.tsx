'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

interface Props {
  onOpenDownload: () => void;
}

export default function HeroSection({ onOpenDownload }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const squiggleRef = useRef<SVGPathElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate headline entrance
      gsap.from(headlineRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });

      // Animate hand-drawn squiggle path drawing
      if (squiggleRef.current) {
        const length = squiggleRef.current.getTotalLength();
        gsap.set(squiggleRef.current, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(squiggleRef.current, {
          strokeDashoffset: 0,
          duration: 1.2,
          delay: 0.5,
          ease: 'power2.inOut',
        });
      }

      // Animate hero floating case card
      gsap.from(cardRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 0.4,
        ease: 'power2.out',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      style={{
        background: '#ffffeb',
        borderBottom: '2px solid #1a1a1a',
        padding: '80px 24px',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
        {/* Left Editorial Copy */}
        <div>
          <div style={{
            fontSize: 12,
            fontFamily: "'Archivo', sans-serif",
            fontWeight: 600,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: '#8a8a80',
            marginBottom: 16,
          }}>
            PARAKH · DIGITAL ONBOARDING RISK ENGINE
          </div>

          <h1
            ref={headlineRef}
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 52,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: '-1px',
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
                  bottom: -10,
                  left: 0,
                  width: '100%',
                  height: 16,
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

          <p style={{ fontSize: 18, lineHeight: 1.5, color: '#222222', margin: '0 0 32px 0', maxWidth: 500 }}>
            AI-driven customer risk profiling for financial onboarding. Pure transparency on warm paper — zero silent scores, zero black boxes.
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
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
              Download Mobile App (APK)
            </button>
            <a
              href="#simulator"
              style={{
                background: '#ffffeb',
                color: '#1a1a1a',
                border: '2px solid #1a1a1a',
                borderRadius: 12,
                padding: '16px 28px',
                fontSize: 16,
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Try Risk Simulator ↓
            </a>
          </div>
        </div>

        {/* Right Hero Case Card Showcase */}
        <div ref={cardRef} style={{ background: '#f2efdc', border: '2px solid #1a1a1a', borderRadius: 24, padding: 24 }}>
          {/* Card Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h4 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Tariq H. Al-Mansoor</h4>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#8a8a80' }}>
                CNIC: 42101-9876543-1
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                background: '#a8322a',
                color: '#ffffeb',
                padding: '6px 14px',
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>
                HIGH
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#8a8a80' }}>
                0.87
              </span>
            </div>
          </div>

          {/* Evidence Row Sample */}
          <div style={{ background: '#e4e4d0', borderLeft: '3px solid #a8322a', borderRadius: 12, padding: '12px 16px', marginBottom: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Income–volume mismatch</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#222222', marginTop: 4 }}>
              declared 45,000/mo · expects 400,000/mo · 8.9×
            </div>
          </div>

          {/* AI Reasoning Sample */}
          <div style={{ background: '#ffffeb', border: '1.5px solid #1a1a1a', borderRadius: 16, padding: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.10em', color: '#8a8a80', textTransform: 'uppercase' }}>
              AI REASONING
            </span>
            <p style={{ fontSize: 15, lineHeight: 1.6, margin: '8px 0 0 0' }}>
              Applicant declared modest personal income, yet specified transaction volume characteristic of commercial trade. Device fingerprint matches 3 recent flagged accounts.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
