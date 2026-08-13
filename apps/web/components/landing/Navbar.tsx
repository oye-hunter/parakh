'use client';

interface Props {
  onOpenDownload: () => void;
  onToggleConsole: () => void;
  isConsoleActive: boolean;
}

export default function Navbar({ onOpenDownload, onToggleConsole, isConsoleActive }: Props) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: '#ffffeb',
      borderBottom: '2px solid #1a1a1a',
      padding: '16px 24px',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontWeight: 600,
            fontSize: 24,
            letterSpacing: '-0.5px',
          }}>
            Parakh
          </span>
          <span style={{
            fontSize: 11,
            fontFamily: "'Archivo', sans-serif",
            fontWeight: 600,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            background: '#e4e4d0',
            border: '1px solid #1a1a1a',
            padding: '2px 8px',
            borderRadius: 9999,
          }}>
            پرکھ
          </span>
        </div>

        {/* Navigation items */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <a href="#simulator" style={{ color: '#1a1a1a', textDecoration: 'none', fontWeight: 500, fontSize: 15 }}>
            Risk Profiler
          </a>
          <a href="#features" style={{ color: '#1a1a1a', textDecoration: 'none', fontWeight: 500, fontSize: 15 }}>
            Features
          </a>
          <a href="#download" style={{ color: '#1a1a1a', textDecoration: 'none', fontWeight: 500, fontSize: 15 }}>
            Mobile App
          </a>
        </nav>

        {/* CTAs */}
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
            {isConsoleActive ? '← Back to Landing' : 'Officer Console →'}
          </button>
        </div>
      </div>
    </header>
  );
}
