import React from 'react';

export default function Problem() {
  return (
    <section id="method" style={sec}>
      <div style={wrap}>
        <div style={label} className="fade-up">The problem</div>
        <h2 style={title} className="fade-up">
          Your dashboard tells you <em style={em}>what</em> happened.<br/>
          It never tells you <em style={em}>why</em>.
        </h2>

        <div style={grid}>
          <div className="glass" style={card}>
            <div style={cardIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 3v18h18M7 14l4-4 4 4 5-5" stroke="#ff7d7d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={cardTag}>Dashboards</div>
            <h3 style={cardTitle}>Show anomalies, not causes</h3>
            <p style={cardText}>
              A chart confirms sales dropped 12%. It cannot determine whether
              it was a stockout, a competitor promo, seasonality, or a pricing error.
            </p>
          </div>

          <div className="glass" style={card}>
            <div style={cardIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#ffb84d" strokeWidth="1.5"/>
                <path d="M12 8v4M12 16h.01" stroke="#ffb84d" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={cardTag}>AI Chatbots</div>
            <h3 style={cardTitle}>Generate plausible fiction</h3>
            <p style={cardText}>
              Asked "why?" an LLM fabricates causal stories from training priors:
              <em> "consumer fatigue," "macroeconomic headwinds."</em> None of it verified against your data.
            </p>
          </div>

          <div className="glass-hi" style={{...card, borderColor: 'rgba(97,218,251,0.2)'}}>
            <div style={cardIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{...cardTag, color: 'var(--accent)'}}>Anchor</div>
            <h3 style={cardTitle}>Discovers & verifies</h3>
            <p style={cardText}>
              Builds a causal graph from your data. Every claim in the
              explanation must map to a validated edge in that graph, or it's rejected.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const sec = {
  position: 'relative',
  padding: '120px 24px',
  zIndex: 2,
};
const wrap = { maxWidth: '1080px', margin: '0 auto' };
const label = {
  fontSize: '12px',
  color: 'var(--accent)',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  marginBottom: '20px',
  textAlign: 'center',
};
const title = {
  fontFamily: 'var(--serif)',
  fontSize: 'clamp(34px, 5.5vw, 60px)',
  fontWeight: 400,
  lineHeight: 1.1,
  letterSpacing: '-0.03em',
  textAlign: 'center',
  marginBottom: '64px',
  maxWidth: '900px',
  marginLeft: 'auto',
  marginRight: 'auto',
};
const em = { fontStyle: 'italic', color: 'var(--ink-dim)' };
const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '20px',
};
const card = {
  padding: '32px 28px',
  borderRadius: 'var(--radius-lg)',
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
  transition: 'transform 0.3s',
};
const cardIcon = {
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid var(--line)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
const cardTag = {
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'var(--ink-faint)',
};
const cardTitle = {
  fontFamily: 'var(--serif)',
  fontSize: '22px',
  fontWeight: 500,
  letterSpacing: '-0.015em',
  lineHeight: 1.2,
};
const cardText = {
  fontSize: '14px',
  color: 'var(--ink-dim)',
  lineHeight: 1.6,
};
