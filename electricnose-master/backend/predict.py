import joblib
import pandas as pd
from pathlib import Path

FEATURES = ["delta135", "mq135_std", "delta3", "mq3_std", "fsr_median", "temp_c", "rh_pct"]
MODEL_PATH = Path(__file__).resolve().parents[1] / "models" / "freshness_model_v2.pkl"
model = joblib.load(MODEL_PATH)

SHELF_LIFE = {
    "apple":  {"fresh": "5-7 days", "ripe": "2-4 days", "overripe": "1-2 days", "rotten": "discard now"},
    "banana": {"fresh": "5-7 days", "ripe": "2-3 days", "overripe": "1-2 days", "rotten": "discard now"},
    "tomato": {"fresh": "3-5 days", "ripe": "1-3 days", "overripe": "about 1 day", "rotten": "discard now"},
    "potato": {"fresh": "2-3 weeks", "ripe": "1-2 weeks", "overripe": "3-5 days", "rotten": "discard now"},
    "carrot": {"fresh": "2-4 weeks", "ripe": "1-2 weeks", "overripe": "3-5 days", "rotten": "discard now"},
}

def predict_freshness(food_type, mq135_baseline, mq3_baseline,
                      mq135_mean, mq135_std, mq3_mean, mq3_std,
                      fsr_median, temp_c, rh_pct):
    food_type = food_type.lower()
    if food_type not in SHELF_LIFE:
        raise ValueError(f"Unsupported food type: {food_type}")

    row = pd.DataFrame([[
        mq135_mean - mq135_baseline, mq135_std,
        mq3_mean - mq3_baseline, mq3_std,
        fsr_median, temp_c, rh_pct
    ]], columns=FEATURES)

    status = model.predict(row)[0]
    confidence = model.predict_proba(row).max() * 100

    return {
        "food": food_type,
        "status": status,
        "confidence": f"{confidence:.0f}%",
        "estimated shelf life": SHELF_LIFE[food_type][status],
        "sensor readings": {"gas_delta": mq135_mean - mq135_baseline,
                            "ethanol_delta": mq3_mean - mq3_baseline,
                            "firmness": fsr_median,
                            "temp_c": temp_c, "humidity": rh_pct},
    }

if __name__ == "__main__":
    scans = [
        ("apple",  dict(mq135_baseline=70, mq3_baseline=25, mq135_mean=85,  mq135_std=6,  mq3_mean=28,  mq3_std=4,  fsr_median=560, temp_c=28.0, rh_pct=60.0)),
        ("potato", dict(mq135_baseline=70, mq3_baseline=25, mq135_mean=150, mq135_std=15, mq3_mean=55,  mq3_std=10, fsr_median=330, temp_c=28.0, rh_pct=60.0)),
        ("tomato", dict(mq135_baseline=70, mq3_baseline=25, mq135_mean=350, mq135_std=30, mq3_mean=185, mq3_std=25, fsr_median=100, temp_c=28.0, rh_pct=60.0)),
    ]
    for food, s in scans:
        r = predict_freshness(food, **s)
        print(f"\n===== {food.upper()} SCAN =====")
        for k, v in r.items():
            print(f"{k}: {v}")