"""HTTP API for the React frontend."""
from pathlib import Path
from typing import Any

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .predict import predict_freshness
from .dataset_service import DATASET_PATH, get_dataset_reading


ROOT = Path(__file__).resolve().parents[1]
FOOD_INFO_PATH = ROOT / "food_info.json"
REAL_DATASET_PATH = ROOT / "data" / "e_nose_dataset_real.csv"
SUPPORTED_FOODS = {"apple", "banana", "tomato", "potato", "carrot"}
SENSOR_FIELDS = (
    "mq135_baseline", "mq3_baseline", "mq135_mean", "mq135_std",
    "mq3_mean", "mq3_std", "fsr_median", "temp_c", "rh_pct"
)

app = FastAPI(title="AI Electronic Nose API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", "http://127.0.0.1:3000",
        "http://localhost:3001", "http://127.0.0.1:3001",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):30\d{2}$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictionRequest(BaseModel):
    food: str
    readings: dict[str, Any]
    is_simulated: bool = True
    reading_id: int | None = None


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/")
def root() -> dict[str, str]:
    return {"service": "AI Electronic Nose API", "status": "ok", "docs": "/docs"}


@app.get("/api/readings/demo")
def demo_reading(food: str, stage: str | None = None) -> dict[str, Any]:
    food = food.lower()
    if food not in SUPPORTED_FOODS:
        raise HTTPException(status_code=400, detail="Unsupported food type")

    try:
        try:
            source = str(DATASET_PATH.relative_to(ROOT))
        except ValueError:
            source = DATASET_PATH.name
        return {
            **get_dataset_reading(food, stage),
            "timestamp": pd.Timestamp.now().timestamp() * 1000,
            "source": source,
        }
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.post("/api/predict")
def predict(request: PredictionRequest) -> dict[str, Any]:
    food = request.food.lower()
    if food not in SUPPORTED_FOODS:
        raise HTTPException(status_code=400, detail="Unsupported food type")

    sensor_values = {field: request.readings[field] for field in SENSOR_FIELDS if field in request.readings}
    try:
        result = predict_freshness(food, **sensor_values)
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=422, detail=f"Invalid sensor readings: {exc}") from exc

    confidence = float(result["confidence"].rstrip("%"))
    return {
        "readingId": request.reading_id,
        "food": food.title(),
        "status": result["status"].title(),
        "confidence": confidence,
        "estimatedShelfLife": result["estimated shelf life"],
        "sensorReadings": {**sensor_values, "timestamp": pd.Timestamp.now().timestamp() * 1000},
        "isSimulated": request.is_simulated,
        "modelType": "Random Forest (300 Trees)",
    }


@app.post("/api/dataset/log")
def log_scan(entry: dict[str, Any]) -> dict[str, str]:
    timestamp = entry.get("timestamp", pd.Timestamp.now().isoformat())
    if isinstance(timestamp, (int, float)):
        timestamp = pd.to_datetime(timestamp, unit="ms").isoformat()
    sensor_values = {
        field: entry.get("readings", {})[field]
        for field in SENSOR_FIELDS
        if field in entry.get("readings", {})
    }
    row = {
        "reading_id": 0,
        "session_id": pd.Timestamp.now().strftime("%Y-%m-%d_%H%M"),
        "food_id": entry.get("foodId", ""),
        "food_type": str(entry.get("food", "")).lower(),
        "timestamp": str(timestamp),
        "days_since_start": 0.0,
        "storage": "room",
        **sensor_values,
        "label": entry.get("trueStage", "").lower(),
        "data_source": "frontend",
        "notes": entry.get("notes", ""),
    }
    try:
        source_reading_id = entry.get("readingId")
        target_path = DATASET_PATH if source_reading_id is not None else REAL_DATASET_PATH
        existing = pd.read_csv(target_path) if target_path.exists() else pd.DataFrame()
        if source_reading_id is not None and not existing.empty:
            matches = existing["reading_id"] == int(source_reading_id)
            if not matches.any():
                raise HTTPException(status_code=404, detail="Source dataset row not found")
            index = existing.index[matches][0]
            for field, value in row.items():
                if field in existing.columns and field != "reading_id":
                    existing.at[index, field] = value
            updated = existing
        else:
            row["reading_id"] = int(existing["reading_id"].max() + 1) if not existing.empty else 0
            row["data_source"] = "hardware" if source_reading_id is None else "frontend"
            updated = pd.concat([existing, pd.DataFrame([row])], ignore_index=True)
        updated.to_csv(target_path, index=False)
    except (OSError, ValueError) as exc:
        raise HTTPException(status_code=500, detail=f"Could not save scan: {exc}") from exc
    try:
        file_name = str(target_path.relative_to(ROOT))
    except ValueError:
        file_name = target_path.name
    return {
        "status": "logged",
        "reading_id": str(row["reading_id"] if source_reading_id is None else source_reading_id),
        "file": file_name,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.api_server:app", host="0.0.0.0", port=8000, reload=True)