# Hardware Handoff

## One-time setup

1. Install Arduino IDE.
2. Install the `DHT sensor library` from Arduino IDE Library Manager.
3. Open `arduino_electronic_nose.ino`.
4. Connect the Arduino Uno with a USB Type-B cable.
5. Select **Arduino Uno** and the correct COM port.
6. Upload the sketch.
7. Close Arduino Serial Monitor before opening the web app.

## Wiring

| Component | Pin in the sketch |
| --- | --- |
| MQ-135 analog output | A0 |
| MQ-3 analog output | A1 |
| FSR voltage-divider output | A2 |
| DHT11 data | D2 |
| Sensor power/ground | 5V/GND |

Use the 10k ohm resistor with the FSR as a voltage divider. Confirm sensor modules accept the Arduino voltage before wiring them.

## Data protocol

The sketch uses 9600 baud and emits:

```text
READY
B,mq135_baseline,mq3_baseline,temp_c,rh_pct
S,mq135_mean,mq135_std,mq3_mean,mq3_std,fsr_median,temp_c,rh_pct
```

The React Live mode sends `B` for baseline calibration and `S:FOOD` for a scan. It reads the returned values and sends them to the Python model.

## Running the app

From the project root:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
npm run frontend:install
npm run dev
```

Open the Vite URL shown in the terminal using Chrome or Edge. Switch to **Live** mode, choose **Connect Device**, select the Arduino port, calibrate the empty chamber, place the produce in the chamber, and start the scan.

The real reading is saved to `data/e_nose_dataset_real.csv` after submitting the dataset log. Demo data remains in `data/e_nose_dataset_v2_synthetic.csv`.

## Important limitation

The bundled model is trained on synthetic data. It will run with real sensors, but collect labeled real readings for each food and freshness stage before relying on the results for research or safety decisions.
