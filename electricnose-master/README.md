# AI Electronic Nose

IoT + AI freshness classification for apples, bananas, tomatoes, potatoes, and carrots. The model uses baseline-calibrated MQ-135, MQ-3, FSR, temperature, and humidity readings to classify Fresh, Ripe, Overripe, or Rotten.

## First-time setup

On Windows, from the project root:

```powershell
.\setup_windows.ps1
```

### Git LFS model files

The deployment model `models/freshness_model_v2.pkl` is stored with Git LFS because it is larger than GitHub's normal file-size limit.

Install Git LFS once on the machine, then pull the model after cloning:

```powershell
git lfs install
git clone https://github.com/jfs1336/electricnose.git
Set-Location electricnose
git lfs pull
```

When using an existing checkout, run `git lfs pull` from the project root before starting the backend. The Windows setup script runs this automatically when Git LFS is available.

Hardware upload and wiring instructions are in [hardware/README.md](hardware/README.md).

## Run the system

From `D:\electricnose`:

```powershell
# Start backend and React frontend together
npm run dev
```

Open the Vite URL shown in the terminal. The frontend calls the API at `http://localhost:8000` by default. Set `VITE_API_BASE_URL` in `frontend/enose_project/.env.local` when the API is hosted elsewhere.

The CLI remains available:

```powershell
python main.py
```

## Backend layout

- `backend/api_server.py`: FastAPI endpoints used by React
- `backend/predict.py`: trained Random Forest inference
- `backend/dataset_service.py`: deterministic dataset-row selection
- `backend/main.py`: terminal scanner
- `backend/serial_reader.py`: Python serial integration
- `hardware/arduino_electronic_nose.ino`: Arduino firmware template
- `data/e_nose_dataset_v2_synthetic.csv`: sensor training/demo rows
- `data/e_nose_dataset_real.csv`: hardware readings saved by live scans
- `models/freshness_model_v2.pkl`: trained deployment model

## Hardware protocol

Upload `hardware/arduino_electronic_nose.ino` after installing the Arduino DHT sensor library and matching the pin constants to the wiring. Use 9600 baud. The board must emit:

- `READY` after startup
- `B,mq135_baseline,mq3_baseline,temp_c,rh_pct` for baseline calibration
- `S,mq135_mean,mq135_std,mq3_mean,mq3_std,fsr_median,temp_c,rh_pct` for a scan

The React live mode sends `B` and `S:<FOOD>` commands over Web Serial. The food name is retained for model/report context; the Arduino reads the sensor values.

Demo scans update their original synthetic row. Live scans are appended to `data/e_nose_dataset_real.csv`, so hardware data never changes the synthetic training dataset.

## Validation

The v2 model is trained on five foods and evaluated with a held-out grouped split. The latest training run reported about 80% held-out accuracy. Treat this as an exhibition prototype: collect real labeled sensor readings and retrain before making production food-safety claims.
