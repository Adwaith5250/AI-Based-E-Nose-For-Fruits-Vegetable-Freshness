import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Cpu,
  Flame,
  Info,
  Layers,
  Loader2,
  Lock,
  Play,
  Radio,
  RefreshCw,
  Scale,
  Sparkles,
  Thermometer,
  Unlock,
  Usb,
  Wind,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  BaselineValues,
  ConnectionStatus,
  FoodType,
  FreshnessStage,
  PredictionResult,
  SensorReadings,
} from "../types";
import {
  connectDevice,
  disconnectDevice,
  getDemoReading,
  getPrediction,
  readBaseline,
  readScan,
} from "../services/apiIntegration";
import { SensorOscilloscope } from "./SensorOscilloscope";
import {
  playChirp,
  playCountdownTick,
  playCompleteChime,
} from "../services/soundEffects";

interface ScanSectionProps {
  mode: "demo" | "live";
  selectedFood: FoodType | null;
  chamberTime: number;
  baudRate: number;
  preferredDemoStage: string;
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (s: ConnectionStatus) => void;
  portName: string | null;
  setPortName: (name: string | null) => void;
  onScanComplete: (result: PredictionResult) => void;
  isScanning: boolean;
  setIsScanning: (v: boolean) => void;
  onSelectFood?: (food: FoodType) => void;
}

export const ScanSection: React.FC<ScanSectionProps> = ({
  mode,
  selectedFood,
  chamberTime,
  baudRate,
  preferredDemoStage,
  connectionStatus,
  setConnectionStatus,
  portName,
  setPortName,
  onScanComplete,
  isScanning,
  setIsScanning,
  onSelectFood,
}) => {
  // Demo Mode Progress States
  const [demoStep, setDemoStep] = useState<number>(0); // 0: idle, 1: baseline, 2: gas chamber, 3: sampling, 4: complete
  const [demoProgressPct, setDemoProgressPct] = useState<number>(0);
  const [showOscilloscope, setShowOscilloscope] = useState<boolean>(true);

  // Live Mode States
  const [serialError, setSerialError] = useState<string | null>(null);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [baselineValues, setBaselineValues] = useState<BaselineValues | null>(
    null,
  );
  const [liveCountdown, setLiveCountdown] = useState<number>(0);

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  // Trigger celebration if fresh
  const triggerCelebrationIfFresh = (stage: FreshnessStage) => {
    playCompleteChime(stage === "Fresh");
    if (stage === "Fresh") {
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.65 },
          colors: ["#53769f", "#436790", "#6988ab", "#6789b0", "#141415"],
        });
      } catch {
        // Safe fallback
      }
    }
  };

  /* ==========================================================================
   * DEMO SCAN FLOW
   * Staged progress sequence:
   * 1. "Reading ambient baseline" (~1.1s)
   * 2. "Sealing chamber, accumulating gas" (~1.4s)
   * 3. "Sampling MQ-135 / MQ-3 (×10), FSR (×3), DHT11" (~1.2s)
   * ========================================================================== */
  const handleStartDemoScan = async (
    forcedFood?: FoodType,
    forcedStage?: FreshnessStage,
  ) => {
    const foodToScan = forcedFood || selectedFood;
    if (!foodToScan || isScanning) return;

    if (forcedFood && onSelectFood) {
      onSelectFood(forcedFood);
    }

    playChirp(880, 0.05);
    setIsScanning(true);
    setDemoStep(1);
    setDemoProgressPct(15);

    // Step 1: Ambient baseline
    await new Promise((r) => setTimeout(r, 1000));
    playChirp(1040, 0.04);
    setDemoStep(2);
    setDemoProgressPct(55);

    // Step 2: Chamber gas accumulation
    await new Promise((r) => setTimeout(r, 1300));
    playChirp(1200, 0.04);
    setDemoStep(3);
    setDemoProgressPct(90);

    // Step 3: Multi-sensor sampling
    await new Promise((r) => setTimeout(r, 1100));
    setDemoStep(4);
    setDemoProgressPct(100);

    // Fetch realistic mock reading & predict
    const targetStage =
      forcedStage ||
      (preferredDemoStage && preferredDemoStage !== "random"
        ? (preferredDemoStage as FreshnessStage)
        : undefined);

    const readings = await getDemoReading(foodToScan, targetStage);
    const prediction = await getPrediction(readings, foodToScan, true, readings.reading_id);

    setIsScanning(false);
    triggerCelebrationIfFresh(prediction.status);
    onScanComplete(prediction);
  };

  /* ==========================================================================
   * LIVE MODE: HARDWARE CONNECT
   * ========================================================================== */
  const handleConnectDevice = async () => {
    setSerialError(null);
    setConnectionStatus("connecting");

    try {
      const res = await connectDevice(baudRate);
      setPortName(res.portName);
      setConnectionStatus("connected");
      playChirp(950, 0.08);
    } catch (err: any) {
      setConnectionStatus("disconnected");
      setSerialError(err.message || "Failed to connect serial port.");
    }
  };

  // Virtual loopback device for exhibition judges without USB hardware
  const handleConnectVirtualHardware = async () => {
    setSerialError(null);
    setConnectionStatus("connecting");
    await new Promise((r) => setTimeout(r, 600));
    setPortName("Arduino Uno Rev3 (Virtual Port Loopback)");
    setConnectionStatus("connected");
    playChirp(950, 0.08);
  };

  const handleDisconnect = async () => {
    await disconnectDevice();
    setConnectionStatus("disconnected");
    setPortName(null);
    setBaselineValues(null);
  };

  /* ==========================================================================
   * LIVE MODE: CALIBRATE BASELINE (STEP 1)
   * ========================================================================== */
  const handleCalibrateBaseline = async () => {
    if (connectionStatus !== "connected" || isCalibrating) return;

    setIsCalibrating(true);
    setSerialError(null);
    playChirp(700, 0.05);

    try {
      await new Promise((r) => setTimeout(r, 1800));
      const baseline = await readBaseline();
      setBaselineValues(baseline);
      playChirp(1200, 0.08);
    } catch (err: any) {
      setSerialError(err.message || "Baseline calibration timed out.");
    } finally {
      setIsCalibrating(false);
    }
  };

  /* ==========================================================================
   * LIVE MODE: SCAN SPECIMEN (STEP 2)
   * Countdown using chamber accumulation time, then read telemetry over serial
   * ========================================================================== */
  const handleStartLiveScan = async () => {
    if (!selectedFood || !baselineValues || isScanning) return;

    setIsScanning(true);
    setSerialError(null);
    setLiveCountdown(chamberTime);
    playChirp(880, 0.06);

    let remaining = chamberTime;

    // Run countdown interval
    await new Promise<void>((resolve) => {
      countdownTimerRef.current = setInterval(() => {
        remaining -= 1;
        setLiveCountdown(remaining);
        playCountdownTick();

        if (remaining <= 0) {
          if (countdownTimerRef.current)
            clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
          resolve();
        }
      }, 1000);
    });

    try {
      const readings = await readScan(baselineValues, selectedFood);
      const prediction = await getPrediction(readings, selectedFood, false);
      setIsScanning(false);
      triggerCelebrationIfFresh(prediction.status);
      onScanComplete(prediction);
    } catch (err: any) {
      setIsScanning(false);
      setSerialError(
        err.message || "Error collecting scan telemetry from device.",
      );
    }
  };

  return (
    <section aria-label="Scan Chamber Operation" className="space-y-4">
      {/* Section Header - Strictly No 1,2,3 numbering */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border border-cyan-400/40 text-cyan-300 shadow-[0_0_12px_rgba(99, 108, 119,0.3)]">
            <Activity className="w-4 h-4 text-cyan-300" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Sensor Acquisition &amp; Inference
              <span className="text-xs font-normal text-slate-400">
                ({mode === "demo" ? "Simulation Engine" : "Web Serial Protocol"})
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Trigger non-destructive sensor sweeps for volatile gases, alcohol, and firmness resistance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowOscilloscope(!showOscilloscope)}
            className="text-[11px] font-mono text-emerald-300 hover:text-emerald-200 transition-colors px-2.5 py-1 rounded-lg bg-[#f7f8f8] border border-emerald-950 inline-flex items-center gap-1 cursor-pointer"
          >
            <span>
              {showOscilloscope ? "Hide Oscilloscope" : "Show Oscilloscope"}
            </span>
          </button>
          {mode === "demo" && (
            <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/40 shadow-[0_0_8px_rgba(83, 118, 159,0.3)]">
              Autonomous 3-Stage Sampler
            </span>
          )}
        </div>
      </div>

      {/* ====================================================================
       * DEMO MODE INTERFACE
       * ==================================================================== */}
      {mode === "demo" && (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#f5f6f6]/95 border border-emerald-500/30 shadow-[0_4px_30px_rgba(252, 252, 253,0.5)] space-y-5">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono font-bold tracking-wider text-emerald-400">
                  Simulation &amp; Diagnostic Pipeline
                </span>
                <span className="text-emerald-900">&bull;</span>
                <span className="text-xs text-slate-400 font-mono">
                  Model: Random Forest (300 Estimators)
                </span>
              </div>
              <p className="text-sm text-slate-300">
                Simulates volatile organic compound (VOC) accumulation, alcohol
                vapor buildup, and mechanical cuticle resistance.
              </p>
            </div>

            {/* Start Scan Primary Button */}
            <div className="flex items-center gap-3">
              <button
                id="start-demo-scan-btn"
                type="button"
                disabled={!selectedFood || isScanning}
                onClick={() => handleStartDemoScan()}
                className={`flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md select-none cursor-pointer ${
                  !selectedFood
                    ? "bg-black text-slate-600 border border-emerald-950 cursor-not-allowed"
                    : isScanning
                      ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 cursor-wait shadow-[0_0_15px_rgba(83, 118, 159,0.3)]"
                      : "green-black-gradient hover:brightness-110 active:scale-[0.99] text-white font-extrabold shadow-[0_0_24px_rgba(83, 118, 159,0.4)]"
                }`}
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                    <span>Analyzing Chamber...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current text-white" />
                    <span>
                      {selectedFood
                        ? `Start Scan (${selectedFood})`
                        : "Select Food to Scan"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Calibration Test Profiles */}
          <div className="p-3 rounded-xl bg-[#f7f8f8] border border-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Calibration Test Profiles:</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <button
                type="button"
                disabled={isScanning}
                onClick={() => handleStartDemoScan("Apple", "Fresh")}
                className="px-2.5 py-1 rounded-lg bg-[#f4f4f5] hover:bg-[#eaebec] text-slate-200 border border-emerald-950 hover:border-emerald-500/50 transition-colors text-[11px] font-mono flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Fresh Apple (Grade A1)</span>
              </button>
              <button
                type="button"
                disabled={isScanning}
                onClick={() => handleStartDemoScan("Banana", "Ripe")}
                className="px-2.5 py-1 rounded-lg bg-[#f4f4f5] hover:bg-[#eaebec] text-slate-200 border border-emerald-950 hover:border-lime-500/50 transition-colors text-[11px] font-mono flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400"></span>
                <span>Ripe Banana (Grade A1)</span>
              </button>
              <button
                type="button"
                disabled={isScanning}
                onClick={() => handleStartDemoScan("Tomato", "Ripe")}
                className="px-2.5 py-1 rounded-lg bg-[#f4f4f5] hover:bg-[#eaebec] text-slate-200 border border-emerald-950 hover:border-lime-500/50 transition-colors text-[11px] font-mono flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400"></span>
                <span>Ripe Tomato (Grade A2)</span>
              </button>
              <button
                type="button"
                disabled={isScanning}
                onClick={() => handleStartDemoScan("Tomato", "Overripe")}
                className="px-2.5 py-1 rounded-lg bg-[#f4f4f5] hover:bg-[#eaebec] text-slate-200 border border-emerald-950 hover:border-amber-500/50 transition-colors text-[11px] font-mono flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Overripe Tomato (Grade B)</span>
              </button>
              <button
                type="button"
                disabled={isScanning}
                onClick={() => handleStartDemoScan("Potato", "Rotten")}
                className="px-2.5 py-1 rounded-lg bg-[#f4f4f5] hover:bg-[#eaebec] text-slate-200 border border-emerald-950 hover:border-rose-500/50 transition-colors text-[11px] font-mono flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                <span>Rotten Potato (Bio-Reject)</span>
              </button>
            </div>
          </div>

          {/* Staged Progress Sequence */}
          <div className="pt-2 border-t border-emerald-950 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">
                Acquisition Pipeline Status:
              </span>
              <span className="font-mono text-emerald-400 font-semibold">
                {isScanning ? `${demoProgressPct}% Telemetry Stream` : "Ready"}
              </span>
            </div>

            {/* Stage Cards with Checkmarks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Step 1: Ambient Baseline */}
              <div
                className={`p-3.5 rounded-xl border transition-all duration-300 ${
                  demoStep > 1
                    ? "bg-emerald-950/30 border-emerald-500/40 text-slate-200"
                    : demoStep === 1
                      ? "bg-[#e8e9ea] border-emerald-400 ring-1 ring-emerald-500/50 text-white"
                      : "bg-[#f7f8f8] border-emerald-950 text-slate-500"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wind
                      className={`w-4 h-4 ${demoStep >= 1 ? "text-emerald-400" : "text-slate-500"}`}
                    />
                    <span className="text-xs font-semibold">
                      Step 1: Ambient
                    </span>
                  </div>
                  {demoStep > 1 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : demoStep === 1 ? (
                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-emerald-950" />
                  )}
                </div>
                <p className="text-[11px] mt-1.5 leading-snug">
                  Reading ambient baseline (MQ-135 &amp; MQ-3 zero-point)
                </p>
              </div>

              {/* Step 2: Sealing & Accumulation */}
              <div
                className={`p-3.5 rounded-xl border transition-all duration-300 ${
                  demoStep > 2
                    ? "bg-emerald-950/30 border-emerald-500/40 text-slate-200"
                    : demoStep === 2
                      ? "bg-[#e8e9ea] border-emerald-400 ring-1 ring-emerald-500/50 text-white"
                      : "bg-[#f7f8f8] border-emerald-950 text-slate-500"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock
                      className={`w-4 h-4 ${demoStep >= 2 ? "text-emerald-400" : "text-slate-500"}`}
                    />
                    <span className="text-xs font-semibold">
                      Step 2: Chamber
                    </span>
                  </div>
                  {demoStep > 2 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : demoStep === 2 ? (
                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-emerald-950" />
                  )}
                </div>
                <p className="text-[11px] mt-1.5 leading-snug">
                  Sealing chamber, accumulating gas volatiles
                </p>
              </div>

              {/* Step 3: Multi-sensor Sampling */}
              <div
                className={`p-3.5 rounded-xl border transition-all duration-300 ${
                  demoStep >= 4
                    ? "bg-emerald-950/30 border-emerald-500/40 text-slate-200"
                    : demoStep === 3
                      ? "bg-[#e8e9ea] border-emerald-400 ring-1 ring-emerald-500/50 text-white"
                      : "bg-[#f7f8f8] border-emerald-950 text-slate-500"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu
                      className={`w-4 h-4 ${demoStep >= 3 ? "text-emerald-400" : "text-slate-500"}`}
                    />
                    <span className="text-xs font-semibold">
                      Step 3: Sampling
                    </span>
                  </div>
                  {demoStep >= 4 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : demoStep === 3 ? (
                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-emerald-950" />
                  )}
                </div>
                <p className="text-[11px] mt-1.5 leading-snug">
                  Sampling MQ-135/MQ-3 (&times;10), FSR (&times;3), DHT11
                </p>
              </div>
            </div>

            {/* Continuous Progress Bar during Scan */}
            {isScanning && (
              <div className="w-full bg-black rounded-full h-1.5 overflow-hidden border border-emerald-950">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-green-400 h-full transition-all duration-500 rounded-full shadow-[0_0_8px_#53769f]"
                  style={{ width: `${demoProgressPct}%` }}
                />
              </div>
            )}
          </div>

          {/* Integrated Real-time Sensor Oscilloscope */}
          {showOscilloscope && (
            <SensorOscilloscope
              isScanning={isScanning}
              chamberTime={30}
              currentCountdown={
                isScanning ? Math.round(30 * (1 - demoProgressPct / 100)) : 30
              }
              targetGasMax={selectedFood === "Potato" ? 320 : 250}
              targetEthanolMax={160}
              fsrTarget={selectedFood === "Tomato" ? 480 : 720}
              temp={22.4}
            />
          )}
        </div>
      )}

      {/* ====================================================================
       * LIVE MODE INTERFACE (ARDUINO WEB SERIAL)
       * ==================================================================== */}
      {mode === "live" && (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#f5f6f6]/95 border border-emerald-500/30 shadow-[0_4px_30px_rgba(252, 252, 253,0.5)] space-y-5">
          {/* Hardware Connection Card */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-[#f7f8f8] border border-emerald-950">
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-xl border ${
                  connectionStatus === "connected"
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                    : "bg-black text-slate-400 border-emerald-950"
                }`}
              >
                <Usb className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">
                    Hardware Interface: Web Serial API
                  </h3>
                  <span
                    className={`text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded-full ${
                      connectionStatus === "connected"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : connectionStatus === "connecting"
                          ? "bg-lime-500/20 text-lime-300 border border-lime-500/40"
                          : "bg-black text-slate-400 border border-emerald-950"
                    }`}
                  >
                    {connectionStatus === "connected"
                      ? "ONLINE"
                      : connectionStatus === "connecting"
                        ? "NEGOTIATING"
                        : "OFFLINE"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {portName ||
                    "No physical COM port selected (Baud: 9600 8-N-1)"}
                </p>
              </div>
            </div>

            {/* Connection Actions */}
            <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
              {connectionStatus === "connected" ? (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#f3f4f4] hover:bg-[#eaebec] text-slate-300 border border-emerald-950 hover:border-emerald-500/50 transition-colors"
                >
                  Disconnect Port
                </button>
              ) : (
                <>
                  <button
                    id="connect-serial-btn"
                    type="button"
                    disabled={connectionStatus === "connecting"}
                    onClick={handleConnectDevice}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-400 hover:bg-emerald-300 text-black transition-all shadow-[0_0_12px_rgba(83, 118, 159,0.3)]"
                  >
                    {connectionStatus === "connecting" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Usb className="w-3.5 h-3.5" />
                    )}
                    <span>Connect Device</span>
                  </button>

                  {/* Fallback for judges without physical hardware attached to laptop */}
                  <button
                    type="button"
                    onClick={handleConnectVirtualHardware}
                    className="px-3 py-2 text-xs font-medium rounded-lg bg-[#f3f4f4] hover:bg-[#eaebec] text-slate-300 border border-emerald-950 hover:border-emerald-500/50 transition-colors"
                    title="Simulates Web Serial loopback handshake if no USB cable is present"
                  >
                    Virtual Serial Fallback
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Error Banner */}
          {serialError && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 flex items-start gap-3 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <p className="font-semibold text-red-300">
                  Serial Communication Error
                </p>
                <p className="text-red-300/80 mt-0.5">{serialError}</p>
              </div>
              <button
                type="button"
                onClick={handleConnectDevice}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-800/60 hover:bg-red-700/80 text-white transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reconnect</span>
              </button>
            </div>
          )}

          {/* Two-Step Workflow for Live Mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step 1: Calibrate Baseline */}
            <div className="p-4 rounded-xl bg-[#f7f8f8] border border-emerald-950 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Ambient Calibration
                  </h4>
                </div>

                {baselineValues ? (
                  <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <Check className="w-3 h-3" /> Locked
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-lime-400">
                    Required
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400">
                Zeroes thermal baseline drift with an empty, ventilated chamber
                before closing the lid.
              </p>

              {/* Locked-in Baseline values display */}
              {baselineValues ? (
                <div className="p-3 rounded-lg bg-black/80 border border-emerald-950 grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] block">
                      MQ-135 Baseline
                    </span>
                    <span className="text-emerald-400 font-bold">
                      {baselineValues.mq135_baseline} counts
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">
                      MQ-3 Baseline
                    </span>
                    <span className="text-green-400 font-bold">
                      {baselineValues.mq3_baseline} counts
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">
                      Temperature
                    </span>
                    <span className="text-slate-300">
                      {baselineValues.temp_c}&deg;C
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">
                      Humidity
                    </span>
                    <span className="text-slate-300">
                      {baselineValues.rh_pct}% RH
                    </span>
                  </div>
                </div>
              ) : null}

              <button
                id="calibrate-baseline-btn"
                type="button"
                disabled={
                  connectionStatus !== "connected" ||
                  isCalibrating ||
                  isScanning
                }
                onClick={handleCalibrateBaseline}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                  connectionStatus !== "connected" || isScanning
                    ? "bg-black text-slate-600 border border-emerald-950 cursor-not-allowed"
                    : isCalibrating
                      ? "bg-emerald-950 text-emerald-300 cursor-wait border border-emerald-700"
                      : "bg-[#f3f4f4] hover:bg-[#eaebec] text-white border border-emerald-950 hover:border-emerald-500/50"
                }`}
              >
                {isCalibrating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    <span>Sampling Ambient Zero Point...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      {baselineValues
                        ? "Recalibrate Baseline"
                        : "Calibrate Baseline (empty chamber)"}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Step 2: Scan Fruit (Gated until baseline exists) */}
            <div className="p-4 rounded-xl bg-[#f7f8f8] border border-emerald-950 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Chamber Accumulation &amp; Scan
                  </h4>
                </div>

                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" /> {chamberTime}s Protocol
                </span>
              </div>

              <p className="text-xs text-slate-400">
                Place {selectedFood || "specimen"} in chamber. Seal lid with
                fixed test probe on firmness sensor.
              </p>

              {/* Countdown or Status Indicator */}
              {isScanning ? (
                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-center space-y-1">
                  <span className="text-xs text-emerald-300 font-semibold block">
                    Chamber Accumulating Gas
                  </span>
                  <div className="text-2xl font-mono font-black text-emerald-400 animate-pulse">
                    {liveCountdown}s remaining
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Keep chamber strictly sealed &mdash; sampling starts at 0s
                  </span>
                </div>
              ) : !baselineValues ? (
                <div className="p-3 rounded-lg bg-black/60 border border-emerald-950 text-xs text-slate-400 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Gated: Complete Step 1 baseline calibration first.
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                  <Unlock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Ready to scan: Baseline is locked in.</span>
                </div>
              )}

              <button
                id="start-live-scan-btn"
                type="button"
                disabled={!baselineValues || !selectedFood || isScanning}
                onClick={handleStartLiveScan}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md ${
                  !baselineValues || !selectedFood || isScanning
                    ? "bg-black text-slate-600 border border-emerald-950 cursor-not-allowed"
                    : "green-black-gradient hover:brightness-110 text-white cursor-pointer font-extrabold shadow-[0_0_16px_rgba(83, 118, 159,0.4)]"
                }`}
                title={
                  !baselineValues
                    ? "Calibrate baseline in Step 1 first"
                    : "Start countdown and scan"
                }
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Accumulating &amp; Reading...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current text-white" />
                    <span>Scan Fruit (sealed, weight on sensor)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Integrated Oscilloscope in Live Mode */}
          {showOscilloscope && (
            <SensorOscilloscope
              isScanning={isScanning}
              chamberTime={chamberTime}
              currentCountdown={liveCountdown}
              targetGasMax={240}
              targetEthanolMax={130}
              fsrTarget={650}
              temp={baselineValues?.temp_c || 22.4}
            />
          )}
        </div>
      )}
    </section>
  );
};
