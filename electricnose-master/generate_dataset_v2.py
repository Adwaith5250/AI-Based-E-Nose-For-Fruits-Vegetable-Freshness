"""
generate_dataset_v2.py — physics-based simulator, version 2.
Key upgrade vs v0: ONE continuous spoilage variable per fruit drives all
sensors; MQ response is logarithmic; stages are thresholds (overlap!);
labeler noise near boundaries. Schema identical to v0.
"""
import numpy as np
import pandas as pd

rng = np.random.default_rng(7)

STAGES  = ["fresh", "ripe", "overripe", "rotten"]
THRESH  = [0.30, 0.55, 0.80]                     # spoilage level where stage flips
FOODS   = ["apple", "banana", "tomato", "potato", "carrot"]
N_ITEMS = 30                                     # fruits per food

LIFE      = {"apple": 26, "banana": 10, "tomato": 14, "potato": 40, "carrot": 30}   # baseline lifespan (days)
A_GAS     = {"apple": 4.0, "banana": 5.0, "tomato": 5.5, "potato": 3.0, "carrot": 2.5}  # emission strength
A_ETH     = {"apple": 4.0, "banana": 5.5, "tomato": 6.0, "potato": 3.0, "carrot": 2.5}
FSR_FRESH = {"apple": 560, "banana": 520, "tomato": 430, "potato": 600, "carrot": 650}
GAIN_GAS, GAIN_ETH = 110, 60                     # log1p(conc) -> sensor counts

rows, rid = [], 0
start = pd.Timestamp("2026-06-01")

for food in FOODS:
    for i in range(1, N_ITEMS + 1):
        food_id = f"{food.upper()}_{i:02d}"
        tau   = LIFE[food] * rng.uniform(0.75, 1.25)   # THIS fruit's decay clock
        d0    = tau * rng.uniform(0.0, 0.30)           # some fruits bought part-aged
        aroma = rng.uniform(0.7, 1.4)                  # emits more/less gas
        firm  = rng.uniform(0.85, 1.15)                # firmer/softer

        for day in range(int(np.ceil(2.2 * tau))):
            spoil = 1 - np.exp(-(day + d0) / tau)      # the one true variable

            si = int(np.digitize(spoil, THRESH))       # stage = threshold on spoil
            dmin = min(abs(spoil - t) for t in THRESH)
            if dmin < 0.025 and rng.random() < 0.45:   # labeler disagrees near boundary
                si = int(np.clip(si + rng.choice([-1, 1]), 0, 3))
            label = STAGES[si]

            for s, sess in enumerate(["AM", "PM"]):
                temp_c = 28 + 3*np.sin(day/7) + rng.normal(0, 1.0) + (0 if s == 0 else 1.2)
                rh     = 60 + 10*np.sin(day/11) + rng.normal(0, 5)
                em     = 1 + 0.025*(temp_c - 28)       # warm fruit outgasses more

                conc_gas = A_GAS[food] * spoil**2   * aroma * em   # rot accelerates
                conc_eth = A_ETH[food] * spoil**2.5 * aroma * em   # fermentation: later still

                d135 = max(GAIN_GAS * np.log1p(conc_gas) + rng.normal(0, 4), 1)
                d3   = max(GAIN_ETH * np.log1p(conc_eth) + rng.normal(0, 3), 0.5)
                fsr  = FSR_FRESH[food] * (1 - 0.75*spoil) * firm + rng.normal(0, 12)

                b135 = 70 + 6*np.sin(day/5) + rng.normal(0, 3)     # drifting baselines
                b3   = 25 + 4*np.sin(day/7) + rng.normal(0, 2)

                rows.append({
                    "reading_id": rid,
                    "session_id": f"{(start + pd.Timedelta(days=day)).date()}_{sess}",
                    "food_id": food_id, "food_type": food,
                    "timestamp": (start + pd.Timedelta(days=day, hours=6 if s==0 else 18)).isoformat(),
                    "days_since_start": day + (0.0 if s == 0 else 0.5),
                    "storage": "room",
                    "mq135_baseline": round(b135), "mq3_baseline": round(b3),
                    "mq135_mean": round(b135 + d135),
                    "mq135_std":  round(max(5 + 0.05*d135 + rng.normal(0, 1), 2), 1),
                    "mq3_mean":   round(b3 + d3),
                    "mq3_std":    round(max(4 + 0.04*d3 + rng.normal(0, 0.8), 1.5), 1),
                    "fsr_median": int(round(fsr)),
                    "temp_c": round(temp_c, 1), "rh_pct": round(rh, 1),
                    "label": label,
                    "data_source": "synthetic_v2",
                    "notes": f"simulated; true spoil={spoil:.2f}",
                })
                rid += 1

df = pd.DataFrame(rows)
for c in ["mq135_baseline","mq3_baseline","mq135_mean","mq3_mean","fsr_median"]:
    df[c] = df[c].clip(0, 1023)
df.to_csv("data/e_nose_dataset_v2_synthetic.csv", index=False)

print(df.shape)
print(df.groupby(["food_type","label"]).size())
print("\nlabel mix:", df.label.value_counts(normalize=True).round(2).to_dict())