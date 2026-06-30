import React, { useRef, useState } from 'react';

export default function UploadPanel({ onUploaded, uploadInfo }) {
  const ref = useRef(null);
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handle = async (file) => {
    if (!file) return;
    setLoading(true); setErr('');
    try {
      const f = new FormData(); f.append('file', file);
      const r = await fetch('/api/upload', { method: 'POST', body: f });
      if (!r.ok) throw new Error((await r.json()).detail);
      onUploaded(await r.json());
    } catch (e) { setErr(e.message); } finally { setLoading(false); }
  };

  if (uploadInfo) return (
    <div className="glass-hi" style={done}>
      <div style={doneLeft}>
        <div style={checkOrb}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 9l3.5 3.5L14 5.5" stroke="var(--good)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <div style={fname}>{uploadInfo.filename}</div>
          <div style={fmeta}>
            {uploadInfo.rows.toLocaleString()} rows · {uploadInfo.metric_cols.length} numeric metrics
            {uploadInfo.date_col && <> · {uploadInfo.date_col}</>}
          </div>
        </div>
      </div>
      <button style={changeBtn} onClick={()=>onUploaded(null)}>Change file</button>
    </div>
  );

  return (
    <div>
      <div
        className="glass"
        style={{
          ...zone,
          borderColor: drag ? 'var(--accent)' : 'var(--line-strong)',
          background: drag ? 'var(--accent-soft)' : 'var(--glass)',
        }}
        onDragOver={e=>{e.preventDefault(); setDrag(true);}}
        onDragLeave={()=>setDrag(false)}
        onDrop={e=>{e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]);}}
        onClick={()=>ref.current?.click()}
      >
        {loading ? (
          <>
            <div style={spinner} />
            <p style={ztitle}>Reading file…</p>
          </>
        ) : (
          <>
            <div style={iconWrap}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 4v16M7 11l7-7 7 7M5 24h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="serif" style={ztitle}>Drop your data here</p>
            <p style={zhint}>CSV or Excel file · or click to browse</p>
            <div style={formatsRow}>
              <span className="mono" style={fmtChip}>.csv</span>
              <span className="mono" style={fmtChip}>.xlsx</span>
              <span className="mono" style={fmtChip}>.xls</span>
            </div>
          </>
        )}
        <input ref={ref} type="file" accept=".csv,.xlsx,.xls" style={{display:'none'}}
          onChange={e=>handle(e.target.files[0])}/>
      </div>
      {err && <p style={errMsg}>{err}</p>}
    </div>
  );
}

const done = {
  padding: '20px 24px',
  borderRadius: 'var(--radius)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px',
};
const doneLeft = { display: 'flex', alignItems: 'center', gap: '14px' };
const checkOrb = {
  width: '40px', height: '40px', borderRadius: '50%',
  background: 'rgba(91,227,160,0.1)',
  border: '1px solid rgba(91,227,160,0.25)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const fname = { fontSize: '14px', color: 'var(--ink)', fontWeight: 500 };
const fmeta = { fontSize: '12px', color: 'var(--ink-faint)', marginTop: '2px' };
const changeBtn = {
  padding: '8px 16px', fontSize: '12px', fontWeight: 500,
  background: 'var(--glass-hi)', border: '1px solid var(--line-strong)',
  borderRadius: '999px', color: 'var(--ink-dim)',
  transition: 'all 0.2s',
};
const zone = {
  padding: '48px 24px',
  borderRadius: 'var(--radius-lg)',
  border: '1.5px dashed var(--line-strong)',
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', gap: '10px', cursor: 'pointer',
  transition: 'all 0.3s',
};
const iconWrap = {
  width: '56px', height: '56px', borderRadius: '16px',
  background: 'var(--glass-hi)', border: '1px solid var(--line-strong)',
  color: 'var(--ink-dim)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  marginBottom: '6px',
};
const ztitle = {
  fontSize: '22px', color: 'var(--ink)',
  fontWeight: 500, letterSpacing: '-0.02em',
};
const zhint = { fontSize: '13px', color: 'var(--ink-faint)' };
const formatsRow = { display: 'flex', gap: '6px', marginTop: '8px' };
const fmtChip = {
  fontSize: '11px', color: 'var(--ink-faint)',
  padding: '3px 10px', background: 'rgba(255,255,255,0.04)',
  borderRadius: '6px', border: '1px solid var(--line)',
};
const errMsg = {
  color: 'var(--bad)', fontSize: '13px',
  marginTop: '10px', padding: '10px 14px',
  background: 'rgba(255,125,138,0.08)',
  border: '1px solid rgba(255,125,138,0.2)',
  borderRadius: '10px',
};
const spinner = {
  width: '32px', height: '32px',
  border: '2px solid var(--line-strong)',
  borderTopColor: 'var(--accent)',
  borderRadius: '50%',
  animation: 'spin 0.7s linear infinite',
};
