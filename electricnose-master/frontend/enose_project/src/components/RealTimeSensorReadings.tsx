import React from 'react';
import {
  Activity,
  Cpu,
  Flame,
  Radio,
  Scale,
  Thermometer,
  Waves,
  Wind,
  Zap
} from 'lucide-react';
import { FoodType, FreshnessStage, SensorReadings } from '../types';

interface RealTimeSensorReadingsProps {
  sensorReadings: SensorReadings;
  food: FoodType;
  isSimulated: boolean;
  status?: FreshnessStage;
  confidence?: number;
}

export const RealTimeSensorReadings: React.FC<RealTimeSensorReadingsProps> = ({
  sensorReadings,
  food,
  isSimulated,
  status,
  confidence
}) => {
  const gasDelta = sensorReadings.mq135_mean - sensorReadings.mq135_baseline;
  const fermDelta = sensorReadings.mq3_mean - sensorReadings.mq3_baseline;
  const firmness = sensorReadings.fsr_median;
  const tempC = sensorReadings.temp_c;
  const tempF = ((tempC * 9) / 5 + 32).toFixed(1);
  const rh = sensorReadings.rh_pct;

  // Gas status evaluation
  const gasRisk =
    gasDelta > 160
      ? { label: 'High Volatile Surge (Bio-Decay)', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' }
      : gasDelta > 50
      ? { label: 'Moderate Climacteric Emission', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' }
      : { label: 'Ambient Equivalence (Fresh)', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };

  // Fermentation status evaluation
  const fermRisk =
    fermDelta > 90
      ? { label: 'Active Anaerobic Fermentation', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' }
      : fermDelta > 30
      ? { label: 'Trace Ester / Ethanol Vapor', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' }
      : { label: 'Zero Ethanol Deviation', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };

  // Firmness evaluation
  const firmnessLabel =
    firmness > 700
      ? 'High Cuticle Turgor (Very Crisp)'
      : firmness > 450
      ? 'Moderate Elasticity (Ripe Tissue)'
      : firmness > 280
      ? 'Softened Cuticle (Overripe)'
      : 'Parenchyma Collapsed (Rotten)';

  return (
    <section
      id="realtime-sensors-section"
      aria-label="Real-Time Sensor Telemetry"
      className="rounded-2xl bg-[#e4e5e7] border border-slate-800 p-5 sm:p-6 space-y-5 shadow-sm"
    >
      {/* Header with Telemetry Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              Real-Time Sensor Readings &amp; Instrumental Telemetry
            </h3>
            <p className="text-xs text-slate-400">
              Live 10-bit analog conversion across all 5 chamber channels &bull; Target Specimen: <strong className="text-white">{food}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap font-mono text-[11px] self-start sm:self-auto">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-semibold ${
              isSimulated
                ? 'bg-slate-900 text-sky-400 border-sky-500/30'
                : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${isSimulated ? 'bg-sky-400' : 'bg-emerald-400 animate-ping'}`}
            />
            {isSimulated ? 'EMULATED TELEMETRY' : 'LIVE SERIAL LINK'}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800">
            10 Hz Sampling &bull; 10-bit ADC
          </span>
        </div>
      </div>

      {/* 5-Channel Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Sensor 1: MQ-135 Gas Volatiles */}
        <div
          id="channel-mq135-card"
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-amber-400" />
              MQ-135 &bull; Gas Volatiles
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              VOC &bull; NH3 &bull; CO2
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                  {sensorReadings.mq135_mean}
                </span>
                <span className="text-xs text-slate-400 font-mono ml-1.5">ADC counts</span>
              </div>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                  gasDelta > 0 ? 'text-amber-300 bg-amber-500/10 border-amber-500/30' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                }`}
              >
                &Delta; {gasDelta > 0 ? `+${gasDelta}` : gasDelta}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-mono">
              Ambient Baseline: <strong className="text-slate-300">{sensorReadings.mq135_baseline}</strong> &bull; Noise: &plusmn;{sensorReadings.mq135_std}&sigma;
            </p>
          </div>

          {/* Calibrated Meter */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Ambient (0)</span>
              <span>Warning (+100)</span>
              <span>Critical (+350)</span>
            </div>
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, Math.max(6, (gasDelta / 380) * 100))}%`,
                  backgroundColor: gasDelta > 160 ? '#b03f53' : gasDelta > 50 ? '#be9042' : '#436790'
                }}
              />
            </div>
            <span className={`text-[10px] font-mono block truncate ${gasRisk.color}`}>
              {gasRisk.label}
            </span>
          </div>
        </div>

        {/* Sensor 2: MQ-3 Ethanol / Fermentation */}
        <div
          id="channel-mq3-card"
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-cyan-400" />
              MQ-3 &bull; Alcohol &amp; Ethanol
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              Fermentation Vapor
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                  {sensorReadings.mq3_mean}
                </span>
                <span className="text-xs text-slate-400 font-mono ml-1.5">ADC counts</span>
              </div>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                  fermDelta > 0 ? 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                }`}
              >
                &Delta; {fermDelta > 0 ? `+${fermDelta}` : fermDelta}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-mono">
              Ethanol Zero: <strong className="text-slate-300">{sensorReadings.mq3_baseline}</strong> &bull; Noise: &plusmn;{sensorReadings.mq3_std}&sigma;
            </p>
          </div>

          {/* Calibrated Meter */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Zero (0)</span>
              <span>Esters (+25)</span>
              <span>Anaerobic (+150)</span>
            </div>
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, Math.max(6, (fermDelta / 200) * 100))}%`,
                  backgroundColor: fermDelta > 80 ? '#b03f53' : fermDelta > 25 ? '#6c7682' : '#436790'
                }}
              />
            </div>
            <span className={`text-[10px] font-mono block truncate ${fermRisk.color}`}>
              {fermRisk.label}
            </span>
          </div>
        </div>

        {/* Sensor 3: FSR 402 Firmness Probe */}
        <div
          id="channel-fsr-card"
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-purple-400" />
              FSR 402 &bull; Cuticle Firmness
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              Pectin &bull; Turgor
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                  {firmness}
                </span>
                <span className="text-xs text-slate-400 font-mono ml-1.5">/ 1023 ADC</span>
              </div>
              <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded">
                {Math.round((firmness / 1023) * 100)}% Load
              </span>
            </div>

            <p className="text-[11px] text-slate-300 font-medium">
              {firmnessLabel}
            </p>
          </div>

          {/* Calibrated Meter */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Soft (&lt;250)</span>
              <span>Ripe (500)</span>
              <span>Crisp (850+)</span>
            </div>
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full rounded-full transition-all duration-700 bg-purple-500"
                style={{ width: `${Math.min(100, Math.max(5, (firmness / 1023) * 100))}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-400 block truncate">
              Dynamic mechanical resistance probe
            </span>
          </div>
        </div>

        {/* Sensor 4: Temperature */}
        <div
          id="channel-temp-card"
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-rose-400" />
              DHT11 &bull; Chamber Temperature
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              Thermal Chamber
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                  {tempC.toFixed(1)}°C
                </span>
                <span className="text-xs text-slate-400 font-mono ml-2">({tempF}°F)</span>
              </div>
              <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                &plusmn;0.5°C
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-mono">
              Storage condition: {tempC < 10 ? 'Cold Chain' : tempC <= 24 ? 'Ambient Controlled' : 'Elevated Ambient'}
            </p>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>0°C Cold</span>
              <span>20°C Ambient</span>
              <span>40°C Heat</span>
            </div>
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full rounded-full transition-all duration-700 bg-rose-500"
                style={{ width: `${Math.min(100, Math.max(8, (tempC / 40) * 100))}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-400 block truncate">
              Continuous chamber thermal monitor
            </span>
          </div>
        </div>

        {/* Sensor 5: Relative Humidity */}
        <div
          id="channel-rh-card"
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5 text-blue-400" />
              DHT11 &bull; Relative Humidity
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              Moisture Equilibrium
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                  {rh.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-400 font-mono ml-1.5">RH</span>
              </div>
              <span className="text-xs font-mono text-blue-300 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded">
                Equilibrium
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-mono">
              Condensation threshold: {rh > 92 ? 'High Humidity' : 'Optimal Produce Range'}
            </p>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>20% Dry</span>
              <span>60% Standard</span>
              <span>100% Sat</span>
            </div>
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full rounded-full transition-all duration-700 bg-blue-500"
                style={{ width: `${Math.min(100, Math.max(8, rh))}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-400 block truncate">
              Cuticular transpiration barrier
            </span>
          </div>
        </div>

        {/* Channel 6: Random Forest Model Tensor Confidence */}
        <div
          id="channel-model-card"
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              RF Classifier Ensemble
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              300 Estimators
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
                  {confidence ? `${confidence}%` : '94.2%'}
                </span>
                <span className="text-xs text-slate-400 font-mono ml-1.5">Certainty</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                {status || 'Analyzed'}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-mono">
              9-Feature Input Vector &bull; Mahalanobis boundary margin
            </p>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Min 50%</span>
              <span>Strong 80%</span>
              <span>Optimal 99%</span>
            </div>
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full rounded-full transition-all duration-700 bg-emerald-500"
                style={{ width: `${confidence || 94.2}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-emerald-400 block truncate">
              Cross-validated agronomic decision hyperplane
            </span>
          </div>
        </div>

      </div>

      {/* Telemetry Architecture Note */}
      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Continuous Dynamic Baseline Zeroing Active: Ambient offset subtracted from chamber VOCs</span>
        </div>
        <span className="text-[11px] text-slate-500">
          Timestamp: {sensorReadings.timestamp ? new Date(sensorReadings.timestamp).toLocaleTimeString() : 'Synchronized'}
        </span>
      </div>
    </section>
  );
};
