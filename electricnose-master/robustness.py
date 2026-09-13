"""
robustness.py — two tests:
  TEST A: sensor-shift invariance (proves the baseline-calibration design)
  TEST B: noise tolerance (clean-trained vs noise-trained model)

Also saves models/freshness_model_v0_robust.pkl  (deploy on hardware day)
and figures/noise_robustness.png                 (poster figure)
"""
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import GroupShuffleSplit

rng = np.random.default_rng(0)

# ---- load + features (same as everywhere) ----
df = pd.read_csv("data/e_nose_dataset_v0_synthetic.csv")
df["delta135"] = df.mq135_mean - df.mq135_baseline
df["delta3"]   = df.mq3_mean   - df.mq3_baseline
FEATURES = ["delta135","mq135_std","delta3","mq3_std","fsr_median","temp_c","rh_pct"]
X, y, groups = df[FEATURES], df["label"], df["food_id"]
model = joblib.load("models/freshness_model_v0.pkl")

def features_of(d):
    d = d.copy()
    d["delta135"] = d.mq135_mean - d.mq135_baseline
    d["delta3"]   = d.mq3_mean   - d.mq3_baseline
    return d[FEATURES]

# =====================================================================
# TEST A — the sensor reads differently today. Does it matter?
# =====================================================================
print("=" * 62)
print("TEST A — sensor-shift invariance (your calibration design)")
print("=" * 62)
print("Scenario: whole sensor reads high/low (hot room, aging unit,")
print("different Arduino) — shift hits baseline AND reading together.\n")

p0 = model.predict(X)
print(f"{'sensor shift':<26s}{'predictions changed':<24s}")
for gs, es in [(25, 10), (60, 25), (100, 40), (-40, -15)]:
    d = df.copy()
    d["mq135_mean"] += gs; d["mq135_baseline"] += gs
    d["mq3_mean"]   += es; d["mq3_baseline"]   += es
    p = model.predict(features_of(d))
    print(f"gas {gs:+4d} / ethanol {es:+3d}     {(p0 != p).mean()*100:8.1f}%")

# comparison: the same shift hitting an UNCALIBRATED model (raw values)
RAW = ["mq135_mean","mq135_std","mq3_mean","mq3_std","fsr_median","temp_c","rh_pct"]
raw_model = RandomForestClassifier(n_estimators=300, random_state=0).fit(df[RAW], y)
d = df.copy(); d["mq135_mean"] += 60; d["mq3_mean"] += 25
raw_before = (raw_model.predict(df[RAW]) == y).mean()
raw_after  = (raw_model.predict(d[RAW]) == y).mean()
print(f"\nSame +60/+25 shift on a model WITHOUT baseline calibration:")
print(f"  accuracy {raw_before:.3f}  ->  {raw_after:.3f}   (your model: unchanged)")

# =====================================================================
# TEST B — real sensors are noisy. Which model survives?
# =====================================================================
print("\n" + "=" * 62)
print("TEST B — noise tolerance (clean-trained vs noise-trained)")
print("=" * 62)

tr, te = next(GroupShuffleSplit(test_size=0.25, random_state=0).split(X, y, groups))
Xtr, ytr, Xte, yte = X.iloc[tr], y.iloc[tr], X.iloc[te], y.iloc[te]

# 1x = realistic hardware noise magnitude per feature
NOISE = {"delta135":20, "mq135_std":3, "delta3":12, "mq3_std":2,
         "fsr_median":40, "temp_c":1.5, "rh_pct":6}

def jitter(Xin, scale):
    Xj = Xin.copy()
    for c, s in NOISE.items():
        Xj[c] = rng.normal(0, s * scale, len(Xj)) + Xin[c].values
    return Xj

# augmented training set: original + 3 noisy copies
Xaug = pd.concat([Xtr] + [jitter(Xtr, s) for s in (0.5, 1.0, 1.5)], ignore_index=True)
yaug = pd.concat([ytr] * 4, ignore_index=True)

clean_model = RandomForestClassifier(n_estimators=300, random_state=0).fit(Xtr, ytr)
aug_model   = RandomForestClassifier(n_estimators=300, random_state=0).fit(Xaug, yaug)

print(f"{'test noise':<14s}{'clean-trained':>16s}{'noise-trained':>16s}")
results = []
for scale in (0.0, 0.5, 1.0, 1.5, 2.0):
    Xn = jitter(Xte, scale)                    # noisy TEST — never seen in training
    a_clean = (clean_model.predict(Xn) == yte).mean()
    a_aug   = (aug_model.predict(Xn) == yte).mean()
    results.append((scale, a_clean, a_aug))
    print(f"{scale:<14.1f}{a_clean:>16.3f}{a_aug:>16.3f}")

# ---- deployment model: noise-augmented, trained on ALL data ----
Xall = pd.concat([X] + [jitter(X, s) for s in (0.5, 1.0, 1.5)], ignore_index=True)
yall = pd.concat([y] * 4, ignore_index=True)
deploy = RandomForestClassifier(n_estimators=300, random_state=0).fit(Xall, yall)
joblib.dump(deploy, "models/freshness_model_v0_robust.pkl")
print("\nSaved: models/freshness_model_v0_robust.pkl  <- use this on hardware day")

# ---- poster figure (optional) ----
try:
    import os, matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    os.makedirs("figures", exist_ok=True)
    s  = [r[0] for r in results]
    plt.figure(figsize=(7, 4.5))
    plt.plot(s, [r[1] for r in results], "o-", label="trained on clean data only")
    plt.plot(s, [r[2] for r in results], "s-", label="trained with noise augmentation")
    plt.xlabel("sensor noise level (×)"); plt.ylabel("accuracy on held-out fruits")
    plt.title("Robustness to Sensor Noise — AI Electronic Nose")
    plt.grid(alpha=0.3); plt.legend(); plt.tight_layout()
    plt.savefig("figures/noise_robustness.png", dpi=150)
    print("Saved: figures/noise_robustness.png")
except ImportError:
    print("(matplotlib not installed — pip install matplotlib to get the figure)")