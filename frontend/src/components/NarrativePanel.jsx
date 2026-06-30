import React, { useState } from 'react';

export default function NarrativePanel({ narrative, cgr, onRegenerate }) {
  const [showDetails, setShowDetails] = useState(false);
  const text = narrative?.narrative || '';
  const method = narrative?.method || '';
  const details = cgr?.details || [];
  const cgrScore = cgr?.cgr ?? 0;
  const cgrTone = cgrScore >= 0.8 ? 'var(--good)' : cgrScore >= 0.5 ? 'var(--warn)' : 'var(--bad)';

  const formatText = (t) => t.split('\n').map((line, i) => {
    if (!line.trim()) return <div key={i} style={{height:'8px'}} />;
    const isHead = /^(SUMMARY|CAUSAL ANALYSIS|CONFIDENCE):?/i.test(line.trim());
    if (isHead) return (
      <div key={i} style={narHead}>
        <span style={narHeadTxt}>{line.replace(':','')}</span>
        <div style={narHeadLine}/>
      </div>
    );
    return <p key={i} style={narLine}>{line}</p>;
  });

  return (
    <div className="glass" style={panel}>
      <div style={top}>
        <div>
          <div style={label}>Explanation</div>
          <h3 className="serif" style={title}>What we found in your data</h3>
        </div>
        <div style={actions}>
          <div style={{...verifyBadge, background: cgrTone+'15', color: cgrTone, borderColor: cgrTone+'30'}}>
            <div style={{...verifyDot, background: cgrTone}}/>
            <span>{(cgrScore*100).toFixed(0)}% verified</span>
          </div>
          <button style={regenBtn} onClick={onRegenerate}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M10 4v4h-4M2 8V4h4M9.5 4A4 4 0 102 4.5M2.5 8A4 4 0 0010 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Regenerate
          </button>
        </div>
      </div>

      <div style={content}>
        {formatText(text)}
      </div>

      {details.length > 0 && (
        <div style={verifySection}>
          <button onClick={()=>setShowDetails(!showDetails)} style={verifyToggle}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{transform:showDetails?'rotate(90deg)':'none',transition:'transform 0.2s'}}>
              <path d="M3 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Claim verification: {cgr.grounded}/{cgr.total_assertions} backed by causal evidence</span>
          </button>
          {showDetails && (
            <div style={claimList}>
              {details.map((d, i) => (
                <div key={i} style={{
                  ...claim,
                  borderLeftColor: d.grounded ? 'var(--good)' : 'var(--bad)',
                }}>
                  <span style={{
                    ...claimStatus,
                    background: d.grounded ? 'rgba(91,227,160,0.08)' : 'rgba(255,125,138,0.08)',
                    color: d.grounded ? 'var(--good)' : 'var(--bad)',
                  }}>
                    {d.grounded ? '✓' : '✗'} {d.match_type}
                  </span>
                  <span style={claimEdge}>{d.cause} → {d.effect}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const panel = {
  padding: '28px 32px',
  borderRadius: 'var(--radius-lg)',
};
const top = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '20px',
  gap: '16px',
  flexWrap: 'wrap',
};
const label = {
  fontSize: '11px',
  color: 'var(--accent)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  fontWeight: 500,
  marginBottom: '4px',
};
const title = {
  fontSize: '28px',
  fontWeight: 400,
  letterSpacing: '-0.02em',
  lineHeight: 1.1,
};
const actions = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};
const verifyBadge = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 12px',
  borderRadius: '999px',
  border: '1px solid',
  fontSize: '12px',
  fontWeight: 500,
};
const verifyDot = {
  width: '6px', height: '6px', borderRadius: '50%',
};
const regenBtn = {
  display: 'flex', alignItems: 'center', gap: '6px',
  padding: '6px 12px', fontSize: '12px', fontWeight: 500,
  color: 'var(--ink-dim)',
  background: 'var(--glass-hi)',
  border: '1px solid var(--line-strong)',
  borderRadius: '999px',
  transition: 'all 0.2s',
};
const content = {
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid var(--line)',
  borderRadius: 'var(--radius)',
  padding: '24px 28px',
};
const narHead = {
  display: 'flex', alignItems: 'center', gap: '12px',
  marginTop: '20px',
  marginBottom: '8px',
};
const narHeadTxt = {
  fontSize: '11px',
  color: 'var(--accent)',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  fontWeight: 600,
};
const narHeadLine = {
  flex: 1,
  height: '1px',
  background: 'var(--line)',
};
const narLine = {
  fontSize: '15px',
  color: 'var(--ink-dim)',
  lineHeight: 1.7,
  marginBottom: '4px',
};
const verifySection = {
  marginTop: '20px',
  paddingTop: '20px',
  borderTop: '1px solid var(--line)',
};
const verifyToggle = {
  display: 'inline-flex', alignItems: 'center', gap: '8px',
  fontSize: '13px', color: 'var(--ink-faint)',
  fontWeight: 500, padding: 0,
};
const claimList = {
  marginTop: '10px',
  display: 'flex', flexDirection: 'column', gap: '6px',
};
const claim = {
  display: 'flex', alignItems: 'center', gap: '14px',
  padding: '8px 14px',
  background: 'rgba(0,0,0,0.25)',
  borderRadius: '8px',
  borderLeft: '3px solid',
  fontSize: '12px',
};
const claimStatus = {
  fontSize: '10px', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.05em',
  padding: '3px 8px', borderRadius: '4px',
  minWidth: '90px',
};
const claimEdge = {
  fontFamily: 'var(--mono)',
  color: 'var(--ink-dim)',
  fontSize: '12px',
};
