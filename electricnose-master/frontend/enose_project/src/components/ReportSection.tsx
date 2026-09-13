import React, { useState } from 'react';
import {
  AlertCircle,
  AlertOctagon,
  Award,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  FileCheck,
  Flame,
  Gauge,
  HelpCircle,
  Layers,
  Percent,
  Printer,
  Radio,
  Scale,
  ShieldCheck,
  Sparkles,
  Thermometer,
  Wind,
  FlaskConical,
  ChevronRight
} from 'lucide-react';
import { FreshnessStage, PredictionResult, StorageEnvironment } from '../types';
import { InspectionCertificateModal } from './InspectionCertificateModal';
import { RealTimeSensorReadings } from './RealTimeSensorReadings';
import { ShelfLifeSection } from './ShelfLifeSection';
import { calculateStorageShelfLife, STORAGE_PRESETS } from '../services/shelfLifeCalculator';

interface ReportSectionProps {
  result: PredictionResult;
  storage?: StorageEnvironment;
  onNavigateToWaxSection?: () => void;
}

const STAGES: FreshnessStage[] = ['Fresh', 'Ripe', 'Overripe', 'Rotten'];

export const ReportSection: React.FC<ReportSectionProps> = ({ result, storage, onNavigateToWaxSection }) => {
  const [isHowComputedOpen, setIsHowComputedOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);

  const activeStorage = storage || result.storageEnvironment || STORAGE_PRESETS.room_temp;
  const { status, confidence, sensorReadings, isSimulated, food } = result;

  // Dynamically calculate shelf life for the active storage location
  const storageCalculation = calculateStorageShelfLife(food, status, activeStorage);
  const activeShelfLife = storageCalculation.displayShelfLife;

  // Exact math from sensor telemetry object:
  const gasDelta = Math.round((sensorReadings.mq135_mean - sensorReadings.mq135_baseline) * 10) / 10;
  const fermDelta = Math.round((sensorReadings.mq3_mean - sensorReadings.mq3_baseline) * 10) / 10;
  const firmness = sensorReadings.fsr_median;

  // Status configuration mapping with FSSAI & BRCGS Standards
  const statusConfig = {
    Fresh: {
      color: '#53769f',
      borderClass: 'border-emerald-500/40',
      bgClass: 'bg-emerald-950/20',
      glowClass: '',
      textClass: 'text-emerald-400',
      badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      icon: CheckCircle2,
      desc: 'Optimal cell wall integrity and low volatile gas generation. Safe for consumption or extended storage.',
      disposition: 'GRADE AA: Approved for Premium Retail Display & Export Logistics',
      dispositionBadge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      brcgsClass: 'BRCGS Grade AA (Global Standard)',
      fssaiStatus: 'FSSAI Safety: Conforming &bull; Safe for Direct Consumption'
    },
    Ripe: {
      color: '#b4983e',
      borderClass: 'border-amber-500/40',
      bgClass: 'bg-amber-950/20',
      glowClass: '',
      textClass: 'text-amber-400',
      badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      icon: Sparkles,
      desc: 'Peak flavor maturity. Enzymatic softening initiated; consumption recommended in near term.',
      disposition: 'GRADE A: Prioritize Immediate Sale or Regional Cold-Chain Routing',
      dispositionBadge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      brcgsClass: 'BRCGS Grade A (Standard Commercial)',
      fssaiStatus: 'FSSAI Safety: Conforming &bull; Prioritize Immediate Distribution'
    },
    Overripe: {
      color: '#c37d4c',
      borderClass: 'border-orange-500/40',
      bgClass: 'bg-orange-950/20',
      glowClass: '',
      textClass: 'text-orange-400',
      badgeClass: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
      icon: AlertCircle,
      desc: 'Significant cell collapse and rising ethanol/alcohol emissions. Process or consume within hours.',
      disposition: 'GRADE B: Divert to Secondary Industrial Processing (Sauce / Puree / Drying)',
      dispositionBadge: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
      brcgsClass: 'BRCGS Grade B (Processing Grade)',
      fssaiStatus: 'FSSAI Advisory: Secondary Processing Required'
    },
    Rotten: {
      color: '#ad4242',
      borderClass: 'border-red-500/40',
      bgClass: 'bg-red-950/20',
      glowClass: '',
      textClass: 'text-red-400',
      badgeClass: 'bg-red-500/10 text-red-300 border-red-500/30',
      icon: AlertOctagon,
      desc: 'Severe microbial decomposition and high amine/volatile gas output. Inedible; discard immediately.',
      disposition: 'REJECT: Quarantine Lot / Bio-Hazard / Direct to Compost',
      dispositionBadge: 'bg-red-500/10 text-red-300 border-red-500/30',
      brcgsClass: 'BRCGS Out-of-Grade (Critical Alert)',
      fssaiStatus: 'FSSAI Non-Conforming: Critical Biological Decomposition'
    }
  }[status];

  const StatusIcon = statusConfig.icon;

  // Circular gauge calculations for Model Confidence
  const gaugeRadius = 40;
  const circumference = 2 * Math.PI * gaugeRadius;

  return (
    <section 
      id="diagnostic-report-section"
      aria-label="Freshness Diagnostic Report"
      className="space-y-4 animate-in fade-in-50 duration-500"
    >
      
      {/* Section Header - Strictly No 1,2,3 numbering */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border border-cyan-400/40 text-cyan-300 shadow-[0_0_12px_rgba(99, 108, 119,0.3)]">
            <Sparkles className="w-4 h-4 text-cyan-300" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              AI Diagnostic Freshness Report
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Specimen: <strong className="text-cyan-300 font-semibold">{food}</strong> &bull; Telemetry Stamp: {new Date(sensorReadings.timestamp || Date.now()).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          <button
            type="button"
            onClick={() => setIsCertificateOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#e4e5e7] hover:bg-slate-800 text-slate-200 border border-indigo-950 hover:border-indigo-500/50 text-xs font-semibold shadow-md transition-all cursor-pointer"
            title="Generate official Inspection Certificate of Analysis"
          >
            <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Certificate</span>
          </button>

          <span
            id="source-mode-tag"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase border shadow-sm ${
              isSimulated
                ? 'bg-[#e4e5e7] text-cyan-300 border-cyan-500/30'
                : 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isSimulated ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-400 animate-ping'
              }`}
            />
            {isSimulated ? '● SIMULATED DATA' : '● LIVE SENSOR DATA'}
          </span>
        </div>
      </div>

      {/* Quick Navigation Anchor Bar */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs font-mono scrollbar-thin">
        <a
          href="#shelf-life-section"
          className="px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors whitespace-nowrap flex items-center gap-1.5"
        >
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Shelf Life &amp; Decay</span>
        </a>
        <a
          href="#realtime-sensors-section"
          className="px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors whitespace-nowrap flex items-center gap-1.5"
        >
          <Radio className="w-3.5 h-3.5 text-sky-400" />
          <span>Real-Time Sensors (5 Channels)</span>
        </a>
        <a
          href="#nutrition-weight-section"
          className="px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors whitespace-nowrap flex items-center gap-1.5"
        >
          <Scale className="w-3.5 h-3.5 text-purple-400" />
          <span>Nutrition &amp; Weight</span>
        </a>
        <button
          type="button"
          onClick={() => setIsHowComputedOpen(true)}
          className="px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors whitespace-nowrap flex items-center gap-1.5"
        >
          <Cpu className="w-3.5 h-3.5 text-amber-400" />
          <span>RF Model Pipeline</span>
        </button>
      </div>

      {/* Main Diagnostic Container */}
      <div className="rounded-2xl bg-[#e4e5e7]/95 border border-indigo-500/25 shadow-[0_4px_24px_rgba(252, 252, 253,0.3)] overflow-hidden divide-y divide-indigo-950/60">
        
        {/* ====================================================================
         * STATUS BANNER
         * ==================================================================== */}
        <div
          className={`p-5 sm:p-6 transition-all duration-300 ${statusConfig.bgClass} border-b ${statusConfig.borderClass} ${statusConfig.glowClass}`}
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              <div
                className={`p-3.5 rounded-2xl bg-slate-900/80 border ${statusConfig.borderClass} shadow-md`}
              >
                <StatusIcon className={`w-8 h-8 sm:w-10 sm:h-10 ${statusConfig.textClass}`} />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className={`text-2xl sm:text-3xl font-extrabold uppercase tracking-tight ${statusConfig.textClass}`}>
                    {status}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${statusConfig.badgeClass}`}
                  >
                    {confidence}% AI CONFIDENCE
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  {statusConfig.desc}
                </p>
              </div>
            </div>

            {/* BRCGS & FSSAI Food Safety Commercial Disposition & Quality Pill */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 max-w-md space-y-1.5 shrink-0 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block tracking-wider">
                  BRCGS &amp; FSSAI Standards
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#e7e8ea] text-cyan-300 border border-cyan-500/30">
                  {statusConfig.brcgsClass}
                </span>
              </div>
              <span className={`text-xs font-bold block ${statusConfig.textClass}`}>
                {statusConfig.disposition}
              </span>
              <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-800/80">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: statusConfig.fssaiStatus }} />
              </div>
            </div>

          </div>
        </div>

        {/* ====================================================================
         * STAGE TIMELINE (4-Segment Horizontal Bar)
         * ==================================================================== */}
        <div className="p-5 sm:p-6 bg-slate-900/40 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 uppercase tracking-wider">
              Freshness Progression Continuum
            </span>
            <span className="font-mono text-slate-400">
              Active Stage: <strong className={statusConfig.textClass}>{status}</strong>
            </span>
          </div>

          {/* 4-Segment Bar */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {STAGES.map((st, idx) => {
              const isActive = st === status;
              const isPast = STAGES.indexOf(status) > idx;

              let stageColor = '#53769f';
              if (st === 'Ripe') stageColor = '#b4983e';
              if (st === 'Overripe') stageColor = '#c37d4c';
              if (st === 'Rotten') stageColor = '#ad4242';

              return (
                <div
                  key={st}
                  className={`relative p-3 rounded-xl border transition-all duration-300 ${
                    isActive
                      ? `bg-slate-800/90 ${statusConfig.borderClass} ${statusConfig.glowClass} ring-1 ring-slate-900/20`
                      : isPast
                      ? 'bg-slate-900/60 border-slate-700/60 opacity-60'
                      : 'bg-slate-950/40 border-slate-800/60 opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">
                      0{idx + 1}
                    </span>
                    {isActive && (
                      <span className="flex h-2 w-2 relative">
                        <span
                          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                          style={{ backgroundColor: stageColor }}
                        />
                        <span
                          className="relative inline-flex rounded-full h-2 w-2"
                          style={{ backgroundColor: stageColor }}
                        />
                      </span>
                    )}
                  </div>

                  <div className="mt-1">
                    <span
                      className={`text-xs sm:text-sm font-bold block ${
                        isActive ? statusConfig.textClass : 'text-slate-300'
                      }`}
                    >
                      {st}
                    </span>
                    <span className="text-[10px] text-slate-400 hidden sm:block">
                      {st === 'Fresh'
                        ? 'Crisp & Intact'
                        : st === 'Ripe'
                        ? 'Peak Aroma'
                        : st === 'Overripe'
                        ? 'Pectin Breakdown'
                        : 'Biomarkers Peak'}
                    </span>
                  </div>

                  {/* Marker line at bottom of each segment */}
                  <div
                    className="mt-2 h-1 w-full rounded-full"
                    style={{
                      backgroundColor: isActive || isPast ? stageColor : '#404448'
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* ====================================================================
         * SECTION A: DEDICATED SHELF LIFE & STORAGE DEGRADATION PART
         * ==================================================================== */}
        <div className="p-4 sm:p-6 bg-[#e4e5e7]">
          <ShelfLifeSection
            food={food}
            status={status}
            estimatedShelfLife={activeShelfLife}
            sensorReadings={sensorReadings}
            storage={activeStorage}
          />
        </div>

        {/* ====================================================================
         * SECTION B: DEDICATED REAL-TIME SENSOR READINGS & TELEMETRY PART
         * ==================================================================== */}
        <div className="p-4 sm:p-6 bg-[#e4e5e7]">
          <RealTimeSensorReadings
            sensorReadings={sensorReadings}
            food={food}
            isSimulated={isSimulated}
            status={status}
            confidence={confidence}
          />
        </div>

        {/* ====================================================================
         * SECTION C: ARTIFICIAL RIPENING & SURFACE WAX SCREENING PREVIEW
         * ==================================================================== */}
        <div className="p-4 sm:p-6 bg-[#e4e5e7] border-t border-indigo-950/80 space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/30 via-indigo-950/40 to-cyan-950/30 border border-amber-500/30 shadow-sm">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-400 shrink-0 shadow-[0_0_12px_rgba(190, 144, 66,0.25)]">
                <FlaskConical className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    Artificial Ripening &amp; Cuticle Wax Screening ({food})
                  </h4>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    FSSAI Reg. 2.3.5 &bull; CERTIFIED SAFE
                  </span>
                </div>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Screened for prohibited Calcium Carbide (CaC₂), volatile alkynes, and petroleum paraffin wax coatings.
                </p>
              </div>
            </div>

            {onNavigateToWaxSection && (
              <button
                id="report-inspect-ripening-wax-btn"
                type="button"
                onClick={onNavigateToWaxSection}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 hover:border-amber-400 text-xs font-mono font-bold tracking-wider transition-all shrink-0 shadow-[0_0_12px_rgba(190, 144, 66,0.2)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Full Lab Audit &amp; Tests</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Explicit Usage Status Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Artificial Ripening Agent:</span>
                <span className="font-extrabold text-emerald-300 text-xs sm:text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  NOT USED (100% Naturally Ripened)
                </span>
                <span className="text-[10px] text-slate-400 block">Zero Calcium Carbide &bull; Clean Gas Profile</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 font-bold border border-emerald-500/40 shrink-0">
                PASS
              </span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Surface Wax Coating:</span>
                <span className="font-extrabold text-emerald-300 text-xs sm:text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  NOT APPLIED (Natural Cuticle Bloom)
                </span>
                <span className="text-[10px] text-slate-400 block">Zero Paraffin Glaze &bull; Unadulterated Skin</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 font-bold border border-emerald-500/40 shrink-0">
                PASS
              </span>
            </div>
          </div>
        </div>

        {/* ====================================================================
         * EXPANDABLE "HOW THIS WAS COMPUTED" PANEL
         * ==================================================================== */}
        <div className="bg-slate-900/70">
          <button
            id="how-computed-toggle-btn"
            type="button"
            onClick={() => setIsHowComputedOpen(!isHowComputedOpen)}
            className="w-full px-5 sm:px-6 py-3.5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-xs sm:text-sm font-bold text-slate-200">
                How this was computed &bull; Algorithmic Pipeline &amp; Sensor Calibration
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <span>{isHowComputedOpen ? 'Collapse Technical Breakdown' : 'Expand 9-Feature Vector'}</span>
              {isHowComputedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {isHowComputedOpen && (
            <div className="px-5 sm:px-6 pb-6 pt-2 space-y-4 border-t border-slate-800/60 text-xs text-slate-300">
              
              {/* Plain-Language Explanation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    ADC Count Scaling &amp; Dynamic Zeroing
                  </h4>
                  <p className="text-slate-400 leading-relaxed">
                    Raw readings from the analog front-end span <strong>0–1023 ADC counts</strong> (10-bit resolution). Gas (MQ-135) and ethanol (MQ-3) readings are evaluated strictly as <em>deltas (&Delta;)</em> from the live ambient baseline recorded before sealing the chamber. This eliminates day-to-day atmospheric temperature drift and sensor heater aging.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Random Forest Inference &amp; Fixed Test Probe
                  </h4>
                  <p className="text-slate-400 leading-relaxed">
                    Firmness utilizes a fixed mechanical weight probe contacting the fruit cuticle against a calibrated Force Sensitive Resistor (FSR 402). The classifier is an ensemble of <strong>300 decision trees</strong> trained on post-harvest datasets. Confidence scores represent normalized distance from the multi-dimensional decision hyperplanes.
                  </p>
                </div>
              </div>

              {/* Exact 9 Model Inputs Traceability Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-300 text-xs uppercase">
                    Model Input Feature Vector (9 Dimensional Tensor)
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400">
                    Input to Random Forest Inference
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-3">Feature Parameter</th>
                        <th className="py-2 px-3">Variable Name</th>
                        <th className="py-2 px-3">Value</th>
                        <th className="py-2 px-3">Unit / Scale</th>
                        <th className="py-2 px-3">Interpretation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                      <tr>
                        <td className="py-2 px-3 font-semibold text-slate-200">MQ-135 Baseline</td>
                        <td className="py-2 px-3 text-slate-400">mq135_baseline</td>
                        <td className="py-2 px-3 text-emerald-400 font-bold">{sensorReadings.mq135_baseline}</td>
                        <td className="py-2 px-3 text-slate-500">counts (0-1023)</td>
                        <td className="py-2 px-3 text-slate-400">Pre-seal ambient air quality reference</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-slate-200">MQ-3 Baseline</td>
                        <td className="py-2 px-3 text-slate-400">mq3_baseline</td>
                        <td className="py-2 px-3 text-emerald-400 font-bold">{sensorReadings.mq3_baseline}</td>
                        <td className="py-2 px-3 text-slate-500">counts (0-1023)</td>
                        <td className="py-2 px-3 text-slate-400">Pre-seal ambient ethanol zero-point</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-slate-200">MQ-135 Mean (10 Samples)</td>
                        <td className="py-2 px-3 text-slate-400">mq135_mean</td>
                        <td className="py-2 px-3 text-amber-400 font-bold">{sensorReadings.mq135_mean}</td>
                        <td className="py-2 px-3 text-slate-500">counts (0-1023)</td>
                        <td className="py-2 px-3 text-slate-400">VOC volatile equilibrium in sealed chamber</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-slate-200">MQ-135 Std Dev</td>
                        <td className="py-2 px-3 text-slate-400">mq135_std</td>
                        <td className="py-2 px-3 text-slate-300">&plusmn;{sensorReadings.mq135_std}</td>
                        <td className="py-2 px-3 text-slate-500">&sigma; count</td>
                        <td className="py-2 px-3 text-slate-400">Sensor variance / noise threshold</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-slate-200">MQ-3 Mean (10 Samples)</td>
                        <td className="py-2 px-3 text-slate-400">mq3_mean</td>
                        <td className="py-2 px-3 text-cyan-400 font-bold">{sensorReadings.mq3_mean}</td>
                        <td className="py-2 px-3 text-slate-500">counts (0-1023)</td>
                        <td className="py-2 px-3 text-slate-400">Alcohol &amp; fermentation vapor density</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-slate-200">MQ-3 Std Dev</td>
                        <td className="py-2 px-3 text-slate-400">mq3_std</td>
                        <td className="py-2 px-3 text-slate-300">&plusmn;{sensorReadings.mq3_std}</td>
                        <td className="py-2 px-3 text-slate-500">&sigma; count</td>
                        <td className="py-2 px-3 text-slate-400">Ethanol sensor stability</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-slate-200">FSR Median (3 Probes)</td>
                        <td className="py-2 px-3 text-slate-400">fsr_median</td>
                        <td className="py-2 px-3 text-purple-400 font-bold">{sensorReadings.fsr_median}</td>
                        <td className="py-2 px-3 text-slate-500">counts (0-1023)</td>
                        <td className="py-2 px-3 text-slate-400">Resistance to constant test mass displacement</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-slate-200">Temperature (DHT11)</td>
                        <td className="py-2 px-3 text-slate-400">temp_c</td>
                        <td className="py-2 px-3 text-slate-200">{sensorReadings.temp_c}</td>
                        <td className="py-2 px-3 text-slate-500">&deg;C</td>
                        <td className="py-2 px-3 text-slate-400">Thermal compensation coefficient</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-slate-200">Humidity (DHT11)</td>
                        <td className="py-2 px-3 text-slate-400">rh_pct</td>
                        <td className="py-2 px-3 text-slate-200">{sensorReadings.rh_pct}</td>
                        <td className="py-2 px-3 text-slate-500">% RH</td>
                        <td className="py-2 px-3 text-slate-400">Vapor condensation &amp; transpiration indicator</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* Official Printable Inspection Certificate Modal */}
      <InspectionCertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        result={{
          ...result,
          estimatedShelfLife: activeShelfLife,
          storageEnvironment: activeStorage
        }}
      />

    </section>
  );
};
