import React from 'react';

export default function Trust() {
  return (
    <section id="trust" style={sec}>
      <div style={wrap}>
        <div style={grid}>
          {/* Left: copy */}
          <div style={left}>
            <div style={label} className="fade-up">Why trust it</div>
            <h2 style={title} className="fade-up">
              Every claim gets <em style={em}>verified</em> against your data.
            </h2>
            <p style={text} className="fade-up">
              Anchor introduces the <strong style={{color:'var(--ink)'}}>Causal Grounding Rate (CGR)</strong>, the
              percentage of causal claims in an explanation that correspond to a validated edge
              in the discovered graph.
            </p>
            <p style={text} className="fade-up">
              If the AI says <em>"inventory caused the revenue drop,"</em> that claim only counts if there's a verified
              inventory → revenue edge in the data. No edge, no claim.
            </p>

            <div style={bench}>
              <div style={benchRow}>
                <span style={benchLbl}>Plain GPT</span>
                <div style={barWrap}><div style={{...bar, width:'21%', background:'#ff7d7d'}}/></div>
                <span className="mono" style={benchVal}>0.21</span>
              </div>
              <div style={benchRow}>
                <span style={benchLbl}>RAG + GPT</span>
                <div style={barWrap}><div style={{...bar, width:'34%', background:'#ffb84d'}}/></div>
                <span className="mono" style={benchVal}>0.34</span>
              </div>
              <div style={benchRow}>
                <span style={{...benchLbl, color:'var(--accent)'}}>Anchor</span>
                <div style={barWrap}><div style={{...bar, width:'89%', background:'var(--accent)'}}/></div>
                <span className="mono" style={{...benchVal, color:'var(--accent)'}}>0.89</span>
              </div>
            </div>
          </div>

          {/* Right: big CGR display */}
          <div style={right}>
            <div className="glass-hi" style={cgrCard}>
              <div style={cgrTop}>
                <span style={cgrTopLbl}>Causal Grounding Rate</span>
                <div style={cgrTopDot}>
                  <div style={cgrDotPulse}/>
                </div>
              </div>
              <div style={cgrBig}>
                <span style={cgrNum}>89</span>
                <span style={cgrPct}>%</span>
              </div>
              <p style={cgrSub}>of claims backed by a validated causal edge</p>
              <div style={cgrDivider} />
              <div style={cgrMetrics}>
                <div style={cgrMetric}>
                  <span style={cgrMetLbl}>Improvement vs baseline</span>
                  <span style={cgrMetVal}>4.2×</span>
                </div>
                <div style={cgrMetric}>
                  <span style={cgrMetLbl}>Narrative fluency (BERT)</span>
                  <span style={cgrMetVal}>0.91</span>
                </div>
                <div style={cgrMetric}>
                  <span style={cgrMetLbl}>Root-cause F₁</span>
                  <span style={cgrMetVal}>0.81</span>
                </div>
              </div>
            </div>

            {/* Decorative glass chip */}
            <div className="glass" style={chip1}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7l3 3 5-6" stroke="var(--good)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Verified</span>
            </div>
            <div className="glass" style={chip2}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="var(--accent)" strokeWidth="1.5"/>
                <circle cx="7" cy="7" r="2" fill="var(--accent)"/>
              </svg>
              <span>DAG anchored</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const sec = { position: 'relative', padding: '120px 24px', zIndex: 2 };
const wrap = { maxWidth: '1080px', margin: '0 auto' };
const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
  gap: '60px',
  alignItems: 'center',
};
const left = { display: 'flex', flexDirection: 'column', gap: '18px' };
const label = {
  fontSize: '12px',
  color: 'var(--accent)',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  marginBottom: '4px',
};
const title = {
  fontFamily: 'var(--serif)',
  fontSize: 'clamp(32px, 5vw, 52px)',
  fontWeight: 400,
  lineHeight: 1.1,
  letterSpacing: '-0.03em',
  marginBottom: '8px',
};
const em = { fontStyle: 'italic', color: 'var(--ink-dim)' };
const text = { fontSize: '15px', color: 'var(--ink-dim)', lineHeight: 1.7 };
const bench = {
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
  marginTop: '20px',
  padding: '24px',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid var(--line)',
  borderRadius: 'var(--radius)',
};
const benchRow = { display: 'grid', gridTemplateColumns: '110px 1fr 50px', alignItems: 'center', gap: '14px' };
const benchLbl = { fontSize: '13px', color: 'var(--ink-dim)', fontWeight: 500 };
const barWrap = { height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' };
const bar = { height: '100%', borderRadius: '4px', transition: 'width 1s cubic-bezier(0.16,1,0.3,1)' };
const benchVal = { fontSize: '13px', color: 'var(--ink)', textAlign: 'right', fontWeight: 500 };
const right = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
};
const cgrCard = {
  width: '100%',
  maxWidth: '380px',
  padding: '36px 32px',
  borderRadius: 'var(--radius-lg)',
  position: 'relative',
  overflow: 'hidden',
};
const cgrTop = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
};
const cgrTopLbl = {
  fontSize: '12px',
  color: 'var(--ink-faint)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  fontWeight: 500,
};
const cgrTopDot = {
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  background: 'var(--accent)',
  position: 'relative',
};
const cgrDotPulse = {
  position: 'absolute',
  inset: '-6px',
  borderRadius: '50%',
  background: 'var(--accent)',
  opacity: 0.4,
  animation: 'pulseGlow 2s ease-in-out infinite',
};
const cgrBig = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '4px',
  lineHeight: 1,
};
const cgrNum = {
  fontFamily: 'var(--serif)',
  fontSize: '112px',
  fontWeight: 300,
  letterSpacing: '-0.04em',
  background: 'linear-gradient(180deg, #fff 0%, var(--ink-dim) 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};
const cgrPct = {
  fontFamily: 'var(--serif)',
  fontSize: '48px',
  fontWeight: 300,
  color: 'var(--ink-dim)',
};
const cgrSub = {
  fontSize: '13px',
  color: 'var(--ink-dim)',
  marginTop: '8px',
};
const cgrDivider = {
  height: '1px',
  background: 'var(--line)',
  margin: '24px 0 20px',
};
const cgrMetrics = { display: 'flex', flexDirection: 'column', gap: '10px' };
const cgrMetric = { display: 'flex', justifyContent: 'space-between', fontSize: '13px' };
const cgrMetLbl = { color: 'var(--ink-faint)' };
const cgrMetVal = { fontFamily: 'var(--serif)', fontWeight: 500, color: 'var(--ink)' };
const chip1 = {
  position: 'absolute',
  top: '10%',
  right: '-12%',
  padding: '8px 14px',
  borderRadius: '999px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12px',
  fontWeight: 500,
  animation: 'float 4s ease-in-out infinite',
};
const chip2 = {
  position: 'absolute',
  bottom: '15%',
  left: '-12%',
  padding: '8px 14px',
  borderRadius: '999px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12px',
  fontWeight: 500,
  animation: 'float 5s ease-in-out infinite 1s',
};
