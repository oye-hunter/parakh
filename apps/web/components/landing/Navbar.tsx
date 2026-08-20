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

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: scrolled ? 'rgba(255, 255, 235, 0.94)' : '#ffffeb',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: '2px solid #1a1a1a',
        padding: scrolled ? '10px 16px' : '14px 20px',
        transition: 'padding 0.25s ease, background-color 0.25s ease, box-shadow 0.25s ease',
        boxShadow: scrolled ? '0 4px 20px rgba(26, 26, 26, 0.06)' : 'none',
      }}
    >
      <style>{`
        .desktop-nav-links {
          display: flex;
          align-items: center;
          gap: 28px;
        }
        .desktop-nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .mobile-menu-btn {
          display: none;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: #e4e4d0;
          border: 1.5px solid #1a1a1a;
          border-radius: 10px;
          cursor: pointer;
          font-size: 20px;
        }
        @media (max-width: 820px) {
          .desktop-nav-links {
            display: none;
          }
          .desktop-nav-actions {
            display: none;
          }
          .mobile-menu-btn {
            display: flex;
          }
        }
      `}</style>

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                fontSize: 24,
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
        <nav className="desktop-nav-links">
          <a
            href="#simulator"
            style={{
              color: '#1a1a1a',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: 14,
              letterSpacing: '0.01em',
            }}
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
            }}
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
            }}
          >
            Mobile APK
          </a>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="desktop-nav-actions">
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
            }}
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
            }}
          >
            {isConsoleActive ? '← Landing' : 'Officer Console →'}
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            background: '#ffffeb',
            borderTop: '1.5px solid #1a1a1a',
            marginTop: 10,
            padding: '20px 8px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <a
            href="#simulator"
            onClick={handleLinkClick}
            style={{
              color: '#1a1a1a',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 16,
              padding: '10px 14px',
              borderRadius: 8,
              background: '#f2efdc',
            }}
          >
            Risk Profiler ↓
          </a>
          <a
            href="#features"
            onClick={handleLinkClick}
            style={{
              color: '#1a1a1a',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 16,
              padding: '10px 14px',
              borderRadius: 8,
              background: '#f2efdc',
            }}
          >
            Compliance Engine ↓
          </a>
          <a
            href="#download"
            onClick={handleLinkClick}
            style={{
              color: '#1a1a1a',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 16,
              padding: '10px 14px',
              borderRadius: 8,
              background: '#f2efdc',
            }}
          >
            Mobile APK Portal ↓
          </a>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDownload();
              }}
              style={{
                width: '100%',
                background: '#f0d7ff',
                color: '#1a1a1a',
                border: '2px solid #1a1a1a',
                borderRadius: 12,
                padding: '12px',
                fontWeight: 600,
                fontSize: 15,
                cursor: 'pointer',
              }}
            >
              Download Mobile App (APK)
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onToggleConsole();
              }}
              style={{
                width: '100%',
                background: isConsoleActive ? '#034f46' : '#ffffeb',
                color: isConsoleActive ? '#ffffeb' : '#1a1a1a',
                border: '2px solid #1a1a1a',
                borderRadius: 12,
                padding: '12px',
                fontWeight: 600,
                fontSize: 15,
                cursor: 'pointer',
              }}
            >
              {isConsoleActive ? '← Back to Landing' : 'Senior Officer Console →'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
