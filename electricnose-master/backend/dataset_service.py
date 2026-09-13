"""Shared dataset reading selection for the CLI and HTTP backend."""
from pathlib import Path
from typing import Any
import hashlib

import pandas as pd


DATASET_PATH = Path(__file__).resolve().parents[1] / "data" / "e_nose_dataset_v2_synthetic.csv"


def get_dataset_reading(food: str, stage: str | None = None) -> dict[str, Any]:
    dataset = pd.read_csv(DATASET_PATH)
    matches = dataset[dataset["food_type"].str.lower() == food.lower()]
    normalized_stage = stage.lower() if stage else None
    if normalized_stage and normalized_stage != "random":
        matches = matches[matches["label"].str.lower() == normalized_stage]
    if matches.empty:
        raise ValueError(f"No dataset reading found for {food} ({stage or 'any stage'})")

    key = f"{food.lower()}:{normalized_stage or 'random'}".encode()
    seed = int.from_bytes(hashlib.sha256(key).digest()[:4], "big")
    row = matches.sample(1, random_state=seed).iloc[0]
    return {
        "reading_id": int(row["reading_id"]),
        "session_id": str(row["session_id"]),
        "food_id": str(row["food_id"]),
        "food_type": str(row["food_type"]),
        "stage": str(row["label"]),
        "mq135_baseline": float(row["mq135_baseline"]),
        "mq3_baseline": float(row["mq3_baseline"]),
        "mq135_mean": float(row["mq135_mean"]),
        "mq135_std": float(row["mq135_std"]),
        "mq3_mean": float(row["mq3_mean"]),
        "mq3_std": float(row["mq3_std"]),
        "fsr_median": float(row["fsr_median"]),
        "temp_c": float(row["temp_c"]),
        "rh_pct": float(row["rh_pct"]),
    }