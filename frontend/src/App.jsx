import React, { useState, useEffect } from 'react';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Problem from './components/Problem';
import HowItWorks from './components/HowItWorks';
import Trust from './components/Trust';
import UseCases from './components/UseCases';
import CTA from './components/CTA';
import UploadPanel from './components/UploadPanel';
import ConfigPanel from './components/ConfigPanel';
import KPICards from './components/KPICards';
import NarrativePanel from './components/NarrativePanel';
import RootCausesPanel from './components/RootCausesPanel';
import DecompChart from './components/DecompChart';
import CausalGraphPanel from './components/CausalGraphPanel';
import { runAnalysis, regenerateNarrative } from './utils/api';
import AuroraBackground from './components/AuroraBackground';
import Theory from './components/Theory';

export default function App() {
  const [mode, setMode] = useState('landing'); // 'landing' | 'theory' | 'dashboard'
  const [upload, setUpload] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showTech, setShowTech] = useState(false);

  const launchApp = () => {
    setMode('dashboard');
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  const goTheory = () => {
    setMode('theory');
    setTimeout(() => window.scrollTo({ top: 0 }), 30);
  };

  const goHome = (section) => {
    setMode('landing');
    setTimeout(() => {
      const id = typeof section === 'string' ? section : null;
      const el = id ? document.getElementById(id) : null;
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else window.scrollTo({ top: 0 });
    }, 60);
  };

  const backToLanding = () => {
    setMode('landing');
    setUpload(null);
    setResult(null);
    setError('');
    setShowTech(false);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  const handleAnalyze = async (cfg) => {
    setLoading(true);
    setError('');
    setResult(null);
    setApiKey(cfg.api_key || '');
    try {
      const data = await runAnalysis(cfg);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegen = async () => {
    try {
      const data = await regenerateNarrative(apiKey);
      setResult((p) => ({ ...p, narrative: data.narrative, cgr: data.cgr }));
    } catch (e) {
      setError(e.message);
    }
  };

  // Scroll reveal
  useEffect(() => {
    const els = document.querySelectorAll('.fade-up');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      },
      { threshold: 0.1, rootMargin: '-50px' }
    );
    els.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'all 0.8s cubic-bezier(0.16,1,0.3,1)';
      io.observe(el);
    });
    return () => io.disconnect();
  }, [mode, result]);

  if (mode === 'theory') {
    return (
      <>
        <AuroraBackground />
        <Theory onLaunch={launchApp} onHome={goHome} />
      </>
    );
  }

  if (mode === 'landing') {
    return (
      <>
        <AuroraBackground />
        <Nav onLaunch={launchApp} onTheory={goTheory} />
        <Hero onLaunch={launchApp} />
        <Problem />
        <HowItWorks />
        <Trust />
        <UseCases />
        <CTA onLaunch={launchApp} />
      </>
    );
  }

  // Dashboard mode
  return (
    <>
      <AuroraBackground />
      <nav style={dashNav}>
        <div className="liquid-nav" style={dashNavInner}>
          <button onClick={backToLanding} style={backBtn}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back to home</span>
          </button>
          <div style={dashBrand}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="var(--accent)" strokeWidth="1.5" fill="none" />
              <circle cx="12" cy="12" r="3" fill="var(--accent)" />
            </svg>
            <span className="serif" style={dashBrandTxt}>Anchor</span>
          </div>
          {result && (
            <div style={dashActions}>
              <button
                onClick={() => setShowTech(!showTech)}
                style={{
                  ...techToggle,
                  background: showTech ? 'var(--accent)' : 'transparent',
                  color: showTech ? 'var(--bg)' : 'var(--ink-dim)',
                  borderColor: showTech ? 'var(--accent)' : 'var(--line-strong)',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M4 1.5L1.5 4v4L4 10.5M8 1.5L10.5 4v4L8 10.5M5.5 3l-1 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {showTech ? 'Hide' : 'Show'} technical details
              </button>
              <button
                onClick={() => { setUpload(null); setResult(null); }}
                style={newBtn}
              >
                New analysis
              </button>
            </div>
          )}
          {!result && <div style={{ width: 100 }} />}
        </div>
      </nav>

      <main style={dashMain}>
        {/* Setup stage — upload + config */}
        {!result && (
          <div style={setupStage}>
            {!upload && (
              <div style={setupHero} className="fade-up">
                <div style={stepBadge}>
                  <span style={stepDot} />
                  <span>Step 1 of 2 · Upload</span>
                </div>
                <h1 className="serif" style={setupTitle}>
                  Let's find out <em style={{ fontStyle: 'italic', color: 'var(--ink-dim)' }}>why</em>.
                </h1>
                <p style={setupSub}>
                  Upload any CSV or Excel file with a date column and business metrics.
                  We'll handle the rest.
                </p>
              </div>
            )}

            {upload && !loading && (
              <div style={setupHero} className="fade-up">
                <div style={stepBadge}>
                  <span style={stepDot} />
                  <span>Step 2 of 2 · Configure</span>
                </div>
                <h1 className="serif" style={setupTitle}>Tell us what to look at.</h1>
              </div>
            )}

            <div style={setupGrid}>
              <div style={{ animation: 'fadeUp 0.6s ease' }}>
                <UploadPanel onUploaded={setUpload} uploadInfo={upload} />
              </div>
              {upload && (
                <div className="glass" style={configWrap}>
                  <ConfigPanel uploadInfo={upload} onAnalyze={handleAnalyze} loading={loading} />
                </div>
              )}
            </div>

            {/* Loading state */}
            {loading && (
              <div className="glass-hi" style={loadCard}>
                <div style={loadOrb}>
                  <div style={loadRing1} />
                  <div style={loadRing2} />
                  <div style={loadCore} />
                </div>
                <h3 className="serif" style={loadTitle}>Running the pipeline</h3>
                <p style={loadSub}>
                  Decomposing trends · Detecting anomalies · Discovering causal structure · Tracing root causes · Generating explanation
                </p>
                <div style={loadProgress}>
                  <div style={loadBar} />
                </div>
              </div>
            )}

            {error && (
              <div style={errCard}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7.5" stroke="var(--bad)" strokeWidth="1.5" />
                  <path d="M9 5v5M9 13h.01" stroke="var(--bad)" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        {/* Results stage */}
        {result && (
          <div style={resultsStage}>
            <div style={resultsHeader} className="fade-up">
              <div>
                <div style={resultsLabel}>
                  <span style={resultsLabelDot} />
                  Analysis complete
                </div>
                <h1 className="serif" style={resultsTitle}>
                  Here's what happened with{' '}
                  <em style={{ fontStyle: 'italic', color: 'var(--ink-dim)' }}>
                    {result.target_metric}
                  </em>.
                </h1>
              </div>
            </div>

            {/* Business view — always visible */}
            <div className="fade-up">
              <KPICards result={result} />
            </div>

            <div className="fade-up">
              <NarrativePanel
                narrative={result.narrative}
                cgr={result.cgr}
                onRegenerate={handleRegen}
              />
            </div>

            <div className="fade-up">
              <RootCausesPanel
                rootCauses={result.root_causes}
                targetMetric={result.target_metric}
              />
            </div>

            {/* Technical view — toggle */}
            {showTech && (
              <>
                <div style={techDivider} className="fade-up">
                  <div style={techDividerLine} />
                  <span style={techDividerLabel}>Technical details</span>
                  <div style={techDividerLine} />
                </div>

                <div className="fade-up">
                  <DecompChart
                    decomposition={result.decomposition}
                    anomalies={result.anomalies}
                    targetMetric={result.target_metric}
                  />
                </div>

                <div className="fade-up">
                  <CausalGraphPanel dag={result.causal_dag} />
                </div>

                <div className="glass fade-up" style={pipelinePanel}>
                  <div style={pipelineTop}>
                    <div style={resultsLabel}>
                      <span style={{ color: 'var(--accent)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
                        Pipeline output
                      </span>
                    </div>
                    <h3 className="serif" style={pipelineTitle}>
                      Raw metrics & Anchor prompt
                    </h3>
                  </div>

                  <div style={statsGrid}>
                    <div style={statRow}>
                      <span style={statLbl}>Target metric</span>
                      <span style={statVal}>{result.target_metric}</span>
                    </div>
                    <div style={statRow}>
                      <span style={statLbl}>Causal edges discovered</span>
                      <span style={statVal}>{result.causal_dag?.n_edges || 0}</span>
                    </div>
                    <div style={statRow}>
                      <span style={statLbl}>Total anomalies detected</span>
                      <span style={statVal}>{result.insights?.total_anomalies || 0}</span>
                    </div>
                    <div style={statRow}>
                      <span style={statLbl}>Causal Grounding Rate</span>
                      <span style={{ ...statVal, color: 'var(--accent)' }}>
                        {((result.cgr?.cgr || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div style={statRow}>
                      <span style={statLbl}>Assertions extracted</span>
                      <span style={statVal}>
                        {result.cgr?.total_assertions || 0} total · {result.cgr?.grounded || 0} grounded
                      </span>
                    </div>
                    <div style={statRow}>
                      <span style={statLbl}>Generation method</span>
                      <span style={statVal}>{result.narrative?.method || 'n/a'}</span>
                    </div>
                    {result.narrative?.prompt_tokens > 0 && (
                      <div style={statRow}>
                        <span style={statLbl}>Token usage</span>
                        <span style={statVal}>
                          {result.narrative.prompt_tokens} prompt · {result.narrative.completion_tokens} completion
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={promptSection}>
                    <div style={promptLabel}>
                      <span>Anchor Prompt sent to LLM</span>
                      <span style={promptHint}>Blocks A + B + C</span>
                    </div>
                    <pre style={promptBox}>{result.narrative?.cpa_prompt || 'No prompt available'}</pre>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </>
  );
}

// ── Dashboard nav styles ───────────────────────────────────────────────
const dashNav = {
  position: 'fixed',
  top: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 100,
  width: 'calc(100% - 40px)',
  maxWidth: '1180px',
  padding: '0 20px',
};
const dashNavInner = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 14px 10px 10px',
  borderRadius: '999px',
  gap: '16px',
};
const backBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 14px',
  fontSize: '13px',
  fontWeight: 500,
  color: 'var(--ink-dim)',
  borderRadius: '999px',
  transition: 'color 0.2s',
};
const dashBrand = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
};
const dashBrandTxt = { fontSize: '16px', fontWeight: 500, letterSpacing: '-0.02em' };
const dashActions = { display: 'flex', gap: '8px', alignItems: 'center' };
const techToggle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '7px 14px',
  fontSize: '12px',
  fontWeight: 500,
  borderRadius: '999px',
  border: '1px solid',
  transition: 'all 0.2s',
};
const newBtn = {
  padding: '8px 16px',
  fontSize: '12px',
  fontWeight: 500,
  color: 'var(--ink)',
  background: 'var(--glass)',
  border: '1px solid var(--line-strong)',
  borderRadius: '999px',
  transition: 'all 0.2s',
};

// ── Dashboard main ──────────────────────────────────────────────────────
const dashMain = {
  position: 'relative',
  zIndex: 2,
  maxWidth: '1140px',
  margin: '0 auto',
  padding: '110px 24px 80px',
};

// ── Setup stage ─────────────────────────────────────────────────────────
const setupStage = { display: 'flex', flexDirection: 'column', gap: '40px' };
const setupHero = { textAlign: 'center', marginBottom: '8px' };
const stepBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 14px',
  borderRadius: '999px',
  background: 'var(--glass)',
  border: '1px solid var(--line)',
  fontSize: '12px',
  color: 'var(--ink-dim)',
  fontWeight: 500,
  marginBottom: '20px',
};
const stepDot = {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: 'var(--accent)',
  boxShadow: '0 0 10px var(--accent)',
};
const setupTitle = {
  fontSize: 'clamp(38px, 6vw, 64px)',
  fontWeight: 400,
  letterSpacing: '-0.03em',
  lineHeight: 1.05,
  marginBottom: '14px',
};
const setupSub = {
  fontSize: '16px',
  color: 'var(--ink-dim)',
  maxWidth: '520px',
  margin: '0 auto',
  lineHeight: 1.6,
};
const setupGrid = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  maxWidth: '720px',
  margin: '0 auto',
  width: '100%',
};
const configWrap = {
  padding: '28px 32px',
  borderRadius: 'var(--radius-lg)',
  animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1)',
};

// ── Loading ─────────────────────────────────────────────────────────────
const loadCard = {
  padding: '48px 32px',
  borderRadius: 'var(--radius-lg)',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  maxWidth: '540px',
  margin: '0 auto',
};
const loadOrb = {
  position: 'relative',
  width: '80px',
  height: '80px',
  marginBottom: '8px',
};
const loadRing1 = {
  position: 'absolute',
  inset: 0,
  borderRadius: '50%',
  border: '2px solid var(--line-strong)',
  borderTopColor: 'var(--accent)',
  animation: 'spin 1.5s linear infinite',
};
const loadRing2 = {
  position: 'absolute',
  inset: '12px',
  borderRadius: '50%',
  border: '2px solid var(--line)',
  borderBottomColor: 'rgba(59,130,246,0.6)',
  animation: 'spin 2s linear infinite reverse',
};
const loadCore = {
  position: 'absolute',
  inset: '30px',
  borderRadius: '50%',
  background: 'var(--accent)',
  boxShadow: '0 0 30px var(--accent)',
  animation: 'pulseGlow 1.5s ease-in-out infinite',
};
const loadTitle = {
  fontSize: '24px',
  fontWeight: 400,
  letterSpacing: '-0.02em',
};
const loadSub = {
  fontSize: '13px',
  color: 'var(--ink-faint)',
  lineHeight: 1.7,
  maxWidth: '400px',
};
const loadProgress = {
  width: '100%',
  maxWidth: '300px',
  height: '3px',
  background: 'var(--line)',
  borderRadius: '2px',
  overflow: 'hidden',
  marginTop: '8px',
};
const loadBar = {
  height: '100%',
  width: '40%',
  background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.8s ease-in-out infinite',
  borderRadius: '2px',
};
const errCard = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '16px 20px',
  background: 'rgba(255,125,138,0.05)',
  border: '1px solid rgba(255,125,138,0.2)',
  borderRadius: 'var(--radius)',
  color: 'var(--bad)',
  fontSize: '14px',
  maxWidth: '540px',
  margin: '0 auto',
};

// ── Results stage ───────────────────────────────────────────────────────
const resultsStage = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
};
const resultsHeader = {
  marginBottom: '8px',
};
const resultsLabel = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '11px',
  color: 'var(--accent)',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  fontWeight: 500,
  marginBottom: '14px',
};
const resultsLabelDot = {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: 'var(--accent)',
  boxShadow: '0 0 10px var(--accent)',
};
const resultsTitle = {
  fontSize: 'clamp(36px, 5.5vw, 56px)',
  fontWeight: 400,
  letterSpacing: '-0.03em',
  lineHeight: 1.05,
  maxWidth: '800px',
};

// ── Technical divider ───────────────────────────────────────────────────
const techDivider = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  margin: '24px 0 8px',
};
const techDividerLine = {
  flex: 1,
  height: '1px',
  background: 'var(--line-strong)',
};
const techDividerLabel = {
  fontSize: '11px',
  color: 'var(--ink-faint)',
  textTransform: 'uppercase',
  letterSpacing: '0.14em',
  fontWeight: 500,
};

// ── Pipeline panel ──────────────────────────────────────────────────────
const pipelinePanel = {
  padding: '28px 32px',
  borderRadius: 'var(--radius-lg)',
};
const pipelineTop = { marginBottom: '20px' };
const pipelineTitle = {
  fontSize: '24px',
  fontWeight: 400,
  letterSpacing: '-0.02em',
  lineHeight: 1.1,
  marginTop: '4px',
};
const statsGrid = {
  display: 'flex',
  flexDirection: 'column',
  marginBottom: '24px',
};
const statRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 0',
  borderBottom: '1px solid var(--line)',
  fontSize: '13px',
};
const statLbl = { color: 'var(--ink-faint)' };
const statVal = {
  fontFamily: 'var(--mono)',
  color: 'var(--ink)',
  fontSize: '12px',
  fontWeight: 500,
};
const promptSection = {
  background: 'rgba(0,0,0,0.35)',
  border: '1px solid var(--line)',
  borderRadius: 'var(--radius)',
  padding: '16px 20px',
};
const promptLabel = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '11px',
  color: 'var(--ink-dim)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  fontWeight: 500,
  marginBottom: '10px',
};
const promptHint = {
  color: 'var(--accent)',
  background: 'var(--accent-soft)',
  padding: '2px 8px',
  borderRadius: '6px',
  fontSize: '10px',
};
const promptBox = {
  fontFamily: 'var(--mono)',
  fontSize: '11px',
  color: 'var(--ink-dim)',
  lineHeight: 1.6,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  maxHeight: '300px',
  overflowY: 'auto',
  margin: 0,
};
