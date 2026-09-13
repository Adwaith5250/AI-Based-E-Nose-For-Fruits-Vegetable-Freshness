import React, { useState, useEffect } from 'react';
import { FoodCategory, FoodType } from '../types';
import {
  CheckCircle2,
  Scale,
  Wind,
  Waves,
  Layers,
  ChevronRight,
  PenTool,
  Search,
  Sparkles,
  RefreshCw,
  Plus
} from 'lucide-react';
import { playChirp } from '../services/soundEffects';

interface FoodSelectorProps {
  selectedFood: FoodType | null;
  onSelectFood: (food: FoodType) => void;
  disabled?: boolean;
}

interface FoodCardMeta {
  type: FoodType;
  category: FoodCategory;
  displayName: string;
  emoji: string;
  scientific: string;
  family: string;
  catalogId: string;
  metricsSummary: string;
  sampleWeights: string;
}

const CATEGORY_CONFIG: Record<
  FoodCategory,
  {
    label: string;
    emoji: string;
    description: string;
    specimenNames: string;
  }
> = {
  fruit: {
    label: 'Fruit',
    emoji: '🍎',
    description: 'Climacteric soft-tissue produce with ethylene & ester synthesis',
    specimenNames: 'Apple, Banana, Mango, Strawberry...'
  },
  vegetable: {
    label: 'Vegetable',
    emoji: '🥦',
    description: 'Solanaceae table varieties, tubers & fibrous greens',
    specimenNames: 'Tomato, Potato, Carrot, Broccoli...'
  }
};

const STANDARD_FOOD_METAS: FoodCardMeta[] = [
  {
    type: 'Apple',
    category: 'fruit',
    displayName: 'Apple',
    emoji: '🍎',
    scientific: 'Malus domestica',
    family: 'Rosaceae (Climacteric)',
    catalogId: 'SPEC-APL-01',
    metricsSummary: 'Ethylene & Esters · Pectin Rigidity',
    sampleWeights: 'Std 180–220g / 500g Test Load'
  },
  {
    type: 'Banana',
    category: 'fruit',
    displayName: 'Banana',
    emoji: '🍌',
    scientific: 'Musa acuminata',
    family: 'Musaceae (Climacteric)',
    catalogId: 'SPEC-BAN-04',
    metricsSummary: 'Isoamyl Acetate & Ethylene · Starch-to-Sugar Softening',
    sampleWeights: 'Std 120–150g / 350g Test Cluster'
  },
  {
    type: 'Tomato',
    category: 'vegetable',
    displayName: 'Tomato',
    emoji: '🍅',
    scientific: 'Solanum lycopersicum',
    family: 'Solanaceae (Climacteric)',
    catalogId: 'SPEC-TMT-02',
    metricsSummary: 'Volatile Alcohol · Cuticle Turgor',
    sampleWeights: 'Std 120–160g / 250g Test Load'
  },
  {
    type: 'Potato',
    category: 'vegetable',
    displayName: 'Potato',
    emoji: '🥔',
    scientific: 'Solanum tuberosum',
    family: 'Solanaceae (Non-climacteric)',
    catalogId: 'SPEC-POT-03',
    metricsSummary: 'Amine Spoilage · Starch Matrix',
    sampleWeights: 'Std 170–240g / 1000g Test Load'
  }
];

// Curated suggestion chips for instant custom typing
const SUGGESTED_CUSTOM_FRUITS = [
  { name: 'Mango', emoji: '🥭' },
  { name: 'Strawberry', emoji: '🍓' },
  { name: 'Avocado', emoji: '🥑' },
  { name: 'Orange', emoji: '🍊' },
  { name: 'Grape', emoji: '🍇' },
  { name: 'Peach', emoji: '🍑' },
  { name: 'Pineapple', emoji: '🍍' },
  { name: 'Watermelon', emoji: '🍉' },
  { name: 'Blueberry', emoji: '🫐' },
  { name: 'Lemon', emoji: '🍋' }
];

const SUGGESTED_CUSTOM_VEGETABLES = [
  { name: 'Carrot', emoji: '🥕' },
  { name: 'Cucumber', emoji: '🥒' },
  { name: 'Onion', emoji: '🧅' },
  { name: 'Broccoli', emoji: '🥦' },
  { name: 'Bell Pepper', emoji: '🫑' },
  { name: 'Lettuce', emoji: '🥬' },
  { name: 'Garlic', emoji: '🧄' },
  { name: 'Corn', emoji: '🌽' },
  { name: 'Spinach', emoji: '🥬' },
  { name: 'Eggplant', emoji: '🍆' }
];

const PRODUCE_EMOJIS: Record<string, string> = {
  mango: '🥭',
  strawberry: '🍓',
  strawberries: '🍓',
  avocado: '🥑',
  orange: '🍊',
  grape: '🍇',
  grapes: '🍇',
  peach: '🍑',
  pineapple: '🍍',
  watermelon: '🍉',
  melon: '🍈',
  lemon: '🍋',
  lime: '🍋',
  cherry: '🍒',
  cherries: '🍒',
  pear: '🍐',
  plum: '🍑',
  kiwi: '🥝',
  blueberry: '🫐',
  blueberries: '🫐',
  banana: '🍌',
  apple: '🍎',
  carrot: '🥕',
  carrots: '🥕',
  cucumber: '🥒',
  onion: '🧅',
  onions: '🧅',
  broccoli: '🥦',
  pepper: '🫑',
  'bell pepper': '🫑',
  peppers: '🫑',
  lettuce: '🥬',
  spinach: '🥬',
  garlic: '🧄',
  corn: '🌽',
  potato: '🥔',
  potatoes: '🥔',
  tomato: '🍅',
  tomatoes: '🍅',
  eggplant: '🍆',
  cabbage: '🥬',
  celery: '🥬',
  zucchini: '🥒',
  pumpkin: '🎃',
  mushroom: '🍄',
  papaya: '🥭',
  guava: '🍈',
  dragonfruit: '🐉'
};

function getEmojiForProduce(name: string, category: FoodCategory): string {
  const clean = name.trim().toLowerCase();
  if (PRODUCE_EMOJIS[clean]) return PRODUCE_EMOJIS[clean];
  for (const [key, val] of Object.entries(PRODUCE_EMOJIS)) {
    if (clean.includes(key) || key.includes(clean)) return val;
  }
  return category === 'fruit' ? '🍎' : '🥦';
}

function autoDetectCategory(name: string): FoodCategory {
  const lower = name.trim().toLowerCase();
  const vegetableKeywords = [
    'carrot', 'potato', 'tomato', 'onion', 'garlic', 'cucumber', 'broccoli',
    'pepper', 'lettuce', 'spinach', 'cabbage', 'celery', 'zucchini', 'eggplant',
    'bean', 'pea', 'corn', 'beet', 'radish', 'mushroom', 'cauliflower', 'asparagus',
    'turnip', 'kale', 'squash', 'pumpkin', 'yam', 'artichoke', 'leek'
  ];
  if (vegetableKeywords.some((kw) => lower.includes(kw))) {
    return 'vegetable';
  }
  return 'fruit';
}

export const FoodSelector: React.FC<FoodSelectorProps> = ({
  selectedFood,
  onSelectFood,
  disabled = false
}) => {
  // Mode: 'catalog' | 'custom'
  const isCustomCurrentlyArmed =
    !!selectedFood && !STANDARD_FOOD_METAS.some((f) => f.type === selectedFood);

  const [selectionMode, setSelectionMode] = useState<'catalog' | 'custom'>(() => {
    return isCustomCurrentlyArmed ? 'custom' : 'catalog';
  });

  const [activeCategory, setActiveCategory] = useState<FoodCategory>(() => {
    if (selectedFood) {
      if (selectedFood === 'Tomato' || selectedFood === 'Potato') return 'vegetable';
      return autoDetectCategory(selectedFood);
    }
    return 'fruit';
  });

  // Custom typing state
  const [typedInput, setTypedInput] = useState<string>(() => {
    return isCustomCurrentlyArmed && selectedFood ? selectedFood : '';
  });
  const [customCategory, setCustomCategory] = useState<FoodCategory>('fruit');

  // Synchronize when selectedFood changes externally
  useEffect(() => {
    if (selectedFood) {
      const isPreset = STANDARD_FOOD_METAS.some((f) => f.type === selectedFood);
      if (isPreset) {
        if (selectedFood === 'Tomato' || selectedFood === 'Potato') {
          setActiveCategory('vegetable');
        } else {
          setActiveCategory('fruit');
        }
      } else {
        // Custom specimen was selected
        const detected = autoDetectCategory(selectedFood);
        setActiveCategory(detected);
        setCustomCategory(detected);
        setTypedInput(selectedFood);
      }
    }
  }, [selectedFood]);

  // Handle typing custom input
  const handleTypedInputChange = (text: string) => {
    setTypedInput(text);
    if (text.trim().length > 1) {
      const detected = autoDetectCategory(text);
      setCustomCategory(detected);
    }
  };

  // Submit and arm custom specimen
  const handleArmCustomSpecimen = (foodName: string, categoryOverride?: FoodCategory) => {
    const clean = foodName.trim();
    if (!clean) return;
    const cat = categoryOverride || customCategory;
    const formatted = clean.charAt(0).toUpperCase() + clean.slice(1);
    playChirp(820, 0.06);
    onSelectFood(formatted);
    setActiveCategory(cat);
  };

  const specimensInCategory = STANDARD_FOOD_METAS.filter(
    (f) => f.category === activeCategory
  );

  const currentCustomEmoji = getEmojiForProduce(typedInput || 'Specimen', customCategory);
  const isTypedCurrentArmed =
    !!selectedFood &&
    typedInput.trim().toLowerCase() === selectedFood.trim().toLowerCase();

  return (
    <section
      id="food-selector-section"
      aria-label="Select Food Category and Specimen"
      className="p-5 sm:p-6 rounded-2xl bg-[#f1f2f2]/95 border border-emerald-500/30 shadow-[0_4px_30px_rgba(252, 252, 253,0.5)] space-y-4 transition-all relative overflow-hidden"
    >
      {/* Ambient background lighting accent */}
      <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-l from-emerald-500/15 via-green-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-950/80">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Specimen Classification Target
            </h2>
            <p className="text-xs text-slate-400">
              International botanical benchmarks &bull; <strong className="text-emerald-300">Select preset or type any fruit / vegetable</strong> manually.
            </p>
          </div>
        </div>

        {/* Current Armed Status */}
        <div className="flex items-center gap-2 text-xs font-mono self-start sm:self-auto">
          {selectedFood ? (
            <span className="text-emerald-300 font-semibold flex items-center gap-2 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-400/50 shadow-[0_0_12px_rgba(83, 118, 159,0.3)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_6px_#6988ab]"></span>
              </span>
              Armed: {selectedFood}
              {isCustomCurrentlyArmed && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-200 px-1.5 py-0.2 rounded border border-emerald-500/40">
                  Custom
                </span>
              )}
            </span>
          ) : (
            <span className="text-slate-400 bg-[#eff0f1] px-3 py-1.5 rounded-lg border border-emerald-950">
              Select or type a specimen
            </span>
          )}
        </div>
      </div>

      {/* Dual Mode Switcher: [Standard Benchmarks] vs [Type Custom Fruit/Vegetable] */}
      <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-[#f5f6f6] border border-emerald-950">
        <div className="grid grid-cols-2 gap-1.5 w-full sm:w-auto">
          <button
            id="tab-mode-catalog"
            type="button"
            disabled={disabled}
            onClick={() => {
              setSelectionMode('catalog');
              playChirp(700, 0.03);
            }}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectionMode === 'catalog'
                ? 'green-black-gradient text-white shadow-[0_0_12px_rgba(83, 118, 159,0.4)]'
                : 'text-slate-400 hover:text-white bg-[#eeeff0]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-300" />
            <span>Preset Catalog (Apple, Banana, Tomato, Potato)</span>
          </button>

          <button
            id="tab-mode-custom-typing"
            type="button"
            disabled={disabled}
            onClick={() => {
              setSelectionMode('custom');
              playChirp(840, 0.03);
            }}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectionMode === 'custom'
                ? 'green-black-gradient text-white shadow-[0_0_12px_rgba(83, 118, 159,0.4)]'
                : 'text-slate-400 hover:text-white bg-[#eeeff0]'
            }`}
          >
            <PenTool className="w-3.5 h-3.5 text-emerald-300" />
            <span>Type Fruit / Vegetable Manually</span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded-full border border-emerald-500/40">
              Custom
            </span>
          </button>
        </div>
      </div>

      {/* VIEW 1: PRESET CATALOG MODE */}
      {selectionMode === 'catalog' && (
        <div className="space-y-4">
          {/* Category Selection Tabs / Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(['fruit', 'vegetable'] as FoodCategory[]).map((catKey) => {
              const config = CATEGORY_CONFIG[catKey];
              const isCategoryActive = activeCategory === catKey;
              const hasSelectedChild =
                selectedFood &&
                STANDARD_FOOD_METAS.some(
                  (f) => f.category === catKey && f.type === selectedFood
                );

              return (
                <button
                  id={`category-tab-${catKey}`}
                  key={catKey}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setActiveCategory(catKey);
                    playChirp(650, 0.02);
                  }}
                  className={`group relative p-4 rounded-xl text-left transition-all duration-200 cursor-pointer border ${
                    isCategoryActive
                      ? 'bg-gradient-to-r from-emerald-950/80 to-[#e5e6e8] border-emerald-500/70 shadow-[0_0_20px_rgba(83, 118, 159,0.25)] ring-1 ring-emerald-400/50'
                      : 'bg-[#eff0f1]/80 hover:bg-[#e4e5e7] border-emerald-950 hover:border-emerald-800'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl select-none filter drop-shadow">
                        {config.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3
                            className={`text-sm sm:text-base font-bold tracking-tight transition-colors ${
                              isCategoryActive
                                ? 'text-white'
                                : 'text-slate-300 group-hover:text-white'
                            }`}
                          >
                            {config.label} Category
                          </h3>
                          {hasSelectedChild && (
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                              Armed: {selectedFood}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          {config.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-colors ${
                          isCategoryActive
                            ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-200 border-emerald-500/40 font-bold shadow-sm'
                            : 'bg-[#f4f4f5] text-slate-500 border-emerald-950'
                        }`}
                      >
                        {isCategoryActive ? 'ACTIVE' : 'SELECT'}
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isCategoryActive
                            ? 'text-emerald-400 rotate-90'
                            : 'text-slate-600 group-hover:text-slate-400'
                        }`}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Specimen Cards Container for the Active Category */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#f3f4f4]/90 border border-emerald-950/80 space-y-3.5">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-emerald-950/60">
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300 font-medium">
                  Available Specimens in{' '}
                  <strong className="green-black-text font-bold capitalize">
                    {CATEGORY_CONFIG[activeCategory].label}
                  </strong>{' '}
                  Category:
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectionMode('custom')}
                className="text-emerald-400 hover:text-emerald-300 text-[11px] font-mono flex items-center gap-1 transition-colors"
              >
                <span>Or type custom produce</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {specimensInCategory.map((food) => {
                const isSelected = selectedFood === food.type;

                return (
                  <button
                    id={`food-card-${food.type.toLowerCase()}`}
                    key={food.type}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      onSelectFood(food.type);
                      playChirp(780, 0.04);
                    }}
                    className={`group relative p-4 sm:p-5 rounded-xl text-left transition-all duration-200 cursor-pointer overflow-hidden border ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#e4e5e7] to-[#f2f3f4] border-emerald-400 ring-1 ring-emerald-400/60 shadow-[0_0_20px_rgba(83, 118, 159,0.3)]'
                        : 'bg-[#eff0f1]/70 hover:bg-[#e4e5e7] border-emerald-950/90 hover:border-emerald-800'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {/* Green LED indicator top accent bar */}
                    {isSelected && (
                      <div className="absolute top-0 left-0 right-0 h-0.5 green-black-gradient shadow-[0_0_8px_#6988ab]" />
                    )}

                    {/* Card Content */}
                    <div className="relative z-10 flex flex-col justify-between h-full space-y-3.5">
                      {/* Header row */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl select-none filter drop-shadow">
                            {food.emoji}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                                {food.displayName}
                              </h4>
                              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#f5f6f6] border border-emerald-950 text-emerald-400">
                                {food.catalogId}
                              </span>
                            </div>
                            <p className="text-xs font-mono italic text-slate-400 mt-0.5">
                              {food.scientific}
                            </p>
                          </div>
                        </div>

                        {/* Radio checkmark circle */}
                        <div
                          className={`flex items-center justify-center w-5 h-5 rounded-full border transition-all ${
                            isSelected
                              ? 'bg-gradient-to-br from-emerald-400 to-green-600 border-emerald-300 text-slate-950 shadow-[0_0_10px_rgba(83, 118, 159,0.5)]'
                              : 'border-emerald-950 bg-[#f5f6f6] text-transparent'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 fill-current stroke-slate-950 stroke-2" />
                        </div>
                      </div>

                      {/* Sensed Channels */}
                      <div className="space-y-1.5 pt-2 border-t border-emerald-950/60">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <Wind className="w-3.5 h-3.5 text-emerald-400" />
                            Gas Volatiles:
                          </span>
                          <span className="font-mono text-emerald-200 font-medium">
                            MQ-135 / MQ-3
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <Scale className="w-3.5 h-3.5 text-lime-400" />
                            Firmness Probe:
                          </span>
                          <span className="font-mono text-lime-200 font-medium">
                            FSR 402 Dynamic
                          </span>
                        </div>

                        <div className="text-[11px] font-mono text-slate-400 pt-0.5">
                          {food.sampleWeights}
                        </div>
                      </div>

                      {/* Physiology Badge & Selection Status */}
                      <div className="flex items-center justify-between pt-1 border-t border-emerald-950/40">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border bg-[#f5f6f6] text-slate-300 border-emerald-950">
                          <Waves className="w-3 h-3 text-emerald-400" />
                          {food.family}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold tracking-wider ${
                            isSelected ? 'text-emerald-300' : 'text-slate-500'
                          }`}
                        >
                          {isSelected ? 'ARMED FOR SCAN' : 'CLICK TO SELECT'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: TYPE CUSTOM PRODUCE MANUALLY */}
      {selectionMode === 'custom' && (
        <div className="p-5 sm:p-6 rounded-xl bg-[#f3f4f4]/95 border border-emerald-950/90 space-y-5">
          {/* Typing instructions & category auto-detector header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-950/60">
            <div>
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Type Any Fruit or Vegetable Specimen
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Type the produce name below. The system automatically configures botanical thresholds, post-harvest reference data, and sensor channels.
              </p>
            </div>

            {/* Category toggle */}
            <div className="flex items-center gap-1.5 bg-[#f5f6f6] p-1 rounded-lg border border-emerald-950 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setCustomCategory('fruit')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  customCategory === 'fruit'
                    ? 'bg-gradient-to-r from-emerald-500/25 to-green-500/25 text-emerald-200 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🍎 Fruit
              </button>
              <button
                type="button"
                onClick={() => setCustomCategory('vegetable')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  customCategory === 'vegetable'
                    ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/25 text-emerald-200 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🥦 Vegetable
              </button>
            </div>
          </div>

          {/* Interactive Manual Typing Input Form */}
          <div className="space-y-2">
            <label
              htmlFor="custom-food-input"
              className="block text-xs font-mono font-medium text-slate-300"
            >
              Custom Specimen Name:
            </label>
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  id="custom-food-input"
                  type="text"
                  value={typedInput}
                  disabled={disabled}
                  onChange={(e) => handleTypedInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && typedInput.trim()) {
                       e.preventDefault();
                      handleArmCustomSpecimen(typedInput);
                    }
                  }}
                  placeholder="Type any fruit or vegetable (e.g. Mango, Strawberry, Avocado, Carrot, Cucumber, Onion)..."
                  className="w-full bg-[#f5f6f6] border border-emerald-500/40 rounded-xl px-4 py-3 pl-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 font-sans shadow-inner transition-all"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search className="w-4 h-4 text-emerald-400" />
                </div>
                {typedInput && (
                  <button
                    type="button"
                    onClick={() => setTypedInput('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-300 text-xs font-mono"
                  >
                    Clear
                  </button>
                )}
              </div>

              <button
                id="btn-arm-custom-specimen"
                type="button"
                disabled={disabled || !typedInput.trim()}
                onClick={() => handleArmCustomSpecimen(typedInput)}
                className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                  typedInput.trim()
                    ? 'green-black-gradient text-white shadow-[0_0_16px_rgba(83, 118, 159,0.4)] hover:shadow-[0_0_20px_rgba(83, 118, 159,0.6)]'
                    : 'bg-slate-900/60 text-slate-600 border border-emerald-950 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>Arm Specimen</span>
              </button>
            </div>
          </div>

          {/* Quick-Select Suggestions: Fruits */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                <span>🍎</span> Popular Fruits (Click to populate &amp; arm):
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_CUSTOM_FRUITS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setTypedInput(item.name);
                    setCustomCategory('fruit');
                    handleArmCustomSpecimen(item.name, 'fruit');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                    selectedFood?.toLowerCase() === item.name.toLowerCase()
                      ? 'bg-emerald-950/70 text-emerald-200 border-emerald-500/80 shadow-[0_0_10px_rgba(83, 118, 159,0.3)] ring-1 ring-emerald-400'
                      : 'bg-[#f4f4f5] text-slate-300 border-emerald-950 hover:border-emerald-800 hover:bg-[#eaebec]'
                  }`}
                >
                  <span className="text-sm">{item.emoji}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick-Select Suggestions: Vegetables */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                <span>🥦</span> Popular Vegetables (Click to populate &amp; arm):
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_CUSTOM_VEGETABLES.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setTypedInput(item.name);
                    setCustomCategory('vegetable');
                    handleArmCustomSpecimen(item.name, 'vegetable');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                    selectedFood?.toLowerCase() === item.name.toLowerCase()
                      ? 'bg-emerald-950/70 text-emerald-200 border-emerald-500/80 shadow-[0_0_10px_rgba(83, 118, 159,0.3)] ring-1 ring-emerald-400'
                      : 'bg-[#f4f4f5] text-slate-300 border-emerald-950 hover:border-emerald-800 hover:bg-[#eaebec]'
                  }`}
                >
                  <span className="text-sm">{item.emoji}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Preview Card for the Typed Specimen */}
          {typedInput.trim() && (
            <div className="p-4 sm:p-5 rounded-xl bg-[#f4f4f5] border border-emerald-500/40 shadow-[0_0_16px_rgba(83, 118, 159,0.15)] space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl select-none filter drop-shadow">
                    {currentCustomEmoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base sm:text-lg font-bold text-white capitalize">
                        {typedInput.trim()}
                      </h4>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase">
                        SPEC-{typedInput.trim().slice(0, 4).toUpperCase()}-CUST
                      </span>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 uppercase">
                        {customCategory}
                      </span>
                    </div>
                    <p className="text-xs font-mono italic text-slate-400 mt-0.5">
                      {typedInput.trim()} botanical specimen &bull; Custom Target Profile
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isTypedCurrentArmed ? (
                    <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/60 px-3 py-1.5 rounded-lg shadow-[0_0_10px_rgba(83, 118, 159,0.3)]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ARMED &amp; READY
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleArmCustomSpecimen(typedInput)}
                      className="flex items-center gap-1.5 text-xs font-mono font-bold text-black bg-emerald-400 hover:bg-emerald-300 px-3 py-1.5 rounded-lg transition-all shadow-sm cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      ARM SPECIMEN
                    </button>
                  )}
                </div>
              </div>

              {/* Sensed Channels Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-emerald-950/60 text-xs text-slate-400">
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#f7f8f8] border border-emerald-950">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Wind className="w-3.5 h-3.5 text-emerald-400" />
                    Gas Volatiles Target:
                  </span>
                  <span className="font-mono text-emerald-300 font-semibold">
                    MQ-135 (Air) / MQ-3 (Alcohol)
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#f7f8f8] border border-emerald-950">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Scale className="w-3.5 h-3.5 text-lime-400" />
                    Cuticle Firmness Sensor:
                  </span>
                  <span className="font-mono text-lime-300 font-semibold">
                    FSR 402 Dynamic Load
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
