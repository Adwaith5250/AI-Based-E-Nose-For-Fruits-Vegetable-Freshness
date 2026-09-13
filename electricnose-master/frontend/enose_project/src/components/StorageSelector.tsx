import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Edit3,
  Flame,
  HelpCircle,
  Info,
  MapPin,
  Moon,
  PenTool,
  Search,
  ShieldCheck,
  Sliders,
  Snowflake,
  Sun,
  Thermometer,
  Warehouse,
  Wind
} from 'lucide-react';
import { FoodType, StorageEnvironment, StoragePresetKey } from '../types';
import {
  STORAGE_PRESETS,
  calculateStorageShelfLife,
  deduceMicroclimateFromText
} from '../services/shelfLifeCalculator';

interface StorageSelectorProps {
  selectedStorage: StorageEnvironment;
  onSelectStorage: (storage: StorageEnvironment) => void;
  selectedFood: FoodType;
  disabled?: boolean;
}

const PRESET_KEYS: StoragePresetKey[] = [
  'refrigerator',
  'room_temp',
  'pantry_cellar',
  'chilled_commercial',
  'warm_sun'
];

const PRESET_ICONS = {
  refrigerator: Snowflake,
  room_temp: Sun,
  pantry_cellar: Warehouse,
  chilled_commercial: Snowflake,
  warm_sun: Flame,
  custom: PenTool
};

const SUGGESTED_CUSTOM_LOCATIONS = [
  'Dining Table Fruit Basket',
  'Basement Storage Rack',
  'Under-Sink Dark Cabinet',
  'Balcony Wire Crate',
  'Kitchen Pantry Lower Shelf',
  'Insulated Cooler Bag'
];

export const StorageSelector: React.FC<StorageSelectorProps> = ({
  selectedStorage,
  onSelectStorage,
  selectedFood,
  disabled = false
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>(
    selectedStorage.isCustom ? 'custom' : 'presets'
  );
  const [customText, setCustomText] = useState(
    selectedStorage.isCustom ? selectedStorage.name : ''
  );
  const [customTemp, setCustomTemp] = useState<number>(selectedStorage.tempC);
  const [customRh, setCustomRh] = useState<number>(selectedStorage.rhPct);
  const [customIsDark, setCustomIsDark] = useState<boolean>(selectedStorage.isDark);
  const [customIsVentilated, setCustomIsVentilated] = useState<boolean>(
    selectedStorage.isVentilated
  );

  // Live impact on currently selected food at "Fresh" stage
  const previewCalculation = calculateStorageShelfLife(
    selectedFood,
    'Fresh',
    selectedStorage
  );

  const handlePresetSelect = (key: StoragePresetKey) => {
    if (disabled) return;
    const preset = STORAGE_PRESETS[key];
    onSelectStorage(preset);
  };

  const handleCustomTextChange = (text: string) => {
    setCustomText(text);
    if (!text.trim()) return;

    // Deduce microclimate properties automatically
    const deduction = deduceMicroclimateFromText(text);
    setCustomTemp(deduction.tempC);
    setCustomRh(deduction.rhPct);
    setCustomIsDark(deduction.isDark);
    setCustomIsVentilated(deduction.isVentilated);

    onSelectStorage({
      id: `custom_${Date.now()}`,
      presetKey: 'custom',
      name: text.trim(),
      tempC: deduction.tempC,
      rhPct: deduction.rhPct,
      isDark: deduction.isDark,
      isVentilated: deduction.isVentilated,
      isCustom: true,
      customNotes: `Custom storage area typed by user: "${text.trim()}"`
    });
  };

  const handleApplyCustomConfig = (
    temp: number,
    rh: number,
    isDark: boolean,
    isVentilated: boolean
  ) => {
    const finalName = customText.trim() || 'Custom Storage Location';
    onSelectStorage({
      id: `custom_${Date.now()}`,
      presetKey: 'custom',
      name: finalName,
      tempC: temp,
      rhPct: rh,
      isDark,
      isVentilated,
      isCustom: true,
      customNotes: `Custom user location (${temp}°C, ${rh}% RH)`
    });
  };

  return (
    <section
      id="storage-selection-section"
      aria-label="Storage Location Setup"
      className="p-5 sm:p-6 rounded-2xl bg-[#e4e5e7]/95 border border-indigo-500/25 shadow-[0_4px_24px_rgba(252, 252, 253,0.3)] space-y-5 relative overflow-hidden transition-all duration-300"
    >
      {/* Background ambient lighting accent */}
      <div className="absolute top-0 right-0 w-96 h-48 bg-gradient-to-l from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header - Strictly No 1,2,3 numbering */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-950/70">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-cyan-500/20 border border-indigo-400/40 text-indigo-300 shadow-[0_0_12px_rgba(122, 132, 143,0.3)]">
            <Warehouse className="w-4 h-4 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Storage Area &amp; Microclimate Environment
              </h2>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_8px_rgba(99, 108, 119,0.2)]">
                Shelf Life Baseline
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select or type where the specimen is stored. Shelf life is calculated dynamically from this environment.
            </p>
          </div>
        </div>

        {/* Tab Toggle: Presets vs Custom Typed */}
        <div className="flex items-center p-1 rounded-xl bg-[#e8e9ea] border border-indigo-950 text-xs font-medium self-start sm:self-auto shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-gradient-to-r from-indigo-500/25 to-cyan-500/20 text-cyan-200 font-bold border border-cyan-500/40 shadow-[0_0_10px_rgba(99, 108, 119,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Warehouse className="w-3.5 h-3.5" />
            <span>Preset Storage Areas</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-gradient-to-r from-indigo-500/25 to-cyan-500/20 text-cyan-200 font-bold border border-cyan-500/40 shadow-[0_0_10px_rgba(99, 108, 119,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Type Custom Location</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PRESETS VIEW */}
      {activeTab === 'presets' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {PRESET_KEYS.map((key) => {
              const preset = STORAGE_PRESETS[key];
              const isSelected = selectedStorage.presetKey === key && !selectedStorage.isCustom;
              const Icon = PRESET_ICONS[key];

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handlePresetSelect(key)}
                  disabled={disabled}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 relative group cursor-pointer ${
                    isSelected
                      ? 'gemini-led-card-active border-cyan-400/80 ring-1 ring-cyan-400/50'
                      : 'bg-[#e4e5e7]/70 hover:bg-[#e4e5e7] border-slate-800/90 hover:border-indigo-500/40'
                  }`}
                >
                  {/* Selected Tick Indicator with Disco Glow */}
                  {isSelected && (
                    <span className="absolute top-2.5 right-2.5 flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 text-slate-950 shadow-[0_0_8px_rgba(99, 108, 119,0.6)]">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-2 rounded-lg border ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                            : 'bg-[#e8e9ea] text-slate-400 border-indigo-950'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="font-mono text-xs font-bold text-slate-200">
                        {preset.tempC}&deg;C
                      </div>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-white leading-snug">
                      {preset.name}
                    </h3>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-indigo-950/60 space-y-1 text-[11px] text-slate-400 font-mono">
                    <div className="flex items-center justify-between">
                      <span>RH: {preset.rhPct}%</span>
                      <span>{preset.isDark ? 'Dark' : 'Light'}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: TYPE CUSTOM LOCATION VIEW */}
      {activeTab === 'custom' && (
        <div className="space-y-4 p-4 sm:p-5 rounded-xl bg-[#e8e9ea]/90 border border-indigo-950/80">
          <div className="space-y-2">
            <label
              htmlFor="custom-storage-input"
              className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Type Your Storage Location</span>
            </label>
            <div className="relative">
              <input
                id="custom-storage-input"
                type="text"
                value={customText}
                onChange={(e) => handleCustomTextChange(e.target.value)}
                placeholder="e.g. Dining table fruit bowl, Basement wire shelf, Balcony shade crate..."
                className="w-full px-4 py-2.5 pl-10 rounded-xl bg-[#e4e5e7] border border-indigo-950 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Quick-Pick Suggested Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400 font-mono">
              Quick Suggestions (Click to fill):
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {SUGGESTED_CUSTOM_LOCATIONS.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => handleCustomTextChange(loc)}
                  className="px-2.5 py-1 rounded-lg bg-[#e4e5e7] hover:bg-[#e4e5e7] border border-indigo-950 hover:border-indigo-500/40 text-xs text-slate-300 transition-colors font-sans cursor-pointer"
                >
                  + {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Microclimate Controls for Custom Area */}
          <div className="pt-3 border-t border-indigo-950/70 grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Custom Temperature Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                  Estimated Temp:
                </span>
                <strong className="text-cyan-300 font-bold">{customTemp}&deg;C ({Math.round(customTemp * 1.8 + 32)}&deg;F)</strong>
              </div>
              <input
                type="range"
                min="0"
                max="38"
                step="1"
                value={customTemp}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCustomTemp(val);
                  handleApplyCustomConfig(val, customRh, customIsDark, customIsVentilated);
                }}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0&deg;C (Chilled)</span>
                <span>20&deg;C (Room)</span>
                <span>38&deg;C (Hot)</span>
              </div>
            </div>

            {/* Custom Relative Humidity */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-sky-400" />
                  Relative Moisture:
                </span>
                <strong className="text-sky-300 font-bold">{customRh}% RH</strong>
              </div>
              <input
                type="range"
                min="30"
                max="95"
                step="5"
                value={customRh}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCustomRh(val);
                  handleApplyCustomConfig(customTemp, val, customIsDark, customIsVentilated);
                }}
                className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Dry (30%)</span>
                <span>Optimal (60%)</span>
                <span>Saturated (95%)</span>
              </div>
            </div>

            {/* Darkness & Ventilation Toggles */}
            <div className="flex items-center justify-between sm:justify-around gap-2 pt-2 sm:pt-0">
              <button
                type="button"
                onClick={() => {
                  const nextDark = !customIsDark;
                  setCustomIsDark(nextDark);
                  handleApplyCustomConfig(customTemp, customRh, nextDark, customIsVentilated);
                }}
                className={`px-3 py-2 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                  customIsDark
                    ? 'bg-indigo-950/70 border-indigo-500/50 text-indigo-300 shadow-sm'
                    : 'bg-[#e4e5e7] border-indigo-950 text-slate-400 hover:text-slate-300'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>{customIsDark ? 'Dark / Shaded' : 'Ambient Light'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const nextVent = !customIsVentilated;
                  setCustomIsVentilated(nextVent);
                  handleApplyCustomConfig(customTemp, customRh, customIsDark, nextVent);
                }}
                className={`px-3 py-2 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                  customIsVentilated
                    ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300 shadow-sm'
                    : 'bg-[#e4e5e7] border-indigo-950 text-slate-400 hover:text-slate-300'
                }`}
              >
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                <span>{customIsVentilated ? 'Open Airflow' : 'Enclosed Box'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ACTIVE STORAGE ENVIRONMENT SUMMARY BANNER */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-[#e8e9ea]/90 border border-indigo-950 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-cyan-300 shrink-0 shadow-sm">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-200">
                Active Storage Location:
              </span>
              <strong className="text-white font-bold px-2 py-0.5 rounded bg-[#e4e5e7] border border-indigo-950 text-xs">
                {selectedStorage.name}
              </strong>
              <span className="text-[11px] font-mono text-cyan-400">
                ({selectedStorage.tempC}&deg;C &bull; {selectedStorage.rhPct}% RH &bull; {selectedStorage.isDark ? 'Dark' : 'Light'})
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mt-0.5">
              {selectedFood} shelf-life calculation is calibrated for this specific microclimate.
            </p>
          </div>
        </div>

        {/* Real-Time Preview Pill for Selected Food */}
        <div className="flex items-center gap-2 bg-[#e4e5e7] px-3.5 py-2 rounded-lg border border-indigo-950 self-start md:self-auto shrink-0 shadow-sm">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400 font-mono text-[11px]">
            Projected Fresh Lifespan:
          </span>
          <strong className="gemini-disco-text font-mono font-bold">
            {previewCalculation.displayShelfLife}
          </strong>
        </div>
      </div>

      {/* Food-Specific Warning If Storage Location is Suboptimal */}
      {previewCalculation.specialWarning && (
        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold text-amber-200">Agronomic Storage Notice:</strong>{' '}
            {previewCalculation.specialWarning}
          </div>
        </div>
      )}
    </section>
  );
};
