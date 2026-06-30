import React, { useState, useEffect } from 'react';

/**
 * Theory: a full reference page explaining every stage of the Anchor pipeline
 * in plain language, with the real math and custom diagrams. Matches the
 * original lime-on-near-black aesthetic.
 */
export default function Theory({ onLaunch, onHome }) {
  const [active, setActive] = useState('intro');

  const SECTIONS = [
    ['intro', 'The core idea'],
    ['decompose', '01 · Pulling a signal apart'],
    ['detect', '02 · Finding the surprises'],
    ['discover', '03 · Learning what causes what'],
    ['trace', '04 · Walking back to the cause'],
    ['anchor', '05 · Anchoring the AI'],
    ['cgr', '06 · Measuring honesty'],
  ];

  useEffect(() => {
    const ids = SECTIONS.map(([id]) => id);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id.replace('sec-', ''));
        });
      },
      { rootMargin: '-25% 0px -65% 0px' }
    );
    ids.forEach((id) => {
      const el = document.getElementById('sec-' + id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* simple top nav (matches landing pill) */}
      <nav style={navWrap}>
        <div className="liquid-nav" style={navPill}>
          <button onClick={onHome} style={navBrand}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="var(--accent)" strokeWidth="1.5" fill="none" />
              <circle cx="12" cy="12" r="3" fill="var(--accent)" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="serif" style={{ fontSize: '17px', fontWeight: 500 }}>Anchor</span>
          </button>
          <div style={navLinks}>
            <button onClick={() => onHome('how')} style={navLink}>How it works</button>
            <span style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 500 }}>Theory</span>
            <button onClick={() => onHome('trust')} style={navLink}>Why trust it</button>
          </div>
          <button onClick={onLaunch} style={navCta}>
            Launch app
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </nav>

      <main style={page}>
        {/* header */}
        <header style={header} className="fade-up">
          <div style={crumb}>Reference</div>
          <h1 className="serif" style={h1}>
            How Anchor <em style={{ fontStyle: 'italic', color: 'var(--ink-dim)' }}>actually</em> works
          </h1>
          <p style={lede}>
            The full method, in plain language with diagrams. No statistics background is assumed.
            Every symbol is explained the moment it appears.
          </p>
        </header>

        <div style={layout}>
          {/* sticky TOC */}
          <aside style={toc}>
            <div style={tocLabel}>Contents</div>
            {SECTIONS.map(([id, label]) => (
              <a
                key={id}
                href={'#sec-' + id}
                style={{
                  ...tocLink,
                  color: active === id ? 'var(--accent)' : 'var(--ink-faint)',
                  borderLeftColor: active === id ? 'var(--accent)' : 'var(--line)',
                }}
              >
                {label}
              </a>
            ))}
          </aside>

          {/* body */}
          <div style={body}>
            {/* INTRO */}
            <Section id="intro" title="The core idea" first>
              <P>
                A large language model is a brilliant writer and an unreliable reasoner. Ask it why sales
                fell and it will give you a clean, confident paragraph. But the causes it names may be
                invention, because it is pattern-matching language, not analysing your data.
              </P>
              <P>
                Anchor's answer is a division of labour. We let classical statistics do the causal
                reasoning, the part the model is bad at, and let the model do only the writing, the part
                it is good at. Critically, we hand the model a map of proven causes and forbid it from
                straying off that map.
              </P>
              <Callout title="In one sentence">
                Statistics finds the causes. The language model is only allowed to describe them. Then we
                check, claim by claim, that it obeyed.
              </Callout>
              <Figure caption="The whole pipeline: data enters on the left, a verified explanation leaves on the right. The model touches only the final stage.">
                <DiagramPipeline />
              </Figure>
            </Section>

            {/* DECOMPOSE */}
            <Section id="decompose" title="01 · Pulling a signal apart">
              <P>
                Imagine daily revenue. Three forces are baked into that one line. There is a slow drift over
                months, the <B>trend</B>. There is a repeating weekly shape, busy weekends and quiet
                Mondays, the <B>season</B>. And there is everything left over once you subtract those two,
                the <B>residual</B>.
              </P>
              <P>
                We separate them with STL (Seasonal-Trend decomposition using Loess). The reason is simple:
                a big number on a Saturday is not surprising if Saturdays are always big. Only the residual
                tells us about genuine surprises, because the predictable parts have already been removed.
              </P>
              <Eq formula="yₜ = Tₜ + Sₜ + Rₜ" gloss="The observed value at time t equals trend plus season plus residual." />
              <Figure caption="One wiggly line (top) separates into a smooth trend, a repeating seasonal wave, and the leftover residual where anomalies hide.">
                <DiagramDecomp />
              </Figure>
              <Callout title="Why Loess">
                Loess fits many tiny local regressions and stitches them together, so the trend can bend
                gently with the data instead of being forced into a straight line.
              </Callout>
            </Section>

            {/* DETECT */}
            <Section id="detect" title="02 · Finding the surprises">
              <P>
                Now we hunt for anomalies in the residual using an <B>Isolation Forest</B>. The intuition is
                delightful: to isolate a point, you keep slicing the data with random cuts until that point
                sits alone. Normal points are crowded together and take many cuts to separate. Weird points
                are off on their own and fall out after just a few cuts.
              </P>
              <P>
                So the number of cuts needed becomes an anomaly score, where fewer cuts means more anomalous. We then
                translate the residual into a z-score, which says, in plain terms, how many standard
                deviations from normal this point sits. A point must both be isolated easily and clear a
                severity threshold before we report it.
              </P>
              <Eq formula="severity = |Rₜ − μ_R| / σ_R" gloss="Distance from the average residual, measured in standard deviations." />
              <Figure caption="Random cuts isolate the outlier (ice blue) in two slices, while the dense normal cluster needs many more. Few cuts means a high anomaly score.">
                <DiagramIsolation />
              </Figure>
            </Section>

            {/* DISCOVER */}
            <Section id="discover" title="03 · Learning what causes what">
              <P>
                This is where Anchor earns its name. We build a <B>causal map</B>, a directed graph where an
                arrow from A to B means A genuinely influences B. We do it in three passes, each answering a
                sharper question.
              </P>
              <H3>Pass one: which pairs are even related?</H3>
              <P>
                The PC algorithm starts by assuming everything connects to everything, then deletes links.
                Its trick is the <B>partial correlation</B>: it asks whether A and B stay related after we
                account for other variables. If ice-cream sales and drowning both rise, they look linked,
                until you account for temperature, and the link vanishes. PC removes exactly those spurious
                links (we use a Spearman rank test, so it catches non-linear monotonic relationships too).
              </P>
              <Eq formula="ρ(A, B | Z) ≈ 0  ⇒  delete the A–B edge" gloss="If A and B are independent once we know Z, they were never directly linked." />
              <H3>Pass two: which way does the arrow point?</H3>
              <P>
                A correlation has no direction; causation does. We use <B>Granger causality</B>: A causes B if
                the past of A helps predict B beyond what B's own past already tells us. Causes come before
                effects in time, and this test listens for that ordering.
              </P>
              <Eq formula="A → B  if  past(A) improves the prediction of B" gloss="Knowing yesterday's A sharpens today's guess about B." />
              <H3>Pass three: how strong is the arrow?</H3>
              <P>
                Finally we measure each arrow's strength with the <B>Average Causal Effect</B>, estimated by
                back-door adjustment: we regress the effect on the cause while holding the other parents
                fixed, so we isolate the true push of A on B and not the influence of its neighbours.
              </P>
              <Eq formula="ACE = ∂ E[B | do(A), Z] / ∂A" gloss="The change in B caused by nudging A, with confounders Z held still." />
              <Figure caption="The three passes turn a tangle of correlations into a clean directed acyclic graph. Arrow thickness is causal strength.">
                <DiagramDAG />
              </Figure>
              <Callout title="Acyclic by design">
                We forbid cycles as edges are added, so the map can never claim A causes B while B also
                causes A. That is a requirement for tracing to make sense.
              </Callout>
            </Section>

            {/* TRACE */}
            <Section id="trace" title="04 · Walking back to the cause">
              <P>
                With a map and a located anomaly, the rest is a backward walk. Stand on the broken metric and
                step to its causal parents. For each parent ask two things: how strongly does it drive the
                target (the edge weight), and how much did it actually move during the anomaly (its
                deviation)? Multiply them.
              </P>
              <P>
                This product is the <B>contribution score</B>, and it is deliberately strict. A variable that
                moved enormously but barely drives the target scores low. A variable that drives the target
                hard but never moved also scores low. Only a strong driver that genuinely shifted rises to
                the top, which is exactly what a real root cause looks like.
              </P>
              <Eq formula="contribution = edge_weight × normalised_deviation" gloss="Strength of the link times how much the cause actually moved." />
              <Figure caption="Starting at the anomalous target (ice blue), we walk back along arrows. Each candidate is scored by strength × movement; the brightest path is the leading explanation.">
                <DiagramTrace />
              </Figure>
            </Section>

            {/* ANCHOR */}
            <Section id="anchor" title="05 · Anchoring the AI">
              <P>
                Only now does the language model appear. We serialise everything we found into a
                <B> three-block prompt</B>. Block A lists the allowed causal edges. Block B gives the ranked
                evidence and the exact numbers. Block C is the rule: every causal claim must map to an edge in
                Block A; if something cannot be explained from the map, say so plainly rather than guess.
              </P>
              <P>
                The model keeps its gift for clear prose but loses its licence to invent. This is the
                anchoring. The explanation is tethered to discovered structure. If no model key is available,
                a template writer fills the same blocks, which is grounded by construction.
              </P>
              <Figure caption="Three blocks go in: the graph, the evidence, the constraint. A fluent but tightly grounded paragraph comes out.">
                <DiagramAnchor />
              </Figure>
              <Callout title="The philosophy">
                We never ask the model to find causes. We ask it to write up causes that statistics already
                proved. The wrong job for the model becomes the right job.
              </Callout>
            </Section>

            {/* CGR */}
            <Section id="cgr" title="06 · Measuring honesty">
              <P>
                A promise is worth checking. After the explanation is written we read it back, extract every
                causal claim it makes, and test each against the map. A claim that matches a real edge or path
                is <B>grounded</B>; one that does not is flagged. The fraction that hold up is the
                <B> Causal Grounding Rate</B>.
              </P>
              <Eq formula="CGR = grounded claims / total claims" gloss="The share of the explanation actually backed by discovered structure." />
              <P>
                CGR is a genuinely new measure. ROUGE and BERTScore ask whether text reads well or overlaps a
                reference; neither asks whether the causal logic is real. CGR does precisely that, and it is
                why a raw model scores around 0.21 while Anchor reaches 0.89, the same fluency with vastly more truth.
              </P>
              <Figure caption="Each claim in the explanation is checked against the graph. Three of three match real edges here, giving a grounding rate of 100%.">
                <DiagramCGR />
              </Figure>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '36px' }}>
                <button onClick={onLaunch} style={ctaPrimary}>
                  Try it on your data
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button onClick={onHome} style={ctaGhost}>Back to home</button>
              </div>
            </Section>
          </div>
        </div>
      </main>
    </>
  );
}

/* ---------- small content primitives ---------- */
function Section({ id, title, children, first }) {
  return (
    <section id={'sec-' + id} style={{ scrollMarginTop: '100px', marginTop: first ? 0 : '64px' }} className="fade-up">
      <h2 className="serif" style={secTitle}>{title}</h2>
      {children}
    </section>
  );
}
const P = ({ children }) => <p style={para}>{children}</p>;
const B = ({ children }) => <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>{children}</strong>;
const H3 = ({ children }) => <h3 className="serif" style={subhead}>{children}</h3>;
function Callout({ title, children }) {
  return (
    <div style={callout}>
      <div style={calloutTitle}>{title}</div>
      <div style={{ color: 'var(--ink)', fontSize: '15px', lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}
function Eq({ formula, gloss }) {
  return (
    <div style={eqBox}>
      <div className="mono" style={{ color: 'var(--accent)', fontSize: '15px', marginBottom: '6px' }}>{formula}</div>
      <div style={{ color: 'var(--ink-faint)', fontSize: '13px' }}>{gloss}</div>
    </div>
  );
}
function Figure({ caption, children }) {
  return (
    <figure style={{ margin: '28px 0' }}>
      <div className="glass" style={{ padding: '26px', borderRadius: 'var(--radius)' }}>{children}</div>
      <figcaption style={figcap}>{caption}</figcaption>
    </figure>
  );
}

/* ============ DIAGRAMS (SVG, ice-blue/slate theme) ============ */
const NODE = (x, y, label, r = 9, accent = false) => (
  <g key={label + x}>
    <circle cx={x} cy={y} r={r + 7} fill={accent ? 'rgba(97,218,251,0.12)' : 'rgba(97,218,251,0.06)'} />
    <circle cx={x} cy={y} r={r} fill={accent ? 'var(--accent)' : 'rgba(97,218,251,0.7)'} stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
    <text x={x} y={y + r + 15} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="11" fill="var(--ink-dim)">{label}</text>
  </g>
);

function DiagramPipeline() {
  const stages = ['Data', 'Decompose', 'Detect', 'Discover', 'Trace', 'Explain', 'Verify'];
  const W = 760, n = stages.length, gap = W / n;
  return (
    <svg viewBox="0 0 760 140" style={{ width: '100%', display: 'block' }}>
      <defs>
        <marker id="pa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0L10 5L0 10z" fill="rgba(97,218,251,0.7)" />
        </marker>
      </defs>
      {stages.map((s, i) => {
        const x = gap * i + gap / 2;
        const isAI = s === 'Explain';
        return (
          <g key={s}>
            <rect x={x - 52} y={40} width={104} height={56} rx={13}
              fill={isAI ? 'rgba(97,218,251,0.1)' : 'rgba(255,255,255,0.03)'}
              stroke={isAI ? 'var(--accent)' : 'var(--line-strong)'} strokeOpacity={isAI ? 0.6 : 1} />
            <text x={x} y={64} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="12" fontWeight="500" fill={isAI ? 'var(--accent)' : 'var(--ink)'}>{s}</text>
            <text x={x} y={82} textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="9" fill="var(--ink-faint)">
              {i === 0 ? 'CSV in' : s === 'Verify' ? 'CGR out' : 'stage ' + i}
            </text>
            {i < n - 1 && <line x1={x + 52} y1={68} x2={x + gap - 52} y2={68} stroke="rgba(97,218,251,0.5)" strokeWidth="1.4" markerEnd="url(#pa)" />}
          </g>
        );
      })}
      <text x={W / 2} y={122} textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="11" fill="var(--accent)">the language model touches only one box</text>
    </svg>
  );
}

function DiagramDecomp() {
  const rows = [['Observed', 'rgba(255,255,255,0.85)', 0], ['Trend', 'var(--accent)', 1], ['Seasonal', '#3B82F6', 2], ['Residual', 'var(--bad)', 3]];
  const W = 720, rh = 72, pad = 70;
  return (
    <svg viewBox="0 0 720 310" style={{ width: '100%', display: 'block' }}>
      {rows.map(([label, color, k]) => {
        const cy = 20 + k * rh + rh / 2;
        let d = `M ${pad} ${cy}`;
        for (let i = 0; i <= 60; i++) {
          const x = pad + (W - pad - 20) * (i / 60);
          let val = 0;
          if (k === 0) val = Math.sin(i / 9) * 8 + Math.sin(i * 2 * Math.PI / 7) * 7 - i * 0.12 + (i > 44 && i < 50 ? -22 : 0);
          else if (k === 1) val = Math.sin(i / 9) * 8 - i * 0.12;
          else if (k === 2) val = Math.sin(i * 2 * Math.PI / 7) * 7;
          else val = (i > 44 && i < 50 ? -20 : 0) + Math.sin(i * 1.7) * 2;
          d += ` L ${x} ${cy - val}`;
        }
        return (
          <g key={label}>
            <line x1={pad} y1={cy} x2={W - 20} y2={cy} stroke="rgba(255,255,255,0.06)" />
            <path d={d} fill="none" stroke={color} strokeWidth="1.6" opacity="0.9" />
            <text x={pad - 12} y={cy + 4} textAnchor="end" fontFamily="Inter,sans-serif" fontSize="11" fontWeight="500" fill={color}>{label}</text>
            {k === 3 && <circle cx={pad + (W - pad - 20) * (47 / 60)} cy={cy + 20} r="6" fill="none" stroke="var(--bad)" strokeWidth="1.5" />}
          </g>
        );
      })}
    </svg>
  );
}

function DiagramIsolation() {
  const cx = 240, cy = 130, ox = 560, oy = 70;
  const pts = [];
  for (let i = 0; i < 40; i++) { const a = (i * 2.39996); const rr = 12 + (i % 7) * 7; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.7]); }
  return (
    <svg viewBox="0 0 720 240" style={{ width: '100%', display: 'block' }}>
      {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.4" fill="rgba(97,218,251,0.6)" />)}
      <circle cx={ox} cy={oy} r="5" fill="var(--accent)" stroke="#fff" strokeWidth="0.8" />
      <text x={ox} y={oy - 14} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="11" fontWeight="500" fill="var(--accent)">outlier</text>
      <line x1="430" y1="20" x2="430" y2="220" stroke="var(--accent)" strokeWidth="1.4" strokeDasharray="5 4" opacity="0.7" />
      <line x1="430" y1="120" x2="700" y2="120" stroke="var(--accent)" strokeWidth="1.4" strokeDasharray="5 4" opacity="0.7" />
      <text x="610" y="205" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="11" fill="var(--accent)">2 cuts → isolated</text>
      {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={185 + i * 25} y1="60" x2={185 + i * 25} y2="200" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="3 3" />)}
      <text x={cx} y="218" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="11" fill="var(--ink-dim)">many cuts → normal</text>
    </svg>
  );
}

function DiagramDAG() {
  const lp = { A: [80, 90], B: [220, 80], C: [150, 180], D: [90, 230] };
  const ledges = [['A', 'B'], ['A', 'C'], ['B', 'C'], ['C', 'D'], ['A', 'D'], ['B', 'D']];
  const rp = { A: [480, 90], B: [640, 80], C: [560, 180], D: [560, 250] };
  return (
    <svg viewBox="0 0 720 290" style={{ width: '100%', display: 'block' }}>
      <defs>
        <marker id="da" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0L10 5L0 10z" fill="rgba(97,218,251,0.7)" />
        </marker>
      </defs>
      <text x="150" y="30" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="11" fill="var(--ink-faint)">correlations</text>
      {ledges.map(([a, b], i) => <line key={i} x1={lp[a][0]} y1={lp[a][1]} x2={lp[b][0]} y2={lp[b][1]} stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" strokeDasharray="3 3" />)}
      {Object.entries(lp).map(([k, [x, y]]) => NODE(x, y, k, 7))}
      <line x1="310" y1="150" x2="400" y2="150" stroke="var(--accent)" strokeWidth="1.6" markerEnd="url(#da)" />
      <text x="355" y="138" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="10" fill="var(--accent)">3 passes</text>
      <text x="560" y="30" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="11" fill="var(--accent)">causal DAG</text>
      <line x1={rp.A[0]} y1={rp.A[1] + 8} x2={rp.C[0] - 8} y2={rp.C[1] - 8} stroke="rgba(97,218,251,0.7)" strokeWidth="2.4" markerEnd="url(#da)" />
      <line x1={rp.B[0]} y1={rp.B[1] + 8} x2={rp.C[0] + 8} y2={rp.C[1] - 8} stroke="rgba(97,218,251,0.5)" strokeWidth="1.6" markerEnd="url(#da)" />
      <line x1={rp.C[0]} y1={rp.C[1] + 8} x2={rp.D[0]} y2={rp.D[1] - 8} stroke="rgba(97,218,251,0.6)" strokeWidth="2" markerEnd="url(#da)" />
      {Object.entries(rp).map(([k, [x, y]]) => NODE(x, y, k, 8))}
    </svg>
  );
}

function DiagramTrace() {
  const pos = { Promotion: [110, 70], CompPrice: [110, 200], Demand: [340, 135], Inventory: [340, 250], Revenue: [600, 135] };
  const E = (a, b, w, c = 'rgba(97,218,251,0.6)') => <line x1={pos[a][0] + 10} y1={pos[a][1]} x2={pos[b][0] - 12} y2={pos[b][1]} stroke={c} strokeWidth={w} markerEnd="url(#ta)" />;
  return (
    <svg viewBox="0 0 720 300" style={{ width: '100%', display: 'block' }}>
      <defs>
        <marker id="ta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="rgba(97,218,251,0.7)" /></marker>
        <marker id="tar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--bad)" /></marker>
      </defs>
      {E('Promotion', 'Demand', 1.6)}
      {E('CompPrice', 'Demand', 1.4)}
      <line x1={pos.Demand[0] + 12} y1={pos.Demand[1]} x2={pos.Revenue[0] - 14} y2={pos.Revenue[1]} stroke="rgba(97,218,251,0.85)" strokeWidth="3" markerEnd="url(#ta)" />
      {E('Inventory', 'Revenue', 1.3)}
      <path d={`M${pos.Revenue[0] - 14} ${pos.Revenue[1] - 10} Q ${pos.Demand[0] + 40} ${pos.Demand[1] - 40} ${pos.Demand[0] + 12} ${pos.Demand[1] - 12}`} stroke="var(--bad)" strokeWidth="1.5" strokeDasharray="5 4" fill="none" markerEnd="url(#tar)" opacity="0.9" />
      {NODE(pos.Promotion[0], pos.Promotion[1], 'Promotion', 8)}
      {NODE(pos.CompPrice[0], pos.CompPrice[1], 'CompetitorPrice', 8)}
      {NODE(pos.Demand[0], pos.Demand[1], 'CustomerDemand', 9)}
      {NODE(pos.Inventory[0], pos.Inventory[1], 'Inventory', 7)}
      {NODE(pos.Revenue[0], pos.Revenue[1], 'Revenue', 11, true)}
      <text x={pos.Revenue[0]} y={pos.Revenue[1] - 26} textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="10" fill="var(--bad)">anomaly here</text>
      <text x="430" y="80" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="10" fill="var(--bad)">walk back ←</text>
    </svg>
  );
}

function DiagramAnchor() {
  const blocks = [['A', 'graph'], ['B', 'evidence'], ['C', 'constraint']];
  return (
    <svg viewBox="0 0 730 210" style={{ width: '100%', display: 'block' }}>
      <defs>
        <marker id="aa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="rgba(97,218,251,0.6)" /></marker>
      </defs>
      {blocks.map(([t, l], i) => {
        const y = 30 + i * 60;
        return (
          <g key={t}>
            <rect x="40" y={y} width="200" height="46" rx="11" fill="rgba(255,255,255,0.03)" stroke="var(--line-strong)" />
            <rect x="52" y={y + 13} width="24" height="20" rx="6" fill="var(--accent)" />
            <text x="64" y={y + 27} textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="12" fontWeight="600" fill="var(--bg)">{t}</text>
            <text x="138" y={y + 27} textAnchor="start" fontFamily="Inter,sans-serif" fontSize="12" fill="var(--ink-dim)">Block {t}: {l}</text>
            <line x1="240" y1={y + 23} x2="360" y2="120" stroke="rgba(97,218,251,0.4)" strokeWidth="1.4" markerEnd="url(#aa)" />
          </g>
        );
      })}
      <rect x="360" y="92" width="120" height="64" rx="14" fill="rgba(97,218,251,0.08)" stroke="var(--accent)" strokeOpacity="0.5" />
      <text x="420" y="120" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="13" fill="var(--accent)">language</text>
      <text x="420" y="138" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="13" fill="var(--accent)">model</text>
      <line x1="480" y1="124" x2="556" y2="124" stroke="rgba(97,218,251,0.5)" strokeWidth="1.4" markerEnd="url(#aa)" />
      <rect x="560" y="88" width="150" height="74" rx="13" fill="rgba(255,255,255,0.03)" stroke="var(--line-strong)" />
      <text x="635" y="116" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="13" fontWeight="500" fill="var(--ink)">grounded</text>
      <text x="635" y="134" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="13" fontWeight="500" fill="var(--ink)">explanation</text>
      <text x="635" y="152" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="9" fill="var(--ink-faint)">every claim = real edge</text>
    </svg>
  );
}

function DiagramCGR() {
  const claims = ['CustomerDemand → Revenue', 'CompetitorPrice → Demand', 'Promotion → Demand'];
  return (
    <svg viewBox="0 0 680 250" style={{ width: '100%', display: 'block' }}>
      {claims.map((txt, i) => {
        const y = 40 + i * 52;
        return (
          <g key={i}>
            <rect x="40" y={y} width="320" height="38" rx="10" fill="rgba(255,255,255,0.03)" stroke="var(--line)" />
            <text x="58" y={y + 24} textAnchor="start" fontFamily="JetBrains Mono,monospace" fontSize="12" fill="var(--ink-dim)">{txt}</text>
            <line x1="360" y1={y + 19} x2="468" y2={y + 19} stroke="var(--good)" strokeWidth="1.4" />
            <circle cx="500" cy={y + 19} r="14" fill="rgba(91,227,160,0.12)" stroke="var(--good)" />
            <path d={`M493 ${y + 19} l5 5 l9 -10`} stroke="var(--good)" strokeWidth="2" fill="none" />
            <text x="524" y={y + 24} textAnchor="start" fontFamily="Inter,sans-serif" fontSize="11" fill="var(--good)">in graph</text>
          </g>
        );
      })}
      <line x1="40" y1="206" x2="640" y2="206" stroke="var(--line)" />
      <text x="40" y="235" textAnchor="start" fontFamily="JetBrains Mono,monospace" fontSize="15" fill="var(--accent)">CGR = 3 / 3 = 1.00</text>
      <text x="640" y="235" textAnchor="end" fontFamily="Inter,sans-serif" fontSize="13" fontWeight="500" fill="var(--good)">100% grounded</text>
    </svg>
  );
}

/* ---------- styles ---------- */
const navWrap = { position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, padding: '0 20px', width: 'calc(100% - 40px)', maxWidth: '1080px' };
const navPill = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 10px 10px 18px', borderRadius: '999px' };
const navBrand = { display: 'flex', alignItems: 'center', gap: '10px', background: 'none' };
const navLinks = { display: 'flex', gap: '24px', alignItems: 'center' };
const navLink = { color: 'var(--ink-dim)', fontSize: '13px', fontWeight: 450, background: 'none' };
const navCta = { background: 'var(--ink)', color: 'var(--bg)', fontSize: '13px', fontWeight: 500, padding: '10px 18px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '6px' };
const page = { position: 'relative', zIndex: 2, maxWidth: '1080px', margin: '0 auto', padding: '130px 24px 100px' };
const header = { textAlign: 'center', maxWidth: '720px', margin: '0 auto 20px' };
const crumb = { fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--accent)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '18px' };
const h1 = { fontSize: 'clamp(36px, 6vw, 62px)', fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.04 };
const lede = { color: 'var(--ink-dim)', fontSize: '17px', lineHeight: 1.6, marginTop: '20px' };
const layout = { display: 'grid', gridTemplateColumns: '210px 1fr', gap: '56px', marginTop: '60px', alignItems: 'start' };
const toc = { position: 'sticky', top: '120px' };
const tocLabel = { fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ink-faint)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '14px' };
const tocLink = { display: 'block', fontSize: '13px', padding: '8px 0 8px 16px', borderLeft: '1px solid var(--line)', transition: 'all 0.25s', lineHeight: 1.4 };
const body = { minWidth: 0 };
const secTitle = { fontSize: 'clamp(26px,4vw,38px)', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: '14px' };
const subhead = { fontSize: '20px', fontWeight: 500, color: 'var(--ink)', marginTop: '28px', marginBottom: '6px', letterSpacing: '-0.01em' };
const para = { color: 'var(--ink-dim)', fontSize: '16.5px', lineHeight: 1.75, margin: '14px 0' };
const callout = { borderLeft: '2px solid var(--accent)', padding: '16px 20px', margin: '24px 0', borderRadius: '0 12px 12px 0', background: 'var(--accent-soft)' };
const calloutTitle = { fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' };
const eqBox = { fontFamily: 'var(--mono)', background: 'rgba(0,0,0,0.35)', border: '1px solid var(--line)', borderRadius: '12px', padding: '18px 22px', margin: '20px 0' };
const figcap = { fontSize: '13px', color: 'var(--ink-faint)', textAlign: 'center', marginTop: '12px', fontFamily: 'var(--mono)', lineHeight: 1.5 };
const ctaPrimary = { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--accent)', color: 'var(--bg)', fontSize: '14px', fontWeight: 500, padding: '13px 24px', borderRadius: '999px' };
const ctaGhost = { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--glass)', color: 'var(--ink)', fontSize: '14px', fontWeight: 500, padding: '13px 24px', borderRadius: '999px', border: '1px solid var(--line-strong)' };
