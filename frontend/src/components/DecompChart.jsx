import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot, Area, AreaChart } from 'recharts';

export default function DecompChart({ decomposition, anomalies, targetMetric }) {
  const [view, setView] = useState('raw');
  const d = decomposition?.[targetMetric];
  const an = anomalies?.[targetMetric];
  if (!d?.dates?.length) return null;

  const step = Math.max(1, Math.floor(d.dates.length / 250));
  const data = [];
  for (let i = 0; i < d.dates.length; i += step) {
    data.push({
      idx: i,
      date: d.dates[i] || '',
      raw: d.raw[i],
      trend: d.trend[i],
      seasonal: d.seasonal[i],
      residual: d.residual[i],
    });
  }

  const anomalyPts = (an?.anomalies || []).slice(0, 20).map(a => ({
    date: a.date, value: a.value, severity: a.severity,
  }));

  const views = [
    { key: 'raw', label: 'Actual vs Trend' },
    { key: 'seasonal', label: 'Seasonal Pattern' },
    { key: 'residual', label: 'Unusual Activity' },
  ];
  const totalAnom = an?.total_flagged || 0;

  return (
    <div className="glass" style={panel}>
      <div style={top}>
        <div>
          <div style={label}>Time Series</div>
          <h3 className="serif" style={title}>{targetMetric} over time</h3>
          {totalAnom > 0 && (
            <div style={anomBadge}>
              <div style={anomDot}/>
              <span>{totalAnom} anomalies detected</span>
            </div>
          )}
        </div>
        <div style={tabs}>
          {views.map(v => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              style={{
                ...tab,
                background: view === v.key ? 'var(--ink)' : 'transparent',
                color: view === v.key ? 'var(--bg)' : 'var(--ink-dim)',
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{width:'100%', height: 280}}>
        <ResponsiveContainer>
          {view === 'raw' ? (
            <LineChart data={data} margin={{top:8,right:16,bottom:4,left:0}}>
              <defs>
                <linearGradient id="trendG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.4}/>
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{fill:'var(--ink-faint)',fontSize:10}} tickLine={false} interval={Math.floor(data.length/5)} axisLine={{stroke:'var(--line)'}}/>
              <YAxis tick={{fill:'var(--ink-faint)',fontSize:10}} tickLine={false} axisLine={false} width={50}/>
              <Tooltip contentStyle={tooltipStyle}/>
              <Line type="monotone" dataKey="raw" stroke="rgba(255,255,255,0.3)" strokeWidth={1} dot={false} name="Actual" />
              <Line type="monotone" dataKey="trend" stroke="var(--accent)" strokeWidth={2} dot={false} name="Trend" />
            </LineChart>
          ) : view === 'seasonal' ? (
            <LineChart data={data} margin={{top:8,right:16,bottom:4,left:0}}>
              <XAxis dataKey="date" tick={{fill:'var(--ink-faint)',fontSize:10}} tickLine={false} interval={Math.floor(data.length/5)} axisLine={{stroke:'var(--line)'}}/>
              <YAxis tick={{fill:'var(--ink-faint)',fontSize:10}} tickLine={false} axisLine={false} width={50}/>
              <Tooltip contentStyle={tooltipStyle}/>
              <Line type="monotone" dataKey="seasonal" stroke="#3B82F6" strokeWidth={1.5} dot={false} name="Seasonal" />
            </LineChart>
          ) : (
            <LineChart data={data} margin={{top:8,right:16,bottom:4,left:0}}>
              <XAxis dataKey="date" tick={{fill:'var(--ink-faint)',fontSize:10}} tickLine={false} interval={Math.floor(data.length/5)} axisLine={{stroke:'var(--line)'}}/>
              <YAxis tick={{fill:'var(--ink-faint)',fontSize:10}} tickLine={false} axisLine={false} width={50}/>
              <Tooltip contentStyle={tooltipStyle}/>
              <Line type="monotone" dataKey="residual" stroke="var(--warn)" strokeWidth={1} dot={false} name="Residual" />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const tooltipStyle = {
  background: 'rgba(10,10,11,0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid var(--line-strong)',
  borderRadius: '10px',
  fontSize: '12px',
  color: 'var(--ink)',
};

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
  fontSize: '11px', color: 'var(--accent)',
  textTransform: 'uppercase', letterSpacing: '0.1em',
  fontWeight: 500, marginBottom: '4px',
};
const title = {
  fontSize: '24px', fontWeight: 400,
  letterSpacing: '-0.02em', lineHeight: 1.1,
};
const anomBadge = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  marginTop: '8px', padding: '4px 10px',
  background: 'rgba(255,184,77,0.08)',
  border: '1px solid rgba(255,184,77,0.2)',
  borderRadius: '999px',
  fontSize: '11px', color: 'var(--warn)', fontWeight: 500,
};
const anomDot = {
  width: '6px', height: '6px', borderRadius: '50%',
  background: 'var(--warn)',
};
const tabs = {
  display: 'flex', gap: '2px',
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid var(--line)',
  borderRadius: '999px', padding: '3px',
};
const tab = {
  border: 'none', borderRadius: '999px',
  padding: '6px 14px', fontSize: '11px', fontWeight: 500,
  transition: 'all 0.2s',
};
