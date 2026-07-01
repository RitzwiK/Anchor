
const BUILD_MARKER_V3 = 'anchor-live';
const BACKEND = 'https://anchor-6w4u.onrender.com';
const B = BACKEND + '/api';

export async function uploadFile(file) {
  const f = new FormData();
  f.append('file', file);
  const r = await fetch(`${B}/upload`, { method: 'POST', body: f });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Upload failed (${r.status}) from ${B}/upload :: ${txt.slice(0, 120)}`);
  }
  return r.json();
}

export async function runAnalysis(cfg) {
  const r = await fetch(`${B}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cfg),
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Analysis failed (${r.status}) :: ${txt.slice(0, 120)}`);
  }
  return r.json();
}

export async function regenerateNarrative(key) {
  const f = new FormData();
  f.append('api_key', key || '');
  const r = await fetch(`${B}/regenerate`, { method: 'POST', body: f });
  if (!r.ok) throw new Error(`Regenerate failed (${r.status})`);
  return r.json();
}

console.log('[Anchor] api.js', BUILD_MARKER_V3, '-> backend:', BACKEND);
