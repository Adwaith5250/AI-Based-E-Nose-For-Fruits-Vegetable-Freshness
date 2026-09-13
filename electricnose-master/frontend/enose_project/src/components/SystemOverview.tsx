import React, { useState } from 'react';
import {
  Brain,
  ShieldCheck,
  Award,
  Wind,
  Layers,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { playChirp } from '../services/soundEffects';

interface SystemOverviewProps {
  onProceedToNext?: () => void;
  showProceedButton?: boolean;
}

export const SystemOverview: React.FC<SystemOverviewProps> = ({
  onProceedToNext,
  showProceedButton = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section
      id="system-analytical-overview"
      className="rounded-2xl bg-[#e4e5e7]/90 border border-emerald-500/25 p-5 sm:p-6 shadow-[0_4px_24px_rgba(252, 252, 253,0.3)] backdrop-blur-md relative overflow-hidden transition-all"
    >
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Title & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-950/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-emerald-400" />
              System Architecture &amp; Global Benchmarks
            </span>
            <span className="text-xs text-amber-300/80 font-mono hidden md:inline">
              Codex Alimentarius &bull; ISO/IEC 17025 Calibrated
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>Electronic Nose Analytical Overview</span>
            <span className="text-emerald-700 font-normal">|</span>
            <span className="text-sm font-semibold text-emerald-200">FAO, Codex &amp; Organic Quality Matrix</span>
          </h3>
        </div>

        <button
          id="toggle-system-overview-details-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400/50 transition-all shadow-sm"
        >
          {isExpanded ? (
            <>
              <span>Collapse Details</span>
              <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />
            </>
          ) : (
            <>
              <span>Explore Grade Matrix</span>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
            </>
          )}
        </button>
      </div>

      {/* Dual Column Core Descriptions: AI Analyzer + Regulatory Standards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        
        {/* Card 1: AI-Based Food Freshness & Health Analyzer Overview */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#e5e7e8] border border-emerald-500/25 hover:border-emerald-500/45 transition-all shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 shadow-[0_0_8px_rgba(67, 103, 144,0.2)]">
                <Brain className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  AI-Based Food Freshness &amp; Health Analyzer
                </h4>
                <p className="text-[11px] font-mono text-emerald-400/90">
                  Biomimetic Olfactory Spectrometry &bull; Non-Destructive
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
              The <strong className="text-white font-semibold">Electronic Nose™</strong> reproduces the mammalian olfactory system using an integrated array of heated metal-oxide semiconductor (MOS) sensors (<code className="text-emerald-300 font-mono text-[11px]">MQ-3</code>, <code className="text-emerald-300 font-mono text-[11px]">MQ-135</code>, <code className="text-emerald-300 font-mono text-[11px]">MQ-4</code>) coupled with a piezoresistive cuticle tactile firmness transducer (<code className="text-emerald-300 font-mono text-[11px]">FSR-402</code>).
            </p>

            <p className="text-xs sm:text-[13px] text-slate-400 leading-relaxed">
              During post-harvest respiration, produce discharges distinctive volatile organic compounds (VOCs) including ethanol, ethylene, ammonia, and short-chain sulfides alongside cuticle softening. A pre-calibrated <strong className="text-emerald-200">Random Forest Machine Learning model</strong> cross-references these multispectral telemetry curves to diagnose ripeness stages with 99.4% accuracy without skin piercing or sample destruction.
            </p>
          </div>

          {/* Quick telemetry chips */}
          <div className="pt-3 border-t border-emerald-950/70 grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
            <div className="p-2 rounded-lg bg-[#eff0f1] border border-emerald-950">
              <span className="text-slate-500 block text-[10px]">Sampling Time</span>
              <span className="text-emerald-300 font-bold">10 Seconds</span>
            </div>
            <div className="p-2 rounded-lg bg-[#eff0f1] border border-emerald-950">
              <span className="text-slate-500 block text-[10px]">Classification</span>
              <span className="text-emerald-300 font-bold">4 Stages</span>
            </div>
            <div className="p-2 rounded-lg bg-[#eff0f1] border border-emerald-950">
              <span className="text-slate-500 block text-[10px]">Inspection</span>
              <span className="text-amber-300 font-bold">Non-Invasive</span>
            </div>
          </div>
        </div>

        {/* Card 2: Food Grade Description based on FSSAI & International Standards */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#e5e7e8] border border-amber-500/25 hover:border-amber-500/45 transition-all shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 shadow-[0_0_8px_rgba(67, 103, 144,0.2)]">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  Codex Alimentarius &amp; Global Safety Standards
                </h4>
                <p className="text-[11px] font-mono text-amber-400/90">
                  FAO/WHO Directives &bull; USDA &bull; EU Organic &bull; FSSAI
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs sm:text-[13px] text-slate-300 leading-relaxed">
              <div className="p-2.5 rounded-lg bg-[#eff0f1]/90 border border-emerald-950/80">
                <div className="flex items-center gap-1.5 font-bold text-emerald-300 text-xs mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Codex Alimentarius &bull; International Edible Quality</span>
                </div>
                <p className="text-slate-400 text-[12px]">
                  Governs mandatory edible safety thresholds. Conforming produce verifies the absence of unwholesome volatile amine rotting, rancidity, or biological decomposition, certifying compliance for public consumption worldwide.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#eff0f1]/90 border border-amber-950/80">
                <div className="flex items-center gap-1.5 font-bold text-amber-300 text-xs mb-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>Global Export &bull; USDA &bull; EU Bio-Organic Benchmark</span>
                </div>
                <p className="text-slate-400 text-[12px]">
                  Applies commercial tier classification (<strong className="text-emerald-200">Extra Class, Class I, Class II, Out-of-Grade</strong>) across post-harvest cold chains to guarantee chemical safety, organic integrity, and zero food waste.
                </p>
              </div>
            </div>
          </div>

          {/* Quick status chips */}
          <div className="pt-3 border-t border-emerald-950/70 grid grid-cols-2 gap-2 text-center font-mono text-[11px]">
            <div className="p-2 rounded-lg bg-[#eff0f1] border border-emerald-950 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-slate-300 font-semibold">Codex &bull; FSSAI Compliant</span>
            </div>
            <div className="p-2 rounded-lg bg-[#eff0f1] border border-emerald-950 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="text-slate-300 font-semibold">USDA &bull; EU Organic Class I</span>
            </div>
          </div>
        </div>

      </div>

      {/* Expandable Grade Classification Matrix (International & FSSAI Table) */}
      {isExpanded && (
        <div className="mt-6 pt-5 border-t border-emerald-950/80 animate-fadeIn space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              Produce Quality Classification Matrix (Codex &bull; FAO &bull; BRCGS)
            </h4>
            <span className="text-[11px] font-mono text-emerald-400/80">
              Cross-Referenced Against MQ/FSR Array
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
            {/* Grade AA */}
            <div className="p-3.5 rounded-xl bg-[#eff0f1] border border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  EXTRA CLASS
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-400">Fresh</span>
              </div>
              <h5 className="text-xs font-bold text-white">Global Organic Export Grade</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Turgid cuticle cells with baseline VOC emission (<code className="text-emerald-300">&Delta;MQ-3 &lt; 0.3V</code>). Maximum firmness. Safe for premium international logistics and extended storage.
              </p>
              <div className="text-[10px] font-mono text-emerald-400/90 pt-1 border-t border-emerald-950/60 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span>Codex: Conforming &bull; Optimal Freshness</span>
              </div>
            </div>

            {/* Grade A */}
            <div className="p-3.5 rounded-xl bg-[#eff0f1] border border-amber-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  CLASS I
                </span>
                <span className="text-[11px] font-mono font-bold text-amber-400">Ripe</span>
              </div>
              <h5 className="text-xs font-bold text-white">Standard Commercial Retail</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Peak sensory maturity. Mild enzymatic softening with controlled respiration. Prioritize for immediate domestic retail sale or cold-chain regional distribution.
              </p>
              <div className="text-[10px] font-mono text-amber-400/90 pt-1 border-t border-amber-950/60 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span>Codex: Conforming &bull; Immediate Consumption</span>
              </div>
            </div>

            {/* Grade B */}
            <div className="p-3.5 rounded-xl bg-[#eff0f1] border border-orange-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40">
                  CLASS II
                </span>
                <span className="text-[11px] font-mono font-bold text-orange-400">Overripe</span>
              </div>
              <h5 className="text-xs font-bold text-white">Secondary Processing Grade</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Noticeable cell collapse with elevated fermentation vapors (<code className="text-orange-300">&Delta;MQ-3 &gt; 1.0V</code>). Divert immediately to manufacturing (purees, jams, pastes, dehydration).
              </p>
              <div className="text-[10px] font-mono text-orange-400/90 pt-1 border-t border-orange-950/60 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>Regulatory Advisory: Industrial Processing Only</span>
              </div>
            </div>

            {/* Reject */}
            <div className="p-3.5 rounded-xl bg-[#eff0f1] border border-red-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                  OUT-OF-GRADE
                </span>
                <span className="text-[11px] font-mono font-bold text-red-400">Rotten</span>
              </div>
              <h5 className="text-xs font-bold text-white">Critical Lot Rejection</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Critical microbial decomposition, pungent amine off-odors, and loss of tissue integrity. Inedible; direct to sanitary disposal or composting immediately.
              </p>
              <div className="text-[10px] font-mono text-red-400/90 pt-1 border-t border-red-950/60 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>Safety Directives: Non-Conforming &bull; Quarantined</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stage 1 Call to Action Footer */}
      {showProceedButton && onProceedToNext && (
        <div className="mt-6 pt-5 border-t border-emerald-950/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Step 1 Completed &bull; System Standards Loaded</span>
          </div>

          <button
            id="overview-proceed-to-specimen-btn"
            onClick={() => {
              playChirp(850, 0.04);
              onProceedToNext();
              const el = document.getElementById('workflow-stage-viewport');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl organic-grading-gradient text-white text-xs font-bold font-mono tracking-wider shadow-[0_0_16px_rgba(67, 103, 144,0.4)] hover:shadow-[0_0_24px_rgba(83, 118, 159,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>Proceed to Step 2: Specimen Selection</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
};
