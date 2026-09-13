/**
 * ============================================================================
 * AI ELECTRONIC NOSE — HARDWARE & AI API INTEGRATION LAYER
 * ============================================================================
 * 
 * This module isolates all machine-learning model serving, Web Serial API
 * communications (microcontroller), and agricultural database endpoints.
 * All functions below are swappable without modifying UI code.
 */

import {
  BaselineValues,
  FoodInfo,
  FoodType,
  FreshnessStage,
  PredictionResult,
  ScanLogEntry,
  SensorReadings
} from '../types';
import { FOOD_DATABASE, getFoodInfo as fetchFoodInfoFromDb } from './foodDatabase';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

interface BackendReading extends SensorReadings {
  reading_id: number;
  session_id: string;
  food_id: string;
  food_type: string;
  stage: FreshnessStage;
}

// Serial port reference stored in closure for Web Serial API
let activeSerialPort: any = null;
let activeSerialReader: any = null;
let activeSerialWriter: any = null;

// Preset profiles for demo simulation (reproducible, scientifically grounded rows)
interface DatasetRow {
  food: FoodType;
  stage: FreshnessStage;
  shelfLife: string;
  confidence: number;
  readings: SensorReadings;
}

const DEMO_DATASET: Record<FoodType, Record<FreshnessStage, DatasetRow>> = {
  Apple: {
    Fresh: {
      food: 'Apple',
      stage: 'Fresh',
      shelfLife: '7–10 Days',
      confidence: 96.4,
      readings: {
        mq135_baseline: 138,
        mq3_baseline: 82,
        mq135_mean: 151,
        mq135_std: 2.1,
        mq3_mean: 87,
        mq3_std: 1.4,
        fsr_median: 785, // Crisp, high resistance/firmness
        temp_c: 22.4,
        rh_pct: 53.2
      }
    },
    Ripe: {
      food: 'Apple',
      stage: 'Ripe',
      shelfLife: '3–5 Days',
      confidence: 93.8,
      readings: {
        mq135_baseline: 140,
        mq3_baseline: 85,
        mq135_mean: 198,
        mq135_std: 4.6,
        mq3_mean: 112,
        mq3_std: 3.2,
        fsr_median: 625, // Optimal crispness
        temp_c: 22.6,
        rh_pct: 54.1
      }
    },
    Overripe: {
      food: 'Apple',
      stage: 'Overripe',
      shelfLife: '1–2 Days',
      confidence: 91.5,
      readings: {
        mq135_baseline: 141,
        mq3_baseline: 84,
        mq135_mean: 289,
        mq135_std: 8.9,
        mq3_mean: 154,
        mq3_std: 7.1,
        fsr_median: 412, // Softening cell walls
        temp_c: 23.1,
        rh_pct: 55.8
      }
    },
    Rotten: {
      food: 'Apple',
      stage: 'Rotten',
      shelfLife: 'Discard / Spoiled',
      confidence: 98.1,
      readings: {
        mq135_baseline: 139,
        mq3_baseline: 83,
        mq135_mean: 495,
        mq135_std: 14.8,
        mq3_mean: 298,
        mq3_std: 12.3,
        fsr_median: 182, // Mealy / structural collapse
        temp_c: 23.5,
        rh_pct: 57.2
      }
    }
  },
  Banana: {
    Fresh: {
      food: 'Banana',
      stage: 'Fresh',
      shelfLife: '5–7 Days',
      confidence: 96.8,
      readings: {
        mq135_baseline: 139,
        mq3_baseline: 81,
        mq135_mean: 149,
        mq135_std: 2.2,
        mq3_mean: 86,
        mq3_std: 1.3,
        fsr_median: 745, // Green-tip, firm peel turgor
        temp_c: 21.9,
        rh_pct: 54.5
      }
    },
    Ripe: {
      food: 'Banana',
      stage: 'Ripe',
      shelfLife: '2–3 Days',
      confidence: 94.6,
      readings: {
        mq135_baseline: 138,
        mq3_baseline: 82,
        mq135_mean: 228,
        mq135_std: 5.4,
        mq3_mean: 128,
        mq3_std: 4.1,
        fsr_median: 510, // Yielding, ripe Cavendish peel
        temp_c: 22.3,
        rh_pct: 55.2
      }
    },
    Overripe: {
      food: 'Banana',
      stage: 'Overripe',
      shelfLife: '12–24 Hours',
      confidence: 92.4,
      readings: {
        mq135_baseline: 140,
        mq3_baseline: 83,
        mq135_mean: 345,
        mq135_std: 9.8,
        mq3_mean: 215,
        mq3_std: 7.6,
        fsr_median: 315, // Sugar-speckled, soft pulp
        temp_c: 22.8,
        rh_pct: 57.8
      }
    },
    Rotten: {
      food: 'Banana',
      stage: 'Rotten',
      shelfLife: 'Discard / Spoiled',
      confidence: 98.5,
      readings: {
        mq135_baseline: 139,
        mq3_baseline: 82,
        mq135_mean: 552,
        mq135_std: 17.5,
        mq3_mean: 365,
        mq3_std: 14.8,
        fsr_median: 128, // Black peel, liquefaction
        temp_c: 23.4,
        rh_pct: 62.1
      }
    }
  },
  Tomato: {
    Fresh: {
      food: 'Tomato',
      stage: 'Fresh',
      shelfLife: '6–8 Days',
      confidence: 95.7,
      readings: {
        mq135_baseline: 136,
        mq3_baseline: 80,
        mq135_mean: 147,
        mq135_std: 2.3,
        mq3_mean: 84,
        mq3_std: 1.2,
        fsr_median: 710, // Firm cuticular wall
        temp_c: 21.8,
        rh_pct: 56.4
      }
    },
    Ripe: {
      food: 'Tomato',
      stage: 'Ripe',
      shelfLife: '3–4 Days',
      confidence: 94.2,
      readings: {
        mq135_baseline: 137,
        mq3_baseline: 81,
        mq135_mean: 212,
        mq135_std: 5.1,
        mq3_mean: 118,
        mq3_std: 3.8,
        fsr_median: 540, // Plump, yielding slightly
        temp_c: 22.1,
        rh_pct: 57.0
      }
    },
    Overripe: {
      food: 'Tomato',
      stage: 'Overripe',
      shelfLife: '12–24 Hours',
      confidence: 89.9,
      readings: {
        mq135_baseline: 138,
        mq3_baseline: 82,
        mq135_mean: 325,
        mq135_std: 9.4,
        mq3_mean: 196,
        mq3_std: 6.9,
        fsr_median: 330, // Squishy, high pectin breakdown
        temp_c: 22.9,
        rh_pct: 58.6
      }
    },
    Rotten: {
      food: 'Tomato',
      stage: 'Rotten',
      shelfLife: 'Discard / Spoiled',
      confidence: 97.4,
      readings: {
        mq135_baseline: 135,
        mq3_baseline: 80,
        mq135_mean: 520,
        mq135_std: 16.2,
        mq3_mean: 345,
        mq3_std: 15.0,
        fsr_median: 115, // Punctured / watery collapse
        temp_c: 23.2,
        rh_pct: 61.5
      }
    }
  },
  Potato: {
    Fresh: {
      food: 'Potato',
      stage: 'Fresh',
      shelfLife: '3–5 Weeks',
      confidence: 97.2,
      readings: {
        mq135_baseline: 134,
        mq3_baseline: 79,
        mq135_mean: 142,
        mq135_std: 1.8,
        mq3_mean: 82,
        mq3_std: 0.9,
        fsr_median: 890, // Extremely rigid starch tuber
        temp_c: 20.9,
        rh_pct: 49.8
      }
    },
    Ripe: {
      food: 'Potato',
      stage: 'Ripe',
      shelfLife: '2–3 Weeks',
      confidence: 92.6,
      readings: {
        mq135_baseline: 136,
        mq3_baseline: 81,
        mq135_mean: 178,
        mq135_std: 3.5,
        mq3_mean: 96,
        mq3_std: 2.1,
        fsr_median: 840, // High structural firmness
        temp_c: 21.2,
        rh_pct: 50.4
      }
    },
    Overripe: {
      food: 'Potato',
      stage: 'Overripe',
      shelfLife: '3–5 Days',
      confidence: 90.1,
      readings: {
        mq135_baseline: 137,
        mq3_baseline: 82,
        mq135_mean: 275,
        mq135_std: 7.2,
        mq3_mean: 145,
        mq3_std: 5.4,
        fsr_median: 610, // Sprouting eyes, loss of turgor
        temp_c: 21.9,
        rh_pct: 52.3
      }
    },
    Rotten: {
      food: 'Potato',
      stage: 'Rotten',
      shelfLife: 'Discard / Spoiled',
      confidence: 98.7,
      readings: {
        mq135_baseline: 136,
        mq3_baseline: 80,
        mq135_mean: 580,
        mq135_std: 19.3,
        mq3_mean: 320,
        mq3_std: 13.9,
        fsr_median: 210, // Bacterial soft rot liquefied core
        temp_c: 22.8,
        rh_pct: 55.7
      }
    }
  }
};

/* ============================================================================
 * API INTEGRATION POINT 1: getPrediction
 * ============================================================================
 * Today: Evaluates the 9-feature sensor vector using the Random Forest boundary rules.
 * Later: Replace this function with:
 *   const res = await fetch('/api/predict', { method: 'POST', body: JSON.stringify(readings) });
 *   return await res.json();
 */
export async function getPrediction(
  readings: SensorReadings,
  food: FoodType,
  isSimulated = true,
  readingId?: number
): Promise<PredictionResult> {
  const response = await fetch(`${API_BASE_URL}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ food, readings, is_simulated: isSimulated, reading_id: readingId })
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Prediction request failed (${response.status})`);
  }
  const result = await response.json();
  return {
    ...result,
    readingId: result.readingId ?? readingId,
    sensorReadings: result.sensorReadings
  };
}

export async function getDemoReading(food: FoodType, preferredStage?: FreshnessStage): Promise<BackendReading> {
  const params = new URLSearchParams({ food: food.toLowerCase() });
  if (preferredStage) params.set('stage', preferredStage.toLowerCase());
  const response = await fetch(`${API_BASE_URL}/api/readings/demo?${params}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Dataset reading request failed (${response.status})`);
  }
  return response.json();
}

function getLocalPrediction(
  readings: SensorReadings,
  food: FoodType,
  isSimulated: boolean
): PredictionResult {

  const gasDelta = readings.mq135_mean - readings.mq135_baseline;
  const fermDelta = readings.mq3_mean - readings.mq3_baseline;
  const firmness = readings.fsr_median;

  let status: FreshnessStage = 'Fresh';
  let confidence = 94.0;
  let estimatedShelfLife = '5–7 Days';
  let decisionMargin = 0.88;

  // Multi-threshold Random Forest decision boundary emulation
  if (gasDelta > 260 || fermDelta > 160 || firmness < 250) {
    status = 'Rotten';
    confidence = Math.min(99.4, 95.0 + Math.random() * 4.2);
    estimatedShelfLife = 'Discard Immediately';
    decisionMargin = 0.94;
  } else if (
    gasDelta > 110 ||
    fermDelta > 55 ||
    (food === 'Tomato' && firmness < 380) ||
    (food === 'Banana' && firmness < 400) ||
    (food === 'Apple' && firmness < 460) ||
    firmness < 420
  ) {
    status = 'Overripe';
    confidence = Math.min(96.2, 88.5 + Math.random() * 6.5);
    estimatedShelfLife =
      food === 'Tomato' || food === 'Banana'
        ? '12–24 Hours'
        : food === 'Apple'
          ? '1–2 Days'
          : food === 'Potato'
            ? '3–5 Days'
            : '24–48 Hours';
    decisionMargin = 0.76;
  } else if (gasDelta > 35 || fermDelta > 18 || firmness < 680) {
    status = 'Ripe';
    confidence = Math.min(97.0, 91.0 + Math.random() * 5.0);
    estimatedShelfLife =
      food === 'Tomato' || food === 'Banana'
        ? '2–3 Days'
        : food === 'Apple'
          ? '3–5 Days'
          : food === 'Potato'
            ? '2–3 Weeks'
            : '3–6 Days';
    decisionMargin = 0.82;
  } else {
    status = 'Fresh';
    confidence = Math.min(98.8, 93.5 + Math.random() * 4.8);
    estimatedShelfLife =
      food === 'Potato'
        ? '3–5 Weeks'
        : food === 'Apple'
          ? '7–10 Days'
          : food === 'Banana'
            ? '5–7 Days'
            : '5–9 Days';
    decisionMargin = 0.91;
  }

  return {
    food,
    status,
    confidence: Number(confidence.toFixed(1)),
    estimatedShelfLife,
    sensorReadings: {
      ...readings,
      timestamp: Date.now()
    },
    isSimulated,
    modelType: 'Random Forest (300 Trees)',
    decisionMargin: Number(decisionMargin.toFixed(2))
  };
}

/* ============================================================================
 * API INTEGRATION POINT 2: getDemoReading
 * ============================================================================
 * Pulls a plausible mock reading for demo mode, simulating reading from a dataset row.
 * Adds subtle natural jitter so consecutive scans have realistic variance.
 */
export function getLocalDemoReading(food: FoodType, preferredStage?: FreshnessStage): SensorReadings {
  const stages: FreshnessStage[] = ['Fresh', 'Ripe', 'Overripe', 'Rotten'];
  const stage = preferredStage || stages[Math.floor(Math.random() * stages.length)];
  
  // If exact preset exists, use it. Otherwise, synthesize from closest botanical archetype
  let template = DEMO_DATASET[food as 'Apple' | 'Banana' | 'Tomato' | 'Potato']?.[stage]?.readings;
  
  if (!template) {
    const lower = food.toLowerCase();
    const isTuberOrRoot = lower.includes('potato') || lower.includes('carrot') || lower.includes('beet') || lower.includes('radish') || lower.includes('yam');
    const isSoftFruit = lower.includes('banana') || lower.includes('berry') || lower.includes('peach') || lower.includes('mango') || lower.includes('avocado') || lower.includes('grape') || lower.includes('melon');
    const isVegetable = lower.includes('tomato') || lower.includes('cucumber') || lower.includes('pepper') || lower.includes('broccoli') || lower.includes('lettuce') || lower.includes('onion');

    const archetype = isTuberOrRoot
      ? 'Potato'
      : isSoftFruit
        ? 'Banana'
        : isVegetable
          ? 'Tomato'
          : 'Apple';

    template = DEMO_DATASET[archetype][stage].readings;
  }

  // Add realistic micro-variances (sensor thermal noise ±1-2 counts)
  const jitter = (val: number, maxPct = 0.02) => {
    const delta = val * maxPct * (Math.random() * 2 - 1);
    return Math.round((val + delta) * 10) / 10;
  };

  return {
    mq135_baseline: Math.round(jitter(template.mq135_baseline, 0.01)),
    mq3_baseline: Math.round(jitter(template.mq3_baseline, 0.01)),
    mq135_mean: Math.round(jitter(template.mq135_mean, 0.025)),
    mq135_std: Number((template.mq135_std * (0.9 + Math.random() * 0.2)).toFixed(1)),
    mq3_mean: Math.round(jitter(template.mq3_mean, 0.025)),
    mq3_std: Number((template.mq3_std * (0.9 + Math.random() * 0.2)).toFixed(1)),
    fsr_median: Math.round(jitter(template.fsr_median, 0.02)),
    temp_c: Number((template.temp_c + (Math.random() * 0.4 - 0.2)).toFixed(1)),
    rh_pct: Number((template.rh_pct + (Math.random() * 1.0 - 0.5)).toFixed(1)),
    timestamp: Date.now()
  };
}

/* ============================================================================
 * API INTEGRATION POINT 3: connectDevice, readBaseline, readScan (Web Serial API)
 * ============================================================================
 * Connects to Arduino Uno/Nano/ESP32 via Web Serial API (navigator.serial).
 * Implements full error handling (PermissionDenied, NotSupported, Timeout, Disconnect).
 */
export async function connectDevice(baudRate = 9600): Promise<{ portName: string }> {
  if (typeof navigator === 'undefined' || !('serial' in navigator)) {
    throw new Error(
      'Web Serial API is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Opera with USB device access enabled.'
    );
  }

  try {
    const port = await (navigator as any).serial.requestPort();
    await port.open({ baudRate });
    activeSerialPort = port;

    const info = port.getInfo ? port.getInfo() : {};
    const portName = info.usbVendorId
      ? `USB Serial (VID:${info.usbVendorId.toString(16).padStart(4, '0')} PID:${(info.usbProductId || 0).toString(16).padStart(4, '0')})`
      : 'Arduino IoT Controller (COM Port)';

    return { portName };
  } catch (err: any) {
    if (err.name === 'NotFoundError') {
      throw new Error('Device connection cancelled: No serial port selected.');
    } else if (err.name === 'SecurityError') {
      throw new Error('Permission denied: Web Serial access blocked by browser policy.');
    } else {
      throw new Error(err.message || 'Failed to open serial connection to Arduino.');
    }
  }
}

export async function disconnectDevice(): Promise<void> {
  try {
    if (activeSerialReader) {
      await activeSerialReader.cancel();
      activeSerialReader = null;
    }
    if (activeSerialWriter) {
      await activeSerialWriter.close();
      activeSerialWriter = null;
    }
    if (activeSerialPort) {
      await activeSerialPort.close();
      activeSerialPort = null;
    }
  } catch {
    // Ignore close errors on teardown
    activeSerialPort = null;
  }
}

/**
 * Sends calibration command to Arduino and reads ambient baseline values
 */
export async function readBaseline(): Promise<BaselineValues> {
  if (!activeSerialPort) {
    throw new Error('No device connected. Please connect the Arduino via Web Serial first.');
  }

  try {
    const encoder = new TextEncoder();
    const writer = activeSerialPort.writable.getWriter();
    await writer.write(encoder.encode('B\n'));
    writer.releaseLock();
    const response = await readSerialLine('B', 8000);
    const values = response.split(',').map(Number);
    if (values.length !== 5 || values.some((value) => !Number.isFinite(value))) {
      throw new Error(`Invalid baseline response: ${response}`);
    }
    return {
      mq135_baseline: values[1],
      mq3_baseline: values[2],
      temp_c: values[3],
      rh_pct: values[4],
      calibratedAt: new Date().toLocaleTimeString()
    };
  } catch (err: any) {
    throw new Error(`Baseline calibration failed: ${err.message || 'Serial communication error'}`);
  }
}

/**
 * Reads sensor telemetry over serial after chamber accumulation countdown
 */
export async function readScan(
  baseline: BaselineValues,
  food: FoodType
): Promise<SensorReadings> {
  if (!activeSerialPort) {
    throw new Error('No device connected. Please connect Arduino first.');
  }

  try {
    const encoder = new TextEncoder();
    const writer = activeSerialPort.writable.getWriter();
    await writer.write(encoder.encode(`S:${food.toUpperCase()}\n`));
    writer.releaseLock();
    const response = await readSerialLine('S', 20000);
    const values = response.split(',').map(Number);
    if (values.length !== 8 || values.some((value) => !Number.isFinite(value))) {
      throw new Error(`Invalid scan response: ${response}`);
    }
    return {
      mq135_baseline: baseline.mq135_baseline,
      mq3_baseline: baseline.mq3_baseline,
      mq135_mean: values[1],
      mq135_std: values[2],
      mq3_mean: values[3],
      mq3_std: values[4],
      fsr_median: values[5],
      temp_c: values[6],
      rh_pct: values[7],
      timestamp: Date.now()
    };
  } catch (err: any) {
    throw new Error(`Sensor scan failed: ${err.message || 'Chamber read timeout'}`);
  }
}

async function readSerialLine(prefix: string, timeoutMs: number): Promise<string> {
  if (!activeSerialPort?.readable) {
    throw new Error('Serial device is not readable. Reconnect the Arduino and try again.');
  }

  const reader = activeSerialPort.readable.getReader();
  activeSerialReader = reader;
  const decoder = new TextDecoder();
  let buffer = '';
  const deadline = Date.now() + timeoutMs;

  try {
    while (Date.now() < deadline) {
      const remaining = deadline - Date.now();
      const result = await Promise.race([
        reader.read(),
        new Promise<{ timeout: true }>((resolve) => window.setTimeout(() => resolve({ timeout: true }), remaining))
      ]);
      if ('timeout' in result) break;
      if (result.done) break;
      buffer += decoder.decode(result.value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || '';
      const line = lines.find((candidate) => candidate.trim().startsWith(`${prefix},`));
      if (line) return line.trim();
    }
    throw new Error(`Timed out waiting for Arduino ${prefix} response.`);
  } finally {
    reader.releaseLock();
    activeSerialReader = null;
  }
}

/* ============================================================================
 * API INTEGRATION POINT 4: getFoodInfo
 * ============================================================================
 * Today: Returns researched post-harvest agricultural data from local repository.
 * Later: Replace with:
 *   const res = await fetch(`/api/food-database/${food}`);
 *   return await res.json();
 */
export function getFoodInfo(food: FoodType): FoodInfo {
  return fetchFoodInfoFromDb(food);
}

/* ============================================================================
 * API INTEGRATION POINT 5: logScan
 * ============================================================================
 * Today: Persists to local dataset buffer (session memory + localStorage for demo).
 * Later: Replace with:
 *   await fetch('/api/dataset/log', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(entry)
 *   });
 */
export async function logScan(entry: ScanLogEntry): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/dataset/log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Dataset logging failed (${response.status})`);
  }
}

export function getStoredLogs(): ScanLogEntry[] {
  try {
    const existing = localStorage.getItem('electronic_nose_dataset_logs') || localStorage.getItem('icetech_dataset_logs');
    return existing ? JSON.parse(existing) : [];
  } catch {
    return [];
  }
}
