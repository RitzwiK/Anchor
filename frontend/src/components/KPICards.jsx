import React from 'react';

export default function KPICards({ result }) {
  const ins = result?.insights || {};
  const cgr = result?.cgr?.cgr ?? 0;
  const rc = result?.root_causes?.root_causes || [];
  const topCause = rc[0];
  const target = result?.target_metric || '';
  const isUp = (ins.change_pct || 0) >= 0;
  const cgrTone = cgr >= 0.8 ? 'var(--good)' : cgr >= 0.5 ? 'var(--warn)' : 'var(--bad)';

  return (
    <div style={wrap}>
      <Card
        label="Recent Average"
        value={formatNum(ins.current_avg)}
        sub={`${isUp ? '↑' : '↓'} ${Math.abs(ins.change_pct || 0)}% vs early period`}
        subColor={isUp ? 'var(--good)' : 'var(--bad)'}
        accent="var(--accent)"
      />
      <Card
        label="Anomalies Found"
        value={ins.total_anomalies || 0}
        sub="unusual data points detected"
      />
      <Card
        label="Causal Edges"
        value={ins.causal_edges || 0}
        sub="cause-effect links discovered"
      />
      <Card
        label="Grounding Rate"
        value={`${(cgr * 100).toFixed(0)}%`}
        sub="claims backed by data"
        valueColor={cgrTone}
        highlight={cgrTone}
      />

      {topCause && (
        <div className="glass" style={finding}>
          <div style={findingLabel}>
            <span className="serif" style={{fontStyle:'italic', fontSize:'15px'}}>Top finding</span>
            <div style={findingLine}/>
          </div>
          <p className="serif" style={findingText}>
            <span style={findingBold}>{topCause.variable}</span> is the strongest driver of changes in{' '}
            <span style={findingBold}>{target}</span>, with{' '}
            <span style={findingNum}>{(topCause.edge_weight * 100).toFixed(0)}%</span> causal strength.
            During anomaly windows, {topCause.variable} deviated by{' '}
            <span style={{...findingNum, color: topCause.deviation_pct > 0 ? 'var(--good)' : 'var(--bad)'}}>
              {topCause.deviation_pct > 0 ? '+' : ''}{topCause.deviation_pct}%
            </span>{' '}
            from its normal range.
          </p>
        </div>
      )}
    </div>
  );
}

function Card({ label, value, sub, subColor, valueColor, highlight }) {
  return (
    <div className="glass" style={{...card, ...(highlight ? { borderColor: highlight+'40' } : {})}}>
      <div style={cardLabel}>{label}</div>
      <div style={{...cardValue, color: valueColor || 'var(--ink)'}}>{value}</div>
      {sub && <div style={{...cardSub, color: subColor || 'var(--ink-faint)'}}>{sub}</div>}
    </div>
  );
}

function formatNum(n) {
  if (n === null || n === undefined) return 'n/a';
  if (Math.abs(n) > 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (Math.abs(n) > 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toLocaleString();
}

const wrap = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '12px',
};
const card = {
  padding: '20px 22px',
  borderRadius: 'var(--radius)',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  transition: 'border-color 0.3s',
};
const cardLabel = {
  fontSize: '11px',
  color: 'var(--ink-faint)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  fontWeight: 500,
};
const cardValue = {
  fontFamily: 'var(--serif)',
  fontSize: '36px',
  fontWeight: 400,
  letterSpacing: '-0.03em',
  lineHeight: 1,
  marginTop: '4px',
};
const cardSub = { fontSize: '12px', fontWeight: 450 };

const finding = {
  gridColumn: '1 / -1',
  padding: '24px 28px',
  borderRadius: 'var(--radius)',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};
const findingLabel = {
  display: 'flex', alignItems: 'center', gap: '12px',
  color: 'var(--ink-dim)',
};
const findingLine = {
  flex: 1, height: '1px',
  background: 'linear-gradient(to right, var(--line-strong), transparent)',
};
const findingText = {
  fontSize: '17px',
  lineHeight: 1.55,
  color: 'var(--ink-dim)',
  letterSpacing: '-0.01em',
  margin: 0,
};
const findingBold = { color: 'var(--ink)', fontWeight: 500 };
const findingNum = {
  fontFamily: 'var(--mono)',
  fontWeight: 500,
  color: 'var(--ink)',
  fontStyle: 'normal',
  fontSize: '0.9em',
};
