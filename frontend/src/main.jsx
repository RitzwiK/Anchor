import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const globalCSS = `
  :root {
    --bg: #071018;
    --bg-2: #0c1424;
    --panel: #111827;
    --surface: #162235;
    --ink: #EEF5FF;
    --ink-dim: #94A3B8;
    --ink-faint: #647184;
    --line: rgba(97,218,251,0.15);
    --line-strong: rgba(97,218,251,0.28);
    --glass: rgba(97,218,251,0.04);
    --glass-hi: rgba(97,218,251,0.06);
    --accent: #61DAFB;
    --accent-2: #3B82F6;
    --accent-soft: rgba(97,218,251,0.14);
    --accent-glow: rgba(154,220,253,0.45);
    --warn: #ffb84d;
    --good: #5BE3A0;
    --bad: #ff7d8a;
    --radius-sm: 10px;
    --radius: 16px;
    --radius-lg: 22px;
    --serif: 'Fraunces', Georgia, serif;
    --sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --mono: 'JetBrains Mono', monospace;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--ink);
    font-family: var(--sans);
    font-weight: 400;
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
    min-height: 100vh;
  }

  /* Grain overlay */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' seed='5'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.08 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    opacity: 0.4;
    pointer-events: none;
    z-index: 2;
    mix-blend-mode: overlay;
  }
  /* (The WebGL Liquid Aurora component renders the atmospheric background at z-index 0.) */

  button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
  a { color: inherit; text-decoration: none; }
  input, select, textarea { font-family: inherit; }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
  ::selection { background: rgba(97,218,251,0.32); color: #fff; }

  /* ---------- Premium liquid glass ---------- */
  .glass {
    position: relative;
    background:
      linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 42%, rgba(255,255,255,0.03) 100%);
    backdrop-filter: blur(26px) saturate(1.7);
    -webkit-backdrop-filter: blur(26px) saturate(1.7);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    box-shadow:
      0 1px 0 0 rgba(255,255,255,0.08) inset,
      0 0 0 0.5px rgba(255,255,255,0.04) inset,
      0 24px 70px -28px rgba(0,0,0,0.7);
  }
  /* specular top edge highlight */
  .glass::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0) 38%, rgba(255,255,255,0) 70%, rgba(97,218,251,0.10));
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  .glass-hi {
    position: relative;
    background:
      linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.025) 45%, rgba(255,255,255,0.05) 100%);
    backdrop-filter: blur(34px) saturate(1.8);
    -webkit-backdrop-filter: blur(34px) saturate(1.8);
    border: 1px solid var(--line-strong);
    border-radius: var(--radius);
    box-shadow:
      0 1px 0 0 rgba(255,255,255,0.12) inset,
      0 0 0 0.5px rgba(255,255,255,0.05) inset,
      0 34px 90px -28px rgba(0,0,0,0.75);
  }
  .glass-hi::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg, rgba(255,255,255,0.26), rgba(255,255,255,0) 40%, rgba(255,255,255,0) 68%, rgba(97,218,251,0.14));
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  .serif { font-family: var(--serif); font-weight: 400; letter-spacing: -0.02em; }
  .mono { font-family: var(--mono); }

  /* Readability over the aurora: a soft cool drop-shadow on headings & key text.
     Subtle enough to be invisible on dark areas, but rescues text over bright ribbons. */
  h1, h2, h3 {
    text-shadow: 0 1px 2px rgba(4,9,16,0.55), 0 2px 14px rgba(4,9,16,0.35);
  }
  .text-legible {
    text-shadow: 0 1px 2px rgba(4,9,16,0.7), 0 2px 16px rgba(4,9,16,0.4);
  }

  /* Premium liquid-glass navbar — frostier, brighter rim, cool tint */
  .liquid-nav {
    position: relative;
    background:
      linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(97,218,251,0.035) 45%, rgba(255,255,255,0.05) 100%);
    backdrop-filter: blur(40px) saturate(1.9);
    -webkit-backdrop-filter: blur(40px) saturate(1.9);
    border: 1px solid rgba(255,255,255,0.10);
    box-shadow:
      0 1px 0 0 rgba(255,255,255,0.18) inset,
      0 0 0 0.5px rgba(154,220,253,0.06) inset,
      0 8px 40px -12px rgba(4,12,24,0.7),
      0 30px 60px -30px rgba(0,0,0,0.6);
  }
  .liquid-nav::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg, rgba(255,255,255,0.45), rgba(154,220,253,0.12) 35%, rgba(255,255,255,0) 60%, rgba(97,218,251,0.18));
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.05); }
  }
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes orbitDrift {
    0% { transform: translate(0,0) scale(1); }
    33% { transform: translate(30px,-20px) scale(1.05); }
    66% { transform: translate(-20px,15px) scale(0.97); }
    100% { transform: translate(0,0) scale(1); }
  }

  .fade-in { animation: fadeIn 0.6s ease both; }
  .fade-up { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

const style = document.createElement('style')
style.textContent = globalCSS
document.head.appendChild(style)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)
