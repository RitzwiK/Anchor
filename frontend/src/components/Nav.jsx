import React from 'react';

export default function Nav({ onLaunch, onTheory }) {
  return (
    <nav style={wrap}>
      <div className="liquid-nav" style={pill}>
        <div style={brand}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="url(#g1)" strokeWidth="1.5" fill="none"/>
            <circle cx="12" cy="12" r="3" fill="var(--accent)"/>
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="24" y2="24">
                <stop offset="0%" stopColor="var(--accent)"/>
                <stop offset="100%" stopColor="#3B82F6"/>
              </linearGradient>
            </defs>
          </svg>
          <span style={brandTxt}>Anchor</span>
        </div>
        <div style={links}>
          <a href="#how" style={link}>How it works</a>
          <button onClick={onTheory} style={{ ...link, background: 'none' }}>Theory</button>
          <a href="#trust" style={link}>Why trust it</a>
        </div>
        <button onClick={onLaunch} style={cta}>
          Launch app
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </nav>
  );
}

const wrap = {
  position: 'fixed',
  top: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 100,
  padding: '0 20px',
  width: 'calc(100% - 40px)',
  maxWidth: '1080px',
};
const pill = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 10px 10px 22px',
  borderRadius: '999px',
};
const brand = { display: 'flex', alignItems: 'center', gap: '10px' };
const brandTxt = {
  fontFamily: 'var(--serif)',
  fontSize: '18px',
  fontWeight: 500,
  letterSpacing: '-0.02em',
};
const links = { display: 'flex', gap: '28px', alignItems: 'center' };
const link = {
  color: 'var(--ink-dim)',
  fontSize: '13px',
  fontWeight: 450,
  transition: 'color 0.2s',
};
const cta = {
  background: 'var(--ink)',
  color: 'var(--bg)',
  fontSize: '13px',
  fontWeight: 500,
  padding: '10px 18px',
  borderRadius: '999px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  transition: 'all 0.2s',
};
