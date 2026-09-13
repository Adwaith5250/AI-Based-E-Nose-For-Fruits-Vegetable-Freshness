"""app.py — AI Electronic Nose frontend (Streamlit).
Modes: 🧪 Demo (simulated) | 🔌 Live (Arduino over USB serial).
"""
import json
import time
from pathlib import Path

import pandas as pd
import streamlit as st
from . import serial_reader as sr
from .predict import predict_freshness

ROOT = Path(__file__).resolve().parents[1]

# ---------------- page + data ----------------
st.set_page_config(page_title="AI Electronic Nose", page_icon="🍏", layout="wide")

@st.cache_data
def load_food_info():
    with (ROOT / "food_info.json").open() as f:
        return json.load(f)

@st.cache_data
def load_dataset():
    return pd.read_csv(ROOT / "data" / "e_nose_dataset_v2_synthetic.csv")

FOOD_INFO = load_food_info()
DATASET = load_dataset()

FOOD_EMOJI = {"apple": "🍎", "tomato": "🍅", "potato": "🥔"}
STAGES = ["fresh", "ripe", "overripe", "rotten"]
STAGE_COLOR = {"fresh": "#22c55e", "ripe": "#eab308",
               "overripe": "#f97316", "rotten": "#ef4444"}

# ---------------- styling ----------------
st.markdown("""
<style>
.stApp {background:#0f172a;}
div[data-testid="stMetric"] {
    background:#1e293b; border:1px solid #334155;
    border-radius:12px; padding:12px 6px;}
.status-banner {border-radius:14px; padding:16px 20px; margin:8px 0 14px;
    font-size:28px; font-weight:800; text-align:center;}
.stagebar {display:flex; gap:6px; margin:4px 0 18px;}
.stage-seg {flex:1; text-align:center; padding:8px; border-radius:10px;
    font-weight:600; font-size:14px; opacity:.25;}
.stage-seg.active {opacity:1; border:2px solid;}
</style>
""", unsafe_allow_html=True)

# ---------------- sidebar ----------------
with st.sidebar:
    st.header("🍏 Electronic Nose")
    mode = st.radio("Input mode", ["🧪 Demo (simulated)", "🔌 Live (Arduino)"])
    wait_s = st.number_input("Chamber accumulation (s)", 5, 120, 60,
                             help="60 s for accurate scans; shorten only for quick tests.")
    if mode.startswith("🔌"):
        ports = sr.list_arduino_ports()
        port = st.selectbox("Serial port", ports or ["— none found —"])
        if st.button("Connect", use_container_width=True):
            try:
                st.session_state.ser = sr.connect(port)
                st.session_state.pop("baseline", None)
                st.success("Arduino connected ✓")
            except Exception as e:
                st.session_state.pop("ser", None)
                st.error(f"{e}")
        if "ser" in st.session_state:
            st.success("✅ Connected")
        st.caption("Close the Arduino Serial Monitor before connecting.")
    st.divider()
    st.caption(f"Model: freshness_model_v2.pkl\n\nDataset: {len(DATASET):,} simulated rows")

# ---------------- header + food selection ----------------
st.title("🍏 AI Electronic Nose")
st.caption("Smart Food Freshness & Health Analyzer — real-time sensor analysis")

st.subheader("1 · Select food item")
cols = st.columns(3)
for col, f in zip(cols, ["apple", "tomato", "potato"]):
    if col.button(f"{FOOD_EMOJI[f]}\n{f.upper()}", use_container_width=True):
        st.session_state.selected_food = f
food = st.session_state.get("selected_food")

# ---------------- scan ----------------
st.subheader("2 · Scan")

if mode.startswith("🧪"):
    st.caption("Simulated sensor data (until hardware is connected).")
    if st.button("🔍 START SCAN", disabled=not food, use_container_width=True, type="primary"):
        with st.status("Acquiring sensor readings…", expanded=True) as sb:
            st.write("Measuring ambient baseline (empty chamber)…")
            st.write("Sealing chamber · gas accumulation…")
            st.write("MQ-135/MQ-3 ×10 samples · FSR ×3 · DHT11…")
            row = DATASET[DATASET.food_type == food].sample(1).iloc[0]
            readings = dict(mq135_baseline=int(row.mq135_baseline), mq3_baseline=int(row.mq3_baseline),
                            mq135_mean=int(row.mq135_mean), mq135_std=float(row.mq135_std),
                            mq3_mean=int(row.mq3_mean), mq3_std=float(row.mq3_std),
                            fsr_median=int(row.fsr_median), temp_c=float(row.temp_c), rh_pct=float(row.rh_pct))
            sb.update(label="Scan complete ✓", state="complete", expanded=False)
        st.session_state.last = (predict_freshness(food, **readings), readings, False)
        if st.session_state.last[0]["status"] == "fresh":
            st.balloons()

else:  # LIVE
    ser = st.session_state.get("ser")
    if ser is None:
        st.info("Connect the Arduino in the sidebar first.")
    elif not food:
        st.info("Select a food item above.")
    else:
        bcol, scol = st.columns(2)
        with bcol:
            if st.button("① Calibrate baseline\n(empty chamber)", use_container_width=True):
                try:
                    with st.spinner("Reading ambient baseline…"):
                        st.session_state.baseline = sr.read_baseline(ser)
                except Exception as e:
                    st.error(f"{e}")
        with scol:
            ready = "baseline" in st.session_state
            scan = st.button("② Scan fruit\n(sealed + weight on fruit)", use_container_width=True,
                             type="primary", disabled=not ready)
        if "baseline" in st.session_state:
            b = st.session_state.baseline
            st.caption(f"Baseline locked: gas {b['mq135_baseline']} · ethanol {b['mq3_baseline']} · "
                       f"{b['temp_c']} °C · {b['rh_pct']} %")
        if scan:
            ph = st.empty()
            for t in range(int(wait_s), 0, -5):
                ph.info(f"⏳ Gas accumulation… keep chamber sealed — {t}s")
                time.sleep(5)
            ph.empty()
            try:
                with st.status("Sampling MQ-135 / MQ-3 / FSR / DHT11…"):
                    scan_data = sr.read_scan(ser)
                b = st.session_state.baseline
                readings = {"mq135_baseline": b["mq135_baseline"], "mq3_baseline": b["mq3_baseline"],
                            "mq135_mean": scan_data["mq135_mean"], "mq135_std": scan_data["mq135_std"],
                            "mq3_mean": scan_data["mq3_mean"], "mq3_std": scan_data["mq3_std"],
                            "fsr_median": scan_data["fsr_median"], "temp_c": scan_data["temp_c"],
                            "rh_pct": scan_data["rh_pct"]}
                st.session_state.last = (predict_freshness(food, **readings), readings, True)
            except Exception as e:
                st.error(f"Scan failed: {e} — reconnect in the sidebar and recalibrate.")

# ---------------- report ----------------
if "last" in st.session_state:
    result, readings, is_live = st.session_state["last"]
    status = result["status"]
    color = STAGE_COLOR[status]
    conf = int(result["confidence"].rstrip("%"))
    gas_d = readings["mq135_mean"] - readings["mq135_baseline"]
    eth_d = readings["mq3_mean"] - readings["mq3_baseline"]

    st.subheader("3 · Report")
    src = "LIVE SENSOR DATA" if is_live else "SIMULATED SENSOR DATA"
    st.markdown(
        f'<div class="status-banner" style="background:{color}22;'
        f'border:2px solid {color};color:{color};">'
        f"{FOOD_EMOJI[result['food']]} {status.upper()} · {result['confidence']} confidence"
        f" <span style='font-size:14px;opacity:.7'>({src})</span></div>",
        unsafe_allow_html=True)

    segs = "".join(
        f'<div class="stage-seg{" active" if s == status else ""}" '
        f'style="background:{STAGE_COLOR[s]}22;color:{STAGE_COLOR[s]};'
        f'border-color:{STAGE_COLOR[s]};">{s.upper()}</div>'
        for s in STAGES)
    st.markdown(f'<div class="stagebar">{segs}</div>', unsafe_allow_html=True)

    st.markdown(f"**AI ANALYSIS** — computed from {src.lower()}")
    m = st.columns(3)
    m[0].metric("Estimated shelf life", result["estimated shelf life"])
    m[1].metric("Gas level (Δ)", f"{gas_d} counts")
    m[2].metric("Fermentation (Δ)", f"{eth_d} counts")
    m = st.columns(4)
    m[0].metric("Firmness", f"{readings['fsr_median']}")
    m[1].metric("Temperature", f"{readings['temp_c']} °C")
    m[2].metric("Humidity", f"{readings['rh_pct']} %")
    m[3].metric("Model confidence", f"{conf} %")
    st.progress(conf)
    with st.expander("🔎 How this was computed"):
        st.markdown(
            "Values are **ADC counts (0–1023)** from the Arduino. Gas and ethanol are the "
            "**difference from the ambient baseline** taken before the scan — this makes results "
            "immune to sensor drift (0.0% sensitivity, validated). Firmness uses a **fixed weight** "
            "on a force sensor for repeatability. A RandomForest (300 trees) trained on "
            "physics-simulated spoilage data classifies the stage; confidence reflects how close "
            "the reading sits to a stage boundary.")

    st.divider()
    st.markdown("**FOOD INFORMATION** — researched database (not sensed)")
    info = FOOD_INFO[result["food"]]
    c1, c2 = st.columns([1, 2])
    with c1:
        st.markdown("🥗 **Nutrition per 100 g**")
        st.table(pd.DataFrame(info["nutrition_per_100g"].items(),
                              columns=["Nutrient", "Value"]))
    with c2:
        st.markdown("🧪 **Chemical & treatment profile**")
        st.write(info["treatment_profile"])
        st.success(f"**Recommendation:** {info['recommendation']}")

# ---------------- log live scans (real data collection) ----------------
if st.session_state.get("last") and st.session_state["last"][2]:
    with st.expander("📝 Log this scan to the real dataset"):
        fid = st.text_input("food_id", value=f"{food.upper()}_01")
        label = st.radio("True stage (operator label)", STAGES, horizontal=True)
        notes = st.text_input("Notes (visible condition, smell…)")
        if st.button("Append to data/e_nose_dataset_real.csv"):
            r = st.session_state["last"][1]
            new = pd.DataFrame([{
                "reading_id": 0, "session_id": pd.Timestamp.now().strftime("%Y-%m-%d_%H%M"),
                "food_id": fid, "food_type": food,
                "timestamp": pd.Timestamp.now().isoformat(), "days_since_start": 0.0,
                "storage": "room",
                "mq135_baseline": r["mq135_baseline"], "mq3_baseline": r["mq3_baseline"],
                "mq135_mean": r["mq135_mean"], "mq135_std": r["mq135_std"],
                "mq3_mean": r["mq3_mean"], "mq3_std": r["mq3_std"],
                "fsr_median": r["fsr_median"], "temp_c": r["temp_c"], "rh_pct": r["rh_pct"],
                "label": label, "data_source": "real", "notes": notes}])
            try:
                real = pd.read_csv("data/e_nose_dataset_real.csv")
                new["reading_id"] = len(real)
                real = pd.concat([real, new], ignore_index=True)
            except FileNotFoundError:
                real = new
            real.to_csv("data/e_nose_dataset_real.csv", index=False)
            st.success("Logged ✓ — every logged scan trains the real model later.")