import React from 'react';

const CASES = [
  {
    industry: 'Retail',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M6 2l1.5 3h9L18 2M4 7h16l-1.5 12.5a2 2 0 01-2 1.5H7.5a2 2 0 01-2-1.5L4 7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    q: 'Why did weekly revenue drop 9% in the Western region?',
    a: 'Inventory depletion across 3 SKU categories (contribution: 0.58) + competitor promotion (0.27)',
  },
  {
    industry: 'SaaS',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M4 7l8-4 8 4-8 4-8-4zM4 12l8 4 8-4M4 17l8 4 8-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    q: 'Why did MRR growth stall in Q3?',
    a: 'Activation rate decline (contribution: 0.61) traced to a UX change in onboarding flow',
  },
  {
    industry: 'Logistics',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 7h11v10H3V7zM14 10h4l3 3v4h-7M7 17a2 2 0 100 4 2 2 0 000-4zM17 17a2 2 0 100 4 2 2 0 000-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    q: 'Why did on-time delivery rate fall below 92%?',
    a: 'Upstream warehouse throughput bottleneck (0.54) amplified by routing changes (0.22)',
  },
  {
    industry: 'Finance',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    q: 'Why did our operating margin contract?',
    a: 'Input cost inflation (0.49) directly affecting COGS; not mitigated by pricing adjustments',
  },
];

export default function UseCases() {
  return (
    <section style={sec}>
      <div style={wrap}>
        <div style={label} className="fade-up">Use cases</div>
        <h2 style={title} className="fade-up">
          Built for the questions<br/>you can't afford to <em style={em}>guess</em> on.
        </h2>

        <div style={grid}>
          {CASES.map((c, i) => (
            <div key={i} className="glass" style={card}>
              <div style={cardTop}>
                <div style={iconBox}>{c.icon}</div>
                <span style={industry}>{c.industry}</span>
              </div>
              <div style={question}>
                <span style={qMark}>Q</span>
                <p style={qText}>{c.q}</p>
              </div>
              <div style={answer}>
                <span style={aMark}>A</span>
                <p style={aText}>{c.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const sec = { position: 'relative', padding: '120px 24px', zIndex: 2 };
const wrap = { maxWidth: '1080px', margin: '0 auto' };
const label = {
  fontSize: '12px', color: 'var(--accent)', fontWeight: 500,
  textTransform: 'uppercase', letterSpacing: '0.12em',
  marginBottom: '20px', textAlign: 'center',
};
const title = {
  fontFamily: 'var(--serif)', fontSize: 'clamp(32px, 5vw, 56px)',
  fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.03em',
  textAlign: 'center', marginBottom: '64px',
};
const em = { fontStyle: 'italic', color: 'var(--ink-dim)' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' };
const card = {
  padding: '28px', borderRadius: 'var(--radius-lg)',
  display: 'flex', flexDirection: 'column', gap: '18px',
  transition: 'transform 0.3s, border-color 0.3s',
};
const cardTop = { display: 'flex', alignItems: 'center', gap: '12px' };
const iconBox = {
  width: '44px', height: '44px', borderRadius: '12px',
  background: 'rgba(97,218,251,0.08)',
  color: 'var(--accent)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  border: '1px solid rgba(97,218,251,0.15)',
};
const industry = {
  fontSize: '12px', fontWeight: 600, color: 'var(--ink-dim)',
  textTransform: 'uppercase', letterSpacing: '0.1em',
};
const question = { display: 'flex', gap: '12px', alignItems: 'flex-start' };
const qMark = {
  fontFamily: 'var(--serif)', fontSize: '18px',
  color: 'var(--ink-faint)', fontStyle: 'italic',
  flexShrink: 0, marginTop: '-2px',
};
const qText = {
  fontFamily: 'var(--serif)', fontSize: '18px',
  fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.01em',
  lineHeight: 1.35,
};
const answer = {
  display: 'flex', gap: '12px', alignItems: 'flex-start',
  padding: '16px', background: 'rgba(97,218,251,0.04)',
  border: '1px solid rgba(97,218,251,0.08)',
  borderRadius: '12px',
};
const aMark = {
  fontFamily: 'var(--serif)', fontSize: '18px',
  color: 'var(--accent)', fontStyle: 'italic',
  flexShrink: 0, marginTop: '-2px', fontWeight: 500,
};
const aText = { fontSize: '13px', color: 'var(--ink-dim)', lineHeight: 1.6 };
