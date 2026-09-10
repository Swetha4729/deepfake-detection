import os
import tempfile
import logging
from pathlib import Path
from contextlib import asynccontextmanager

import numpy as np
import soundfile as sf
import librosa
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── Configuration ────────────────────────────────────────────────────────────
MODEL_PATH = Path(__file__).parent / "best_model.keras"

SAMPLE_RATE = 16000
DURATION = 1.0          # input window length in seconds
N_MFCC = 13
N_FFT = 400
HOP_LENGTH = 160
SPOOF_THRESHOLD = 0.70  # >= threshold → spoof

ALLOWED_EXTENSIONS = {".wav", ".flac", ".mp3", ".ogg", ".m4a"}

# ─── Global model handle ──────────────────────────────────────────────────────
model = None


def load_model():
    """Load the Keras model once at startup."""
    global model
    if not MODEL_PATH.exists():
        raise RuntimeError(f"Model file not found: {MODEL_PATH}")
    import tensorflow as tf
    model = tf.keras.models.load_model(str(MODEL_PATH))
    logger.info(f"Model loaded from {MODEL_PATH}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model()
    yield


# ─── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Deepfake Voice Detector API",
    version="1.0.0",
    description="Backend for the deepfake audio detection demo",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten to your Vercel URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Schemas ──────────────────────────────────────────────────────────────────
class PredictionResponse(BaseModel):
    verdict: str                     # "bonafide" | "spoof"
    label: str                       # "Likely Genuine" | "Likely Synthetic"
    confidence: float                # 0–100 %
    spoof_probability: float         # raw aggregate spoof prob
    segment_count: int
    segment_probabilities: List[float]
    filename: str
    mfcc: List[List[float]]


# ─── Audio loading (format-agnostic) ─────────────────────────────────────────
def safe_load_audio(file_path: str) -> np.ndarray:
    """
    Load audio as float32 mono at SAMPLE_RATE.
    Tries soundfile first (WAV/FLAC/OGG), then pydub (MP3/M4A),
    then falls back to librosa (requires ffmpeg for compressed formats).
    """
    suffix = Path(file_path).suffix.lower()

    # ── soundfile: handles WAV, FLAC, OGG natively (no ffmpeg needed) ────────
    if suffix in ('.wav', '.flac', '.ogg'):
        try:
            data, orig_sr = sf.read(file_path, dtype='float32', always_2d=False)
            if data.ndim > 1:
                data = data.mean(axis=1)   # stereo → mono
            if orig_sr != SAMPLE_RATE:
                data = librosa.resample(data, orig_sr=orig_sr, target_sr=SAMPLE_RATE)
            return data
        except Exception as e:
            logger.warning(f"soundfile failed ({e}), trying pydub…")

    # ── pydub: handles MP3, M4A, and anything soundfile missed ───────────────
    try:
        from pydub import AudioSegment
        audio = AudioSegment.from_file(file_path)
        audio = audio.set_frame_rate(SAMPLE_RATE).set_channels(1).set_sample_width(2)
        samples = np.array(audio.get_array_of_samples(), dtype=np.float32)
        samples /= 32768.0   # int16 → [-1, 1]
        return samples
    except Exception as e:
        logger.warning(f"pydub failed ({e}), trying librosa…")

    # ── librosa last resort (needs ffmpeg for mp3/m4a) ────────────────────────
    y, _ = librosa.load(file_path, sr=SAMPLE_RATE, mono=True)
    return y


# ─── Feature extraction ───────────────────────────────────────────────────────
def extract_mfcc(file_path: str):
    """
    Mirrors the training pipeline exactly:
    • Load audio at SAMPLE_RATE
    • Truncate or pad to DURATION (1.0 s) — the model only sees the first second
    • Compute MFCCs (n_mfcc=N_MFCC, n_fft=N_FFT, hop_length=HOP_LENGTH)
    Returns (model_input, mfcc_2d) where:
    • model_input: (1, n_frames, N_MFCC, 1) = (1, 101, 13, 1)
    • mfcc_2d:     (n_frames, N_MFCC) = (101, 13) for visualization
    """
    y = safe_load_audio(file_path)

    target_len = int(SAMPLE_RATE * DURATION)
    if len(y) < target_len:
        y = np.pad(y, (0, target_len - len(y)))
    else:
        y = y[:target_len]

    mfcc = librosa.feature.mfcc(
        y=y,
        sr=SAMPLE_RATE,
        n_mfcc=N_MFCC,
        n_fft=N_FFT,
        hop_length=HOP_LENGTH,
    )
    # mfcc shape: (N_MFCC, n_frames)
    mfcc_2d = mfcc.T                                   # (n_frames, N_MFCC) = (101, 13)
    features = mfcc_2d[np.newaxis, ..., np.newaxis]    # (1, n_frames, N_MFCC, 1)
    return features, mfcc_2d


# ─── Inference ────────────────────────────────────────────────────────────────
def run_inference(segments: np.ndarray):
    """
    Returns a list of per-segment spoof probabilities (0→bonafide, 1→spoof).
    """
    if model is None:
        raise RuntimeError("Model not loaded")

    preds = model.predict(segments, verbose=0)  # shape: (n, 1) or (n, 2)

    if preds.ndim == 2 and preds.shape[1] == 2:
        # softmax output: column 1 = spoof probability
        spoof_probs = preds[:, 1].tolist()
    else:
        spoof_probs = preds.flatten().tolist()

    return spoof_probs


# ─── Endpoints ────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "model_path": str(MODEL_PATH),
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...)):
    # Validate extension
    suffix = Path(file.filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{suffix}'. Accepted: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Save to a temp file
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(
            delete=False, suffix=suffix, dir=tempfile.gettempdir()
        ) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        # Extract features
        try:
            segments, mfcc_2d = extract_mfcc(tmp_path)
        except Exception as e:
            logger.error(f"Feature extraction failed: {e}")
            raise HTTPException(
                status_code=422,
                detail=f"Could not process audio file: {str(e)}",
            )

        # Run model
        segment_probs = run_inference(segments)

        # Aggregate
        mean_spoof_prob = float(np.mean(segment_probs))
        verdict = "spoof" if mean_spoof_prob >= SPOOF_THRESHOLD else "bonafide"
        label = "Likely Synthetic" if verdict == "spoof" else "Likely Genuine"

        if verdict == "spoof":
            confidence = round(mean_spoof_prob * 100, 1)
        else:
            confidence = round((1 - mean_spoof_prob) * 100, 1)

        return PredictionResponse(
            verdict=verdict,
            label=label,
            confidence=confidence,
            spoof_probability=round(mean_spoof_prob, 4),
            segment_count=len(segment_probs),
            segment_probabilities=[round(p, 4) for p in segment_probs],
            filename=file.filename,
            mfcc=[[round(v, 4) for v in row] for row in mfcc_2d.tolist()],
        )

    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)
