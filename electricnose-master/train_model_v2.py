import numpy as np, pandas as pd, joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import GroupShuffleSplit
from sklearn.metrics import classification_report

rng = np.random.default_rng(1)
df = pd.read_csv("data/e_nose_dataset_v2_synthetic.csv")
df["delta135"] = df.mq135_mean - df.mq135_baseline
df["delta3"]   = df.mq3_mean   - df.mq3_baseline
FEATURES = ["delta135","mq135_std","delta3","mq3_std","fsr_median","temp_c","rh_pct"]
X, y, groups = df[FEATURES], df["label"], df["food_id"]

NOISE = {"delta135":20,"mq135_std":3,"delta3":12,"mq3_std":2,"fsr_median":40,"temp_c":1.5,"rh_pct":6}
def jitter(Xin, scale):
    Xj = Xin.copy()
    for c, s in NOISE.items():
        Xj[c] = Xin[c].values + rng.normal(0, s*scale, len(Xj))
    return Xj

# honest report on held-out fruits (train = noisy-augmented, test = clean, unseen fruits)
tr, te = next(GroupShuffleSplit(test_size=0.25, random_state=0).split(X, y, groups))
Xaug = pd.concat([X.iloc[tr]] + [jitter(X.iloc[tr], s) for s in (0.5,1.0,1.5)], ignore_index=True)
yaug = pd.concat([y.iloc[tr]]*4, ignore_index=True)
clf = RandomForestClassifier(n_estimators=300, class_weight="balanced", random_state=0).fit(Xaug, yaug)
print(classification_report(y.iloc[te], clf.predict(X.iloc[te])))   # expect ~0.78-0.81

# deployment version: all fruits + noise augmentation + balanced weights
Xall = pd.concat([X] + [jitter(X, s) for s in (0.5,1.0,1.5)], ignore_index=True)
yall = pd.concat([y]*4, ignore_index=True)
deploy = RandomForestClassifier(n_estimators=300, class_weight="balanced", random_state=0).fit(Xall, yall)
joblib.dump(deploy, "models/freshness_model_v2.pkl")
print(pd.Series(deploy.feature_importances_, index=FEATURES).sort_values(ascending=False))