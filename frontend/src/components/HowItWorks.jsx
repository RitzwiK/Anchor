import React from 'react';

const STAGES = [
  {
    num: '01',
    title: 'Decompose',
    desc: 'Separate your metric into trend, seasonal pattern, and unexpected residuals using STL decomposition.',
    tech: 'STL · LOESS',
  },
  {
    num: '02',
    title: 'Detect',
    desc: 'Flag unusual data points in the residuals using Isolation Forest with severity scoring.',
    tech: 'Isolation Forest',
  },
  {
    num: '03',
    title: 'Discover',
    desc: 'Build a directed causal graph between your variables using the PC algorithm and Granger causality.',
    tech: 'PC + Granger + ACE',
  },
  {
    num: '04',
    title: 'Trace',
    desc: 'Walk backward through the graph from the anomaly to find the variables that caused it, ranked by contribution.',
    tech: 'Backward DAG walk',
  },
  {
    num: '05',
    title: 'Explain',
    desc: 'Generate a natural-language explanation where every causal claim is verified against the discovered graph.',
    tech: 'Anchor Prompt + CGR',
  },
];

export default function HowItWorks() {
  return (
    <section id="how" style={sec}>
      <div style={wrap}>
        <div style={label} className="fade-up">Pipeline</div>
        <h2 style={title} className="fade-up">
          Five stages.<br/>
          <em style={em}>One pass.</em> Full transparency.
        </h2>
        <p style={sub} className="fade-up">
          Every stage exposes its intermediate output, so you see exactly how the explanation was built.
        </p>

        <div style={stagesWrap}>
          {/* Vertical spine */}
          <div style={spine} />

          {STAGES.map((s, i) => (
            <div key={s.num} style={stageRow} className="fade-up">
              <div style={stageNumWrap}>
                <div style={stageNumDot} />
                <span className="serif" style={stageNum}>{s.num}</span>
              </div>
              <div className="glass" style={stageCard}>
                <div style={stageHeader}>
                  <h3 style={stageTitle}>{s.title}</h3>
                  <span className="mono" style={stageTech}>{s.tech}</span>
                </div>
                <p style={stageDesc}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const sec = { position: 'relative', padding: '120px 24px', zIndex: 2 };
const wrap = { maxWidth: '880px', margin: '0 auto' };
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
  marginBottom: '16px',
};
const em = { fontStyle: 'italic', color: 'var(--ink-dim)' };
const sub = {
  textAlign: 'center',
  fontSize: '16px',
  color: 'var(--ink-dim)',
  marginBottom: '72px',
  maxWidth: '540px',
  marginLeft: 'auto',
  marginRight: 'auto',
};
const stagesWrap = { position: 'relative', paddingLeft: '60px' };
const spine = {
  position: 'absolute',
  left: '24px',
  top: '24px',
  bottom: '24px',
  width: '1px',
  background: 'linear-gradient(to bottom, var(--line), var(--accent), var(--line))',
  opacity: 0.3,
};
const stageRow = {
  position: 'relative',
  display: 'flex',
  alignItems: 'stretch',
  gap: '32px',
  marginBottom: '16px',
};
const stageNumWrap = {
  position: 'absolute',
  left: '-60px',
  top: '24px',
  width: '48px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
};
const stageNumDot = {
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  background: 'var(--accent)',
  border: '2px solid var(--bg)',
  boxShadow: '0 0 16px var(--accent)',
};
const stageNum = {
  fontSize: '12px',
  color: 'var(--ink-faint)',
  fontWeight: 500,
  letterSpacing: '0.1em',
};
const stageCard = {
  flex: 1,
  padding: '24px 28px',
  borderRadius: 'var(--radius)',
  transition: 'all 0.3s',
};
const stageHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  marginBottom: '8px',
  flexWrap: 'wrap',
  gap: '8px',
};
const stageTitle = {
  fontFamily: 'var(--serif)',
  fontSize: '24px',
  fontWeight: 500,
  letterSpacing: '-0.02em',
};
const stageTech = {
  fontSize: '11px',
  color: 'var(--accent)',
  background: 'var(--accent-soft)',
  padding: '4px 10px',
  borderRadius: '6px',
  fontWeight: 500,
};
const stageDesc = {
  fontSize: '14px',
  color: 'var(--ink-dim)',
  lineHeight: 1.6,
};
