import React, { useMemo } from 'react';

export default function CausalGraphPanel({ dag }) {
  const edges = dag?.edges || [];
  const nodes = dag?.nodes || [];

  const layout = useMemo(() => {
    if (!nodes.length) return { pos: {}, w: 400, h: 200 };
    const layers = [];
    const done = new Set();
    let rem = [...nodes];

    while (rem.length) {
      const layer = rem.filter(n => !done.has(n) &&
        edges.filter(e => e.target === n && !done.has(e.source)).length === 0);
      if (!layer.length) { layers.push(rem.filter(n => !done.has(n))); break; }
      layers.push(layer);
      layer.forEach(n => done.add(n));
      rem = rem.filter(n => !done.has(n));
    }

    const nW = 130, nH = 40, lG = 90, nG = 50, pad = 60;
    const h = layers.length * lG + pad * 2;
    const maxPL = Math.max(...layers.map(l => l.length), 1);
    const w = Math.max(maxPL * (nW + nG) + pad * 2, 500);
    const pos = {};
    layers.forEach((layer, li) => {
      const lw = layer.length * (nW + nG) - nG;
      const sx = (w - lw) / 2;
      layer.forEach((n, ni) => {
        pos[n] = { x: sx + ni * (nW + nG) + nW / 2, y: pad + li * lG + nH / 2 };
      });
    });
    return { pos, w, h };
  }, [nodes, edges]);

  if (!nodes.length) return null;
  const { pos, w, h } = layout;

  return (
    <div className="glass" style={panel}>
      <div style={top}>
        <div style={label}>Causal Graph</div>
        <h3 className="serif" style={title}>Cause & Effect Map</h3>
        <p style={sub}>
          {edges.length} relationships discovered between {nodes.length} variables
        </p>
      </div>

      <div style={graphBg}>
        <svg viewBox={`0 0 ${w} ${h}`} style={{width:'100%', height:'auto', maxHeight:'420px'}}>
          <defs>
            <marker id="ah2" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
              <polygon points="0 0, 7 2.5, 0 5" fill="rgba(255,255,255,0.4)"/>
            </marker>
            <filter id="nodeGlow">
              <feGaussianBlur stdDeviation="3"/>
              <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {edges.map((e, i) => {
            const f = pos[e.source], t = pos[e.target];
            if (!f || !t) return null;
            const mid = { x: (f.x + t.x) / 2, y: (f.y + t.y) / 2 };
            return (
              <g key={i}>
                <line
                  x1={f.x} y1={f.y + 20}
                  x2={t.x} y2={t.y - 20}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth={Math.max(1, e.weight * 2.5)}
                  markerEnd="url(#ah2)"
                />
                <rect x={mid.x - 20} y={mid.y - 9} width="40" height="18" rx="9"
                  fill="rgba(5,5,5,0.8)" stroke="var(--line)" strokeWidth="1"/>
                <text x={mid.x} y={mid.y + 4} textAnchor="middle"
                  fill="var(--accent)" fontSize="10" fontFamily="JetBrains Mono, monospace" fontWeight="500">
                  {(e.weight * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}

          {nodes.map(n => {
            const p = pos[n]; if (!p) return null;
            const lbl = n.length > 14 ? n.slice(0, 13) + '…' : n;
            const isTarget = edges.some(e => e.target === n && !edges.some(e2 => e2.source === n));
            const isRoot = edges.some(e => e.source === n && !edges.some(e2 => e2.target === n));
            const tone = isTarget ? 'rgba(255,125,138,0.4)' : isRoot ? 'rgba(97,218,251,0.4)' : 'var(--line-strong)';
            return (
              <g key={n}>
                <rect
                  x={p.x - 62} y={p.y - 20}
                  width={124} height={40} rx={10}
                  fill="rgba(15,15,16,0.9)"
                  stroke={tone}
                  strokeWidth={1.5}
                />
                <text x={p.x} y={p.y + 5} textAnchor="middle"
                  fill="var(--ink)" fontSize="11" fontWeight="500" fontFamily="Inter, sans-serif">
                  {lbl}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div style={legend}>
        <div style={legItem}>
          <div style={{...legDot, background:'rgba(97,218,251,0.4)', borderColor:'rgba(97,218,251,0.6)'}}/>
          <span>Source variables</span>
        </div>
        <div style={legItem}>
          <div style={{...legDot, background:'rgba(255,125,138,0.4)', borderColor:'rgba(255,125,138,0.6)'}}/>
          <span>Target variables</span>
        </div>
        <div style={legItem}>
          <div style={{...legDot, background:'transparent', borderColor:'var(--line-strong)'}}/>
          <span>Intermediate</span>
        </div>
      </div>

      {/* Edge list */}
      <div style={edgeList}>
        {edges.sort((a,b) => b.weight - a.weight).map((e, i) => (
          <div key={i} style={edgeItem}>
            <span style={edgeName}>{e.source} → {e.target}</span>
            <div style={edgeRight}>
              <div style={edgeBarWrap}>
                <div style={{...edgeBar, width: `${e.weight * 100}%`}}/>
              </div>
              <span className="mono" style={edgeW}>{(e.weight * 100).toFixed(1)}%</span>
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
  fontSize: '24px', fontWeight: 400,
  letterSpacing: '-0.02em', lineHeight: 1.1,
};
const sub = { fontSize: '13px', color: 'var(--ink-faint)', marginTop: '4px' };
const graphBg = {
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid var(--line)',
  borderRadius: 'var(--radius)',
  padding: '16px',
  marginBottom: '16px',
};
const legend = {
  display: 'flex', gap: '20px', flexWrap: 'wrap',
  marginBottom: '20px', fontSize: '11px', color: 'var(--ink-faint)',
};
const legItem = { display: 'flex', alignItems: 'center', gap: '6px' };
const legDot = {
  width: '10px', height: '10px', borderRadius: '3px',
  border: '1px solid',
};
const edgeList = {
  display: 'flex', flexDirection: 'column', gap: '6px',
  maxHeight: '200px', overflowY: 'auto',
};
const edgeItem = {
  display: 'flex', justifyContent: 'space-between',
  alignItems: 'center', gap: '16px',
  padding: '10px 14px',
  background: 'rgba(0,0,0,0.25)', borderRadius: '8px',
  fontSize: '13px',
};
const edgeName = { color: 'var(--ink)', fontWeight: 500, flex: 1 };
const edgeRight = { display: 'flex', alignItems: 'center', gap: '10px' };
const edgeBarWrap = { width: '80px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' };
const edgeBar = { height: '100%', background: 'var(--accent)', borderRadius: '2px' };
const edgeW = { fontSize: '11px', color: 'var(--ink-dim)', minWidth: '45px', textAlign: 'right' };
