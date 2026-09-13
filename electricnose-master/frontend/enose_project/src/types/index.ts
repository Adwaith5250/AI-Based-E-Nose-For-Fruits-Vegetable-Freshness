export type FoodType = 'Apple' | 'Banana' | 'Tomato' | 'Potato' | string;

export type FoodCategory = 'fruit' | 'vegetable';

export type FreshnessStage = 'Fresh' | 'Ripe' | 'Overripe' | 'Rotten';

export interface SensorReadings {
  mq135_baseline: number;
  mq3_baseline: number;
  mq135_mean: number;
  mq135_std: number;
  mq3_mean: number;
  mq3_std: number;
  fsr_median: number;
  temp_c: number;
  rh_pct: number;
  timestamp?: number;
}

export type StoragePresetKey =
  | 'refrigerator'
  | 'room_temp'
  | 'pantry_cellar'
  | 'chilled_commercial'
  | 'warm_sun'
  | 'custom';

export interface StorageEnvironment {
  id: string;
  presetKey: StoragePresetKey;
  name: string;
  tempC: number;
  rhPct: number;
  isDark: boolean;
  isVentilated: boolean;
  isCustom: boolean;
  customNotes?: string;
}

export interface CalculatedShelfLife {
  displayShelfLife: string;
  daysMin: number;
  daysMax: number;
  expiryDate: string;
  storageSuitability: 'optimal' | 'acceptable' | 'suboptimal' | 'hazardous';
  suitabilityBadge: string;
  storageImpactNote: string;
  temperatureFactor: number;
  specialWarning?: string;
}

export interface PredictionResult {
  readingId?: number;
  food: FoodType;
  status: FreshnessStage;
  confidence: number; // e.g. 94.2
  estimatedShelfLife: string; // e.g. "5–7 Days"
  sensorReadings: SensorReadings;
  isSimulated: boolean;
  modelType?: string; // "Random Forest (300 Trees)"
  decisionMargin?: number;
  storageEnvironment?: StorageEnvironment;
}

export interface NutritionFact {
  nutrient: string;
  amount: string;
  dailyValue?: string;
  note?: string;
}

export interface ProduceWeightProfile {
  small: number;
  medium: number;
  large: number;
  defaultWeight: number;
  unit: string;
  sizeDescription: string;
}

export interface FoodInfo {
  food: FoodType;
  scientificName: string;
  weightProfile: ProduceWeightProfile;
  nutritionPer100g: NutritionFact[];
  treatmentProfile: string;
  recommendation: string;
  optimalStorage: string;
  spoilageMechanisms: string;
}

export interface ScanLogEntry {
  id: string;
  readingId?: number;
  timestamp: string;
  foodId: string;
  food: FoodType;
  predictedStage: FreshnessStage;
  trueStage: FreshnessStage;
  confidence: number;
  readings: SensorReadings;
  notes: string;
}

export interface BaselineValues {
  mq135_baseline: number;
  mq3_baseline: number;
  temp_c: number;
  rh_pct: number;
  calibratedAt: string;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export type RipeningAgentUsageStatus =
  | 'not_used' // 100% Naturally Ripened
  | 'used_calcium_carbide' // Illegal Calcium Carbide / Acetylene detected
  | 'used_regulated_ethylene' // Commercial Ethylene / Ethephon chamber
  | 'inconclusive';

export type WaxCoatingUsageStatus =
  | 'not_applied' // Natural Epicuticular Bloom / No wax
  | 'applied_synthetic_paraffin' // Petroleum paraffin wax detected
  | 'applied_food_grade_wax' // Carnauba (E903) or Shellac (E904)
  | 'inconclusive';

export interface ChemicalScreeningVerdict {
  ripeningStatus: RipeningAgentUsageStatus;
  ripeningLabel: string;
  ripeningAgentUsed: boolean;
  waxStatus: WaxCoatingUsageStatus;
  waxLabel: string;
  waxCoatingUsed: boolean;
  carbideProbability: number; // 0 - 100%
  waxThicknessScore: number; // 0 - 100
  safetyVerdict: 'SAFE' | 'CAUTION' | 'PROHIBITED';
  fssaiCompliance: boolean;
  specimenNotes: string[];
}
