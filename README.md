# Anchor

**Causal Prompt Anchoring for business anomaly explanation**

Anchor answers one question: *why did this number change?* It takes a spreadsheet of business metrics over time, finds the anomalies, works out the causal relationships between the metrics, and writes a plain-English explanation. The catch that makes it different from asking a chatbot: every causal claim in that explanation has to map to a real, validated edge in the causal graph the system discovered from your data. The model is not allowed to invent reasons.

The idea is a split of labour. Statistics does the causal reasoning, which language models are bad at. The language model does the writing, which it is good at. Then a verification step checks the explanation claim by claim and reports the fraction that hold up, a score we call the Causal Grounding Rate.

<!-- Add a hero screenshot here -->
<!-- ![Anchor landing page](docs/images/landing.png) -->

---

## The Whole Pipeline

The backend runs a six-stage pipeline. Only the last stage touches a language model.

| Stage | What it does | Method |
|-------|--------------|--------|
| Decompose | Splits each metric into trend, season, and residual so surprises stand out | STL (LOESS) |
| Detect | Flags the residual points that don't fit, with a severity score | Isolation Forest |
| Discover | Builds a directed causal graph with weighted edges | PC algorithm, Granger causality, ACE |
| Trace | Walks backward from an anomaly to rank its real root causes | Contribution scoring (weight × deviation) |
| Explain | Writes the narrative, constrained to only cite discovered edges | CPA prompt (three blocks), then an LLM |
| Verify | Checks every causal claim against the graph | Assertion extraction and edge matching |

The full walkthrough of the maths, in plain language with diagrams, lives on the **Theory** page in the app itself.

<!-- Add a screenshot of the causal graph / dashboard here -->
<!-- ![Causal graph and results](docs/images/dashboard.png) -->

---

## Running it locally

You need Python 3.11, Node 18 or newer, and optionally an LLM API key if you want model-written narratives instead of the built-in template writer.

### Backend

```bash
cd backend

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

# optional: only needed if you want LLM-written narratives
cp .env.example .env            # then paste your key into .env

# optional: regenerate the sample dataset
python generate_sample_data.py

uvicorn main:app --reload --port 8000
```

Backend is now at `http://localhost:8000`, with interactive API docs at `/docs`.

> Note on Python versions: stick to **3.11**. FastAPI and Pydantic can break on 3.14.

### Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

### Try it

1. Click **Launch app**.
2. Upload `backend/sample_retail_data.csv`, or drop in your own CSV or Excel file with a date column and a few numeric metrics.
3. Pick the metric you want explained (Revenue in the sample).
4. Run the analysis.
5. Read the decomposition chart, the causal graph, the ranked root causes, and the grounded narrative with its CGR score.

If you skip the API key, the template writer fills in the same explanation structure. It is grounded by construction, so demos work with nothing to configure.

<!-- Add a screenshot of an uploaded result / narrative + CGR here -->
<!-- ![Narrative and CGR](docs/images/narrative.png) -->

---

## Deployment

The app splits cleanly into a static frontend and a Python backend.

- **Frontend** deploys to Vercel as a Vite app. Set the project's Root Directory to `frontend`. Point it at the backend with a `VITE_API_URL` environment variable (for example `https://your-backend.onrender.com`, no trailing slash).
- **Backend** deploys to Render as a web service. Root Directory `backend`, build `pip install -r requirements.txt`, start `uvicorn main:app --host 0.0.0.0 --port $PORT`.

A `render.yaml` and `vercel.json` are included to make both close to one-click.

<!-- Add a screenshot of the deployed site here if you like -->
<!-- ![Deployed](docs/images/deployed.png) -->

---

## Project layout

```
Anchor/
├── backend/
│   ├── main.py                   # FastAPI app and endpoints
│   ├── requirements.txt
│   ├── generate_sample_data.py   # sample data generator
│   ├── sample_retail_data.csv
│   └── pipeline/
│       ├── decomposition.py      # STL decomposition
│       ├── anomaly.py            # Isolation Forest
│       ├── causal.py            # PC, Granger, ACE
│       ├── tracing.py           # backward root-cause walk
│       ├── cpa.py               # CPA prompt and LLM call
│       └── cgr.py               # CGR verification
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── public/                   # favicons and static assets
│   └── src/
│       ├── main.jsx
│       ├── App.jsx               # routing and orchestration
│       ├── utils/api.js          # backend client
│       └── components/
│           ├── AuroraBackground.jsx
│           ├── Nav.jsx
│           ├── Hero.jsx
│           ├── UploadPanel.jsx
│           ├── ConfigPanel.jsx
│           ├── DecompChart.jsx
│           ├── CausalGraphPanel.jsx
│           ├── RootCausesPanel.jsx
│           ├── NarrativePanel.jsx
│           ├── Theory.jsx
│           └── ...
└── README.md
```

---

## API

| Method | Endpoint | What it returns |
|--------|----------|-----------------|
| GET | `/api/health` | Health check |
| POST | `/api/upload` | Uploads a CSV or Excel file, returns the inferred schema |
| POST | `/api/analyze` | Runs the full pipeline and returns every stage's output |
| POST | `/api/regenerate` | Re-runs narrative generation for the CGR feedback loop |

---

## A few things worth knowing

- Generative AI is used in exactly one place, the final narrative. Everything upstream is classical statistics. That is the whole point.
- Without a key, the template writer produces a fully grounded narrative, so nothing about the causal discovery, anomaly detection, tracing, or CGR depends on an external service.
- The sample dataset ships with a known ground-truth causal structure (see `generate_sample_data.py`), so you can confirm the pipeline recovers the right edges.
- On large files (100k rows and up), causal discovery can take 30 to 60 seconds.

---

## Screenshots

<!--
Drop your images in a docs/images/ folder and reference them here.
A three-up gallery reads well on GitHub:

| Landing | Dashboard | Theory |
|---------|-----------|--------|
| ![](docs/images/landing.png) | ![](docs/images/dashboard.png) | ![](docs/images/theory.png) |
-->

_Add screenshots here._

---

## Author

Built by Ritwik.

- GitHub: [@RitzwiK](https://github.com/RitzwiK)
- LinkedIn: [ritwikk03](https://linkedin.com/in/ritwikk03)
