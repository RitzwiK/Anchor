# CPA — Causal Prompt Anchoring

**Grounding LLM-Generated Business Anomaly Explanations in Discovered Causal Structure**

A full-stack system that detects anomalies in business data, discovers causal relationships, and generates trustworthy natural-language explanations where every causal claim maps to a validated edge in the discovered causal graph.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (React + Vite)        :5173                   │
│  Upload → Config → Charts → DAG → Narrative + CGR       │
└─────────────────┬───────────────────────────────────────┘
                  │ /api proxy
┌─────────────────▼───────────────────────────────────────┐
│  Backend (FastAPI + Python)      :8000                   │
│                                                         │
│  Stage 1: STL Decomposition  (statsmodels)              │
│  Stage 2: Anomaly Detection  (Isolation Forest)         │
│  Stage 3: Causal Discovery   (PC + Granger + ACE)       │
│  Stage 4: Root-Cause Tracing (backward DAG walk)        │
│  Stage 5: CPA Generation    (LLM or template fallback)  │
│  Verify:  CGR Computation    (assertion extraction)      │
└─────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- (Optional) OpenAI API key for LLM-powered narratives

### 1. Clone / Navigate

```bash
cd cpa-project
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Linux/Mac
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# (Optional) Set OpenAI key
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Generate sample test data
python generate_sample_data.py

# Start the API server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend runs at **http://localhost:8000**.  
API docs at **http://localhost:8000/docs**.

### 3. Frontend Setup

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The frontend runs at **http://localhost:5173**.

### 4. Use It

1. Open **http://localhost:5173** in your browser
2. Upload `backend/sample_retail_data.csv` (or your own CSV/Excel)
3. Select **Revenue** as the target metric
4. Select the causal variables (all are selected by default)
5. (Optional) Paste your OpenAI API key — without it, the system uses a template-based fallback that still demonstrates the full pipeline
6. Click **Run CPA Analysis**
7. View results: decomposition chart, causal DAG, root causes, and the causally grounded narrative with CGR score

---

## Pipeline Stages

| Stage | What It Does | Method |
|-------|-------------|--------|
| **S1** | Decomposes time series into trend + seasonal + residual | STL (LOESS) |
| **S2** | Flags anomalous residuals with severity scores | Isolation Forest |
| **S3** | Discovers causal DAG with weighted edges | PC algorithm + Granger causality + ACE |
| **S4** | Traces anomaly backward through DAG parents | Contribution scoring (weight × deviation) |
| **S5** | Generates explanation constrained to DAG edges | CPA prompt (Blocks A+B+C) → LLM |
| **CGR** | Verifies every causal claim against the DAG | Dependency-parse extraction + edge matching |

---

## Key Files

```
cpa-project/
├── backend/
│   ├── main.py                   # FastAPI app + endpoints
│   ├── requirements.txt
│   ├── generate_sample_data.py   # Sample data generator
│   ├── .env.example
│   └── pipeline/
│       ├── decomposition.py      # Stage 1: STL
│       ├── anomaly.py            # Stage 2: Isolation Forest
│       ├── causal.py             # Stage 3: PC + Granger + ACE
│       ├── tracing.py            # Stage 4: Root-cause tracing
│       ├── cpa.py                # Stage 5: CPA prompt + LLM
│       └── cgr.py                # CGR verification
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx               # Main orchestrator
│       ├── utils/api.js          # API client
│       └── components/
│           ├── Header.jsx
│           ├── Upload.jsx
│           ├── ConfigPanel.jsx
│           ├── DecompChart.jsx
│           ├── CausalGraph.jsx
│           ├── RootCauses.jsx
│           └── Narrative.jsx
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/upload` | Upload CSV/Excel, returns schema info |
| POST | `/api/analyze` | Run full CPA pipeline |
| GET | `/api/result` | Get last analysis result |
| POST | `/api/regenerate` | Re-run narrative generation (CGR feedback loop) |

---

## Notes

- **Without an OpenAI key**, the system generates a template-based narrative using the same CPA structure. The causal discovery, anomaly detection, root-cause tracing, and CGR verification all work fully without any API key.
- **With an OpenAI key**, narratives are generated by GPT-4o-mini constrained by the CPA prompt (Blocks A+B+C).
- The sample dataset has a **known ground-truth causal structure** (see `generate_sample_data.py`) so you can verify that the pipeline discovers the correct edges.
- For large datasets (100k+ rows), causal discovery may take 30-60 seconds.
