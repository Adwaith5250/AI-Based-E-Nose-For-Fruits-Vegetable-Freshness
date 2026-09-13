import React, { useState, useEffect } from 'react';
import { Activity, Flame, Gauge, Layers, Scale, Thermometer, Wind } from 'lucide-react';

interface SensorOscilloscopeProps {
  isScanning: boolean;
  chamberTime: number;
  currentCountdown: number;
  targetGasMax?: number;
  targetEthanolMax?: number;
  fsrTarget?: number;
  temp?: number;
}

interface TelemetryDataPoint {
  time: number;
  gas: number;
  ethanol: number;
  fsr: number;
  temp: number;
}

export const SensorOscilloscope: React.FC<SensorOscilloscopeProps> = ({
  isScanning,
  chamberTime,
  currentCountdown,
  targetGasMax = 260,
  targetEthanolMax = 140,
  fsrTarget = 680,
  temp = 22.4
}) => {
  const [dataPoints, setDataPoints] = useState<TelemetryDataPoint[]>([]);
  const [visibleChannels, setVisibleChannels] = useState({
    gas: true,
    ethanol: true,
    fsr: true
  });

  // Calculate elapsed seconds
  const elapsed = Math.max(0, chamberTime - currentCountdown);

  // Generate live curve points during scan
  useEffect(() => {
    if (!isScanning) {
      if (dataPoints.length === 0) {
        // Generate a baseline resting waveform
        const initial: TelemetryDataPoint[] = [];
        for (let i = 0; i <= 20; i++) {
          initial.push({
            time: i,
            gas: 138 + Math.sin(i * 0.4) * 2,
            ethanol: 82 + Math.cos(i * 0.3) * 1.5,
            fsr: 0,
            temp: 22.4
          });
        }
        setDataPoints(initial);
      }
      return;
    }

    // Reset when starting scan
    if (elapsed === 0) {
      setDataPoints([
        { time: 0, gas: 138, ethanol: 82, fsr: 0, temp }
      ]);
    } else {
      // Simulate real chamber VOC accumulation dynamics (exponential approach to equilibrium)
      const tRatio = Math.min(1, elapsed / chamberTime);
      const gasAccumulation = 138 + (targetGasMax - 138) * (1 - Math.exp(-3.2 * tRatio)) + (Math.random() * 4 - 2);
      const ethanolAccumulation = 82 + (targetEthanolMax - 82) * (1 - Math.exp(-2.8 * tRatio)) + (Math.random() * 3 - 1.5);
      const currentFsr = tRatio > 0.15 ? fsrTarget + (Math.random() * 8 - 4) : 0;

      setDataPoints((prev) => {
        const next = [...prev, {
          time: elapsed,
          gas: Math.round(gasAccumulation * 10) / 10,
          ethanol: Math.round(ethanolAccumulation * 10) / 10,
          fsr: Math.round(currentFsr),
          temp: Number((temp + (Math.random() * 0.2 - 0.1)).toFixed(1))
        }];
        return next.slice(-40); // Keep last 40 frames
      });
    }
  }, [isScanning, elapsed, chamberTime, targetGasMax, targetEthanolMax, fsrTarget, temp]);

  // Compute SVG polyline paths
  const width = 600;
  const height = 180;
  const padding = 20;

  const maxVal = 850;
  const minVal = 0;

  const getX = (index: number, total: number) => {
    if (total <= 1) return padding;
    return padding + (index / (total - 1)) * (width - 2 * padding);
  };

  const getY = (val: number) => {
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    return height - padding - ((clamped - minVal) / (maxVal - minVal)) * (height - 2 * padding);
  };

  const gasPath = dataPoints.map((pt, i) => `${getX(i, dataPoints.length)},${getY(pt.gas)}`).join(' ');
  const ethanolPath = dataPoints.map((pt, i) => `${getX(i, dataPoints.length)},${getY(pt.ethanol)}`).join(' ');
  const fsrPath = dataPoints.map((pt, i) => `${getX(i, dataPoints.length)},${getY(pt.fsr)}`).join(' ');

  const currentGas = dataPoints[dataPoints.length - 1]?.gas || 138;
  const currentEth = dataPoints[dataPoints.length - 1]?.ethanol || 82;
  const currentFsr = dataPoints[dataPoints.length - 1]?.fsr || 0;

  return (
    <div className="p-4 rounded-xl bg-[#f5f6f6]/95 border border-emerald-950 space-y-3 font-mono">
      
      {/* Scope Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-emerald-950">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold text-slate-200 tracking-wider uppercase flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            Real-time Sensor Oscilloscope (10-bit ADC Stream)
          </span>
        </div>

        {/* Channel Toggles */}
        <div className="flex items-center gap-2 text-[10px]">
          <button
            type="button"
            onClick={() => setVisibleChannels(p => ({ ...p, gas: !p.gas }))}
            className={`px-2 py-0.5 rounded border transition-colors ${
              visibleChannels.gas
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/60 shadow-[0_0_8px_rgba(83, 118, 159,0.3)]'
                : 'bg-black text-slate-600 border-emerald-950'
            }`}
          >
            CH1: MQ-135 ({Math.round(currentGas)})
          </button>

          <button
            type="button"
            onClick={() => setVisibleChannels(p => ({ ...p, ethanol: !p.ethanol }))}
            className={`px-2 py-0.5 rounded border transition-colors ${
              visibleChannels.ethanol
                ? 'bg-green-950/70 text-green-300 border-green-500/60 shadow-[0_0_8px_rgba(85, 119, 158,0.3)]'
                : 'bg-black text-slate-600 border-emerald-950'
            }`}
          >
            CH2: MQ-3 ({Math.round(currentEth)})
          </button>

          <button
            type="button"
            onClick={() => setVisibleChannels(p => ({ ...p, fsr: !p.fsr }))}
            className={`px-2 py-0.5 rounded border transition-colors ${
              visibleChannels.fsr
                ? 'bg-lime-950/70 text-lime-300 border-lime-500/60 shadow-[0_0_8px_rgba(76, 113, 155,0.3)]'
                : 'bg-black text-slate-600 border-emerald-950'
            }`}
          >
            CH3: FSR ({Math.round(currentFsr)})
          </button>
        </div>
      </div>

      {/* SVG Oscilloscope Display */}
      <div className="relative w-full h-44 bg-[#f9f9f9] rounded-lg border border-emerald-950 overflow-hidden shadow-inner">
        
        {/* Background Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
          <defs>
            <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#53769f" strokeWidth="0.75" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Telemetry Curves */}
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="w-full h-full relative z-10"
        >
          {/* FSR Firmness Trace (Lime Green) */}
          {visibleChannels.fsr && fsrPath && (
            <polyline
              fill="none"
              stroke="#4c719b"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={fsrPath}
              className="transition-all duration-150 filter drop-shadow-[0_0_6px_rgba(76, 113, 155,0.6)]"
            />
          )}

          {/* MQ-135 Gas Trace (Emerald Green) */}
          {visibleChannels.gas && gasPath && (
            <polyline
              fill="none"
              stroke="#53769f"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={gasPath}
              className="transition-all duration-150 filter drop-shadow-[0_0_6px_rgba(83, 118, 159,0.6)]"
            />
          )}

          {/* MQ-3 Ethanol Trace (Mint Green) */}
          {visibleChannels.ethanol && ethanolPath && (
            <polyline
              fill="none"
              stroke="#55779e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={ethanolPath}
              className="transition-all duration-150 filter drop-shadow-[0_0_6px_rgba(85, 119, 158,0.6)]"
            />
          )}

          {/* Scanning sweep vertical line */}
          {isScanning && (
            <line
              x1={getX(dataPoints.length - 1, dataPoints.length)}
              y1="10"
              x2={getX(dataPoints.length - 1, dataPoints.length)}
              y2={height - 10}
              stroke="#658ab3"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              className="animate-pulse"
            />
          )}
        </svg>

        {/* Ambient status overlay tags */}
        <div className="absolute top-2 left-2 flex items-center gap-2 pointer-events-none">
          <span className="text-[10px] px-2 py-0.5 rounded bg-black/90 border border-emerald-950 text-emerald-400">
            Sweep Rate: 10 Hz
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-black/90 border border-emerald-950 text-slate-400">
            Sampling: 10-bit SAR ADC
          </span>
        </div>

        <div className="absolute bottom-2 right-2 text-[10px] text-emerald-400/80 font-mono pointer-events-none">
          {isScanning ? `Acquisition Phase: ${elapsed}s / ${chamberTime}s` : 'Chamber Standby Telemetry'}
        </div>
      </div>

      {/* Real-time metrics mini-ticker */}
      <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
        <div className="p-1.5 rounded bg-[#f7f8f8] border border-emerald-950">
          <span className="text-slate-500 block text-[9px]">MQ-135 (VOC)</span>
          <span className="text-emerald-400 font-bold">{Math.round(currentGas)} counts</span>
        </div>
        <div className="p-1.5 rounded bg-[#f7f8f8] border border-emerald-950">
          <span className="text-slate-500 block text-[9px]">MQ-3 (ETHANOL)</span>
          <span className="text-green-400 font-bold">{Math.round(currentEth)} counts</span>
        </div>
        <div className="p-1.5 rounded bg-[#f7f8f8] border border-emerald-950">
          <span className="text-slate-500 block text-[9px]">FSR (FIRMNESS)</span>
          <span className="text-lime-400 font-bold">{Math.round(currentFsr)} counts</span>
        </div>
        <div className="p-1.5 rounded bg-[#f7f8f8] border border-emerald-950">
          <span className="text-slate-500 block text-[9px]">DHT11 (CHAMBER)</span>
          <span className="text-emerald-300 font-bold">{temp}&deg;C / 54% RH</span>
        </div>
      </div>

    </div>
  );
};
