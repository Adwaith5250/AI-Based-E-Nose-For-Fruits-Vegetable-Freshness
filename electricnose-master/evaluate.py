import pandas as pd
from sklearn.model_selection import StratifiedGroupKFold, cross_validate, cross_val_predict
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier, HistGradientBoostingClassifier
from sklearn.metrics import classification_report, confusion_matrix

# ---- load + features (same as train_model.py) ----
df = pd.read_csv("data/e_nose_dataset_v2_synthetic.csv")
df["delta135"] = df.mq135_mean - df.mq135_baseline
df["delta3"]   = df.mq3_mean   - df.mq3_baseline
FEATURES = ["delta135","mq135_std","delta3","mq3_std","fsr_median","temp_c","rh_pct"]
X, y, groups = df[FEATURES], df["label"], df["food_id"]

# ---- split BY FRUIT, labels balanced across folds ----
cv = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=0)

# ---- compare models fairly (all get the same 5 folds) ----
models = {
    "dummy (baseline)":    DummyClassifier(strategy="most_frequent"),
    "logreg":              LogisticRegression(max_iter=2000),
    "random_forest":       RandomForestClassifier(n_estimators=300, random_state=0),
    "extra_trees":         ExtraTreesClassifier(n_estimators=300, random_state=0),
    "hist_gradient_boost": HistGradientBoostingClassifier(random_state=0),
}

print(f"{len(df)} rows, {df.food_id.nunique()} fruits, {len(FEATURES)} features\n")
print(f"{'model':22s} {'accuracy':16s} {'f1_macro':16s}")
print("-" * 56)
results = {}
for name, m in models.items():
    s = cross_validate(m, X, y, groups=groups, cv=cv, scoring=["accuracy","f1_macro"])
    acc = f"{s['test_accuracy'].mean():.3f} ± {s['test_accuracy'].std():.3f}"
    f1  = f"{s['test_f1_macro'].mean():.3f} ± {s['test_f1_macro'].std():.3f}"
    results[name] = s["test_accuracy"].mean()
    print(f"{name:22s} {acc:16s} {f1:16s}")

# ---- out-of-fold confusion matrix for the best model ----
best_name = max(results, key=results.get)
best = models[best_name]
print(f"\n=== Out-of-fold confusion matrix: {best_name} ===")
print("(every prediction comes from a fold that never saw that fruit)\n")
STAGES = ["fresh","ripe","overripe","rotten"]
pred = cross_val_predict(best, X, y, groups=groups, cv=cv)
cm = pd.DataFrame(confusion_matrix(y, pred, labels=STAGES), index=STAGES, columns=STAGES)
cm.to_csv("confusion_matrix_v2.csv")
print(cm)
print()
print(classification_report(y, pred))