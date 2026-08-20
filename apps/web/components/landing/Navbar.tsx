'use client';

import { useState, useEffect } from 'react';

interface Props {
  onOpenDownload: () => void;
  onToggleConsole: () => void;
  isConsoleActive: boolean;
}

export default function Navbar({ onOpenDownload, onToggleConsole, isConsoleActive }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: scrolled ? 'rgba(255, 255, 235, 0.92)' : '#ffffeb',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: '2px solid #1a1a1a',
        padding: scrolled ? '12px 24px' : '16px 24px',
        transition: 'padding 0.25s ease, background-color 0.25s ease, box-shadow 0.25s ease',
        boxShadow: scrolled ? '0 4px 20px rgba(26, 26, 26, 0.06)' : 'none',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a
            href="#"
            style={{
              textDecoration: 'none',
              color: '#1a1a1a',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontWeight: 600,
                fontSize: 26,
                letterSpacing: '-0.5px',
                lineHeight: 1,
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
                border: '1.5px solid #1a1a1a',
                padding: '2px 8px',
                borderRadius: 9999,
                color: '#1a1a1a',
              }}
            >
              پرکھ
            </span>
          </a>
        </div>

        {/* Desktop Navigation links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 28,
          }}
          className="desktop-nav"
        >
          <a
            href="#simulator"
            style={{
              color: '#1a1a1a',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: 14,
              letterSpacing: '0.01em',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Risk Profiler
          </a>
          <a
            href="#features"
            style={{
              color: '#1a1a1a',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: 14,
              letterSpacing: '0.01em',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Compliance Engine
          </a>
          <a
            href="#download"
            style={{
              color: '#1a1a1a',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: 14,
              letterSpacing: '0.01em',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Mobile APK
          </a>
        </nav>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onOpenDownload}
            style={{
              background: '#f0d7ff',
              color: '#1a1a1a',
              border: '2px solid #1a1a1a',
              borderRadius: 12,
              padding: '10px 18px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 14,
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(1px)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            Download App
          </button>
          <button
            onClick={onToggleConsole}
            style={{
              background: isConsoleActive ? '#034f46' : '#ffffeb',
              color: isConsoleActive ? '#ffffeb' : '#1a1a1a',
              border: '2px solid #1a1a1a',
              borderRadius: 12,
              padding: '10px 18px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 14,
              transition: 'all 0.15s ease',
            }}
          >
            {isConsoleActive ? '← Landing' : 'Officer Console →'}
          </button>
        </div>
      </div>
    </header>
  );
}
