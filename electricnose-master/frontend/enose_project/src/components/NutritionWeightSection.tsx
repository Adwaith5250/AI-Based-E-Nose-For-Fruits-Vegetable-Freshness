import React, { useState, useMemo } from 'react';
import {
  Apple,
  Award,
  BookOpen,
  CheckCircle2,
  FileText,
  HeartPulse,
  Info,
  Scale,
  ShieldCheck,
  Sliders,
  Sparkles,
  ThermometerSnowflake,
  Utensils
} from 'lucide-react';
import { FoodInfo, FreshnessStage } from '../types';
import { calculateScaledNutrition } from '../services/foodDatabase';

interface NutritionWeightSectionProps {
  foodInfo: FoodInfo;
  status?: FreshnessStage;
}

export const NutritionWeightSection: React.FC<NutritionWeightSectionProps> = ({
  foodInfo,
  status = 'Fresh'
}) => {
  const weightProfile = foodInfo.weightProfile || {
    small: 100,
    medium: 150,
    large: 220,
    defaultWeight: 150,
    unit: 'g',
    sizeDescription: 'Standard Medium Specimen'
  };

  const [estimatedWeight, setEstimatedWeight] = useState<number>(weightProfile.defaultWeight);

  // Sync when food changes
  React.useEffect(() => {
    setEstimatedWeight(weightProfile.defaultWeight);
  }, [foodInfo.food, weightProfile.defaultWeight]);

  // Scaled nutrition facts based on current estimated weight
  const scaledFacts = useMemo(() => {
    return calculateScaledNutrition(foodInfo.nutritionPer100g, estimatedWeight);
  }, [foodInfo.nutritionPer100g, estimatedWeight]);

  // Quick summary highlights
  const caloriesFact = scaledFacts.find((f) => f.nutrient.toLowerCase().includes('energy'));
  const carbsFact = scaledFacts.find((f) => f.nutrient.toLowerCase().includes('carbohydrate'));
  const fiberFact = scaledFacts.find((f) => f.nutrient.toLowerCase().includes('fiber'));
  const sugarFact = scaledFacts.find((f) => f.nutrient.toLowerCase().includes('sugar'));
  const primaryMineral = scaledFacts.find(
    (f) =>
      f.nutrient.toLowerCase().includes('potassium') ||
      f.nutrient.toLowerCase().includes('vitamin c') ||
      f.nutrient.toLowerCase().includes('lycopene')
  );

  // Physiological ripening impact on nutritional profile
  const getRipenessImpact = () => {
    switch (foodInfo.food) {
      case 'Banana':
        return {
          starchStatus: status === 'Fresh' ? 'High Resistant Starch (~20%)' : status === 'Ripe' ? 'Converted to Soluble Sugars (<2% starch)' : 'Fully Hydrolyzed Simple Sugars',
          antioxidantLevel: status === 'Ripe' ? 'Peak Polyphenol & Dopamine Concentration' : 'Moderate Baseline',
          bioSummary: 'As bananas mature from green/fresh to ripe, amylase enzymes convert insoluble prebiotic resistant starch into glucose, fructose, and sucrose. Peel spotting indicates peak antioxidant potential before cellular senescence begins.'
        };
      case 'Tomato':
        return {
          starchStatus: 'Low Starch / High Soluble Lycopene',
          antioxidantLevel: status === 'Ripe' ? 'Peak Bioavailable Trans-Lycopene (2.5x)' : 'Moderate Carotenoids',
          bioSummary: 'Lycopene synthesis peaks dramatically during full red ripening. Cuticular cell wall softening caused by polygalacturonase enhances nutrient bioavailability, though prolonged overripeness causes gradual loss of ascorbic acid (Vitamin C).'
        };
      case 'Apple':
        return {
          starchStatus: status === 'Fresh' ? 'High Protopectin & Rigid Fibers' : 'Solubilized Soluble Dietary Pectin',
          antioxidantLevel: 'Sustained Quercetin & Catechin in Cuticle',
          bioSummary: 'Apples maintain strong dietary fiber and phenolic flavonoids across maturation stages. Ripening converts insoluble protopectin into soluble fiber, softening the pulp while preserving potassium and organic malic acids.'
        };
      case 'Potato':
        return {
          starchStatus: status === 'Fresh' ? 'High Complex Amylose / Amylopectin' : 'Elevated Free Reducing Sugars',
          antioxidantLevel: 'High Ascorbic Acid & Bioavailable Potassium',
          bioSummary: 'Potatoes are nutrient-dense root tubers providing sustained complex starch and high potassium. Avoid exposure to light which induces toxic bitter solanine alkaloids, and avoid storage below 4°C to prevent acrylamide-generating sweetening.'
        };
      default:
        return {
          starchStatus: 'Standard Cellular Matrix',
          antioxidantLevel: 'Natural Plant Phenolics',
          bioSummary: 'Nutrient bioavailability is preserved during optimal harvest and storage windows.'
        };
    }
  };

  const ripenessImpact = getRipenessImpact();

  return (
    <section
      id="nutrition-weight-section"
      aria-label="Specimen Weight Estimation & Nutritional Profile"
      className="rounded-2xl bg-[#e4e5e7] border border-slate-800 p-5 sm:p-6 space-y-6 shadow-sm"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              Specimen Weight Estimation &amp; Nutritional Profile
            </h3>
            <p className="text-xs text-slate-400">
              Agronomic size modeling with proportional USDA nutrient scaling &bull; Specimen: <strong className="text-white">{foodInfo.food}</strong> ({foodInfo.scientificName})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono self-start sm:self-auto bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>USDA FoodData Central Verified</span>
        </div>
      </div>

      {/* Interactive Weight Estimator Panel */}
      <div
        id="weight-estimator-controller"
        className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Estimated Specimen Weight Controller
              </h4>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select standard USDA size calibration or adjust the gram weight slider to compute exact portion nutrients.
            </p>
          </div>

          {/* Current Active Weight Badge */}
          <div className="flex items-center gap-2 bg-[#e4e5e7] border border-sky-500/30 px-3.5 py-1.5 rounded-xl shadow-sm self-start sm:self-auto">
            <span className="text-xs font-mono text-slate-400">Selected Weight:</span>
            <span className="text-lg font-extrabold font-mono text-sky-300">
              {estimatedWeight} {weightProfile.unit}
            </span>
          </div>
        </div>

        {/* Preset Weight Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            id="preset-weight-small"
            type="button"
            onClick={() => setEstimatedWeight(weightProfile.small)}
            className={`p-3 rounded-xl border text-left transition-all ${
              estimatedWeight === weightProfile.small
                ? 'bg-sky-950/50 border-sky-400 ring-1 ring-sky-400/40 text-white'
                : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Small Size</span>
              <span className="font-mono text-sky-400">{weightProfile.small}g</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Compact / Caliper Grade 6</p>
          </button>

          <button
            id="preset-weight-medium"
            type="button"
            onClick={() => setEstimatedWeight(weightProfile.medium)}
            className={`p-3 rounded-xl border text-left transition-all ${
              estimatedWeight === weightProfile.medium
                ? 'bg-sky-950/50 border-sky-400 ring-1 ring-sky-400/40 text-white'
                : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1">
                <span>Standard Medium</span>
                <span className="text-[10px] px-1 rounded bg-sky-500/20 text-sky-300 font-mono">USDA</span>
              </span>
              <span className="font-mono text-sky-400">{weightProfile.medium}g</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Typical grocery reference size</p>
          </button>

          <button
            id="preset-weight-large"
            type="button"
            onClick={() => setEstimatedWeight(weightProfile.large)}
            className={`p-3 rounded-xl border text-left transition-all ${
              estimatedWeight === weightProfile.large
                ? 'bg-sky-950/50 border-sky-400 ring-1 ring-sky-400/40 text-white'
                : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Large / Jumbo</span>
              <span className="font-mono text-sky-400">{weightProfile.large}g</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Prime commercial grade load</p>
          </button>
        </div>

        {/* Custom Weight Slider & Number Input */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full flex-1">
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1.5">
              <span>50g (Minimal)</span>
              <span>200g</span>
              <span>400g</span>
              <span>600g (Batch/Heavy)</span>
            </div>
            <input
              id="weight-range-slider"
              type="range"
              min="50"
              max="500"
              step="5"
              value={estimatedWeight}
              onChange={(e) => setEstimatedWeight(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400 font-mono">Custom Grams:</span>
            <input
              id="weight-number-input"
              type="number"
              min="30"
              max="1500"
              value={estimatedWeight}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val > 0) setEstimatedWeight(val);
              }}
              className="w-20 px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-sky-400 text-center"
            />
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-400 pt-1 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>Size Specification: {weightProfile.sizeDescription}</span>
        </div>
      </div>

      {/* Dynamic Key Macronutrient Cards (Scaled to Estimated Weight) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        
        {/* Calories */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Energy (Calories)
          </span>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
              {caloriesFact ? caloriesFact.amountScaled : '—'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              In {estimatedWeight}g portion ({caloriesFact ? caloriesFact.amount100g : '—'} / 100g)
            </p>
          </div>
        </div>

        {/* Carbohydrates */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 text-sky-400" />
            Carbohydrates
          </span>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
              {carbsFact ? carbsFact.amountScaled : '—'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              {carbsFact?.dailyValueScaled ? `${carbsFact.dailyValueScaled} Daily Value` : 'Digestible Energy'}
            </p>
          </div>
        </div>

        {/* Dietary Fiber */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
            Dietary Fiber
          </span>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
              {fiberFact ? fiberFact.amountScaled : '—'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              {fiberFact?.dailyValueScaled ? `${fiberFact.dailyValueScaled} DV (Pectin)` : 'Digestive Prebiotic'}
            </p>
          </div>
        </div>

        {/* Natural Sugars / Micronutrient */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-purple-400" />
            Natural Sugars
          </span>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
              {sugarFact ? sugarFact.amountScaled : primaryMineral ? primaryMineral.amountScaled : '—'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              Fructose &amp; Glucose balance
            </p>
          </div>
        </div>

      </div>

      {/* Two-Column Layout: Scaled Nutrition Facts Table (Left) + Ripening & Storage Insights (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Complete Nutrition Facts Table (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              Nutritional Breakdown (Scaled to {estimatedWeight}g)
            </h4>
            <span className="text-[10px] font-mono text-sky-400 bg-sky-950/60 border border-sky-800 px-2 py-0.5 rounded">
              Factor: {(estimatedWeight / 100).toFixed(2)}x
            </span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-inner">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                <tr>
                  <th className="py-2.5 px-3.5 font-semibold">Nutrient Component</th>
                  <th className="py-2.5 px-3 font-semibold text-right text-sky-300">
                    For {estimatedWeight}g Specimen
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-right text-slate-400">
                    % DV
                  </th>
                  <th className="py-2.5 px-3.5 font-semibold text-right text-slate-500">
                    Per 100g Std
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {scaledFacts.map((fact, idx) => (
                  <tr
                    key={fact.nutrient}
                    className={idx % 2 === 0 ? 'bg-transparent' : 'bg-slate-900/30'}
                  >
                    <td className="py-2.5 px-3.5 text-slate-200 font-sans font-medium text-xs">
                      {fact.nutrient}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-sky-300">
                      {fact.amountScaled}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400">
                      {fact.dailyValueScaled || '—'}
                    </td>
                    <td className="py-2.5 px-3.5 text-right text-slate-500">
                      {fact.amount100g}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-slate-500 font-mono">
            * Percent Daily Values (% DV) based on a 2,000 calorie reference diet (USDA Dietary Guidelines).
          </p>
        </div>

        {/* Right: Ripeness Bio-Impact & Storage Guidance (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Ripening Nutritional Bio-Impact */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                Maturation Biochemical Dynamics
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                {status} Stage
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {ripenessImpact.bioSummary}
            </p>

            <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Carbohydrate Form:</span>
                <span className="text-slate-200 font-semibold">{ripenessImpact.starchStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Antioxidant Index:</span>
                <span className="text-slate-200 font-semibold">{ripenessImpact.antioxidantLevel}</span>
              </div>
            </div>
          </div>

          {/* Optimal Storage Reference */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <ThermometerSnowflake className="w-3.5 h-3.5 text-cyan-400" />
              Preservation &amp; Storage Regimes
            </span>
            <p className="text-xs text-slate-300 font-mono">
              {foodInfo.optimalStorage}
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              {foodInfo.recommendation}
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
