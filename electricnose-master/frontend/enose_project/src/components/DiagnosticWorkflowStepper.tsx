import React from 'react';
import {
  Info,
  Apple,
  Thermometer,
  Wind,
  FileCheck,
  CheckCircle2,
  ChevronRight,
  SlidersHorizontal,
  Layers,
  FlaskConical
} from 'lucide-react';
import { playChirp } from '../services/soundEffects';

export type DiagnosticStepId = 1 | 2 | 3 | 4 | 5 | 6;

interface StepConfig {
  id: DiagnosticStepId;
  number: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
}

const STEPS: StepConfig[] = [
  {
    id: 1,
    number: '01',
    title: 'System & Standards',
    subtitle: 'FSSAI & BRCGS Benchmarks',
    icon: Info,
  },
  {
    id: 2,
    number: '02',
    title: 'Specimen Target',
    subtitle: 'Produce Selection',
    icon: Apple,
  },
  {
    id: 3,
    number: '03',
    title: 'Microclimate',
    subtitle: 'Storage Environment',
    icon: Thermometer,
  },
  {
    id: 4,
    number: '04',
    title: 'Olfactory Chamber',
    subtitle: 'Sensor Array & Scan',
    icon: Wind,
  },
  {
    id: 5,
    number: '05',
    title: 'Diagnostic Report',
    subtitle: 'FSSAI Certificate & Metrics',
    icon: FileCheck,
  },
  {
    id: 6,
    number: '06',
    title: 'Ripening & Wax',
    subtitle: 'Carbide & Cuticle Safety',
    icon: FlaskConical,
  },
];

interface DiagnosticWorkflowStepperProps {
  activeStep: DiagnosticStepId;
  onStepChange: (step: DiagnosticStepId) => void;
  viewMode: 'stepped' | 'full';
  onToggleViewMode: () => void;
  isFoodSelected: boolean;
  isScanComplete: boolean;
  selectedFoodName?: string;
}

export const DiagnosticWorkflowStepper: React.FC<DiagnosticWorkflowStepperProps> = ({
  activeStep,
  onStepChange,
  viewMode,
  onToggleViewMode,
  isFoodSelected,
  isScanComplete,
  selectedFoodName,
}) => {
  const handleSelectStep = (step: DiagnosticStepId) => {
    playChirp(700 + step * 50, 0.03);
    onStepChange(step);
    // Smooth scroll to main container if needed
    const mainEl = document.getElementById('workflow-stage-viewport');
    if (mainEl) {
      mainEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const isStepCompleted = (stepId: DiagnosticStepId) => {
    if (stepId === 1) return true; // System overview always accessible
    if (stepId === 2) return isFoodSelected;
    if (stepId === 3) return true; // Default storage always selected
    if (stepId === 4) return isScanComplete;
    if (stepId === 5) return isScanComplete;
    if (stepId === 6) return true; // Ripening and wax safety accessible anytime
    return false;
  };

  return (
    <nav
      id="diagnostic-workflow-stepper"
      aria-label="Diagnostic Workflow Stepper"
      className="p-2 sm:p-3 rounded-2xl bg-[#f5f6f6]/95 border border-emerald-500/30 shadow-[0_8px_32px_rgba(252, 252, 253,0.5)] backdrop-blur-xl transition-all"
    >
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Step Progression Buttons */}
        <div className="flex items-center overflow-x-auto no-scrollbar gap-1 sm:gap-2 pb-1 lg:pb-0">
          {STEPS.map((step, idx) => {
            const isActive = activeStep === step.id && viewMode === 'stepped';
            const completed = isStepCompleted(step.id);
            const Icon = step.icon;

            return (
              <React.Fragment key={step.id}>
                <button
                  id={`workflow-step-btn-${step.id}`}
                  onClick={() => handleSelectStep(step.id)}
                  className={`group relative flex items-center gap-2.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-left transition-all shrink-0 select-none ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-950/90 via-[#e4e5e7] to-emerald-950/90 border border-emerald-400/80 shadow-[0_0_20px_rgba(83, 118, 159,0.35)] text-white'
                      : completed
                      ? 'bg-[#edeeef]/80 hover:bg-[#e4e5e7] border border-emerald-950 text-slate-300'
                      : 'bg-[#f7f8f8]/50 hover:bg-[#eeeff0]/60 border border-transparent text-slate-500'
                  }`}
                >
                  {/* Step Number & Indicator Icon */}
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs transition-all ${
                      isActive
                        ? 'bg-emerald-400 text-black shadow-[0_0_12px_#6988ab]'
                        : completed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {completed && !isActive ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <span>{step.number}</span>
                    )}
                  </div>

                  {/* Step Labels */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap ${
                          isActive ? 'text-white' : completed ? 'text-slate-200' : 'text-slate-400'
                        }`}
                      >
                        {step.title}
                      </span>
                      {step.id === 2 && selectedFoodName && (
                        <span className="hidden xl:inline-block text-[10px] font-mono px-1.5 py-0.2 rounded bg-black text-emerald-300 border border-emerald-500/30">
                          {selectedFoodName}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-mono whitespace-nowrap hidden sm:block ${
                        isActive ? 'text-emerald-300 font-semibold' : 'text-slate-500'
                      }`}
                    >
                      {step.subtitle}
                    </span>
                  </div>

                  {/* Active Pulse Pill */}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-emerald-400 to-green-300 rounded-full shadow-[0_0_10px_#6988ab]" />
                  )}
                </button>

                {/* Chevron connector between steps */}
                {idx < STEPS.length - 1 && (
                  <div className="text-emerald-900 hidden md:flex items-center shrink-0">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* View Mode Toggle: Stage-by-Stage (No scrolling) vs All-in-One View */}
        <div className="flex items-center justify-between lg:justify-end gap-2 border-t lg:border-t-0 border-emerald-950 pt-2 lg:pt-0 shrink-0">
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            Workflow Mode:
          </span>

          <button
            id="toggle-workflow-view-mode-btn"
            onClick={onToggleViewMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border transition-all ${
              viewMode === 'stepped'
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(83, 118, 159,0.3)]'
                : 'bg-[#edeeef] hover:bg-[#e4e5e7] border-emerald-950 text-slate-400 hover:text-slate-200'
            }`}
            title={
              viewMode === 'stepped'
                ? 'Step-by-Step Guided Mode active (zero scrolling required). Click to view all sections.'
                : 'All-in-One Continuous View active. Click to switch to Step-by-Step Guided Mode.'
            }
          >
            {viewMode === 'stepped' ? (
              <>
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Stage-by-Stage (Focused)</span>
              </>
            ) : (
              <>
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span>All Sections (Continuous)</span>
              </>
            )}
          </button>
        </div>

      </div>
    </nav>
  );
};
