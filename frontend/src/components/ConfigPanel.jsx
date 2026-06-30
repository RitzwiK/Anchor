import React, { useState, useEffect } from 'react';

export default function ConfigPanel({ uploadInfo, onAnalyze, loading }) {
  const [target, setTarget] = useState('');
  const [cols, setCols] = useState([]);
  const [period, setPeriod] = useState(7);
  const [apiKey, setApiKey] = useState('');
  const [showAdv, setShowAdv] = useState(false);
  const metrics = uploadInfo?.metric_cols || [];
  const stats = uploadInfo?.stats || {};

  useEffect(() => {
    if (metrics.length && !target) {
      setTarget(metrics[0]);
      setCols([...metrics]);
    }
  }, [metrics]);

  const toggle = (c) => setCols(p => p.includes(c) ? p.filter(x=>x!==c) : [...p, c]);

  return (
    <div style={wrap}>
      {/* Target selector */}
      <div style={section}>
        <label style={label}>
          <span style={labelNum}>01</span>
          What metric do you want to investigate?
        </label>
        <div style={targetGrid}>
          {metrics.map(m => (
            <button
              key={m}
              onClick={()=>setTarget(m)}
              className={target === m ? 'glass-hi' : 'glass'}
              style={{
                ...targetBtn,
                borderColor: target === m ? 'var(--accent)' : 'var(--line)',
                background: target === m ? 'var(--accent-soft)' : 'var(--glass)',
              }}
            >
              <span style={targetName}>{m}</span>
              {stats[m] && (
                <span style={targetStats}>
                  avg {stats[m].mean?.toLocaleString()}
                </span>
              )}
              {target === m && <div style={targetCheck}><svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke="var(--accent)" strokeWidth="2" fill="none"/></svg></div>}
            </button>
          ))}
        </div>
      </div>

      {/* Causal vars */}
      <div style={section}>
        <label style={label}>
          <span style={labelNum}>02</span>
          Which variables might affect it?
          <span style={sublabel}>Select all that could have a causal relationship</span>
        </label>
        <div style={chips}>
          {metrics.map(m=>(
            <button key={m} onClick={()=>toggle(m)} style={{
              ...chip,
              background: cols.includes(m) ? 'var(--ink)' : 'transparent',
              color: cols.includes(m) ? 'var(--bg)' : 'var(--ink-dim)',
              borderColor: cols.includes(m) ? 'var(--ink)' : 'var(--line-strong)',
            }}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced */}
      <div style={section}>
        <button onClick={()=>setShowAdv(!showAdv)} style={advToggle}>
          <svg width="10" height="10" viewBox="0 0 10 10" style={{transform:showAdv?'rotate(90deg)':'none',transition:'transform 0.2s'}}>
            <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </svg>
          Advanced settings
        </button>
        {showAdv && (
          <div style={advGrid}>
            <div>
              <label style={miniLabel}>Data frequency</label>
              <select value={period} onChange={e=>setPeriod(+e.target.value)} style={select}>
                <option value={7}>Daily (weekly pattern)</option>
                <option value={12}>Monthly</option>
                <option value={30}>30-day cycle</option>
                <option value={365}>Yearly</option>
              </select>
            </div>
            <div>
              <label style={miniLabel}>OpenAI API key <span style={{color:'var(--ink-faint)'}}>(optional)</span></label>
              <input value={apiKey} onChange={e=>setApiKey(e.target.value)} type="password" placeholder="sk-..." style={input}/>
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={() => target && onAnalyze({
          target_metric: target,
          metric_cols: cols.length ? cols : metrics,
          date_col: uploadInfo.date_col,
          period,
          api_key: apiKey,
        })}
        disabled={loading || !target}
        style={{
          ...analyzeBtn,
          opacity: (loading || !target) ? 0.5 : 1,
          cursor: (loading || !target) ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? (
          <>
            <div style={miniSpin}/>
            <span>Analyzing. This takes 20 to 40 seconds</span>
          </>
        ) : (
          <>
            <span>Run Anchor analysis</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </>
        )}
      </button>
    </div>
  );
}

const wrap = { display: 'flex', flexDirection: 'column', gap: '28px' };
const section = { display: 'flex', flexDirection: 'column', gap: '14px' };
const label = {
  display: 'flex', alignItems: 'center', gap: '10px',
  fontSize: '14px', fontWeight: 500, color: 'var(--ink)',
  letterSpacing: '-0.01em', flexWrap: 'wrap',
};
const labelNum = {
  fontFamily: 'var(--serif)', fontSize: '13px',
  color: 'var(--accent)', fontWeight: 500,
  background: 'var(--accent-soft)', padding: '2px 8px',
  borderRadius: '6px', letterSpacing: '0.05em',
};
const sublabel = {
  fontSize: '12px', color: 'var(--ink-faint)', fontWeight: 400,
  marginLeft: 'auto',
};
const targetGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: '8px',
};
const targetBtn = {
  position: 'relative',
  padding: '14px 16px', borderRadius: 'var(--radius-sm)',
  display: 'flex', flexDirection: 'column',
  alignItems: 'flex-start', gap: '4px',
  transition: 'all 0.2s', textAlign: 'left',
};
const targetName = {
  fontSize: '14px', fontWeight: 500, color: 'var(--ink)',
};
const targetStats = {
  fontSize: '11px', color: 'var(--ink-faint)',
  fontFamily: 'var(--mono)',
};
const targetCheck = {
  position: 'absolute', top: '12px', right: '12px',
};
const chips = { display: 'flex', flexWrap: 'wrap', gap: '6px' };
const chip = {
  border: '1px solid', borderRadius: '999px',
  padding: '6px 14px', fontSize: '12px', fontWeight: 500,
  transition: 'all 0.15s',
};
const advToggle = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  fontSize: '13px', color: 'var(--ink-faint)', fontWeight: 500,
  padding: 0,
};
const advGrid = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
  marginTop: '4px',
};
const miniLabel = {
  display: 'block', fontSize: '11px',
  color: 'var(--ink-faint)', marginBottom: '6px',
  textTransform: 'uppercase', letterSpacing: '0.08em',
};
const select = {
  width: '100%', padding: '10px 12px',
  background: 'var(--glass)', border: '1px solid var(--line-strong)',
  borderRadius: '10px', color: 'var(--ink)',
  fontSize: '13px', fontFamily: 'inherit',
  outline: 'none',
};
const input = {
  width: '100%', padding: '10px 12px',
  background: 'var(--glass)', border: '1px solid var(--line-strong)',
  borderRadius: '10px', color: 'var(--ink)',
  fontSize: '13px', fontFamily: 'var(--mono)',
  outline: 'none',
};
const analyzeBtn = {
  background: 'var(--accent)',
  color: 'var(--bg)',
  fontSize: '14px', fontWeight: 600,
  padding: '14px 20px',
  borderRadius: '12px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  gap: '8px',
  transition: 'all 0.25s',
  boxShadow: '0 10px 40px -10px rgba(97,218,251,0.4)',
};
const miniSpin = {
  width: '14px', height: '14px',
  border: '2px solid rgba(0,0,0,0.2)',
  borderTopColor: 'var(--bg)',
  borderRadius: '50%',
  animation: 'spin 0.7s linear infinite',
};
