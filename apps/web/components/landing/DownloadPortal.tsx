'use client';

import { useState, useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

interface Props {
  onOpenDownload: () => void;
}

export default function DownloadPortal({ onOpenDownload }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const phoneMockupRef = useRef<HTMLDivElement>(null);

  const [activeScreen, setActiveScreen] = useState<number>(0);

  const screens = [
    {
      step: 'STEP 1 · CNIC',
      title: 'Identity Verification',
      badge: 'NADRA VERISYS',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ background: '#e4e4d0', padding: '10px 12px', borderRadius: 8, border: '1px solid #1a1a1a' }}>
            <div style={{ fontSize: 10, color: '#8a8a80', textTransform: 'uppercase', fontWeight: 700 }}>CNIC NUMBER</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600 }}>42101-9876543-1</div>
          </div>
          <div style={{ background: '#e4e4d0', padding: '10px 12px', borderRadius: 8, border: '1px solid #1a1a1a' }}>
            <div style={{ fontSize: 10, color: '#8a8a80', textTransform: 'uppercase', fontWeight: 700 }}>OCR MATCH</div>
            <div style={{ fontSize: 12, color: '#034f46', fontWeight: 600 }}>✓ Watermark & Microprint Intact</div>
          </div>
        </div>
      ),
    },
    {
      step: 'STEP 2 · INCOME',
      title: 'Financial Declarations',
      badge: 'HEURISTIC RATIO',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ background: '#e4e4d0', padding: '10px 12px', borderRadius: 8, border: '1px solid #1a1a1a' }}>
            <div style={{ fontSize: 10, color: '#8a8a80', textTransform: 'uppercase', fontWeight: 700 }}>DECLARED INCOME</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600 }}>PKR 120,000 / mo</div>
          </div>
          <div style={{ background: '#e4e4d0', padding: '10px 12px', borderRadius: 8, border: '1px solid #1a1a1a' }}>
            <div style={{ fontSize: 10, color: '#8a8a80', textTransform: 'uppercase', fontWeight: 700 }}>EXPECTED TURNOVER</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600 }}>PKR 180,000 / mo (1.5×)</div>
          </div>
        </div>
      ),
    },
    {
      step: 'STEP 3 · BIOMETRIC',
      title: 'Active Liveness Check',
      badge: 'PASS 99.4%',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ background: '#ffffeb', border: '1.5px dashed #1a1a1a', padding: 14, borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 24 }}>👤</div>
            <div style={{ fontSize: 11, fontWeight: 600, marginTop: 4 }}>Live Face Vector Extracted</div>
            <div style={{ fontSize: 10, color: '#8a8a80', fontFamily: "'JetBrains Mono', monospace" }}>NADRA BIOMETRIC VERIFIED</div>
          </div>
        </div>
      ),
    },
    {
      step: 'STEP 4 · RESULT',
      title: 'Instant Clear Verdict',
      badge: 'LOW RISK 0.12',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ background: '#034f46', color: '#ffffeb', padding: 12, borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.08em', fontWeight: 700 }}>AUTO-APPROVED</div>
            <div style={{ fontSize: 12, marginTop: 2, opacity: 0.9 }}>Digital Account Provisioned</div>
          </div>
          <div style={{ fontSize: 10, color: '#8a8a80', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace" }}>
            DECISION REF #TX-90412
          </div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!sectionRef.current) return;

      gsap.from(leftColRef.current, {
        opacity: 0,
        x: -40,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      });

      gsap.from(phoneMockupRef.current, {
        opacity: 0,
        x: 40,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="download"
      ref={sectionRef}
      style={{
        background: '#f2efdc',
        borderBottom: '2px solid #1a1a1a',
        padding: '88px 24px',
        position: 'relative',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: 56,
          alignItems: 'center',
        }}
      >
        {/* Left Column Copy & QR code download */}
        <div ref={leftColRef}>
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
              marginBottom: 16,
            }}
          >
            NATIVE ANDROID EXPERIENCE
          </div>

          <h2
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 42,
              fontWeight: 600,
              color: '#1a1a1a',
              margin: '0 0 16px 0',
              lineHeight: 1.1,
              letterSpacing: '-0.8px',
            }}
          >
            Digital Onboarding in the Palm of Your Hand
          </h2>

          <p style={{ fontSize: 16, lineHeight: 1.5, color: '#333333', margin: '0 0 32px 0', maxWidth: 500 }}>
            The Parakh Mobile APK delivers a frictionless 5-step applicant onboarding experience with offline draft recovery, native camera document scanning, and light-only ledger aesthetics.
          </p>

          {/* Download Action Box with QR code */}
          <div
            style={{
              background: '#ffffeb',
              border: '2px solid #1a1a1a',
              borderRadius: 20,
              padding: 24,
              boxShadow: '4px 4px 0 #1a1a1a',
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              marginBottom: 32,
              flexWrap: 'wrap',
            }}
          >
            {/* Vector QR Box */}
            <div
              style={{
                width: 100,
                height: 100,
                background: '#ffffff',
                border: '2px solid #1a1a1a',
                borderRadius: 12,
                padding: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg viewBox="0 0 100 100" width="100%" height="100%">
                {/* QR Pattern Representation */}
                <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
                {/* Corner Top-Left */}
                <rect x="6" y="6" width="28" height="28" fill="#1a1a1a" rx="4" />
                <rect x="12" y="12" width="16" height="16" fill="#ffffff" rx="2" />
                <rect x="16" y="16" width="8" height="8" fill="#1a1a1a" />
                {/* Corner Top-Right */}
                <rect x="66" y="6" width="28" height="28" fill="#1a1a1a" rx="4" />
                <rect x="72" y="12" width="16" height="16" fill="#ffffff" rx="2" />
                <rect x="76" y="16" width="8" height="8" fill="#1a1a1a" />
                {/* Corner Bottom-Left */}
                <rect x="6" y="66" width="28" height="28" fill="#1a1a1a" rx="4" />
                <rect x="12" y="72" width="16" height="16" fill="#ffffff" rx="2" />
                <rect x="16" y="76" width="8" height="8" fill="#1a1a1a" />
                {/* Data Grid Dots */}
                <rect x="42" y="8" width="6" height="6" fill="#1a1a1a" />
                <rect x="52" y="16" width="6" height="6" fill="#1a1a1a" />
                <rect x="42" y="24" width="6" height="6" fill="#1a1a1a" />
                <rect x="42" y="42" width="16" height="16" fill="#1a1a1a" rx="2" />
                <rect x="8" y="42" width="6" height="6" fill="#1a1a1a" />
                <rect x="24" y="48" width="6" height="6" fill="#1a1a1a" />
                <rect x="68" y="42" width="6" height="6" fill="#1a1a1a" />
                <rect x="80" y="52" width="6" height="6" fill="#1a1a1a" />
                <rect x="44" y="68" width="6" height="6" fill="#1a1a1a" />
                <rect x="56" y="78" width="6" height="6" fill="#1a1a1a" />
                <rect x="76" y="72" width="12" height="12" fill="#1a1a1a" rx="2" />
              </svg>
            </div>

            {/* Download Button & Meta */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#8a8a80', textTransform: 'uppercase' }}>
                DIRECT INSTALL FILE
              </div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, margin: '2px 0 10px' }}>
                Parakh Android APK v1.0.0
              </div>
              <button
                onClick={onOpenDownload}
                style={{
                  background: '#f0d7ff',
                  color: '#1a1a1a',
                  border: '2px solid #1a1a1a',
                  borderRadius: 10,
                  padding: '10px 18px',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <span>Download APK (24 MB)</span>
                <span>↓</span>
              </button>
            </div>
          </div>

          {/* Spec Badges Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: '#ffffeb', border: '1.5px solid #1a1a1a', borderRadius: 12, padding: '10px 14px' }}>
              <div style={{ fontSize: 11, color: '#8a8a80', fontWeight: 600 }}>PLATFORM TARGET</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>Android 8.0+ (API 26)</div>
            </div>
            <div style={{ background: '#ffffeb', border: '1.5px solid #1a1a1a', borderRadius: 12, padding: '10px 14px' }}>
              <div style={{ fontSize: 11, color: '#8a8a80', fontWeight: 600 }}>OFFLINE BUFFER</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>Secure Store Draft Cache</div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Phone Mockup */}
        <div ref={phoneMockupRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Screen Tab Selectors */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            {screens.map((sc, i) => (
              <button
                key={sc.step}
                onClick={() => setActiveScreen(i)}
                style={{
                  background: activeScreen === i ? '#1a1a1a' : '#ffffeb',
                  color: activeScreen === i ? '#ffffeb' : '#1a1a1a',
                  border: '1.5px solid #1a1a1a',
                  borderRadius: 9999,
                  padding: '4px 12px',
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {sc.step.split(' · ')[1]}
              </button>
            ))}
          </div>

          {/* Phone Frame */}
          <div
            style={{
              width: 320,
              background: '#1a1a1a',
              borderRadius: 36,
              padding: '12px 10px',
              boxShadow: '8px 8px 0px rgba(26, 26, 26, 0.4)',
              border: '2px solid #1a1a1a',
            }}
          >
            {/* Phone Screen Glass */}
            <div
              style={{
                background: '#ffffeb',
                borderRadius: 26,
                padding: '20px 16px',
                minHeight: 400,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid #e4e4d0',
                position: 'relative',
              }}
            >
              {/* Speaker Notch */}
              <div
                style={{
                  width: 60,
                  height: 4,
                  background: '#1a1a1a',
                  borderRadius: 9999,
                  margin: '0 auto 16px',
                }}
              />

              {/* In-App Screen Header */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#8a8a80' }}>
                    {screens[activeScreen]?.step}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 6px',
                      background: '#e4e4d0',
                      borderRadius: 4,
                    }}
                  >
                    {screens[activeScreen]?.badge}
                  </span>
                </div>

                <h4 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, margin: '0 0 14px 0', fontWeight: 600 }}>
                  {screens[activeScreen]?.title}
                </h4>

                {screens[activeScreen]?.content}
              </div>

              {/* In-App Action Button Footer */}
              <div style={{ marginTop: 24, paddingTop: 12, borderTop: '1px solid #e4e4d0' }}>
                <button
                  style={{
                    width: '100%',
                    background: '#f0d7ff',
                    border: '1.5px solid #1a1a1a',
                    borderRadius: 10,
                    padding: '10px',
                    fontWeight: 600,
                    fontSize: 13,
                    color: '#1a1a1a',
                  }}
                >
                  Continue Next Step →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
