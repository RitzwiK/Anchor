import React from 'react';

export default function Hero({ onLaunch }) {
  return (
    <section style={sec}>
      <div style={orbWrap}>
        <div style={orb1} />
        <div style={orb2} />
        <div style={orb3} />
      </div>

      <div style={content}>
        <div style={badge} className="fade-up">
          <span style={dot} />
          <span>Causal Grounding Rate · 89%</span>
        </div>

        <h1 style={h1} className="fade-up">
          Find out <em style={{fontStyle:'italic', color:'rgba(255,255,255,0.78)'}}>why</em><br/>
          your numbers <span style={underlineText}>changed</span>.
        </h1>

        <p style={sub} className="fade-up text-legible">
          Upload your business data. Anchor detects anomalies, discovers cause-and-effect relationships,
          and generates explanations where every claim is verified against your data,
          not hallucinated by an AI.
        </p>

        <div style={ctaRow} className="fade-up">
          <button onClick={onLaunch} style={ctaPrimary}>
            Analyze your data
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <a href="#how" style={ctaSecondary}>
            See how it works
          </a>
        </div>

        <div style={trustRow} className="text-legible">
          <div style={trustItem}>
            <span style={trustNum}>5</span>
            <span style={trustLbl}>stage pipeline</span>
          </div>
          <div style={trustSep} />
          <div style={trustItem}>
            <span style={trustNum}>0</span>
            <span style={trustLbl}>hallucinated claims</span>
          </div>
          <div style={trustSep} />
          <div style={trustItem}>
            <span style={trustNum}>40s</span>
            <span style={trustLbl}>end-to-end</span>
          </div>
          <div style={trustSep} />
          <div style={trustItem}>
            <span style={trustNum}>Any</span>
            <span style={trustLbl}>CSV or Excel</span>
          </div>
        </div>
      </div>
    </section>
  );
}

const sec = {
  position: 'relative',
  minHeight: '92vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '140px 24px 80px',
  overflow: 'hidden',
};
const orbWrap = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 0,
};
const orb1 = {
  position: 'absolute',
  top: '15%',
  left: '15%',
  width: '400px',
  height: '400px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(97,218,251,0.12), transparent 60%)',
  filter: 'blur(40px)',
  animation: 'orbitDrift 14s ease-in-out infinite',
};
const orb2 = {
  position: 'absolute',
  top: '35%',
  right: '10%',
  width: '500px',
  height: '500px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(59,130,246,0.10), transparent 60%)',
  filter: 'blur(50px)',
  animation: 'orbitDrift 18s ease-in-out infinite reverse',
};
const orb3 = {
  position: 'absolute',
  bottom: '10%',
  left: '40%',
  width: '350px',
  height: '350px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(154,220,253,0.07), transparent 60%)',
  filter: 'blur(40px)',
  animation: 'orbitDrift 20s ease-in-out infinite',
};
const content = {
  position: 'relative',
  zIndex: 2,
  maxWidth: '900px',
  textAlign: 'center',
  animation: 'fadeIn 0.8s ease',
};
const badge = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  padding: '7px 16px',
  borderRadius: '999px',
  background: 'rgba(255,255,255,0.03)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.08)',
  fontSize: '12px',
  color: 'var(--ink-dim)',
  fontWeight: 450,
  marginBottom: '32px',
  animationDelay: '0.05s',
};
const dot = {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: 'var(--accent)',
  boxShadow: '0 0 12px var(--accent)',
  animation: 'pulseGlow 2s ease-in-out infinite',
};
const divider = { color: 'var(--ink-faint)', margin: '0 4px' };
const h1 = {
  fontFamily: 'var(--serif)',
  fontSize: 'clamp(48px, 8vw, 96px)',
  fontWeight: 400,
  letterSpacing: '-0.04em',
  lineHeight: 0.95,
  marginBottom: '28px',
  animationDelay: '0.1s',
  color: '#FFFFFF',
  // brightest element on the page: crisp white + subtle cool glow for legibility
  textShadow: '0 1px 3px rgba(4,9,16,0.6), 0 2px 22px rgba(4,9,16,0.5), 0 0 38px rgba(154,220,253,0.18)',
};
const underlineText = {
  position: 'relative',
  // lighter ice blue that clearly stands out against the dark pool
  background: 'linear-gradient(92deg, #BDEBFF 0%, #61DAFB 55%, #9ADCFD 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  textShadow: '0 0 26px rgba(97,218,251,0.35)',
};
const sub = {
  fontSize: '17px',
  color: '#C5D2E4',
  maxWidth: '620px',
  margin: '0 auto 44px',
  lineHeight: 1.65,
  fontWeight: 400,
  animationDelay: '0.2s',
};
const ctaRow = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: '80px',
  flexWrap: 'wrap',
  animationDelay: '0.3s',
};
const ctaPrimary = {
  background: 'var(--ink)',
  color: 'var(--bg)',
  fontSize: '15px',
  fontWeight: 500,
  padding: '14px 26px',
  borderRadius: '999px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'all 0.25s',
  boxShadow: '0 10px 40px -10px rgba(255,255,255,0.3)',
};
const ctaSecondary = {
  fontSize: '14px',
  fontWeight: 450,
  padding: '14px 20px',
  color: 'var(--ink-dim)',
  transition: 'color 0.2s',
};
const trustRow = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '32px',
  flexWrap: 'wrap',
  opacity: 1,
  animation: 'fadeUp 0.7s ease both',
  animationDelay: '0.45s',
};
const trustItem = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2px',
};
const trustNum = {
  fontFamily: 'var(--serif)',
  fontSize: '24px',
  fontWeight: 500,
  color: '#FFFFFF',
};
const trustLbl = {
  fontSize: '11px',
  color: '#8FA0B8',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};
const trustSep = {
  width: '1px',
  height: '20px',
  background: 'var(--line)',
};
