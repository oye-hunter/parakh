'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { smoothScrollTo } from '@/lib/gsap';

interface Props {
  onOpenDownload: () => void;
  onToggleConsole?: () => void;
  isConsoleActive?: boolean;
}

export default function Navbar({ onOpenDownload, onToggleConsole, isConsoleActive }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Active section detection
      const sections = ['simulator', 'features', 'download'];
      const scrollPos = window.scrollY + 200;

      let current: string | null = null;
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            current = id;
            break;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    smoothScrollTo(targetId);
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
          gap: 14px;
        }
        .nav-link-pill {
          color: #1a1a1a;
          text-decoration: none;
          font-weight: 500;
          font-size: 14px;
          letter-spacing: 0.01em;
          padding: 6px 14px;
          border-radius: 9999px;
          border: 1.5px solid transparent;
          transition: all 0.2s ease;
        }
        .nav-link-pill:hover {
          background: #f2efdc;
          border-color: #1a1a1a;
        }
        .nav-link-pill.active {
          background: #ffffeb;
          border-color: #1a1a1a;
          font-weight: 700;
          box-shadow: 2px 2px 0 #1a1a1a;
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
            onClick={(e) => {
              e.preventDefault();
              smoothScrollTo(document.body, { offsetY: 0 });
            }}
            style={{
              textDecoration: 'none',
              color: '#1a1a1a',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
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

        {/* Desktop Navigation links with Active Pill State */}
        <nav className="desktop-nav-links">
          <a
            href="#simulator"
            onClick={(e) => handleNavClick(e, '#simulator')}
            className={`nav-link-pill ${activeSection === 'simulator' ? 'active' : ''}`}
          >
            Risk Profiler
          </a>
          <a
            href="#features"
            onClick={(e) => handleNavClick(e, '#features')}
            className={`nav-link-pill ${activeSection === 'features' ? 'active' : ''}`}
          >
            Compliance Engine
          </a>
          <a
            href="#download"
            onClick={(e) => handleNavClick(e, '#download')}
            className={`nav-link-pill ${activeSection === 'download' ? 'active' : ''}`}
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
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '2px 2px 0 #1a1a1a')}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
          >
            Download App
          </button>
          <Link
            href="/console"
            style={{
              background: '#ffffeb',
              color: '#1a1a1a',
              border: '2px solid #1a1a1a',
              borderRadius: 12,
              padding: '10px 18px',
              fontWeight: 600,
              textDecoration: 'none',
              cursor: 'pointer',
              fontSize: 14,
              display: 'inline-flex',
              alignItems: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '2px 2px 0 #1a1a1a')}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
          >
            Officer Console →
          </Link>
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
            onClick={(e) => handleNavClick(e, '#simulator')}
            style={{
              color: '#1a1a1a',
              textDecoration: 'none',
              fontWeight: activeSection === 'simulator' ? 700 : 600,
              fontSize: 16,
              padding: '12px 14px',
              borderRadius: 10,
              background: activeSection === 'simulator' ? '#ffffeb' : '#f2efdc',
              border: activeSection === 'simulator' ? '2px solid #1a1a1a' : '1.5px solid transparent',
              boxShadow: activeSection === 'simulator' ? '2px 2px 0 #1a1a1a' : 'none',
            }}
          >
            Risk Profiler ↓
          </a>
          <a
            href="#features"
            onClick={(e) => handleNavClick(e, '#features')}
            style={{
              color: '#1a1a1a',
              textDecoration: 'none',
              fontWeight: activeSection === 'features' ? 700 : 600,
              fontSize: 16,
              padding: '12px 14px',
              borderRadius: 10,
              background: activeSection === 'features' ? '#ffffeb' : '#f2efdc',
              border: activeSection === 'features' ? '2px solid #1a1a1a' : '1.5px solid transparent',
              boxShadow: activeSection === 'features' ? '2px 2px 0 #1a1a1a' : 'none',
            }}
          >
            Compliance Engine ↓
          </a>
          <a
            href="#download"
            onClick={(e) => handleNavClick(e, '#download')}
            style={{
              color: '#1a1a1a',
              textDecoration: 'none',
              fontWeight: activeSection === 'download' ? 700 : 600,
              fontSize: 16,
              padding: '12px 14px',
              borderRadius: 10,
              background: activeSection === 'download' ? '#ffffeb' : '#f2efdc',
              border: activeSection === 'download' ? '2px solid #1a1a1a' : '1.5px solid transparent',
              boxShadow: activeSection === 'download' ? '2px 2px 0 #1a1a1a' : 'none',
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
            <Link
              href="/console"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                width: '100%',
                background: '#ffffeb',
                color: '#1a1a1a',
                border: '2px solid #1a1a1a',
                borderRadius: 12,
                padding: '12px',
                fontWeight: 600,
                fontSize: 15,
                textAlign: 'center',
                textDecoration: 'none',
                display: 'block',
                boxSizing: 'border-box',
                cursor: 'pointer',
              }}
            >
              Senior Officer Console →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
