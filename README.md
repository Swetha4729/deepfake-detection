# VoiceGuard — Deepfake Audio Detection Demo

> Web demo of a 2D-CNN model trained on the ASVspoof 2019 LA dataset.

## Project Structure

```
deepfake-detection/
├── backend/
│   ├── main.py           # FastAPI app (POST /predict, GET /health)
│   ├── requirements.txt  # Python dependencies
│   └── best_model.keras  # ← place your trained model here
└── frontend/
    ├── src/
    │   ├── App.jsx        # Main React component
    │   └── index.css      # Global design system
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Quick Start

### 1. Backend

```bash
cd backend

# (Optional) create a virtual environment
python -m venv .venv
.venv\Scripts\activate          # Windows
# or: source .venv/bin/activate  # macOS/Linux

pip install -r requirements.txt

# Place your model
# Copy best_model.keras (or best_lcnn.keras) into the backend/ folder

# Run
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Visit http://localhost:8000/health to confirm the backend is alive.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

The Vite dev server proxies `/api/*` → `http://localhost:8000/*` automatically,
so no CORS config is needed during local development.

---

## Model File

The backend attempts to load (in order):
1. `backend/best_model.keras`
2. `backend/best_lcnn.keras`

If **neither** is present, the app runs in **Demo Mode** — predictions are
randomised but the full UI is functional.

---

## Deploying to Vercel + Railway / Render

1. Deploy the `frontend/` directory to Vercel.
2. Deploy the `backend/` directory to Railway or Render (set start command to
   `uvicorn main:app --host 0.0.0.0 --port 8000`).
3. In Vercel, set the environment variable:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```

---

## API

| Method | Path       | Description                                |
|--------|------------|--------------------------------------------|
| GET    | `/health`  | Returns `{"status":"ok","model_loaded":…}` |
| POST   | `/predict` | Upload audio file; returns JSON verdict    |

### POST /predict — Response

```json
{
  "verdict": "bonafide",
  "label": "Likely Genuine",
  "confidence": 87.3,
  "spoof_probability": 0.1267,
  "segment_count": 5,
  "segment_probabilities": [0.12, 0.09, 0.15, 0.14, 0.11],
  "filename": "sample.wav",
  "demo_mode": false
}
```
