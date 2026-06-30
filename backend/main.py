"""
CPA — Causal Prompt Anchoring API
"""
import os, io, traceback
from typing import List, Optional
import pandas as pd
import numpy as np
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from pipeline.decomposition import decompose_metrics
from pipeline.anomaly import detect_anomalies
from pipeline.causal import discover_causal_dag
from pipeline.tracing import trace_root_causes
from pipeline.cpa import generate_cpa_narrative
from pipeline.cgr import compute_cgr

load_dotenv()
app = FastAPI(title="CPA", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
_store: dict = {}

def _safe(v):
    if isinstance(v, pd.Timestamp): return v.strftime("%Y-%m-%d")
    if isinstance(v, (np.integer,)): return int(v)
    if isinstance(v, (np.floating,)):
        return None if (np.isnan(v) or np.isinf(v)) else round(float(v), 4)
    if isinstance(v, float) and (np.isnan(v) or np.isinf(v)): return None
    if isinstance(v, (np.bool_,)): return bool(v)
    return v

CALENDAR_KEYWORDS = {"month","year","day","week","quarter","hour","minute","second","dayofweek","dayofyear","weekday","weekofyear","yr","mo","dt","dow"}
ID_KEYWORDS = {"id","index","row","serial","number","no","sr","sno","s.no","unnamed","_index"}

def _try_build_date(df):
    """Try to construct a date column from separate YEAR/MONTH/DAY columns."""
    cols_lower = {c: c.lower().strip() for c in df.columns}
    year_col = next((c for c,l in cols_lower.items() if l in ("year","yr")), None)
    month_col = next((c for c,l in cols_lower.items() if l in ("month","mo")), None)
    day_col = next((c for c,l in cols_lower.items() if l in ("day",)), None)
    if year_col and month_col:
        try:
            d = {"year": df[year_col].astype(int)}
            d["month"] = df[month_col].astype(int).clip(1,12)
            d["day"] = df[day_col].astype(int).clip(1,28) if day_col else 1
            return pd.to_datetime(pd.DataFrame(d))
        except: pass
    return None

def _infer_columns(df):
    date_col = None
    # Strategy 1: Look for a proper date column
    for col in df.columns:
        if any(kw in col.lower() for kw in ["date","time","timestamp","period"]):
            if col.lower().strip() in CALENDAR_KEYWORDS: continue  # skip "month", "year" etc
            try:
                p = pd.to_datetime(df[col], errors="coerce", dayfirst=True)
                if p.notna().sum()/len(df) > 0.5: date_col = col; break
            except: continue
    # Strategy 2: Try any object column
    if not date_col:
        for col in df.columns:
            if col.lower().strip() in CALENDAR_KEYWORDS: continue
            if df[col].dtype == "object":
                try:
                    p = pd.to_datetime(df[col], errors="coerce", dayfirst=True)
                    if p.notna().sum()/len(df) > 0.5: date_col = col; break
                except: continue
    # Strategy 3: Build from YEAR+MONTH+DAY columns
    if not date_col:
        built = _try_build_date(df)
        if built is not None:
            df["_built_date"] = built
            date_col = "_built_date"

    # Identify metric columns — exclude calendar, ID, and low-variance columns
    metrics = []
    for col in df.columns:
        if col == date_col: continue
        cl = col.lower().strip().replace(" ","").replace("_","")
        # Skip calendar columns
        if col.lower().strip() in CALENDAR_KEYWORDS: continue
        if any(kw in cl for kw in ["month","year","quarter","dayof","weekof"]): continue
        # Skip ID columns
        if col.lower().strip() in ID_KEYWORDS: continue
        if not pd.api.types.is_numeric_dtype(df[col]): continue
        # Skip binary/flag columns
        if df[col].nunique() <= 2: continue
        # Skip columns where every value is unique sequential int (likely IDs/indices)
        if df[col].nunique() == len(df) and df[col].dtype in ['int64','int32']:
            # Only skip if values are roughly sequential (like 1,2,3... or 1001,1002,1003...)
            sorted_vals = df[col].sort_values().values
            diffs = np.diff(sorted_vals)
            if len(diffs) > 0 and np.median(diffs) <= 2:
                continue
        # Skip columns that look like calendar fields (small integer range like 1-12, 1-31)
        vals = df[col].dropna()
        if len(vals) > 0 and vals.max() <= 53 and vals.min() >= 0 and df[col].nunique() <= 53:
            if df[col].dtype in ['int64','int32'] and (vals % 1 == 0).all():
                continue
        if df[col].std() > 0: metrics.append(col)
    return date_col, metrics

@app.get("/api/health")
async def health(): return {"status": "ok"}

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        content = await file.read()
        fn = file.filename or "data.csv"
        if fn.endswith((".xlsx",".xls")): df = pd.read_excel(io.BytesIO(content))
        else:
            try: df = pd.read_csv(io.BytesIO(content))
            except: df = pd.read_csv(io.BytesIO(content), encoding="latin-1")
        df.columns = df.columns.str.strip()
        date_col, metric_cols = _infer_columns(df)
        if date_col:
            df[date_col] = pd.to_datetime(df[date_col], errors="coerce", dayfirst=True)
            df = df.dropna(subset=[date_col]).sort_values(date_col).reset_index(drop=True)
        if date_col is None:
            df["_index"] = range(len(df)); date_col = "_index"
        _store.update({"df":df,"filename":fn,"date_col":date_col,"metric_cols":metric_cols})
        preview = df.head(8).to_dict(orient="records")
        for row in preview:
            for k in list(row.keys()): row[k] = _safe(row[k])
        stats = {}
        for col in metric_cols:
            v = df[col].dropna()
            stats[col] = {"mean":round(float(v.mean()),2),"min":round(float(v.min()),2),"max":round(float(v.max()),2),"std":round(float(v.std()),2)}
        return {"filename":fn,"rows":len(df),"columns":list(df.columns),"date_col":date_col if date_col!="_index" else None,"metric_cols":metric_cols,"categorical_cols":[c for c in df.columns if c not in metric_cols and c!=date_col],"preview":preview,"stats":stats}
    except Exception as e:
        traceback.print_exc(); raise HTTPException(400, f"Error: {str(e)}")

class AnalyzeRequest(BaseModel):
    target_metric: str
    metric_cols: Optional[List[str]] = None
    date_col: Optional[str] = None
    period: int = 7
    api_key: Optional[str] = None

@app.post("/api/analyze")
async def analyze(req: AnalyzeRequest):
    if "df" not in _store: raise HTTPException(400, "Upload a file first.")
    df = _store["df"].copy()
    date_col = req.date_col or _store.get("date_col")
    metric_cols = req.metric_cols or _store.get("metric_cols",[])
    target = req.target_metric
    if target not in metric_cols: metric_cols.append(target)
    if date_col is None or date_col not in df.columns:
        df["_index"] = range(len(df)); date_col = "_index"
    if len(metric_cols) < 2: raise HTTPException(400, "Need at least 2 numeric columns.")
    try:
        decomp = decompose_metrics(df, date_col, metric_cols, period=req.period)
        anomalies = detect_anomalies(decomp, df, date_col)
        dag = discover_causal_dag(df, metric_cols)
        root_causes = trace_root_causes(dag, anomalies, df, target)
        api_key = req.api_key or os.getenv("OPENAI_API_KEY","")
        narrative_result = await generate_cpa_narrative(dag, root_causes, api_key=api_key)
        cgr_result = compute_cgr(narrative_result["narrative"], dag)
        # Clean dates in decomposition
        decomp_summary = {}
        for col in metric_cols:
            d = decomp.get(col, {})
            clean_dates = []
            for dt in d.get("dates",[]):
                try:
                    p = pd.to_datetime(str(dt), errors="coerce")
                    if pd.notna(p) and p.year > 1980: clean_dates.append(p.strftime("%Y-%m-%d"))
                    else: clean_dates.append(str(dt)[:10])
                except: clean_dates.append(str(dt)[:10])
            decomp_summary[col] = {"dates":clean_dates,"raw":[_safe(v) for v in d.get("raw",[])],"trend":[_safe(v) for v in d.get("trend",[])],"seasonal":[_safe(v) for v in d.get("seasonal",[])],"residual":[_safe(v) for v in d.get("residual",[])]}
        # Clean anomalies
        anomaly_summary = {}
        for col, data in anomalies.items():
            al = data.get("anomalies",[])[:20]
            for a in al:
                if "date" in a:
                    try:
                        p = pd.to_datetime(str(a["date"]), errors="coerce")
                        a["date"] = p.strftime("%Y-%m-%d") if pd.notna(p) and p.year>1980 else str(a["date"])[:10]
                    except: a["date"] = str(a["date"])[:10]
                if "pct_deviation" in a: a["pct_deviation"] = round(max(min(a["pct_deviation"],999),-999),2)
            anomaly_summary[col] = {"total_flagged":data.get("total_flagged",0),"anomalies":al}
        # Cap root cause values
        if root_causes and "root_causes" in root_causes:
            for c in root_causes["root_causes"]:
                if "deviation_pct" in c: c["deviation_pct"] = round(max(min(c["deviation_pct"],999),-999),2)
        if root_causes and root_causes.get("anomaly_summary"):
            root_causes["anomaly_summary"]["avg_deviation_pct"] = round(max(min(root_causes["anomaly_summary"]["avg_deviation_pct"],999),-999),2)
        # Business insights
        td = df[target].dropna()
        insights = {
            "current_avg": round(float(td.tail(30).mean()),2),
            "overall_avg": round(float(td.mean()),2),
            "change_pct": round(float(((td.tail(30).mean()-td.head(30).mean())/(td.head(30).mean()+1e-10))*100),2),
            "total_anomalies": sum(d.get("total_flagged",0) for d in anomaly_summary.values()),
            "causal_edges": dag.get("n_edges",0),
        }
        result = {"target_metric":target,"decomposition":decomp_summary,"anomalies":anomaly_summary,"causal_dag":dag,"root_causes":root_causes,"narrative":narrative_result,"cgr":cgr_result,"insights":insights}
        _store["last_result"] = result
        return result
    except Exception as e:
        traceback.print_exc(); raise HTTPException(500, f"Analysis error: {str(e)}")

@app.post("/api/regenerate")
async def regenerate(api_key: str = Form(default="")):
    if "last_result" not in _store: raise HTTPException(404, "No analysis yet.")
    r = _store["last_result"]
    key = api_key or os.getenv("OPENAI_API_KEY","")
    n = await generate_cpa_narrative(r["causal_dag"], r["root_causes"], api_key=key)
    c = compute_cgr(n["narrative"], r["causal_dag"])
    r["narrative"]=n; r["cgr"]=c; _store["last_result"]=r
    return {"narrative":n,"cgr":c}

if __name__ == "__main__":
    import uvicorn; uvicorn.run(app, host="0.0.0.0", port=8000)
