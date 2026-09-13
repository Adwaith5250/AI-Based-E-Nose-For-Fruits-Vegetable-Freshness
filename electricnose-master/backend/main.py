import json
from pathlib import Path

from .predict import predict_freshness
from .dataset_service import get_dataset_reading

ROOT = Path(__file__).resolve().parents[1]
FOOD_INFO_PATH = ROOT / "food_info.json"

SENSOR_FIELDS = (
    "mq135_baseline", "mq3_baseline", "mq135_mean", "mq135_std",
    "mq3_mean", "mq3_std", "fsr_median", "temp_c", "rh_pct"
)

with FOOD_INFO_PATH.open() as f:
    FOOD_INFO = json.load(f)

def print_report(food, result):
    info = FOOD_INFO[food]
    print("\n" + "=" * 55)
    print(f"     FOOD FRESHNESS REPORT — {food.upper()}")
    print("=" * 55)
    print("\n--- AI ANALYSIS (from sensor data) ---")
    print(f"Status:               {result['status'].upper()}")
    print(f"Confidence:           {result['confidence']}")
    print(f"Estimated shelf life: {result['estimated shelf life']}")
    print(f"Sensor readings:      {result['sensor readings']}")
    print("\n--- FOOD INFORMATION (researched database) ---")
    print(f"Nutrition per 100g:   {info['nutrition_per_100g']}")
    print(f"Treatment profile:    {info['treatment_profile']}")
    print(f"Recommendation:       {info['recommendation']}")
    print("=" * 55 + "\n")

def get_readings_simulated(food):
    """Stands in for the Arduino using the shared backend dataset selector."""
    return get_dataset_reading(food)

def get_readings_live():
    """HARDWARE DAY: open serial port, trigger Arduino, parse its CSV line."""
    raise NotImplementedError("Arduino not connected yet — use simulated mode")

def main():
    food = input("Food to scan (apple/tomato/potato): ").strip().lower()
    while food not in ("apple", "banana", "tomato", "potato", "carrot"):
        food = input("Please type apple, banana, tomato, potato, or carrot: ").strip().lower()

    readings = get_readings_simulated(food)     # ← swap to get_readings_live() on hardware day
    sensor_readings = {field: readings[field] for field in SENSOR_FIELDS}
    result = predict_freshness(food, **sensor_readings)
    print_report(food, result)


if __name__ == "__main__":
    main()