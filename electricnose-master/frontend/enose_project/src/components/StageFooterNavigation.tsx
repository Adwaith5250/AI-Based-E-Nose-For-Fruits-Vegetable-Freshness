import React from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { playChirp } from '../services/soundEffects';

interface StageFooterNavigationProps {
  currentStep: number;
  prevLabel?: string;
  nextLabel?: string;
  onPrev?: () => void;
  onNext?: () => void;
  statusBadge?: string;
  disableNext?: boolean;
  onReset?: () => void;
  resetLabel?: string;
}

export const StageFooterNavigation: React.FC<StageFooterNavigationProps> = ({
  currentStep,
  prevLabel,
  nextLabel,
  onPrev,
  onNext,
  statusBadge,
  disableNext = false,
  onReset,
  resetLabel = 'Start New Scan',
}) => {
  const handlePrev = () => {
    if (onPrev) {
      playChirp(600, 0.03);
      onPrev();
      const el = document.getElementById('workflow-stage-viewport');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNext = () => {
    if (onNext && !disableNext) {
      playChirp(850, 0.04);
      onNext();
      const el = document.getElementById('workflow-stage-viewport');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleReset = () => {
    if (onReset) {
      playChirp(550, 0.05);
      onReset();
      const el = document.getElementById('workflow-stage-viewport');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      id={`stage-footer-nav-step-${currentStep}`}
      className="mt-6 p-4 rounded-2xl bg-[#e4e5e7]/90 border border-indigo-500/25 shadow-[0_4px_24px_rgba(252, 252, 253,0.3)] backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 transition-all"
    >
      {/* Previous Step or Reset */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
        {onPrev ? (
          <button
            id={`stage-prev-btn-${currentStep}`}
            onClick={handlePrev}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e4e5e7] hover:bg-[#e4e5e7] border border-indigo-950 text-slate-300 hover:text-white text-xs font-mono font-semibold transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>{prevLabel || 'Previous Section'}</span>
          </button>
        ) : onReset ? (
          <button
            id="stage-reset-btn"
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e4e5e7] hover:bg-[#e4e5e7] border border-indigo-950 text-slate-300 hover:text-white text-xs font-mono font-semibold transition-all shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>{resetLabel}</span>
          </button>
        ) : (
          <span className="text-xs text-slate-500 font-mono">Stage {currentStep} of 6</span>
        )}
      </div>

      {/* Middle Status Pill */}
      {statusBadge && (
        <div className="text-center font-mono text-xs text-slate-400 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#e8e9ea] border border-indigo-950/80">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{statusBadge}</span>
        </div>
      )}

      {/* Next Step Button */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {onNext && (
          <button
            id={`stage-next-btn-${currentStep}`}
            disabled={disableNext}
            onClick={handleNext}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider transition-all w-full sm:w-auto ${
              disableNext
                ? 'bg-slate-800/60 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                : 'gemini-disco-gradient text-white shadow-[0_0_15px_rgba(122, 132, 143,0.4)] hover:shadow-[0_0_20px_rgba(99, 108, 119,0.5)] hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <span>{nextLabel || 'Next Section'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
