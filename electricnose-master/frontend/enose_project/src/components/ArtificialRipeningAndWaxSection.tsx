import React, { useState } from 'react';
import {
  FlaskConical,
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  Droplets,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Search,
  ScanSearch,
  Apple,
  FileWarning,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Layers,
  ThermometerSnowflake,
  ShieldX,
  Radio,
  Microscope,
  Gauge
} from 'lucide-react';
import { FoodType, SensorReadings } from '../types';
import { playChirp } from '../services/soundEffects';
import {
  evaluateProduceChemicalStatus,
  screenRipeningPattern,
  SpecimenConditionPreset,
  SpecimenSafetyEvaluation
} from '../services/chemicalScreeningService';

interface ArtificialRipeningAndWaxSectionProps {
  selectedFood?: FoodType;
  onSelectFood?: (food: FoodType) => void;
  sensorReadings?: SensorReadings;
}

type FoodRiskKey = 'Banana' | 'Apple' | 'Tomato' | 'Potato';

interface FoodSafetyProfile {
  name: FoodRiskKey;
  icon: string;
  category: string;
  ripeningRiskLevel: 'Critical' | 'Moderate' | 'Low' | 'None';
  ripeningRiskColor: string;
  waxRiskLevel: 'Very High' | 'Moderate' | 'Minimal' | 'None';
  waxRiskColor: string;
  ripeningSummary: string;
  waxSummary: string;
  carbideIndicators: string[];
  waxIndicators: string[];
  recommendedAction: string;
}

const FOOD_SAFETY_PROFILES: Record<FoodRiskKey, FoodSafetyProfile> = {
  Banana: {
    name: 'Banana',
    icon: '🍌',
    category: 'Climacteric Fruit',
    ripeningRiskLevel: 'Critical',
    ripeningRiskColor: 'text-red-400 bg-red-950/60 border-red-500/40',
    waxRiskLevel: 'Minimal',
    waxRiskColor: 'text-slate-400 bg-slate-900/60 border-slate-800',
    ripeningSummary:
      'The primary fruit globally associated with illegal calcium carbide ripening. Also commonly and legally ripened using regulated ethylene gas chambers.',
    waxSummary:
      'Bananas are virtually never coated with artificial wax due to their thick protective peel and fast post-harvest logistics.',
    carbideIndicators: [
      'Uniform bright canary-yellow peel, while the stem (pedicel) remains conspicuously dark green.',
      'Rapid onset of large black patches and soft spots within 12–24 hours of room-temperature air exposure.',
      'Pulp remains firm, astringent, and noticeably deficient in natural sweetness (premature starch conversion).',
      'Faint pungent sulfurous or garlic-like odor from acetylene and trace phosphine/arsenic impurities.',
    ],
    waxIndicators: [
      'Natural peel has no synthetic wax treatment.',
      'Surface wash with normal water is sufficient; peeling removes any exterior dust or pesticide residue.',
    ],
    recommendedAction:
      'Reject bananas with dark green stems and glowing yellow skins. Look for fruit ripened naturally with gradual, synchronous yellowing of both skin and stalk.',
  },
  Apple: {
    name: 'Apple',
    icon: '🍎',
    category: 'Climacteric Pome Fruit',
    ripeningRiskLevel: 'Low',
    ripeningRiskColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40',
    waxRiskLevel: 'Very High',
    waxRiskColor: 'text-amber-400 bg-amber-950/60 border-amber-500/40',
    ripeningSummary:
      'Rarely artificially ripened with calcium carbide. Apples are picked mature and stored in controlled atmosphere (CA) cold rooms with low oxygen to retard natural ripening.',
    waxSummary:
      'The #1 produce item subject to artificial waxing. Natural cuticular wax is often washed off during industrial packing and replaced with carnauba (E903), shellac (E904), or cheap petroleum paraffin wax to retain moisture during 6–12 months of storage.',
    carbideIndicators: [
      'Negligible incidence of calcium carbide application.',
      'Natural respiration produces endogenous ethylene; commercial CA storage uses ethylene scrubbers (1-MCP).',
    ],
    waxIndicators: [
      'Artificial wax creates an unnaturally high mirror-like gloss and smooth slippery feel.',
      'Gentle knife scraping produces visible powdery white wax shavings (paraffin / shellac deposits).',
      'Hot water test (60°C): dipping for 10 seconds causes the artificial wax to melt and turn into a cloudy, milky surface film.',
    ],
    recommendedAction:
      'Soak apples in warm water with 1 tsp baking soda for 10–15 minutes, or peel the skin if non-food-grade petroleum paraffin wax is suspected.',
  },
  Tomato: {
    name: 'Tomato',
    icon: '🍅',
    category: 'Climacteric Solanaceous Fruit',
    ripeningRiskLevel: 'Moderate',
    ripeningRiskColor: 'text-amber-400 bg-amber-950/60 border-amber-500/40',
    waxRiskLevel: 'Moderate',
    waxRiskColor: 'text-slate-300 bg-slate-900/60 border-slate-700',
    ripeningSummary:
      'Commonly treated with regulated ethylene gas or ethephon spray to induce uniform red coloration for market presentation. Calcium carbide is occasionally reported in unorganized wholesale mandis.',
    waxSummary:
      'High-end export tomatoes are sometimes lightly coated with food-grade carnauba or mineral emulsion to reduce transit moisture loss.',
    carbideIndicators: [
      'Lustrous red exterior skin, but upon slicing, the internal locular gel and seeds are pale green and hard.',
      'Severe lack of acidity and lycopene flavor balance; watery, bland interior.',
      'Fruit feels spongy on the outside yet rigid in the core.',
    ],
    waxIndicators: [
      'Natural cuticle has subtle shine. Thick synthetic coatings feel waxy and resist water droplets excessively.',
    ],
    recommendedAction:
      'Slice open to check internal seed color. Mature tomatoes should have pinkish-red jelly surrounding the seeds, not pale green unripened locules.',
  },
  Potato: {
    name: 'Potato',
    icon: '🥔',
    category: 'Non-Climacteric Tuber',
    ripeningRiskLevel: 'None',
    ripeningRiskColor: 'text-slate-400 bg-slate-900/60 border-slate-800',
    waxRiskLevel: 'None',
    waxRiskColor: 'text-slate-400 bg-slate-900/60 border-slate-800',
    ripeningSummary:
      'Potatoes are tubers and do not undergo ripening. They are never treated with ripening agents such as calcium carbide or ethylene.',
    waxSummary:
      'Potatoes are never coated with wax. Their periderm (skin) provides natural protection against water loss.',
    carbideIndicators: [
      'No ripening agents used.',
      'Primary chemical risk is sprout inhibitors (e.g. Chlorpropham / CIPC) applied during warehouse storage to prevent sprouting.',
    ],
    waxIndicators: [
      'Zero wax application.',
      'Watch for green skin pigmentation (solanine glycoalkaloids from sun exposure), which is toxic and should be trimmed.',
    ],
    recommendedAction:
      'Store in a cool, dark, ventilated dry place. Do not consume green tubers or sprouted eyes with high solanine levels.',
  },
};

export const ArtificialRipeningAndWaxSection: React.FC<ArtificialRipeningAndWaxSectionProps> = ({
  selectedFood = 'Banana',
  onSelectFood,
  sensorReadings,
}) => {
  const activeKey: FoodRiskKey =
    selectedFood === 'Apple' || selectedFood === 'Banana' || selectedFood === 'Tomato' || selectedFood === 'Potato'
      ? selectedFood
      : 'Banana';

  const [activeTab, setActiveTab] = useState<'detector' | 'ripening_chemicals' | 'wax_standards' | 'guidelines'>(
    'detector'
  );
  const [selectedProduce, setSelectedProduce] = useState<FoodRiskKey>(activeKey);
  const [specimenCondition, setSpecimenCondition] = useState<SpecimenConditionPreset>('natural');

  const profile = FOOD_SAFETY_PROFILES[selectedProduce];
  const specimenVerdict = evaluateProduceChemicalStatus(selectedProduce, specimenCondition, sensorReadings);
  const liveRipeningScreen = screenRipeningPattern(sensorReadings);

  const handleProduceChange = (key: FoodRiskKey) => {
    setSelectedProduce(key);
    playChirp(700, 0.03);
    if (onSelectFood) {
      onSelectFood(key);
    }
  };

  const handleConditionChange = (cond: SpecimenConditionPreset) => {
    setSpecimenCondition(cond);
    playChirp(750, 0.03);
  };

  return (
    <section
      id="artificial-ripening-wax-section"
      className="rounded-2xl bg-[#e4e5e7]/95 border border-amber-500/25 p-5 sm:p-7 shadow-[0_8px_32px_rgba(252, 252, 253,0.35)] backdrop-blur-xl relative overflow-hidden transition-all space-y-7"
    >
      {/* Ambient background glows */}
      <div className="absolute top-0 right-10 w-96 h-48 bg-gradient-to-l from-amber-500/10 via-red-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-40 bg-gradient-to-r from-cyan-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Main Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-indigo-950/90 relative z-10">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow-[0_0_8px_rgba(190, 144, 66,0.25)]">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              FSSAI Regulation 2.3.5 &bull; Adulteration Diagnostics
            </span>
            <span className="text-slate-600 hidden sm:inline">&bull;</span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Non-Destructive Chemical &amp; Cuticle Inspection
            </span>
          </div>

          <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span className="gemini-disco-text">Artificial Ripening &amp; Wax Coating Inspection</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
            Multi-variable screening for prohibited <strong className="text-red-400 font-semibold">Calcium Carbide (CaC₂)</strong>, regulated commercial ripening agents (<strong className="text-cyan-300">Ethylene C₂H₄</strong>, <strong className="text-cyan-300">Ethephon</strong>), and industrial <strong className="text-amber-300">Cuticle Wax Coatings</strong>.
          </p>
        </div>

        {/* Produce Quick Selector */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
          {(['Banana', 'Apple', 'Tomato', 'Potato'] as FoodRiskKey[]).map((key) => {
            const isSelected = selectedProduce === key;
            return (
              <button
                key={key}
                id={`safety-produce-btn-${key}`}
                onClick={() => handleProduceChange(key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
                  isSelected
                    ? 'gemini-disco-gradient text-white shadow-[0_0_12px_rgba(122, 132, 143,0.45)] scale-105'
                    : 'bg-[#e4e5e7] hover:bg-[#e4e5e7] text-slate-400 hover:text-slate-200 border border-indigo-950'
                }`}
              >
                <span>{FOOD_SAFETY_PROFILES[key].icon}</span>
                <span>{key}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-indigo-950/70 pb-2">
        <button
          id="safety-tab-detector"
          onClick={() => {
            setActiveTab('detector');
            playChirp(650, 0.03);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
            activeTab === 'detector'
              ? 'bg-amber-950/70 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <ScanSearch className="w-4 h-4 text-amber-400" />
          <span>Produce Diagnostic Profile ({selectedProduce})</span>
        </button>

        <button
          id="safety-tab-chemicals"
          onClick={() => {
            setActiveTab('ripening_chemicals');
            playChirp(700, 0.03);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
            activeTab === 'ripening_chemicals'
              ? 'bg-red-950/70 text-red-300 border border-red-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <FlaskConical className="w-4 h-4 text-red-400" />
          <span>Regulated vs. Banned Chemicals</span>
        </button>

        <button
          id="safety-tab-wax"
          onClick={() => {
            setActiveTab('wax_standards');
            playChirp(750, 0.03);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
            activeTab === 'wax_standards'
              ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Droplets className="w-4 h-4 text-cyan-400" />
          <span>Wax Coating Standards &amp; Test</span>
        </button>

        <button
          id="safety-tab-guidelines"
          onClick={() => {
            setActiveTab('guidelines');
            playChirp(800, 0.03);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
            activeTab === 'guidelines'
              ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>FSSAI Advisory &amp; Safe Consumption</span>
        </button>
      </div>

      {/* TAB CONTENT 1: LIVE PRODUCE DETECTOR PROFILE */}
      {activeTab === 'detector' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* ====================================================================
           * SPECIMEN CHEMICAL & COATING VERIFICATION: HAS USED OR NOT
           * ==================================================================== */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#e4e5e7] via-[#e4e5e7] to-[#e5e6e8] border-2 border-indigo-500/30 shadow-[0_0_24px_rgba(108, 116, 125,0.15)] space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className={`rounded-xl border p-4 ${
              liveRipeningScreen.status === 'possible_accelerated_ripening_pattern'
                ? 'border-amber-500/50 bg-amber-950/20'
                : liveRipeningScreen.status === 'no_strong_anomaly'
                  ? 'border-emerald-500/40 bg-emerald-950/20'
                  : 'border-slate-600 bg-slate-900/30'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold text-white">LIVE SENSOR RIPENING SCREEN</span>
                <span className="text-[10px] font-mono text-slate-300">Experimental · {liveRipeningScreen.confidence}% signal confidence</span>
              </div>
              <p className="mt-2 text-sm font-bold text-amber-200">{liveRipeningScreen.label}</p>
              <p className="mt-1 text-xs text-slate-300">{liveRipeningScreen.basis}</p>
              <p className="mt-2 text-[11px] text-slate-400">{liveRipeningScreen.disclaimer}</p>
            </div>

            {/* Verification Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-indigo-950">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
                    <Microscope className="w-3.5 h-3.5 text-indigo-400" />
                    Educational Scenario Verification
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    specimenVerdict.fssaiCompliance
                      ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                      : 'bg-red-950/70 text-red-300 border-red-500/40 animate-pulse'
                  }`}>
                    {specimenVerdict.fssaiCompliance ? '✓ FSSAI Reg. 2.3.5 Compliant' : '⚠ Statutory Violation Detected'}
                  </span>
                </div>
                <h3 className="text-base sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>Has This Specimen Used Artificial Agents or Wax?</span>
                  <span className="text-slate-400 font-normal text-sm font-mono">({selectedProduce})</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Current Evaluation Target: <strong className="text-amber-300 font-semibold">{specimenVerdict.conditionTitle}</strong>
                </p>
              </div>

              {/* Interactive Specimen Condition Preset Switcher */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-[#e7e8ea] p-1.5 rounded-xl border border-indigo-950 shrink-0">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2">
                  Test Condition:
                </span>
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    type="button"
                    id="specimen-cond-natural"
                    onClick={() => handleConditionChange('natural')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      specimenCondition === 'natural'
                        ? 'bg-emerald-600 text-white shadow-[0_0_8px_rgba(67, 103, 144,0.4)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                    title="Natural tree/vine ripened and unwaxed"
                  >
                    🌿 Natural Farm Specimen
                  </button>

                  <button
                    type="button"
                    id="specimen-cond-carbide"
                    onClick={() => handleConditionChange('carbide')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      specimenCondition === 'carbide'
                        ? 'bg-red-600 text-white shadow-[0_0_8px_rgba(173, 66, 66,0.4)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                    title="Specimen treated with prohibited Calcium Carbide (CaC2)"
                  >
                    ☠ Carbide Gassed
                  </button>

                  <button
                    type="button"
                    id="specimen-cond-wax"
                    onClick={() => handleConditionChange('paraffin_wax')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      specimenCondition === 'paraffin_wax'
                        ? 'bg-amber-600 text-white shadow-[0_0_8px_rgba(190, 144, 66,0.4)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                    title="Specimen glazed with synthetic paraffin wax"
                  >
                    🕯 Paraffin Wax Coated
                  </button>

                  <button
                    type="button"
                    id="specimen-cond-ethylene"
                    onClick={() => handleConditionChange('commercial_ethylene')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      specimenCondition === 'commercial_ethylene'
                        ? 'bg-cyan-600 text-white shadow-[0_0_8px_rgba(99, 108, 119,0.4)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                    title="Commercial ripening chamber using regulated ethylene gas"
                  >
                    🏭 Regulated Ethylene
                  </button>
                </div>
              </div>
            </div>

            {/* Two Primary Verdict Cards: Ripening Agent + Wax Coating */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* CARD 1: ARTIFICIAL RIPENING AGENT STATUS */}
              <div className={`p-4 sm:p-5 rounded-xl border transition-all space-y-3 relative overflow-hidden ${
                !specimenVerdict.ripeningAgentUsed
                  ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_15px_rgba(67, 103, 144,0.1)]'
                  : specimenVerdict.ripeningStatus === 'used_calcium_carbide'
                  ? 'bg-red-950/25 border-red-500/50 shadow-[0_0_15px_rgba(173, 66, 66,0.15)]'
                  : 'bg-cyan-950/25 border-cyan-500/40 shadow-[0_0_15px_rgba(99, 108, 119,0.1)]'
              }`}>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      !specimenVerdict.ripeningAgentUsed
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                        : specimenVerdict.ripeningStatus === 'used_calcium_carbide'
                        ? 'bg-red-950 text-red-400 border border-red-500/40'
                        : 'bg-cyan-950 text-cyan-400 border border-cyan-500/40'
                    }`}>
                      <FlaskConical className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                        Chemical Ripening Agent Screening
                      </span>
                      <h4 className="text-sm font-bold text-white">Artificial Ripening Status</h4>
                    </div>
                  </div>

                  <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                    !specimenVerdict.ripeningAgentUsed
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : specimenVerdict.ripeningStatus === 'used_calcium_carbide'
                      ? 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  }`}>
                    {!specimenVerdict.ripeningAgentUsed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>AGENT NOT USED</span>
                      </>
                    ) : specimenVerdict.ripeningStatus === 'used_calcium_carbide' ? (
                      <>
                        <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                        <span>AGENT USED (ILLEGAL CaC₂)</span>
                      </>
                    ) : (
                      <>
                        <Info className="w-3.5 h-3.5 text-cyan-400" />
                        <span>AGENT USED (REGULATED C₂H₄)</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Primary Ripening Verdict Statement */}
                <div className={`p-3.5 rounded-lg border text-xs sm:text-sm font-mono font-bold ${
                  !specimenVerdict.ripeningAgentUsed
                    ? 'bg-emerald-950/40 text-emerald-200 border-emerald-500/30'
                    : specimenVerdict.ripeningStatus === 'used_calcium_carbide'
                    ? 'bg-red-950/40 text-red-200 border-red-500/40'
                    : 'bg-cyan-950/40 text-cyan-200 border-cyan-500/30'
                }`}>
                  {specimenVerdict.ripeningLabel}
                </div>

                {/* Key Chemical Telemetry Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div className="p-2.5 rounded-lg bg-[#e7e8ea]/80 border border-indigo-950 space-y-0.5">
                    <span className="text-[10px] text-slate-400 block">Acetylene Alkyne Residue:</span>
                    <span className={`text-sm font-black ${
                      specimenVerdict.ripeningStatus === 'used_calcium_carbide' ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {specimenVerdict.ripeningStatus === 'used_calcium_carbide' ? '54.2 ppm (Toxic Peak)' : '0.0 ppm (Zero Detected)'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#e7e8ea]/80 border border-indigo-950 space-y-0.5">
                    <span className="text-[10px] text-slate-400 block">Carbide Contamination Index:</span>
                    <span className={`text-sm font-black ${
                      specimenVerdict.carbideProbability > 50 ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {specimenVerdict.carbideProbability}% Probability
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {!specimenVerdict.ripeningAgentUsed
                    ? 'Zero chemical ripening accelerators detected. Endogenous phytohormone evolution corresponds directly with natural respiration and gradual starch conversion.'
                    : specimenVerdict.ripeningStatus === 'used_calcium_carbide'
                    ? 'PROHIBITED CALCIUM CARBIDE (CaC₂) DETECTED. Specimen exhibits characteristic pedicel-to-peel color discordance, elevated volatile acetylene, and industrial hydride traces.'
                    : 'Regulated ethylene gas applied in an authorized chamber under permissible guidelines (<100 ppm). Phytohormone is chemically identical to natural ripening gas.'}
                </p>
              </div>

              {/* CARD 2: SURFACE WAX COATING STATUS */}
              <div className={`p-4 sm:p-5 rounded-xl border transition-all space-y-3 relative overflow-hidden ${
                !specimenVerdict.waxCoatingUsed
                  ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_15px_rgba(67, 103, 144,0.1)]'
                  : specimenVerdict.waxStatus === 'applied_synthetic_paraffin'
                  ? 'bg-amber-950/25 border-amber-500/50 shadow-[0_0_15px_rgba(190, 144, 66,0.15)]'
                  : 'bg-cyan-950/25 border-cyan-500/40 shadow-[0_0_15px_rgba(99, 108, 119,0.1)]'
              }`}>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      !specimenVerdict.waxCoatingUsed
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                        : specimenVerdict.waxStatus === 'applied_synthetic_paraffin'
                        ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                        : 'bg-cyan-950 text-cyan-400 border border-cyan-500/40'
                    }`}>
                      <Droplets className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                        Cuticle Barrier &amp; Glaze Screening
                      </span>
                      <h4 className="text-sm font-bold text-white">Surface Wax Coating Status</h4>
                    </div>
                  </div>

                  <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                    !specimenVerdict.waxCoatingUsed
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : specimenVerdict.waxStatus === 'applied_synthetic_paraffin'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  }`}>
                    {!specimenVerdict.waxCoatingUsed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>WAX NOT APPLIED</span>
                      </>
                    ) : specimenVerdict.waxStatus === 'applied_synthetic_paraffin' ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>WAX APPLIED (SYNTHETIC)</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>WAX APPLIED (FOOD-GRADE)</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Primary Wax Verdict Statement */}
                <div className={`p-3.5 rounded-lg border text-xs sm:text-sm font-mono font-bold ${
                  !specimenVerdict.waxCoatingUsed
                    ? 'bg-emerald-950/40 text-emerald-200 border-emerald-500/30'
                    : specimenVerdict.waxStatus === 'applied_synthetic_paraffin'
                    ? 'bg-amber-950/40 text-amber-200 border-amber-500/40'
                    : 'bg-cyan-950/40 text-cyan-200 border-cyan-500/30'
                }`}>
                  {specimenVerdict.waxLabel}
                </div>

                {/* Key Wax Telemetry Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div className="p-2.5 rounded-lg bg-[#e7e8ea]/80 border border-indigo-950 space-y-0.5">
                    <span className="text-[10px] text-slate-400 block">Blade Scraped Wax Weight:</span>
                    <span className={`text-sm font-black ${
                      specimenVerdict.waxStatus === 'applied_synthetic_paraffin' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {specimenVerdict.waxStatus === 'applied_synthetic_paraffin' ? '34.6 mg / 100cm²' : '0.0 mg (Natural Cuticle)'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#e7e8ea]/80 border border-indigo-950 space-y-0.5">
                    <span className="text-[10px] text-slate-400 block">Hot Water (60°C) Immersion:</span>
                    <span className={`text-sm font-black ${
                      specimenVerdict.waxStatus === 'applied_synthetic_paraffin' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {specimenVerdict.waxStatus === 'applied_synthetic_paraffin' ? 'Milky Opaque Film' : 'Clear Bath (No Film)'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {!specimenVerdict.waxCoatingUsed
                    ? 'Natural epicuticular bloom verified. Zero synthetic petroleum paraffin, mineral oil, or shellac coating applied to the produce skin.'
                    : specimenVerdict.waxStatus === 'applied_synthetic_paraffin'
                    ? 'SYNTHETIC PARAFFIN WAX DETECTED. The surface has been heavily coated with industrial petroleum wax to prevent moisture evaporation during prolonged cold storage.'
                    : 'Food-grade carnauba (E903) or refined shellac (E904) glazing detected. Meets permissible national food standards.'}
                </p>
              </div>

            </div>

            {/* Specimen Analytical Findings & Laboratory Evidence Table */}
            <div className="p-4 rounded-xl bg-[#e7e8ea] border border-indigo-950 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                    Analytical Evidence &amp; Compliance Audit Table ({selectedProduce})
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Electronic Nose Sensor Suite + Physical Micro-Assay
                </span>
              </div>

              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-indigo-950 text-slate-400 text-[10px] uppercase">
                      <th className="pb-2 font-semibold">Test Parameter</th>
                      <th className="pb-2 font-semibold">Finding on Specimen</th>
                      <th className="pb-2 font-semibold">Regulatory Limit</th>
                      <th className="pb-2 font-semibold">Audit Result</th>
                      <th className="pb-2 font-semibold hidden sm:table-cell">Detection Instrument</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-950/60 text-slate-300">
                    {specimenVerdict.labMetrics.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-2.5 font-bold text-white flex items-center gap-1.5">
                          <span className="text-indigo-400">&bull;</span>
                          <span>{row.parameter}</span>
                        </td>
                        <td className="py-2.5 font-mono text-cyan-300">{row.finding}</td>
                        <td className="py-2.5 text-slate-400">{row.regulatoryThreshold}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            row.status === 'PASS'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                              : row.status === 'FAIL'
                              ? 'bg-red-950 text-red-300 border-red-500/40'
                              : 'bg-amber-950 text-amber-300 border-amber-500/40'
                          }`}>
                            {row.status === 'PASS'
                              ? 'PASS (NOT USED)'
                              : row.status === 'FAIL'
                              ? 'FAIL (AGENT DETECTED)'
                              : 'WARN (ANOMALY)'}
                          </span>
                        </td>
                        <td className="py-2.5 text-[11px] text-slate-500 hidden sm:table-cell">
                          {row.instrument}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Actionable Advice Banner */}
              <div className="pt-2 border-t border-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start sm:items-center gap-2 text-slate-300">
                  <span className="text-amber-400 font-bold font-mono shrink-0">RECOMMENDED PROTOCOL:</span>
                  <span className="text-slate-200">{specimenVerdict.detoxificationProtocol}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Top Risk Level Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Artificial Ripening Risk Card */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#e4e5e7] border border-indigo-950 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-red-950/70 border border-red-500/30 text-red-300">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Ripening Integrity Assessment</h3>
                    <p className="text-[11px] font-mono text-slate-400">{profile.category}</p>
                  </div>
                </div>

                <span
                  className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${profile.ripeningRiskColor}`}
                >
                  {profile.ripeningRiskLevel} Risk
                </span>
              </div>

              <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
                {profile.ripeningSummary}
              </p>

              <div className="pt-2 border-t border-indigo-950/70">
                <div className="text-[11px] font-mono font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                  <Search className="w-3 h-3 text-cyan-400" />
                  <span>Physical &amp; Chemical Anomaly Checklist ({profile.name}):</span>
                </div>
                <ul className="space-y-1.5">
                  {profile.carbideIndicators.map((item, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-amber-400 font-bold shrink-0">&bull;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Wax Coating Risk Card */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#e4e5e7] border border-indigo-950 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-500/30 text-cyan-300">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Cuticle Wax Coating Status</h3>
                    <p className="text-[11px] font-mono text-slate-400">Surface Barrier Evaluation</p>
                  </div>
                </div>

                <span
                  className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${profile.waxRiskColor}`}
                >
                  {profile.waxRiskLevel} Risk
                </span>
              </div>

              <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
                {profile.waxSummary}
              </p>

              <div className="pt-2 border-t border-indigo-950/70">
                <div className="text-[11px] font-mono font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Cuticle &amp; Wax Detection Criteria:</span>
                </div>
                <ul className="space-y-1.5">
                  {profile.waxIndicators.map((item, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-cyan-400 font-bold shrink-0">&bull;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

          {/* Electronic Nose Multi-Sensor Scientific Correlation Matrix */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#e6e7e9] border border-cyan-500/20 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <ScanSearch className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs sm:text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Electronic Nose Sensor Correlation for {profile.name}
                </h4>
              </div>
              <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-500/30">
                Spectrometry + Tactile Cross-Validation
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[#e4e5e7] border border-indigo-950 space-y-1">
                <span className="text-slate-400 text-[10px] block">MQ-4 (Acetylene &amp; HC)</span>
                <span className="text-white font-bold text-sm block">Acetylene (C₂H₂) Proxy</span>
                <p className="text-[11px] text-slate-400 font-sans">
                  Detects volatile alkynes emitted from CaC₂ moisture reaction. Low baseline in natural fruits.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#e4e5e7] border border-indigo-950 space-y-1">
                <span className="text-slate-400 text-[10px] block">MQ-135 (Amine &amp; Phosphine)</span>
                <span className="text-white font-bold text-sm block">Hydride Contaminant Proxy</span>
                <p className="text-[11px] text-slate-400 font-sans">
                  Sensitive to trace phosphine (PH₃) and arsine gas released by industrial-grade carbide.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#e4e5e7] border border-indigo-950 space-y-1">
                <span className="text-slate-400 text-[10px] block">MQ-3 (Ethanol &amp; Esters)</span>
                <span className="text-white font-bold text-sm block">Natural Ripening Esters</span>
                <p className="text-[11px] text-slate-400 font-sans">
                  Naturally ripened fruits exhibit gradual aroma ester ramp-up; carbide fruits display truncated peaks.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#e4e5e7] border border-indigo-950 space-y-1">
                <span className="text-slate-400 text-[10px] block">FSR-402 (Tactile &amp; Cuticle Drag)</span>
                <span className="text-white font-bold text-sm block">Pulp Gradient &amp; Wax Friction</span>
                <p className="text-[11px] text-slate-400 font-sans">
                  Flags hard pulp vs soft peel discrepancy (carbide symptom) and surface friction changes (wax).
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#e4e5e7] border border-indigo-950/80 flex items-center justify-between gap-3 flex-wrap text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Recommended Consumer Protocol:</strong> {profile.recommendedAction}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT 2: REGULATED VS BANNED CHEMICALS */}
      {activeTab === 'ripening_chemicals' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Column 1: Regulated / Considered Safe */}
            <div className="p-5 rounded-2xl bg-[#e4e5e7] border border-cyan-500/30 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-cyan-950">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">Regulated / Considered Safe</h3>
                    <p className="text-[11px] font-mono text-cyan-300">Legally Approved Under Controlled Limits</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  FSSAI Compliant
                </span>
              </div>

              {/* Chemical 1: Ethylene Gas */}
              <div className="p-4 rounded-xl bg-[#e8e9ea] border border-cyan-950/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-bold text-cyan-300 flex items-center gap-1.5">
                    <span>Ethylene Gas (C₂H₄)</span>
                    <span className="text-[10px] font-mono text-slate-400 font-normal">&bull; Natural Phytohormone</span>
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold">100–150 ppm Safe</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The natural ripening hormone that plants themselves produce. Commercial ripening chambers pump regulated low concentrations of pure ethylene gas at controlled temperatures (18–22°C) and 90% humidity to jumpstart the fruit&apos;s natural enzymatic respiration.
                </p>
                <div className="text-[11px] font-mono text-slate-400 space-y-1 pt-1 border-t border-indigo-950">
                  <p><strong className="text-slate-300">Widely Used For:</strong> Bananas, Mangoes, Tomatoes, Avocados, Papayas.</p>
                  <p><strong className="text-slate-300">Safety Profile:</strong> Considered completely non-toxic; leaves zero synthetic chemical residue because it is identical to biological endogenous ethylene.</p>
                </div>
              </div>

              {/* Chemical 2: Ethephon */}
              <div className="p-4 rounded-xl bg-[#e8e9ea] border border-cyan-950/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-bold text-cyan-300 flex items-center gap-1.5">
                    <span>Ethephon (2-CEPA)</span>
                    <span className="text-[10px] font-mono text-slate-400 font-normal">&bull; Phosphonic Acid Ester</span>
                  </h4>
                  <span className="text-[10px] font-mono text-amber-300 font-semibold">MRL: &le; 2.0 mg/kg</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  A systemic chemical compound that penetrates plant tissues and gradually breaks down upon hydration into ethylene, phosphate, and chloride ions, driving uniform pigment and sugar development.
                </p>
                <div className="text-[11px] font-mono text-slate-400 space-y-1 pt-1 border-t border-indigo-950">
                  <p><strong className="text-slate-300">Used Commercially On:</strong> Bananas, Tomatoes, Mangoes, Coffee.</p>
                  <p><strong className="text-slate-300">Regulatory Oversight:</strong> Approved for regulated post-harvest application in many countries. FSSAI mandates that residues must remain strictly below Maximum Residue Limits (MRLs).</p>
                </div>
              </div>
            </div>

            {/* Column 2: Banned or Heavily Restricted */}
            <div className="p-5 rounded-2xl bg-[#e8e9eb] border border-red-500/40 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-red-950">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-red-950 text-red-300 border border-red-500/40">
                    <ShieldX className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">Banned or Heavily Restricted</h3>
                    <p className="text-[11px] font-mono text-red-300">Illegal Malpractice &bull; Toxic Health Hazard</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/50">
                  STRICTLY PROHIBITED
                </span>
              </div>

              {/* Chemical: Calcium Carbide */}
              <div className="p-4 rounded-xl bg-[#f2f2f3] border border-red-950/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-bold text-red-300 flex items-center gap-1.5">
                    <span>Calcium Carbide (CaC₂)</span>
                    <span className="text-[10px] font-mono text-slate-400 font-normal">&bull; &ldquo;Masala&rdquo;</span>
                  </h4>
                  <span className="text-[10px] font-mono text-red-400 font-bold">FSSAI Reg. 2.3.5 BANNED</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The most pervasive illegal ripening agent. When small packets of industrial carbide contact moisture on the fruit&apos;s surface, it produces volatile <strong className="text-red-300 font-semibold">Acetylene Gas (C₂H₂)</strong>:
                </p>
                <div className="p-2 rounded bg-[#e8e9eb] border border-red-900/50 font-mono text-[11px] text-red-200 text-center">
                  CaC₂ + 2H₂O &rarr; Ca(OH)₂ + C₂H₂ &uarr; (Acetylene Gas)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Acetylene mimics ethylene to trigger superficial color change, but does not convert inner starches into sugars.
                </p>
                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-900/70 text-[11px] text-red-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-red-300">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Heavy Metal Contamination (Arsenic &amp; Phosphine):</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Industrial-grade calcium carbide contains toxic trace impurities of <strong>Arsenic (As)</strong> and <strong>Phosphine (PH₃)</strong>.
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    <strong>Symptoms &amp; Risks:</strong> Frequent headaches, dizziness, sleepiness, mental confusion, mouth/throat ulcers, gastrointestinal inflammation, and long-term systemic toxicity.
                  </p>
                </div>
              </div>

              {/* Chemical: Oxytocin & Unregulated Powders */}
              <div className="p-4 rounded-xl bg-[#f2f2f3] border border-red-950/90 space-y-2">
                <h4 className="text-xs sm:text-sm font-bold text-red-300 flex items-center gap-1.5">
                  <span>Oxytocin &amp; Informal Synthetic Powders</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  In some regional markets, hormone injections like oxytocin are illegally administered to vegetables (pumpkins, gourds, cucumbers) to induce overnight plumping and weight gain. Unregulated Chinese ripening powders and industrial copper sulfate dyes are also heavily prohibited.
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* TAB CONTENT 3: WAX COATING STANDARDS & PHYSICAL TESTS */}
      {activeTab === 'wax_standards' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Wax Type 1 */}
            <div className="p-4.5 rounded-xl bg-[#e4e5e7] border border-emerald-500/30 space-y-2.5">
              <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                TYPE 1 &bull; NATURAL
              </span>
              <h4 className="text-sm font-bold text-white">Natural Epicuticular Wax</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Apples, plums, and grapes naturally produce a whitish, powdery outer film composed of long-chain fatty acids (ursolic acid).
              </p>
              <div className="text-[11px] font-mono text-emerald-400 pt-2 border-t border-indigo-950">
                &bull; 100% Safe, Edible &amp; Non-Toxic
              </div>
            </div>

            {/* Wax Type 2 */}
            <div className="p-4.5 rounded-xl bg-[#e4e5e7] border border-cyan-500/30 space-y-2.5">
              <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                TYPE 2 &bull; REGULATED FOOD-GRADE
              </span>
              <h4 className="text-sm font-bold text-white">Food-Grade Waxes (Carnauba / Shellac)</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Derived from palm trees (Carnauba E903), bees (Beeswax E901), or the lac beetle (Shellac E904). Approved by FSSAI &amp; US FDA when labeled explicitly as &ldquo;Wax Coated&rdquo;.
              </p>
              <div className="text-[11px] font-mono text-cyan-300 pt-2 border-t border-indigo-950">
                &bull; Must be declared on packaging
              </div>
            </div>

            {/* Wax Type 3 */}
            <div className="p-4.5 rounded-xl bg-[#e8e9eb] border border-red-500/40 space-y-2.5">
              <span className="text-[10px] font-mono font-bold text-red-300 bg-red-950/80 px-2 py-0.5 rounded border border-red-500/40">
                TYPE 3 &bull; HAZARDOUS NON-FOOD GRADE
              </span>
              <h4 className="text-sm font-bold text-white">Petroleum Paraffin &amp; Morpholine</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Cheap industrial petroleum distillates used illegally to give apples mirror-like shine. May contain morpholine emulsifiers that form carcinogenic nitrosamines in the stomach.
              </p>
              <div className="text-[11px] font-mono text-red-300 pt-2 border-t border-red-950">
                &bull; Strictly Prohibited by FSSAI
              </div>
            </div>

          </div>

          {/* Home & Laboratory Verification Tests for Wax */}
          <div className="p-5 rounded-2xl bg-[#e8e9ea] border border-indigo-950 space-y-4">
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Standard Home &amp; Field Verification Tests for Wax Coating
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-[13px] text-slate-300">
              
              <div className="p-4 rounded-xl bg-[#e4e5e7] border border-indigo-900/60 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[11px] font-mono">1</span>
                  <span>The Knife Blade Scraping Test</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Take a clean, dry stainless-steel knife and gently scrape the surface of the apple from top to bottom. If artificial paraffin wax is present, it will immediately peel off in distinct white, powdery shavings. Natural bloom does not scrape off into heavy white flakes.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#e4e5e7] border border-indigo-900/60 space-y-2">
                <div className="flex items-center gap-2 font-bold text-cyan-300">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[11px] font-mono">2</span>
                  <span>The 60&deg;C Hot Water Immersion Test</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Submerge the produce in a bowl of warm water (approx. 50–60°C) for 10 to 15 seconds. If coated with petroleum paraffin or shellac, the heat will melt the wax, creating an opaque, milky white crust on the surface and oil droplets on the water.
                </p>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT 4: FSSAI ADVISORY & CONSUMER PROTOCOL */}
      {activeTab === 'guidelines' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          <div className="p-5 rounded-2xl bg-[#e4e5e7] border border-emerald-500/30 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-sm sm:text-base font-bold text-white">
                FSSAI Statutory Mandates &amp; Safe Consumption Protocols
              </h3>
            </div>

            <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
              Under <strong>Regulation 2.3.5 of the Food Safety and Standards (Prohibition and Restrictions on Sales) Regulations, 2011</strong>, no person shall sell or offer for sale any fruit that has been artificially ripened with acetylene gas (calcium carbide). Violators are subject to penal action under Sections 59 and 60 of the FSS Act, 2006.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#e8e9ea] border border-emerald-950 space-y-1">
                <span className="text-emerald-400 font-bold text-xs block font-mono">Step 1: Thorough Washing</span>
                <p className="text-[11px] text-slate-400">
                  Wash produce thoroughly under brisk running tap water before cutting to remove surface chemical dust and arsenic residues.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#e8e9ea] border border-emerald-950 space-y-1">
                <span className="text-cyan-400 font-bold text-xs block font-mono">Step 2: Alkaline Soak</span>
                <p className="text-[11px] text-slate-400">
                  Soaking apples or tomatoes in water with 1% baking soda (sodium bicarbonate) for 10 minutes degrades surface ethephon and pesticide residues.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#e8e9ea] border border-emerald-950 space-y-1">
                <span className="text-purple-400 font-bold text-xs block font-mono">Step 3: Discard Outer Peels</span>
                <p className="text-[11px] text-slate-400">
                  Always peel bananas and mangoes. Avoid consuming skins that exhibit suspicious black chemical burns or artificial paraffin wax films.
                </p>
              </div>
            </div>

            {/* Helpline Callout */}
            <div className="p-3.5 rounded-xl bg-[#e4e5e7] border border-indigo-500/30 flex items-center justify-between gap-3 flex-wrap text-xs">
              <div className="flex items-center gap-2 text-slate-200">
                <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  To report illegal calcium carbide use, call the <strong>FSSAI National Toll-Free Helpline: 1800-112-100</strong> or contact your District Food Safety Officer (FSO).
                </span>
              </div>
            </div>

          </div>

        </div>
      )}

    </section>
  );
};
