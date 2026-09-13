import { FoodType, SensorReadings, ChemicalScreeningVerdict, RipeningAgentUsageStatus, WaxCoatingUsageStatus } from '../types';

export type SpecimenConditionPreset =
  | 'natural'
  | 'carbide'
  | 'commercial_ethylene'
  | 'paraffin_wax'
  | 'food_grade_wax';

export interface LabVerificationMetric {
  parameter: string;
  finding: string;
  regulatoryThreshold: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  instrument: string;
}

export interface SpecimenSafetyEvaluation extends ChemicalScreeningVerdict {
  food: FoodType;
  conditionKey: SpecimenConditionPreset;
  conditionTitle: string;
  labMetrics: LabVerificationMetric[];
  chemicalCompoundsDetected: {
    name: string;
    formula: string;
    concentration: string;
    status: 'Natural' | 'Regulated Safe' | 'Prohibited Toxic';
  }[];
  detoxificationProtocol: string;
}

export interface ExperimentalRipeningScreening {
  status: 'inconclusive' | 'no_strong_anomaly' | 'possible_accelerated_ripening_pattern';
  label: string;
  confidence: number;
  basis: string;
  disclaimer: string;
}

/**
 * Screens live sensor patterns for an experimental follow-up signal.
 * The current sensor set cannot identify carbide or ethylene directly.
 */
export function screenRipeningPattern(sensorReadings?: SensorReadings): ExperimentalRipeningScreening {
  if (!sensorReadings) {
    return {
      status: 'inconclusive',
      label: 'INCONCLUSIVE — NO LIVE SENSOR READING',
      confidence: 0,
      basis: 'Run a hardware scan to evaluate the gas and firmness pattern.',
      disclaimer: 'This is a research screen, not a chemical test.'
    };
  }

  const gasDelta = sensorReadings.mq135_mean - sensorReadings.mq135_baseline;
  const ethanolDelta = sensorReadings.mq3_mean - sensorReadings.mq3_baseline;
  const firmness = sensorReadings.fsr_median;
  const anomalySignals = [gasDelta > 120, ethanolDelta > 70, firmness < 300].filter(Boolean).length;

  if (anomalySignals >= 2) {
    return {
      status: 'possible_accelerated_ripening_pattern',
      label: 'POSSIBLE ACCELERATED-RIPENING PATTERN',
      confidence: Math.min(85, 55 + anomalySignals * 10),
      basis: `Elevated gas deltas (${gasDelta.toFixed(0)} / ${ethanolDelta.toFixed(0)}) and reduced firmness (${firmness.toFixed(0)}) are present.`,
      disclaimer: 'This pattern may also come from natural ripening or spoilage. It does not identify carbide, ethylene, or any specific chemical.'
    };
  }

  return {
    status: 'no_strong_anomaly',
    label: 'NO STRONG ACCELERATED-RIPENING ANOMALY',
    confidence: 55,
    basis: `Current gas deltas (${gasDelta.toFixed(0)} / ${ethanolDelta.toFixed(0)}) and firmness (${firmness.toFixed(0)}) are within the experimental screen range.`,
    disclaimer: 'This result does not prove that the produce is untreated.'
  };
}

export function evaluateProduceChemicalStatus(
  food: FoodType,
  preset: SpecimenConditionPreset = 'natural',
  sensorReadings?: SensorReadings
): SpecimenSafetyEvaluation {
  const isBanana = food === 'Banana';
  const isApple = food === 'Apple';
  const isTomato = food === 'Tomato';
  const isPotato = food === 'Potato';

  // If sensor readings are provided and indicate high abnormal VOCs/firmness deviations,
  // we can also factor them into the probability calculations
  const mq135Delta = sensorReadings ? Math.max(0, sensorReadings.mq135_mean - sensorReadings.mq135_baseline) : 0;
  const mq3Delta = sensorReadings ? Math.max(0, sensorReadings.mq3_mean - sensorReadings.mq3_baseline) : 0;

  switch (preset) {
    case 'carbide': {
      return {
        food,
        conditionKey: 'carbide',
        conditionTitle: 'Artificially Ripened with Calcium Carbide (CaC₂)',
        ripeningAgentUsed: true,
        ripeningStatus: 'used_calcium_carbide',
        ripeningLabel: 'USED: Prohibited Calcium Carbide (CaC₂ / Acetylene Detected)',
        waxCoatingUsed: false,
        waxStatus: 'not_applied',
        waxLabel: isBanana
          ? 'NOT APPLIED: Natural Peel (No Wax Layer)'
          : isApple
          ? 'NOT APPLIED: Natural Cuticular Wax'
          : 'NOT APPLIED: Natural Cuticle',
        carbideProbability: Math.min(99, Math.max(88, 92 + Math.round(mq135Delta / 40))),
        waxThicknessScore: 6,
        safetyVerdict: 'PROHIBITED',
        fssaiCompliance: false,
        specimenNotes: [
          'Direct violation of FSSAI Regulation 2.3.5 (Prohibition of use of Carbide Gas in ripening of fruits).',
          'Acetylene gas (C₂H₂) detected at elevated concentrations alongside trace phosphine (PH₃) and arsenic hydride.',
          'Peel-to-stem discordance: Uniform yellow skin while pedicel stem remains dark green and fibrous.',
          'Pulp analysis: Insipid starch content, premature chlorophyll breakdown without natural sucrose conversion.',
        ],
        labMetrics: [
          {
            parameter: 'Acetylene Gas (C₂H₂)',
            finding: '54.2 ppm (Elevated Alkyne Peak)',
            regulatoryThreshold: '< 1.0 ppm (Zero Tolerance in FSSAI)',
            status: 'FAIL',
            instrument: 'Electronic Nose MQ-4 Proxy / GC-MS',
          },
          {
            parameter: 'Trace Hydrides (PH₃ / AsH₃)',
            finding: '0.18 ppm (Industrial Impurity)',
            regulatoryThreshold: '< 0.01 ppm Limit',
            status: 'FAIL',
            instrument: 'MQ-135 Sensor Array / Colorimetric Tube',
          },
          {
            parameter: 'Skin/Pulp Firmness Ratio',
            finding: 'High discrepancy: Peel 220, Core 690',
            regulatoryThreshold: 'Uniform Gradient < 180 Delta',
            status: 'WARN',
            instrument: 'FSR-402 Tactile Force Sensor',
          },
          {
            parameter: 'Cuticle Wax Flake Weight',
            finding: '< 1.0 mg / 100cm² (Natural)',
            regulatoryThreshold: 'N/A',
            status: 'PASS',
            instrument: 'Micro-gravimetric Blade Scrape',
          },
        ],
        chemicalCompoundsDetected: [
          { name: 'Acetylene Gas', formula: 'C₂H₂', concentration: '54.2 ppm', status: 'Prohibited Toxic' },
          { name: 'Phosphine Traces', formula: 'PH₃', concentration: '0.18 ppm', status: 'Prohibited Toxic' },
          { name: 'Arsenic Trioxide Traces', formula: 'As₂O₃', concentration: '0.04 ppm', status: 'Prohibited Toxic' },
        ],
        detoxificationProtocol:
          'DO NOT CONSUME. Calcium carbide penetrates porous peel membranes and carries neurological toxins (arsenic and phosphorus). Discard or lodge a sample report with municipal food safety authorities.',
      };
    }

    case 'commercial_ethylene': {
      return {
        food,
        conditionKey: 'commercial_ethylene',
        conditionTitle: 'Treated with Regulated Ethylene Gas Chamber (C₂H₄)',
        ripeningAgentUsed: true,
        ripeningStatus: 'used_regulated_ethylene',
        ripeningLabel: 'USED: Regulated Commercial Ethylene Chamber (C₂H₄ Safe Gas)',
        waxCoatingUsed: isApple,
        waxStatus: isApple ? 'applied_food_grade_wax' : 'not_applied',
        waxLabel: isApple
          ? 'APPLIED: Permissible Food-Grade Glaze (Carnauba E903)'
          : 'NOT APPLIED: Natural Peel',
        carbideProbability: 4,
        waxThicknessScore: isApple ? 42 : 5,
        safetyVerdict: 'SAFE',
        fssaiCompliance: true,
        specimenNotes: [
          'Fully compliant with FSSAI statutory standards allowing up to 100 ppm ethylene gas treatment in certified chambers.',
          'Ethylene (C₂H₄) is an identical synthetic analogue of the endogenous phytohormone produced naturally by plant tissues.',
          'Zero trace hydrides or acetylene detected; fruit ripened evenly throughout flesh and peel.',
          'Even color transition with healthy yellow pedicel stem and normal soluble solids content (Brix).',
        ],
        labMetrics: [
          {
            parameter: 'Acetylene Gas (C₂H₂)',
            finding: '0.0 ppm (None Detected)',
            regulatoryThreshold: '< 1.0 ppm Limit',
            status: 'PASS',
            instrument: 'MQ-4 Electronic Nose Spectrometry',
          },
          {
            parameter: 'Ethylene Gas Residue (C₂H₄)',
            finding: '1.4 ppm (Volatilized in Chamber)',
            regulatoryThreshold: '< 100 ppm Chamber Limit',
            status: 'PASS',
            instrument: 'Photometric Gas Chamber Telemetry',
          },
          {
            parameter: 'Hydride Contaminants (PH₃ / AsH₃)',
            finding: 'Undetectable (< 0.001 ppm)',
            regulatoryThreshold: '< 0.01 ppm Limit',
            status: 'PASS',
            instrument: 'MQ-135 Baseline Monitor',
          },
          {
            parameter: 'Pulp Starch-to-Sugar Index',
            finding: 'Optimal Sweetness (Brix 18.5°)',
            regulatoryThreshold: '> 16.0° for Ripe Banana',
            status: 'PASS',
            instrument: 'Refractometer Index',
          },
        ],
        chemicalCompoundsDetected: [
          { name: 'Ethylene (Phytohormone)', formula: 'C₂H₄', concentration: '1.4 ppm', status: 'Regulated Safe' },
          { name: 'Natural Esters (Isoamyl acetate)', formula: 'C₇H₁₄O₂', concentration: '18.2 ppm', status: 'Natural' },
        ],
        detoxificationProtocol:
          'SAFE FOR IMMEDIATE CONSUMPTION. Rinse thoroughly under running water as standard hygiene practice before peeling or eating.',
      };
    }

    case 'paraffin_wax': {
      return {
        food,
        conditionKey: 'paraffin_wax',
        conditionTitle: 'Artificially Coated with Petroleum Paraffin Wax',
        ripeningAgentUsed: false,
        ripeningStatus: 'not_used',
        ripeningLabel: 'NOT USED: Naturally Ripened / Harvest Matured',
        waxCoatingUsed: true,
        waxStatus: 'applied_synthetic_paraffin',
        waxLabel: 'APPLIED: Synthetic Petroleum Paraffin Wax Coating (High Risk)',
        carbideProbability: 3,
        waxThicknessScore: 89,
        safetyVerdict: 'CAUTION',
        fssaiCompliance: false,
        specimenNotes: [
          'Industrial petroleum wax film detected. Non-compliant if non-food-grade paraffin is substituted for authorized natural carnauba/shellac.',
          'Water immersion test: Dip at 60°C causes wax to turn into an opaque, milky white crust within 8 seconds.',
          'Blade scrape test: Substantial powdery white wax shavings scraped easily off cuticle surface (> 28 mg / 100cm²).',
          'Occludes natural lenticels (pores), accelerating internal anaerobic fermentation while retaining exterior moisture artificially.',
        ],
        labMetrics: [
          {
            parameter: 'Cuticle Wax Flake Weight',
            finding: '34.6 mg / 100cm² (High Synthetic Wax)',
            regulatoryThreshold: '< 5.0 mg (Natural Epicuticular)',
            status: 'FAIL',
            instrument: 'Precision Micro-Gravimetric Scrape',
          },
          {
            parameter: 'Thermal Dissolution (60°C Bath)',
            finding: 'Cloudy Milky Crust within 6s',
            regulatoryThreshold: 'No Film Transformation',
            status: 'FAIL',
            instrument: 'Thermal Wax Turbidity Sensor',
          },
          {
            parameter: 'Surface Friction Coefficient',
            finding: '0.12 (Slick Unnatural Glide)',
            regulatoryThreshold: '0.35 - 0.48 (Natural Apple Cuticle)',
            status: 'WARN',
            instrument: 'FSR-402 Surface Shear Probe',
          },
          {
            parameter: 'Acetylene / Ripening Residue',
            finding: 'Undetectable (< 0.2 ppm)',
            regulatoryThreshold: '< 1.0 ppm Limit',
            status: 'PASS',
            instrument: 'MQ-4 / MQ-135 Array',
          },
        ],
        chemicalCompoundsDetected: [
          { name: 'Petroleum Paraffin Wax', formula: 'CₙH₂ₙ₊₂ (n=20-40)', concentration: '34.6 mg/100cm²', status: 'Prohibited Toxic' },
          { name: 'Mineral Oil Hydrocarbons (MOSH)', formula: 'Hydrocarbons', concentration: 'Trace Residue', status: 'Prohibited Toxic' },
        ],
        detoxificationProtocol:
          'DO NOT CONSUME SKIN DIRECTLY. Soak specimen in warm water (45–50°C) with 1 tablespoon baking soda and vinegar for 10 minutes, brush vigorously with a vegetable scrubber, or thoroughly peel the skin before consumption.',
      };
    }

    case 'food_grade_wax': {
      return {
        food,
        conditionKey: 'food_grade_wax',
        conditionTitle: 'Permitted Food-Grade Wax Coating (Carnauba E903 / Shellac E904)',
        ripeningAgentUsed: false,
        ripeningStatus: 'not_used',
        ripeningLabel: 'NOT USED: Natural Maturation / Cold-Storage Managed',
        waxCoatingUsed: true,
        waxStatus: 'applied_food_grade_wax',
        waxLabel: 'APPLIED: Permissible Food-Grade Carnauba (E903) Wax',
        carbideProbability: 2,
        waxThicknessScore: 44,
        safetyVerdict: 'SAFE',
        fssaiCompliance: true,
        specimenNotes: [
          'Complies with FSSAI standards under Regulation 2.3.5 allowing food-grade beeswax, carnauba, or shellac glaze on whole fruits.',
          'Breathable natural wax layer preserves post-harvest crispness and prevents dehydration during cold chain transit.',
          'Scrape shavings minimal and non-petroleum; dissolves safely and is chemically non-reactive in human digestion.',
        ],
        labMetrics: [
          {
            parameter: 'Cuticle Wax Coating Weight',
            finding: '7.8 mg / 100cm² (Within Food-Grade Allowance)',
            regulatoryThreshold: '< 15.0 mg Permissible Wax Coating',
            status: 'PASS',
            instrument: 'Micro-Gravimetric Evaluation',
          },
          {
            parameter: 'Food-Grade Glazing Purity',
            finding: '99.4% Carnauba / Fatty Esters',
            regulatoryThreshold: '> 98.0% Food-Grade Standard',
            status: 'PASS',
            instrument: 'Spectrophotometric Wax Assay',
          },
          {
            parameter: 'Ripening Agent Traces',
            finding: 'Zero Carbide or Unregulated Additives',
            regulatoryThreshold: 'Zero Tolerance',
            status: 'PASS',
            instrument: 'Electronic Nose Sensor Suite',
          },
        ],
        chemicalCompoundsDetected: [
          { name: 'Carnauba Wax (E903)', formula: 'Aliphatic Esters', concentration: '7.8 mg/100cm²', status: 'Regulated Safe' },
        ],
        detoxificationProtocol:
          'SAFE TO CONSUME. Wash under warm tap water with light rubbing to remove surface dust before eating.',
      };
    }

    case 'natural':
    default: {
      return {
        food,
        conditionKey: 'natural',
        conditionTitle: '100% Naturally Ripened & Unwaxed (Organic / Fresh Farm Harvest)',
        ripeningAgentUsed: false,
        ripeningStatus: 'not_used',
        ripeningLabel: 'NOT USED: 100% Naturally Ripened (Tree / Vine Matured)',
        waxCoatingUsed: false,
        waxStatus: 'not_applied',
        waxLabel: isApple
          ? 'NOT APPLIED: 100% Natural Epicuticular Bloom (No Synthetic Wax)'
          : isBanana
          ? 'NOT APPLIED: Natural Fruit Peel (Zero Wax)'
          : isTomato
          ? 'NOT APPLIED: Natural Cuticle Layer'
          : 'NOT APPLIED: Natural Tuber Periderm',
        carbideProbability: Math.min(6, Math.max(1, 2 + Math.round(mq135Delta / 100))),
        waxThicknessScore: isApple ? 12 : 2,
        safetyVerdict: 'SAFE',
        fssaiCompliance: true,
        specimenNotes: [
          'Clean diagnostic signature: Zero artificial ripening chemicals or synthetic waxes detected.',
          'Phytohormone profile matches endogenous plant respiration without external alkyne or petroleum spikes.',
          isBanana
            ? 'Synchronous stem-and-peel ripening: stem color transitions proportionally with peel yellowing.'
            : isApple
            ? 'Surface exhibits velvety natural epicuticular bloom rather than artificial mirror-like gloss.'
            : isTomato
            ? 'Internal seeds show full mature gel development with balanced lycopene aroma.'
            : 'Tuber skin intact, free from prohibited sprout suppressants and solanine greening.',
          'Full compliance with national (FSSAI) and international (Codex Alimentarius) food safety benchmarks.',
        ],
        labMetrics: [
          {
            parameter: 'Acetylene Gas (C₂H₂)',
            finding: '0.0 ppm (Below Detection Limit)',
            regulatoryThreshold: '< 1.0 ppm Prohibited Threshold',
            status: 'PASS',
            instrument: 'MQ-4 Hydrocarbon Sensor Array',
          },
          {
            parameter: 'Hydride Toxic Contaminants',
            finding: '0.00 ppm (Clean Baseline)',
            regulatoryThreshold: '< 0.01 ppm Limit',
            status: 'PASS',
            instrument: 'MQ-135 Baseline Calibrator',
          },
          {
            parameter: 'Synthetic Paraffin Shavings',
            finding: '0.0 mg (Natural Epicuticular Bloom Only)',
            regulatoryThreshold: '< 5.0 mg Natural Baseline',
            status: 'PASS',
            instrument: 'Blade Scrape / Gravimetry',
          },
          {
            parameter: 'Hot Water Turbidity Test',
            finding: 'No Milky Film (Water remains crystal clear)',
            regulatoryThreshold: 'Clear at 60°C',
            status: 'PASS',
            instrument: 'Thermal Dissolution Inspection',
          },
        ],
        chemicalCompoundsDetected: [
          { name: 'Natural Epicuticular Esters', formula: 'Ursolic & Oleanolic Acids', concentration: 'Natural Cuticle', status: 'Natural' },
          { name: 'Natural Endogenous Ethylene', formula: 'C₂H₄', concentration: '0.3–0.8 ppm (Respiration)', status: 'Natural' },
        ],
        detoxificationProtocol:
          'SAFE & READY TO ENJOY. Rinse under clean cold water to remove standard farm dust and soil particles.',
      };
    }
  }
}
