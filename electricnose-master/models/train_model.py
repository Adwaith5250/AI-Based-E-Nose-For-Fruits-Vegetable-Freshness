import pandas as pd, joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import GroupShuffleSplit
from sklearn.metrics import classification_report

df = pd.read_csv("data/e_nose_dataset_v0_synthetic.csv")
df["delta135"] = df.mq135_mean - df.mq135_baseline
df["delta3"]   = df.mq3_mean   - df.mq3_baseline
FEATURES = ["delta135","mq135_std","delta3","mq3_std","fsr_median","temp_c","rh_pct"]
X, y = df[FEATURES], df["label"]

tr, te = next(GroupShuffleSplit(test_size=0.25, random_state=0)
              .split(X, y, groups=df.food_id))          # split BY FRUIT
clf = RandomForestClassifier(n_estimators=300, random_state=0).fit(X.iloc[tr], y.iloc[tr])
print(classification_report(y.iloc[te], clf.predict(X.iloc[te])))

joblib.dump(clf, "models/freshness_model_v0.pkl")
print("\nFeature importances:")
print(pd.Series(clf.feature_importances_, index=FEATURES).sort_values(ascending=False))
