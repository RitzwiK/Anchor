import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function RootCausesPanel({ rootCauses, targetMetric }) {
  const causes = rootCauses?.root_causes || [];
  if (!causes.length) return null;

  const data = causes.slice(0, 6).map(rc => ({
    name: rc.variable.length > 16 ? rc.variable.slice(0,15)+'…' : rc.variable,
    full: rc.variable,
    score: +(rc.contribution_score * 100).toFixed(1),
    deviation: rc.deviation_pct,
  }));

  return (
    <div className="glass" style={panel}>
      <div style={top}>
        <div style={label}>Root Cause Attribution</div>
        <h3 className="serif" style={title}>
          Why {targetMetric} changed
        </h3>
        <p style={sub}>Ranked by contribution to the anomaly</p>
      </div>

      <div style={{width:'100%', height: Math.max(180, data.length * 40), marginBottom: '20px'}}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{left:0,right:20,top:4,bottom:4}}>
            <XAxis type="number" tick={{fill:'var(--ink-faint)', fontSize:10}} tickLine={false} axisLine={false} unit="%"/>
            <YAxis type="category" dataKey="name" tick={{fill:'var(--ink-dim)', fontSize:12}} tickLine={false} axisLine={false} width={120}/>
            <Tooltip
              contentStyle={{
                background: 'rgba(10,10,11,0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--line-strong)',
                borderRadius: '10px',
                fontSize: '12px',
                color: 'var(--ink)',
              }}
              formatter={(v, _, p)=>[`${v}% contribution`, p.payload.full]}
              labelFormatter={() => ''}
            />
            <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={22}>
              {data.map((_, i) => (
                <Cell key={i} fill={i === 0 ? 'var(--accent)' : `rgba(97,218,251,${0.7 - i*0.1})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={list}>
        {causes.slice(0, 5).map((rc, i) => (
          <div key={i} style={item}>
            <div style={itemTop}>
              <span className="mono" style={rank}>{String(i+1).padStart(2,'0')}</span>
              <span style={varName}>{rc.variable}</span>
              <svg width="14" height="10" viewBox="0 0 14 10" style={{color:'var(--ink-faint)'}}><path d="M1 5h12m-3-3l3 3-3 3" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={targetName}>{rc.target_node}</span>
            </div>
            <div style={metaRow}>
              <div style={metaItem}>
                <span style={metaLbl}>Contribution</span>
                <span style={{...metaVal, color:'var(--accent)'}}>{(rc.contribution_score*100).toFixed(1)}%</span>
              </div>
              <div style={metaItem}>
                <span style={metaLbl}>Causal strength</span>
                <span style={metaVal}>{(rc.edge_weight*100).toFixed(0)}%</span>
              </div>
              <div style={metaItem}>
                <span style={metaLbl}>Deviation during anomaly</span>
                <span style={{...metaVal, color: rc.deviation_pct < 0 ? 'var(--bad)' : 'var(--good)'}}>
                  {rc.deviation_pct > 0 ? '+' : ''}{rc.deviation_pct}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const panel = {
  padding: '28px 32px',
  borderRadius: 'var(--radius-lg)',
};
const top = { marginBottom: '24px' };
const label = {
  fontSize: '11px', color: 'var(--accent)',
  textTransform: 'uppercase', letterSpacing: '0.1em',
  fontWeight: 500, marginBottom: '4px',
};
const title = {
  fontSize: '28px', fontWeight: 400,
  letterSpacing: '-0.02em', lineHeight: 1.1,
};
const sub = {
  fontSize: '13px', color: 'var(--ink-faint)',
  marginTop: '4px',
};
const list = {
  display: 'flex', flexDirection: 'column', gap: '8px',
};
const item = {
  padding: '14px 18px',
  background: 'rgba(0,0,0,0.25)',
  border: '1px solid var(--line)',
  borderRadius: '12px',
};
const itemTop = {
  display: 'flex', alignItems: 'center', gap: '10px',
  marginBottom: '10px',
};
const rank = {
  fontSize: '11px', color: 'var(--ink-faint)',
  fontWeight: 500, letterSpacing: '0.05em',
};
const varName = {
  fontSize: '14px', color: 'var(--ink)', fontWeight: 500,
};
const targetName = {
  fontSize: '14px', color: 'var(--ink-dim)',
};
const metaRow = {
  display: 'flex', gap: '24px', flexWrap: 'wrap',
};
const metaItem = {
  display: 'flex', flexDirection: 'column', gap: '2px',
};
const metaLbl = {
  fontSize: '10px', color: 'var(--ink-faint)',
  textTransform: 'uppercase', letterSpacing: '0.06em',
  fontWeight: 500,
};
const metaVal = {
  fontFamily: 'var(--mono)', fontSize: '13px',
  fontWeight: 500, color: 'var(--ink)',
};
