import React from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Flame,
  Hourglass,
  Info,
  MapPin,
  Moon,
  ShieldAlert,
  Snowflake,
  Sparkles,
  Sun,
  Thermometer,
  Warehouse,
  Wind
} from 'lucide-react';
import { FoodType, FreshnessStage, SensorReadings, StorageEnvironment } from '../types';
import { calculateStorageShelfLife, STORAGE_PRESETS } from '../services/shelfLifeCalculator';

interface ShelfLifeSectionProps {
  food: FoodType;
  status: FreshnessStage;
  estimatedShelfLife: string;
  sensorReadings: SensorReadings;
  storage?: StorageEnvironment;
}

export const ShelfLifeSection: React.FC<ShelfLifeSectionProps> = ({
  food,
  status,
  sensorReadings,
  storage = STORAGE_PRESETS.room_temp
}) => {
  const stages: FreshnessStage[] = ['Fresh', 'Ripe', 'Overripe', 'Rotten'];
  const currentStageIndex = stages.indexOf(status);

  // Dynamically calculate shelf-life based on the user's selected/typed storage environment
  const storageCalculation = calculateStorageShelfLife(food, status, storage);

  // Status themes
  const statusTheme = {
    Fresh: {
      textClass: 'text-emerald-400',
      borderClass: 'border-emerald-500/40',
      badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      barColor: '#436790',
      action: 'Primary Grade A Retail & Long-Term Preservation',
      actionBadge: 'Ready for Storage'
    },
    Ripe: {
      textClass: 'text-amber-400',
      borderClass: 'border-amber-500/40',
      badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      barColor: '#be9042',
      action: 'Optimal Peak Flavor · Prioritize Table Display or Fast Consumption',
      actionBadge: 'Peak Consumption Window'
    },
    Overripe: {
      textClass: 'text-orange-400',
      borderClass: 'border-orange-500/40',
      badgeClass: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
      barColor: '#c37d4c',
      action: 'Secondary Culinary Processing (Sauces, Purees, Freezing, Juicing)',
      actionBadge: 'Process Promptly'
    },
    Rotten: {
      textClass: 'text-rose-400',
      borderClass: 'border-rose-500/40',
      badgeClass: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
      barColor: '#b03f53',
      action: 'REJECT: Quarantine Lot · High Volatile Amines · Compost Immediately',
      actionBadge: 'Quarantine & Discard'
    }
  }[status];

  // Suitability badge style
  const suitabilityStyles = {
    optimal: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    acceptable: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    suboptimal: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    hazardous: 'bg-rose-500/15 text-rose-300 border-rose-500/30'
  }[storageCalculation.storageSuitability];

  // Storage comparison calculations for standard regimes
  const ambientCalc = calculateStorageShelfLife(food, status, STORAGE_PRESETS.room_temp);
  const refrigCalc = calculateStorageShelfLife(food, status, STORAGE_PRESETS.refrigerator);
  const cellarCalc = calculateStorageShelfLife(food, status, STORAGE_PRESETS.pantry_cellar);

  const isAmbientActive = storage.presetKey === 'room_temp' && !storage.isCustom;
  const isRefrigActive = storage.presetKey === 'refrigerator' && !storage.isCustom;
  const isCellarActive = storage.presetKey === 'pantry_cellar' && !storage.isCustom;
  const isCustomActive = storage.isCustom;

  return (
    <section
      id="shelf-life-section"
      aria-label="Estimated Shelf Life & Degradation Projection"
      className="rounded-2xl bg-[#e4e5e7] border border-slate-800 p-5 sm:p-6 space-y-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-sm">
            <Hourglass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Shelf Life &amp; Storage Degradation Projection
              </h3>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-emerald-400 border border-slate-700">
                Calibrated to User Storage Area
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Biochemical post-harvest decay modeled dynamically using volatile emission rate and storage microclimate.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs self-start sm:self-auto flex-wrap">
          <span className={`px-3 py-1 rounded-lg border font-bold ${statusTheme.badgeClass}`}>
            Stage: {status}
          </span>
          <span className={`px-3 py-1 rounded-lg border font-bold ${suitabilityStyles}`}>
            {storageCalculation.suitabilityBadge}
          </span>
        </div>
      </div>

      {/* ACTIVE STORAGE AREA SUMMARY CALLOUT */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400">Selected Storage Area:</span>
            <strong className="text-white font-bold bg-slate-900 px-2.5 py-0.5 rounded border border-slate-700">
              {storage.name}
            </strong>
            <span className="font-mono text-slate-400 text-[11px]">
              &bull; {storage.tempC}&deg;C ({Math.round(storage.tempC * 1.8 + 32)}&deg;F) &bull; {storage.rhPct}% RH &bull; {storage.isDark ? 'Dark / Shaded' : 'Ambient Light'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px] self-start md:self-auto">
          <Thermometer className="w-3.5 h-3.5 text-rose-400" />
          <span>Respiration Rate Factor:</span>
          <strong className="text-emerald-400">{storageCalculation.temperatureFactor}x</strong>
        </div>
      </div>

      {/* Main Shelf Life Hero Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
        
        {/* Left: Primary Clock / Days Remaining IN THE SELECTED STORAGE */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Lifespan in {storage.name}</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Storage-Adjusted
              </span>
            </div>
            
            <div className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold font-mono mt-2 ${statusTheme.textClass}`}>
              {storageCalculation.displayShelfLife}
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mt-2 flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Projected Expiry Date: </span>
              <strong className="text-white">{storageCalculation.expiryDate}</strong>
            </p>
          </div>

          {/* Storage Impact Note */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1.5">
            <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
              <span className="flex items-center gap-1">
                <Info className="w-3 h-3 text-sky-400" />
                Storage Environment Impact:
              </span>
              <span className={`font-semibold ${statusTheme.textClass}`}>{statusTheme.actionBadge}</span>
            </div>
            <p className="font-sans font-medium text-slate-200 leading-relaxed">
              {storageCalculation.storageImpactNote}
            </p>
          </div>
        </div>

        {/* Right: Freshness Stage Progression Curve */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-3 pt-4 lg:pt-0 lg:border-l lg:border-slate-800 lg:pl-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Produce Maturation Continuum
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Stage {currentStageIndex + 1} of 4 ({status})
            </span>
          </div>

          {/* Stepper with visual indicators */}
          <div className="grid grid-cols-4 gap-2">
            {stages.map((stageName, idx) => {
              const isCurrent = stageName === status;
              const isPast = idx < currentStageIndex;
              const stageColor =
                stageName === 'Fresh'
                  ? '#436790'
                  : stageName === 'Ripe'
                  ? '#be9042'
                  : stageName === 'Overripe'
                  ? '#c37d4c'
                  : '#b03f53';

              return (
                <div key={stageName} className="space-y-2 text-center">
                  <div className="relative flex items-center justify-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold border transition-all ${
                        isCurrent
                          ? 'ring-2 ring-emerald-400/50 scale-110 text-white'
                          : isPast
                          ? 'border-slate-700 bg-slate-800 text-slate-300'
                          : 'border-slate-800 bg-slate-900 text-slate-600'
                      }`}
                      style={{
                        backgroundColor: isCurrent ? stageColor : undefined,
                        borderColor: isCurrent ? stageColor : undefined
                      }}
                    >
                      {idx + 1}
                    </div>
                  </div>
                  <div>
                    <span
                      className={`text-xs block font-bold truncate ${
                        isCurrent ? 'text-white' : isPast ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {stageName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 block truncate">
                      {stageName === 'Fresh'
                        ? 'Crisp'
                        : stageName === 'Ripe'
                        ? 'Ready'
                        : stageName === 'Overripe'
                        ? 'Soft'
                        : 'Decomposed'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dynamic Progress Track */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>Harvest Fresh (0%)</span>
              <span>Decomposition (100%)</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.max(10, Math.min(100, (currentStageIndex / 3) * 100))}%`,
                  backgroundColor: statusTheme.barColor
                }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Special Agronomic Warning for Incompatible Storage (e.g. Banana in fridge, Potato in light/refrig) */}
      {storageCalculation.specialWarning && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3 text-xs text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-300 text-sm">
              Critical Storage Area Advisory for {food}
            </h4>
            <p className="leading-relaxed text-amber-200/90">
              {storageCalculation.specialWarning}
            </p>
          </div>
        </div>
      )}

      {/* Storage Regimes Comparison Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Warehouse className="w-3.5 h-3.5 text-sky-400" />
            Storage Environment Comparison Matrix for {food}
          </h4>
          <span className="text-[11px] font-mono text-slate-400">
            Current Stage: {status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          
          {/* Regime 1: Ambient Room Temperature */}
          <div
            className={`p-4 rounded-xl border space-y-2.5 relative transition-all ${
              isAmbientActive
                ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg'
                : 'bg-slate-900/70 border-slate-800'
            }`}
          >
            {isAmbientActive && (
              <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-mono font-bold">
                YOUR STORAGE
              </span>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5" />
                Kitchen Countertop (21°C)
              </span>
              <span className="text-[10px] font-mono text-slate-400">Ambient</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white">
              {ambientCalc.displayShelfLife}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Standard room open-air condition. Optimal for bananas and tomatoes to ripen with full aromatic flavor.
            </p>
          </div>

          {/* Regime 2: Cold Chain Refrigeration */}
          <div
            className={`p-4 rounded-xl border space-y-2.5 relative transition-all ${
              isRefrigActive
                ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg'
                : food === 'Banana' || food === 'Tomato' || food === 'Potato'
                ? 'bg-amber-950/20 border-amber-500/30'
                : 'bg-slate-900/70 border-slate-800'
            }`}
          >
            {isRefrigActive && (
              <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-mono font-bold">
                YOUR STORAGE
              </span>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                <Snowflake className="w-3.5 h-3.5" />
                Refrigerator (4°C)
              </span>
              <span className="text-[10px] font-mono text-slate-400">Cold Chain</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white">
              {refrigCalc.displayShelfLife}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {food === 'Banana' ? (
                <span className="text-amber-300">
                  Chilling Warning: Bananas suffer peel browning below 12°C. Pulp lasts 2–4 days.
                </span>
              ) : food === 'Tomato' ? (
                <span className="text-amber-300">
                  Chilling Warning: Storing below 10°C suppresses aroma volatiles and creates mealy pulp.
                </span>
              ) : food === 'Potato' ? (
                <span className="text-amber-300">
                  Sweetening Warning: Cold converts starch to reducing sugars, producing acrylamide when fried.
                </span>
              ) : (
                'Optimal commercial cold holding for apples. Drastically slows respiration and preserves crispness.'
              )}
            </p>
          </div>

          {/* Regime 3: Dark Pantry / Root Cellar */}
          <div
            className={`p-4 rounded-xl border space-y-2.5 relative transition-all ${
              isCellarActive
                ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg'
                : 'bg-slate-900/70 border-slate-800'
            }`}
          >
            {isCellarActive && (
              <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-mono font-bold">
                YOUR STORAGE
              </span>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
                <Warehouse className="w-3.5 h-3.5" />
                Dark Pantry / Cellar (11°C)
              </span>
              <span className="text-[10px] font-mono text-slate-400">Cool &amp; Dark</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white">
              {cellarCalc.displayShelfLife}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {food === 'Potato'
                ? 'Optimal storage for potatoes! Cool darkness prevents sprouting and blocks toxic solanine synthesis.'
                : 'Cool shaded holding with gentle ventilation. Extends freshness without extreme chilling injury.'}
            </p>
          </div>

        </div>

        {/* Custom Storage Card if User Typed a Custom Location */}
        {isCustomActive && (
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/60 ring-1 ring-emerald-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-400" />
                Your Custom Typed Storage Area: &ldquo;{storage.name}&rdquo;
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500 text-slate-950">
                ACTIVE CALCULATION
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <div className="text-2xl font-extrabold font-mono text-emerald-400">
                {storageCalculation.displayShelfLife}
              </div>
              <span className="text-xs font-mono text-slate-400">
                (at {storage.tempC}&deg;C, {storage.rhPct}% RH, {storage.isDark ? 'Dark' : 'Light'})
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {storageCalculation.storageImpactNote}
            </p>
          </div>
        )}
      </div>

      {/* Degradation & Microbial Dynamics */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Biochemical Degradation Dynamics</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {status === 'Fresh'
              ? `Turgid cuticle membranes (FSR: ${sensorReadings.fsr_median} ADC) seal intracellular vacuole pressure. Low respiration in ${storage.name}.`
              : status === 'Ripe'
              ? 'Pectin methyl esterase breakdown softens cellular boundaries, accelerating sugar concentration and aroma ester release.'
              : status === 'Overripe'
              ? 'Complete middle lamella degradation. Anaerobic fermentation converts sugars to ethanol and acetaldehyde vapors.'
              : 'Severe fungal hyphae penetration, pectin liquefaction, and toxic putrefactive diamine generation.'}
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Microbial &amp; Pathogen Risk in {storage.name}</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {status === 'Fresh'
              ? `Negligible pathogen colony formation under ${storage.name} conditions. Surface sanitized cuticle maintains natural defense.`
              : status === 'Ripe'
              ? 'Elevated sugar availability makes cuticle receptive to Penicillium expansum or Botrytis cinerea if relative humidity exceeds 85%.'
              : status === 'Overripe'
              ? 'High microbial susceptibility. Fruit flies and airborne mold spores readily colonize micro-fractures in the skin.'
              : 'CRITICAL: High fungal and bacterial contamination. Do not consume or touch without washing hands.'}
          </p>
        </div>
      </div>
    </section>
  );
};
