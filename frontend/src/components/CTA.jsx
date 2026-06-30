import React from 'react';

export default function CTA({ onLaunch }) {
  return (
    <section style={sec}>
      <div style={wrap}>
        <div className="glass-hi" style={box}>
          <div style={glow}/>
          <div style={content}>
            <div style={label}>Ready when you are</div>
            <h2 style={title}>
              Stop guessing. Start <em style={em}>anchoring</em>.
            </h2>
            <p style={text}>
              Upload a CSV or Excel file. Get causally-grounded explanations in under a minute.
              No integration, no signup, no credit card.
            </p>
            <div style={btnRow}>
              <button onClick={onLaunch} style={ctaBtn}>
                Launch Anchor
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <a href="#how" style={secBtn}>Revisit the method</a>
            </div>
          </div>
        </div>
      </div>

      <footer style={footer}>
        <div style={footInner}>
          <div style={footLeft}>
            <div style={footBrand}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="var(--accent)" strokeWidth="1.5" fill="none"/>
                <circle cx="12" cy="12" r="3" fill="var(--accent)"/>
              </svg>
              <span className="serif" style={{fontSize:'16px', fontWeight:500}}>Anchor</span>
            </div>
            <span style={footDim}>Causal Prompt Anchoring for business anomaly attribution</span>
          </div>
          <div style={footRight}>
            <span style={footName}>Ritwik</span>
            <a href="https://github.com/RitzwiK" target="_blank" rel="noopener noreferrer" style={footLink} aria-label="GitHub">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.36 9.36 0 0112 6.84c.85 0 1.71.12 2.51.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.02 10.02 0 0022 12.25C22 6.58 17.52 2 12 2z"/>
              </svg>
            </a>
            <a href="https://linkedin.com/in/ritwikk03" target="_blank" rel="noopener noreferrer" style={footLink} aria-label="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14zM8.34 18.34V9.99H5.67v8.35h2.67zM7 8.81a1.55 1.55 0 100-3.09 1.55 1.55 0 000 3.09zM18.34 18.34v-4.58c0-2.45-1.31-3.59-3.06-3.59-1.41 0-2.04.78-2.39 1.32v-1.13h-2.67c.04.75 0 8.35 0 8.35h2.67v-4.66c0-.24.02-.48.09-.65.19-.48.63-.98 1.37-.98.97 0 1.35.74 1.35 1.81v4.48h2.64z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </section>
  );
}

const sec = { position: 'relative', padding: '80px 24px 0', zIndex: 2 };
const wrap = { maxWidth: '1080px', margin: '0 auto' };
const box = {
  position: 'relative',
  padding: '72px 48px',
  borderRadius: 'var(--radius-lg)',
  textAlign: 'center',
  overflow: 'hidden',
};
const glow = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '600px',
  height: '600px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(97,218,251,0.15), transparent 60%)',
  filter: 'blur(50px)',
  pointerEvents: 'none',
};
const content = { position: 'relative', zIndex: 2 };
const label = {
  fontSize: '12px', color: 'var(--accent)', fontWeight: 500,
  textTransform: 'uppercase', letterSpacing: '0.12em',
  marginBottom: '20px',
};
const title = {
  fontFamily: 'var(--serif)',
  fontSize: 'clamp(36px, 6vw, 64px)',
  fontWeight: 400, lineHeight: 1.05,
  letterSpacing: '-0.03em',
  marginBottom: '16px',
};
const em = { fontStyle: 'italic', color: 'var(--ink-dim)' };
const text = {
  fontSize: '16px', color: 'var(--ink-dim)',
  maxWidth: '520px', margin: '0 auto 32px',
  lineHeight: 1.65,
};
const btnRow = {
  display: 'flex', gap: '12px', justifyContent: 'center',
  alignItems: 'center', flexWrap: 'wrap',
};
const ctaBtn = {
  background: 'var(--accent)', color: 'var(--bg)',
  fontSize: '15px', fontWeight: 600,
  padding: '14px 28px', borderRadius: '999px',
  display: 'inline-flex', alignItems: 'center', gap: '8px',
  transition: 'all 0.25s',
  boxShadow: '0 10px 40px -10px rgba(97,218,251,0.5)',
};
const secBtn = {
  fontSize: '14px', fontWeight: 450,
  padding: '14px 20px', color: 'var(--ink-dim)',
};
const footer = {
  marginTop: '80px',
  padding: '32px 0 40px',
  borderTop: '1px solid var(--line)',
};
const footInner = {
  maxWidth: '1080px', margin: '0 auto',
  display: 'flex', justifyContent: 'space-between',
  alignItems: 'center', gap: '20px', flexWrap: 'wrap',
};
const footLeft = { display: 'flex', flexDirection: 'column', gap: '6px' };
const footBrand = { display: 'flex', alignItems: 'center', gap: '8px' };
const footDim = { fontSize: '12px', color: 'var(--ink-faint)' };
const footRight = { display: 'flex', alignItems: 'center', gap: '14px' };
const footName = { fontSize: '13px', color: 'var(--ink-dim)', fontWeight: 500, letterSpacing: '0.01em' };
const footLink = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '34px',
  height: '34px',
  borderRadius: '999px',
  color: 'var(--ink-dim)',
  border: '1px solid var(--line)',
  background: 'var(--glass)',
  transition: 'all 0.2s',
};
