import numpy as np
import pandas as pd

rng = np.random.default_rng(42)

STAGES = ["fresh", "ripe", "overripe", "rotten"]
FOODS = ["apple", "tomato", "potato"]
ITEMS_PER_FOOD = 10   # food_id = the unit you split train/test by!

# Days each item spends per stage (sampled per item)
STAGE_DAYS = {
    "apple":   {"fresh": (7,12),  "ripe": (3,6),  "overripe": (2,4), "rotten": (2,5)},
    "tomato":  {"fresh": (3,6),   "ripe": (2,4),  "overripe": (1,3), "rotten": (1,4)},
    "potato":  {"fresh": (14,25), "ripe": (4,8),  "overripe": (3,6), "rotten": (2,6)},
}

# (mean_delta_above_baseline, spread) per stage. Tomatoes rot juicier -> bigger spikes.
GAS = {
    "apple":  {"mq135": [(15,6),(45,12),(100,25),(220,70)],
               "mq3":   [(3,2), (12,5), (45,18), (120,50)]},
    "tomato": {"mq135": [(20,8),(55,15),(125,30),(280,90)],
               "mq3":   [(4,2), (15,6), (60,22), (160,60)]},
    "potato": {"mq135": [(10,5),(30,10),(80,20),(250,80)],
               "mq3":   [(2,1), (6,3),  (30,12), (100,45)]},
}

# FSR reading under fixed 500g weight: firm -> high, mushy -> low
FSR = {
    "apple":  [(560,50),(440,45),(300,50),(150,50)],
    "tomato": [(430,45),(320,40),(200,40),(100,40)],
    "potato": [(600,50),(480,45),(330,50),(140,50)],
}

rows, rid = [], 0
start = pd.Timestamp("2026-06-01")

for food in FOODS:
    for i in range(1, ITEMS_PER_FOOD + 1):
        food_id = f"{food.upper()}_{i:02d}"
        aroma = rng.normal(1.0, 0.12)   # each fruit slightly more/less smelly
        firm  = rng.normal(1.0, 0.10)   # each fruit slightly firmer/softer
        timeline = []
        for st in STAGES:
            timeline += [st] * int(rng.integers(*STAGE_DAYS[food][st]))

        for day, st in enumerate(timeline):
            si = STAGES.index(st)
            for s in range(2):  # AM + PM scans
                # baselines drift slowly day-to-day (like real MQ sensors)
                b135 = 70 + 8*np.sin(day/5) + rng.normal(0, 4)
                b3   = 25 + 5*np.sin(day/7) + rng.normal(0, 3)
                pm_boost = 0 if s == 0 else rng.normal(3, 1)  # warmer afternoons
                d135 = max(rng.normal(*GAS[food]["mq135"][si]) * aroma + pm_boost, 1)
                d3   = max(rng.normal(*GAS[food]["mq3"][si])   * aroma + pm_boost, 0.5)
                fsr  = rng.normal(*FSR[food][si]) * firm

                rows.append({
                    "reading_id": rid,
                    "session_id": f"{(start + pd.Timedelta(days=day)).date()}_{'AM' if s==0 else 'PM'}",
                    "food_id": food_id, "food_type": food,
                    "timestamp": (start + pd.Timedelta(days=day, hours=6 if s==0 else 18)).isoformat(),
                    "days_since_start": day + (0.0 if s==0 else 0.5),
                    "storage": "room",
                    "mq135_baseline": round(b135), "mq3_baseline": round(b3),
                    "mq135_mean": round(b135 + d135), "mq135_std": round(max(rng.normal(6,2),2),1),
                    "mq3_mean":   round(b3 + d3),     "mq3_std":   round(max(rng.normal(4,1.5),1.5),1),
                    "fsr_median": int(round(fsr)),
                    "temp_c": round(rng.normal(28,1.5),1), "rh_pct": round(rng.normal(60,8),1),
                    "label": st,
                    "data_source": "synthetic_v0",   # NEVER delete this column
                    "notes": "simulated; ranges are estimates",
                })
                rid += 1

df = pd.DataFrame(rows)
for c in ["mq135_baseline","mq3_baseline","mq135_mean","mq3_mean","fsr_median"]:
    df[c] = df[c].clip(0, 1023)
df.to_csv("e_nose_dataset_v0_synthetic.csv", index=False)
print(df.shape)
print(df.groupby(["food_type","label"]).size())