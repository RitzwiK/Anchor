const B = (import.meta.env.VITE_API_URL || 'https://anchor-6w4u.onrender.com') + '/api';

export async function uploadFile(file) {
  const f = new FormData();
  f.append('file', file);
  const r = await fetch(`${B}/upload`, { method: 'POST', body: f });
  if (!r.ok) throw new Error((await r.json()).detail || 'Upload failed');
  return r.json();
}

export async function runAnalysis(cfg) {
  const r = await fetch(`${B}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cfg),
  });
  if (!r.ok) throw new Error((await r.json()).detail || 'Analysis failed');
  return r.json();
}

export async function regenerateNarrative(key) {
  const f = new FormData();
  f.append('api_key', key || '');
  const r = await fetch(`${B}/regenerate`, { method: 'POST', body: f });
  if (!r.ok) throw new Error((await r.json()).detail || 'Failed');
  return r.json();
}