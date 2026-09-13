/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TopBar } from './components/TopBar';
import { StorageSelector } from './components/StorageSelector';
import { FoodSelector } from './components/FoodSelector';
import { ScanSection } from './components/ScanSection';
import { ReportSection } from './components/ReportSection';
import { NutritionWeightSection } from './components/NutritionWeightSection';
import { ResearchedFoodInfo } from './components/ResearchedFoodInfo';
import { DatasetLogSection } from './components/DatasetLogSection';
import { SettingsModal } from './components/SettingsModal';
import { SerialTerminalModal } from './components/SerialTerminalModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ElectronicNoseLogo } from './components/ElectronicNoseLogo';
import { SystemOverview } from './components/SystemOverview';
import { DiagnosticWorkflowStepper, DiagnosticStepId } from './components/DiagnosticWorkflowStepper';
import { StageFooterNavigation } from './components/StageFooterNavigation';
import { ArtificialRipeningAndWaxSection } from './components/ArtificialRipeningAndWaxSection';
import { ConnectionStatus, FoodType, PredictionResult, ScanLogEntry, StorageEnvironment } from './types';
import { getFoodInfo } from './services/apiIntegration';
import { STORAGE_PRESETS, calculateStorageShelfLife } from './services/shelfLifeCalculator';
import {
  Activity,
  CheckCircle2,
  Compass,
  Cpu,
  Flame,
  Gauge,
  Layers,
  Scale,
  ShieldCheck,
  Sparkles,
  Thermometer,
  Wind,
} from 'lucide-react';

export default function App() {
  // Global App States
  const [mode, setMode] = useState<'demo' | 'live'>('demo');
  const [selectedStorage, setSelectedStorage] = useState<StorageEnvironment>(STORAGE_PRESETS.room_temp);
  const [selectedFood, setSelectedFood] = useState<FoodType>('Apple'); // Default to Apple for instant readiness
  const [chamberTime, setChamberTime] = useState<number>(60);
  const [baudRate, setBaudRate] = useState<number>(9600);
  const [preferredDemoStage, setPreferredDemoStage] = useState<string>('random');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);

  // Workflow Stage Navigation States (Step-by-Step Guided vs Continuous)
  const [activeStep, setActiveStep] = useState<DiagnosticStepId>(1);
  const [viewMode, setViewMode] = useState<'stepped' | 'full'>('stepped');

  // Connection & Scan States
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [portName, setPortName] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Active Prediction Report Result
  const [currentResult, setCurrentResult] = useState<PredictionResult | null>(null);

  // Notification Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSelectStorage = (storage: StorageEnvironment) => {
    setSelectedStorage(storage);
    // If a scan report exists, recalculate shelf life instantly for the newly selected storage area
    if (currentResult) {
      const calc = calculateStorageShelfLife(currentResult.food, currentResult.status, storage);
      setCurrentResult((prev) =>
        prev
          ? {
              ...prev,
              storageEnvironment: storage,
              estimatedShelfLife: calc.displayShelfLife
            }
          : null
      );
      addToast(
        'info',
        'Storage Re-Calibrated',
        `Recalculated ${currentResult.food} shelf life for ${storage.name}: ${calc.displayShelfLife}`
      );
    }
  };

  const handleSelectFood = (food: FoodType) => {
    setSelectedFood(food);
  };

  // Called when a scan finishes in either Demo or Live mode
  const handleScanComplete = (result: PredictionResult) => {
    const calc = calculateStorageShelfLife(result.food, result.status, selectedStorage);
    const calibratedResult: PredictionResult = {
      ...result,
      storageEnvironment: selectedStorage,
      estimatedShelfLife: calc.displayShelfLife
    };
    setCurrentResult(calibratedResult);
    addToast(
      'success',
      'Telemetry Analysis Complete',
      `${result.food} (${result.status}) in ${selectedStorage.name}: ${calc.displayShelfLife}`
    );

    // Auto-advance to Step 5 (Diagnostic Report) in stepped workflow mode
    if (viewMode === 'stepped') {
      setActiveStep(5);
      setTimeout(() => {
        const el = document.getElementById('workflow-stage-viewport');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  };

  // Called when operator appends to dataset in Live mode
  const handleLoggedSuccess = (entry: ScanLogEntry) => {
    addToast(
      'success',
      'Dataset Row Appended',
      `Saved ${entry.foodId} as ground-truth label [${entry.trueStage}] to training buffer.`
    );
  };

  // Researched static food knowledge for currently selected food
  const currentFoodInfo = getFoodInfo(selectedFood);

  return (
    <div className="min-h-screen bg-[#eaebec] text-slate-100 flex flex-col antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Top Navigation Bar */}
      <TopBar
        mode={mode}
        onModeChange={(newMode) => {
          setMode(newMode);
          if (newMode === 'live') {
            addToast('info', 'Live Hardware Mode', 'Web Serial API activated. Connect your sensor hardware below.');
          } else {
            addToast('info', 'Simulation Mode Active', 'Multi-stage autonomous physics simulation engine online.');
          }
        }}
        connectionStatus={connectionStatus}
        portName={portName}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTerminal={() => setIsTerminalOpen(true)}
        chamberTime={chamberTime}
      />

      {/* Main Single-Page App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        
        {/* Sub-Header International Standard Telemetry Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#e4e5e7]/95 border border-emerald-500/30 shadow-[0_4px_24px_rgba(252, 252, 253,0.35)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-32 bg-gradient-to-l from-emerald-500/15 via-amber-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#6988ab]"></span>
                  Global Food Freshness &amp; Organic Quality Diagnostics &bull; Codex Alimentarius
                </span>
                <span className="text-emerald-800 hidden sm:inline">&bull;</span>
                <span className="text-xs text-amber-300/90 font-mono hidden sm:inline">
                  USDA Organic &bull; EU Bio-Certification &bull; BRCGS Global
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Non-Destructive Volatile Gas &amp; Cuticle Firmness Produce Health Classification
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono self-stretch md:self-auto justify-between md:justify-end flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-[#e7e8ea] border border-emerald-900/60 text-slate-300">
              Standard: <strong className="text-emerald-300 font-semibold">FAO &bull; WHO &bull; Codex</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#e7e8ea] border border-emerald-900/60 text-slate-300">
              Grading: <strong className="text-amber-300 font-semibold">Organic Class I &amp; Extra</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#e7e8ea] border border-emerald-900/60 text-slate-300">
              Sensors: <strong className="text-emerald-200">Metal-Oxide Array (380&deg;C)</strong>
            </span>
          </div>
        </div>

        {/* Interactive Executive Diagnostic Workflow Stepper */}
        <DiagnosticWorkflowStepper
          activeStep={activeStep}
          onStepChange={(step) => setActiveStep(step)}
          viewMode={viewMode}
          onToggleViewMode={() => setViewMode((prev) => (prev === 'stepped' ? 'full' : 'stepped'))}
          isFoodSelected={!!selectedFood}
          isScanComplete={!!currentResult}
          selectedFoodName={selectedFood || undefined}
        />

        {/* Viewport for Staged Section-by-Section Experience */}
        <div id="workflow-stage-viewport" className="space-y-8 scroll-mt-24">
          
          {viewMode === 'stepped' ? (
            /* ================================================================
             * STEPPED GUIDED MODE (One section at a time, zero vertical scrolling)
             * ================================================================ */
            <div className="space-y-6">

              {/* STAGE 1: SYSTEM OVERVIEW & INTERNATIONAL/FSSAI STANDARDS */}
              {activeStep === 1 && (
                <div className="animate-in fade-in zoom-in-95 duration-300">
                  <SystemOverview onProceedToNext={() => setActiveStep(2)} showProceedButton={true} />
                </div>
              )}

              {/* STAGE 2: SPECIMEN CLASSIFICATION TARGET (FRUIT / VEGETABLE) */}
              {activeStep === 2 && (
                <div className="animate-in fade-in zoom-in-95 duration-300 space-y-4">
                  <FoodSelector
                    selectedFood={selectedFood}
                    onSelectFood={handleSelectFood}
                    disabled={isScanning}
                  />

                  {/* Nutrition preview for chosen specimen */}
                  <div className="pt-2">
                    <NutritionWeightSection foodInfo={currentFoodInfo} status="Fresh" />
                  </div>

                  <StageFooterNavigation
                    currentStep={2}
                    prevLabel="System & Standards"
                    nextLabel="Proceed to Storage Environment"
                    onPrev={() => setActiveStep(1)}
                    onNext={() => setActiveStep(3)}
                    statusBadge={selectedFood ? `Specimen Configured: ${selectedFood}` : 'Please choose a produce specimen'}
                    disableNext={!selectedFood}
                  />
                </div>
              )}

              {/* STAGE 3: STORAGE AREA & MICROCLIMATE ENVIRONMENT */}
              {activeStep === 3 && (
                <div className="animate-in fade-in zoom-in-95 duration-300 space-y-4">
                  <StorageSelector
                    selectedStorage={selectedStorage}
                    onSelectStorage={handleSelectStorage}
                    selectedFood={selectedFood}
                    disabled={isScanning}
                  />

                  <StageFooterNavigation
                    currentStep={3}
                    prevLabel="Specimen Target"
                    nextLabel="Proceed to Olfactory Chamber"
                    onPrev={() => setActiveStep(2)}
                    onNext={() => setActiveStep(4)}
                    statusBadge={`Microclimate: ${selectedStorage.name} (${selectedStorage.temp}°C, ${selectedStorage.humidity}% RH)`}
                  />
                </div>
              )}

              {/* STAGE 4: SENSOR ACQUISITION & INFERENCE (SCAN) */}
              {activeStep === 4 && (
                <div className="animate-in fade-in zoom-in-95 duration-300 space-y-4">
                  <ScanSection
                    mode={mode}
                    selectedFood={selectedFood}
                    chamberTime={chamberTime}
                    baudRate={baudRate}
                    preferredDemoStage={preferredDemoStage}
                    connectionStatus={connectionStatus}
                    setConnectionStatus={setConnectionStatus}
                    portName={portName}
                    setPortName={setPortName}
                    onScanComplete={handleScanComplete}
                    isScanning={isScanning}
                    setIsScanning={setIsScanning}
                    onSelectFood={handleSelectFood}
                  />

                  <StageFooterNavigation
                    currentStep={4}
                    prevLabel="Storage Environment"
                    nextLabel={currentResult ? "View Diagnostic Report & Certificate" : "Proceed to Report View"}
                    onPrev={() => setActiveStep(3)}
                    onNext={() => setActiveStep(5)}
                    statusBadge={
                      currentResult
                        ? `Last Scan: ${currentResult.food} (${currentResult.status})`
                        : 'Awaiting Chamber Scan Initiation'
                    }
                  />
                </div>
              )}

              {/* STAGE 5: REPORT & HEALTH CERTIFICATE */}
              {activeStep === 5 && (
                <div className="animate-in fade-in zoom-in-95 duration-300 space-y-6">
                  {currentResult ? (
                    <div className="space-y-6">
                      <ReportSection
                        result={currentResult}
                        storage={selectedStorage}
                        onNavigateToWaxSection={() => setActiveStep(6)}
                      />
                      <NutritionWeightSection foodInfo={currentFoodInfo} status={currentResult.status} />
                      <ResearchedFoodInfo foodInfo={currentFoodInfo} />
                      {mode === 'live' && (
                        <DatasetLogSection
                          currentResult={currentResult}
                          onLoggedSuccess={handleLoggedSuccess}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="p-8 sm:p-12 rounded-2xl bg-[#e4e5e7]/80 border border-dashed border-emerald-500/30 text-center space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-amber-500/20 border border-emerald-400/40 text-emerald-300 mx-auto flex items-center justify-center shadow-[0_0_15px_rgba(67, 103, 144,0.3)]">
                        <Compass className="w-6 h-6 animate-pulse text-emerald-300" />
                      </div>
                      <div className="max-w-md mx-auto space-y-2">
                        <h3 className="text-base font-bold text-white">Chamber Ready for Specimen Analysis</h3>
                        <p className="text-xs sm:text-sm text-slate-300">
                          {selectedFood ? (
                            <>
                              <strong className="text-emerald-300 font-semibold">{selectedFood}</strong> is selected. Run an olfactory scan in Step 4 to generate the full FAO, Codex Alimentarius &amp; Organic Inspection Certificate.
                            </>
                          ) : (
                            'Select an organic produce target in Step 2 to begin the olfactory scan process.'
                          )}
                        </p>
                        <div className="pt-2">
                          <button
                            id="jump-to-scan-chamber-btn"
                            onClick={() => setActiveStep(4)}
                            className="px-5 py-2.5 rounded-xl organic-grading-gradient text-white text-xs font-mono font-bold shadow-[0_0_15px_rgba(67, 103, 144,0.4)] hover:shadow-[0_0_20px_rgba(83, 118, 159,0.5)] transition-all"
                          >
                            Go to Step 4: Olfactory Scan Chamber &rarr;
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <StageFooterNavigation
                    currentStep={5}
                    prevLabel="Olfactory Chamber"
                    nextLabel="Proceed to Ripening & Wax Safety"
                    onPrev={() => setActiveStep(4)}
                    onNext={() => setActiveStep(6)}
                    onReset={() => {
                      setCurrentResult(null);
                      setActiveStep(2);
                      addToast('info', 'New Specimen Session', 'Ready to classify next produce target.');
                    }}
                    resetLabel="Analyze Another Specimen ↺"
                    statusBadge={currentResult ? 'FSSAI & BRCGS Inspection Certified' : undefined}
                  />
                </div>
              )}

              {/* STAGE 6: ARTIFICIAL RIPENING & WAX COATING INSPECTION */}
              {activeStep === 6 && (
                <div className="animate-in fade-in zoom-in-95 duration-300 space-y-6">
                  <ArtificialRipeningAndWaxSection
                    selectedFood={selectedFood}
                    onSelectFood={handleSelectFood}
                    sensorReadings={currentResult?.sensorReadings}
                  />

                  <StageFooterNavigation
                    currentStep={6}
                    prevLabel="Diagnostic Report"
                    onPrev={() => setActiveStep(5)}
                    onReset={() => {
                      setCurrentResult(null);
                      setActiveStep(2);
                      addToast('info', 'New Specimen Session', 'Ready to classify next produce target.');
                    }}
                    resetLabel="Analyze Another Specimen ↺"
                    statusBadge="FSSAI Reg. 2.3.5 & Cuticle Wax Screened"
                  />
                </div>
              )}

            </div>
          ) : (
            /* ================================================================
             * ALL-IN-ONE CONTINUOUS VIEW (For operators preferring full layout)
             * ================================================================ */
            <div className="space-y-8">
              {/* 1. System Overview */}
              <SystemOverview showProceedButton={false} />

              {/* 2. Specimen Target */}
              <FoodSelector
                selectedFood={selectedFood}
                onSelectFood={handleSelectFood}
                disabled={isScanning}
              />

              {/* 3. Storage Area */}
              <StorageSelector
                selectedStorage={selectedStorage}
                onSelectStorage={handleSelectStorage}
                selectedFood={selectedFood}
                disabled={isScanning}
              />

              {/* 4. Olfactory Scan Section */}
              <ScanSection
                mode={mode}
                selectedFood={selectedFood}
                chamberTime={chamberTime}
                baudRate={baudRate}
                preferredDemoStage={preferredDemoStage}
                connectionStatus={connectionStatus}
                setConnectionStatus={setConnectionStatus}
                portName={portName}
                setPortName={setPortName}
                onScanComplete={handleScanComplete}
                isScanning={isScanning}
                setIsScanning={setIsScanning}
                onSelectFood={handleSelectFood}
              />

              {/* 5. Report & Knowledge Base */}
              {currentResult ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <ReportSection
                    result={currentResult}
                    storage={selectedStorage}
                    onNavigateToWaxSection={() => {
                      setActiveStep(6);
                      const el = document.getElementById('artificial-ripening-wax-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  />
                  <NutritionWeightSection foodInfo={currentFoodInfo} status={currentResult.status} />
                  <ResearchedFoodInfo foodInfo={currentFoodInfo} />
                  {mode === 'live' && (
                    <DatasetLogSection
                      currentResult={currentResult}
                      onLoggedSuccess={handleLoggedSuccess}
                    />
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-8 sm:p-12 rounded-2xl bg-[#e4e5e7]/80 border border-dashed border-emerald-500/30 text-center space-y-3 relative overflow-hidden">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-amber-500/20 border border-emerald-400/40 text-emerald-300 mx-auto flex items-center justify-center shadow-[0_0_15px_rgba(67, 103, 144,0.3)]">
                      <Compass className="w-6 h-6 animate-pulse text-emerald-300" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1">
                      <h3 className="text-base font-bold text-white">Chamber Ready for Specimen Analysis</h3>
                      <p className="text-xs sm:text-sm text-slate-300">
                        {selectedFood ? (
                          <>
                            <strong className="text-emerald-300 font-semibold">{selectedFood}</strong> is selected. Click <strong className="text-white font-bold">&ldquo;Start Scan&rdquo;</strong> above to run telemetry inference.
                          </>
                        ) : (
                          'Select an Organic Produce Target under Specimen Classification to activate sensor scan.'
                        )}
                      </p>
                    </div>
                  </div>

                  <NutritionWeightSection foodInfo={currentFoodInfo} status="Fresh" />
                </div>
              )}

              {/* 6. Artificial Ripening & Wax Coating Inspection Section */}
              <ArtificialRipeningAndWaxSection
                selectedFood={selectedFood}
                onSelectFood={handleSelectFood}
              />
            </div>
          )}

        </div>

      </main>

      {/* Industrial Footer with Regulatory & Hardware Audit Traceability */}
      <footer className="border-t border-emerald-950/80 bg-[#ebeced] px-4 py-5 text-xs text-slate-400 font-mono mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ElectronicNoseLogo size="sm" showTrademarkBadge={false} />
            <span className="text-emerald-300 font-semibold">Electronic Nose™: AI Food Freshness &amp; Organic Health Analyzer</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap justify-center md:justify-end">
            <span>FAO &bull; Codex Alimentarius Standard</span>
            <span>USDA &amp; EU Bio-Organic Calibration</span>
            <span>BRCGS Global &bull; FSSAI Compliant</span>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        chamberTime={chamberTime}
        onChamberTimeChange={(val) => {
          setChamberTime(val);
          addToast('info', 'Chamber Parameter Updated', `Gas accumulation time set to ${val} seconds.`);
        }}
        baudRate={baudRate}
        onBaudRateChange={(baud) => {
          setBaudRate(baud);
          addToast('info', 'Serial Configuration', `Baud rate set to ${baud}.`);
        }}
        preferredDemoStage={preferredDemoStage}
        onPreferredDemoStageChange={(st) => {
          setPreferredDemoStage(st);
          addToast(
            'info',
            'Demo Profile Selected',
            st === 'random' ? 'Random natural distribution active.' : `Forced demo test stage: ${st}`
          );
        }}
      />

      {/* Serial Bus Monitor Console Modal */}
      <SerialTerminalModal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        portName={portName}
        baudRate={baudRate}
      />

      {/* Toast Feedback Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

    </div>
  );
}
