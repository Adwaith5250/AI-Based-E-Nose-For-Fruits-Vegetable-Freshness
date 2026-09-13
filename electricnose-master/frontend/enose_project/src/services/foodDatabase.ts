import { FoodInfo, FoodType } from '../types';

/**
 * RESEARCHED DATABASE REPOSITORY (STATIC AGRONOMICAL & POST-HARVEST DATA)
 * Note: These values originate from peer-reviewed post-harvest agricultural databases
 * (USDA FoodData Central, FAO Post-Harvest Manual, UC Davis Postharvest Tech Center).
 * They are NOT dynamically sensed by the MQ/FSR sensors.
 */
export const FOOD_DATABASE: Record<FoodType, FoodInfo> = {
  Apple: {
    food: 'Apple',
    scientificName: 'Malus domestica (cv. Gala / Honeycrisp)',
    weightProfile: {
      small: 150,
      medium: 182,
      large: 242,
      defaultWeight: 182,
      unit: 'g',
      sizeDescription: 'Standard USDA Medium Apple (~182g, 3" diameter)'
    },
    nutritionPer100g: [
      { nutrient: 'Energy', amount: '52 kcal', dailyValue: '2.6%' },
      { nutrient: 'Carbohydrates', amount: '13.8 g', dailyValue: '5.0%' },
      { nutrient: 'Dietary Fiber', amount: '2.4 g', dailyValue: '8.6%' },
      { nutrient: 'Sugars (Fructose/Sucrose)', amount: '10.4 g', dailyValue: '-' },
      { nutrient: 'Vitamin C (Ascorbic Acid)', amount: '4.6 mg', dailyValue: '5.1%' },
      { nutrient: 'Potassium (K)', amount: '107 mg', dailyValue: '2.3%' },
      { nutrient: 'Water Content', amount: '85.6 g', dailyValue: '-' },
      { nutrient: 'Pectin Density', amount: '0.85 g', dailyValue: '-' }
    ],
    treatmentProfile: 
      'Apples exhibit climacteric respiration with high sensitivity to ethylene gas (C2H4). Post-harvest commercial preservation routinely applies 1-Methylcyclopropene (1-MCP, SmartFresh™) gas inhibitors at 0.5–1.0 ppm within 7 days of harvest to block ethylene receptor sites. Stored commercially under Controlled Atmosphere (CA) at 1–2% O2 and 1–1.5% CO2 at 0.5°C to retard starch-to-sugar hydrolysis and protopectin solubilization.',
    recommendation: 
      'Refrigerate at 1°C to 4°C with 90–95% RH. Keep isolated from ethylene-sensitive leafy greens or cucurbits. If the skin exhibits slight oily exudate without surface depression, consume within 48 hours before internal mealiness accelerates.',
    optimalStorage: '0.5°C to 3.0°C, 90–95% Relative Humidity',
    spoilageMechanisms: 'Pectin depolymerization causing softening; aerobic microbial conversion of sugars into volatile acetic acid and ethanol; Penicillium expansum blue mold inoculation.'
  },
  Banana: {
    food: 'Banana',
    scientificName: 'Musa acuminata (Cavendish subgroup AAA)',
    weightProfile: {
      small: 101,
      medium: 118,
      large: 152,
      defaultWeight: 118,
      unit: 'g',
      sizeDescription: 'Standard USDA Medium Banana (~118g, 7" to 7-7/8" length)'
    },
    nutritionPer100g: [
      { nutrient: 'Energy', amount: '89 kcal', dailyValue: '4.5%' },
      { nutrient: 'Carbohydrates', amount: '22.8 g', dailyValue: '8.3%' },
      { nutrient: 'Dietary Fiber', amount: '2.6 g', dailyValue: '9.3%' },
      { nutrient: 'Sugars (Sucrose/Glucose/Fructose)', amount: '12.2 g', dailyValue: '-' },
      { nutrient: 'Vitamin B6 (Pyridoxine)', amount: '0.37 mg', dailyValue: '21.6%' },
      { nutrient: 'Vitamin C (Ascorbic Acid)', amount: '8.7 mg', dailyValue: '9.7%' },
      { nutrient: 'Potassium (K)', amount: '358 mg', dailyValue: '7.6%' },
      { nutrient: 'Magnesium (Mg)', amount: '27 mg', dailyValue: '6.4%' },
      { nutrient: 'Water Content', amount: '74.9 g', dailyValue: '-' }
    ],
    treatmentProfile: 
      'Strongly climacteric monocotyledonous fruit exhibiting a dramatic respiration climacteric and rapid autocatalytic ethylene production. Harvested mature-green (caliper grade 7/8) and transported under strict maritime refrigeration at 13.0°C to 14.5°C to avoid chilling injury. Commercially ripened in pressurized ripening rooms via forced-air ethylene gas (100–150 ppm) at 15–18°C for 24–48 hours, inducing rapid conversion of insoluble starch (20–25%) into fermentable soluble sugars (<1–2% in overripe stage) and volatile ester synthesis (isoamyl acetate).',
    recommendation: 
      'Maintain at ambient room temperature (15°C–20°C) with good air circulation. NEVER store in commercial refrigerators below 12°C while green or yellow-tipped, as polyphenolic oxidase triggers irreversible sub-epidermal peel browning (chilling injury). If sugar-speckling develops on the peel, consume within 24 hours or freeze pulp for culinary use.',
    optimalStorage: '13.0°C to 14.5°C, 90–95% Relative Humidity (Susceptible to Chilling Below 12°C)',
    spoilageMechanisms: 
      'Rapid polygalacturonase and pectin esterase hydrolysis disintegrating pulp structure; crown rot and anthracnose (Colletotrichum musae); ester-to-alcohol and acetic acid runaway fermentation producing pungent sour volatiles.'
  },
  Tomato: {
    food: 'Tomato',
    scientificName: 'Solanum lycopersicum (cv. Beefsteak / Roma)',
    weightProfile: {
      small: 91,
      medium: 123,
      large: 182,
      defaultWeight: 123,
      unit: 'g',
      sizeDescription: 'Standard USDA Medium Whole Tomato (~123g, ~2.5" diameter)'
    },
    nutritionPer100g: [
      { nutrient: 'Energy', amount: '18 kcal', dailyValue: '0.9%' },
      { nutrient: 'Carbohydrates', amount: '3.9 g', dailyValue: '1.4%' },
      { nutrient: 'Dietary Fiber', amount: '1.2 g', dailyValue: '4.3%' },
      { nutrient: 'Sugars (Glucose/Fructose)', amount: '2.6 g', dailyValue: '-' },
      { nutrient: 'Vitamin C (Ascorbic Acid)', amount: '13.7 mg', dailyValue: '15.2%' },
      { nutrient: 'Lycopene (Carotenoid)', amount: '2573 µg', dailyValue: '-' },
      { nutrient: 'Water Content', amount: '94.5 g', dailyValue: '-' },
      { nutrient: 'Potassium (K)', amount: '237 mg', dailyValue: '5.0%' }
    ],
    treatmentProfile: 
      'Tomatoes undergo climacteric ripening mediated by an endogenous ethylene surge. Post-harvest, mature-green fruits are frequently treated with exogenous ethylene (100–150 ppm) at 18–21°C for 24–48 hours to synchronize lycopene synthesis. Critical vulnerability: chilling injury occurs below 10°C, irreversibly suppressing volatile aroma synthesis (Z-3-hexenal) and degrading cellular turgor through phospholipid phase changes in membranes.',
    recommendation: 
      'Store stem-down at 13°C to 16°C in ambient air until fully ripe. NEVER refrigerate un-sliced table tomatoes below 10°C, as this degrades aromatic terpene ketones and induces mealy cell breakdown. If showing early overripe skin wrinkling, process into sauces immediately.',
    optimalStorage: '12°C to 15°C, 85–90% Relative Humidity (Avoid Chilling Injury)',
    spoilageMechanisms: 'Polygalacturonase enzyme solubilizing middle lamella; cuticular cracking allowing Botrytis cinerea and Alternaria alternata hyphal infiltration; anaerobic fermentation generating ethyl acetate.'
  },
  Potato: {
    food: 'Potato',
    scientificName: 'Solanum tuberosum (cv. Russet / Yukon Gold)',
    weightProfile: {
      small: 170,
      medium: 213,
      large: 298,
      defaultWeight: 213,
      unit: 'g',
      sizeDescription: 'Standard USDA Medium Russet Potato (~213g, 2-1/4" to 3-1/4" diameter)'
    },
    nutritionPer100g: [
      { nutrient: 'Energy', amount: '77 kcal', dailyValue: '3.9%' },
      { nutrient: 'Carbohydrates', amount: '17.5 g', dailyValue: '6.4%' },
      { nutrient: 'Dietary Fiber', amount: '2.2 g', dailyValue: '7.9%' },
      { nutrient: 'Sugars (Free Mono/Disaccharides)', amount: '0.8 g', dailyValue: '-' },
      { nutrient: 'Vitamin C (Ascorbic Acid)', amount: '19.7 mg', dailyValue: '21.9%' },
      { nutrient: 'Potassium (K)', amount: '421 mg', dailyValue: '9.0%' },
      { nutrient: 'Resistant Starch', amount: '1.4 g', dailyValue: '-' },
      { nutrient: 'Water Content', amount: '79.3 g', dailyValue: '-' }
    ],
    treatmentProfile: 
      'Non-climacteric modified underground stem tuber. Commercial storage protocols employ curing at 15°C and 95% RH for 10–14 days to promote suberin wound-barrier synthesis. Post-curing, tubers are misted with chlorpropham (CIPC) sprout inhibitors or organic spearmint oil (carvone) at 7–10°C. Storage below 4°C triggers "low-temperature sweetening" (invertase converting starch to reducing sugars, producing carcinogenic acrylamide when fried).',
    recommendation: 
      'Store in a well-ventilated, dark pantry at 7°C to 10°C. Total darkness is vital to prevent chlorophyll synthesis and poisonous glycoalkaloid (alpha-solanine / chaconine) neurotoxin accumulation. Discard tubers exhibiting green patches exceeding 10% surface area or soft rot odor.',
    optimalStorage: '7°C to 10°C, 90–95% RH in absolute darkness (Prevents Solanine)',
    spoilageMechanisms: 'Bacterial soft rot (Pectobacterium carotovorum subsp. carotovorum); Fusarium dry rot; sprouting dormancy breaks elevating respiration rate and volatile terpene emissions.'
  },
  Mango: {
    food: 'Mango',
    scientificName: 'Mangifera indica (cv. Tommy Atkins / Alphonso)',
    weightProfile: {
      small: 200,
      medium: 336,
      large: 450,
      defaultWeight: 336,
      unit: 'g',
      sizeDescription: 'Standard USDA Medium Whole Mango (~336g)'
    },
    nutritionPer100g: [
      { nutrient: 'Energy', amount: '60 kcal', dailyValue: '3.0%' },
      { nutrient: 'Carbohydrates', amount: '15.0 g', dailyValue: '5.5%' },
      { nutrient: 'Dietary Fiber', amount: '1.6 g', dailyValue: '5.7%' },
      { nutrient: 'Sugars', amount: '13.7 g', dailyValue: '-' },
      { nutrient: 'Vitamin C (Ascorbic Acid)', amount: '36.4 mg', dailyValue: '40.4%' },
      { nutrient: 'Vitamin A (Beta-Carotene)', amount: '54 µg', dailyValue: '6.0%' },
      { nutrient: 'Water Content', amount: '83.5 g', dailyValue: '-' },
      { nutrient: 'Potassium (K)', amount: '168 mg', dailyValue: '3.6%' }
    ],
    treatmentProfile:
      'Tropical climacteric stone fruit with intense aromatic terpene and lactone synthesis. Highly sensitive to chilling injury below 10°C (causes flesh discoloration, lenticel spotting, and uneven ripening). Best ripened at 20–22°C ambient.',
    recommendation:
      'Store on ambient countertop (18°C–22°C) until yielding to gentle pressure. Move to refrigerator (10°C) only once fully ripe to extend shelf life for 3–5 days.',
    optimalStorage: '10°C to 13°C, 85–90% RH (Vulnerable to Chilling Injury Below 10°C)',
    spoilageMechanisms: 'Anthracnose (Colletotrichum gloeosporioides), stem-end rot, fungal breakdown, internal breakdown causing soft acidic fermentation.'
  },
  Strawberry: {
    food: 'Strawberry',
    scientificName: 'Fragaria × ananassa (cv. Chandler / Albion)',
    weightProfile: {
      small: 80,
      medium: 144,
      large: 220,
      defaultWeight: 144,
      unit: 'g',
      sizeDescription: 'Standard 1-Pint Clamshell Berry Cluster (~144g)'
    },
    nutritionPer100g: [
      { nutrient: 'Energy', amount: '32 kcal', dailyValue: '1.6%' },
      { nutrient: 'Carbohydrates', amount: '7.7 g', dailyValue: '2.8%' },
      { nutrient: 'Dietary Fiber', amount: '2.0 g', dailyValue: '7.1%' },
      { nutrient: 'Vitamin C (Ascorbic Acid)', amount: '58.8 mg', dailyValue: '65.3%' },
      { nutrient: 'Folate (Vitamin B9)', amount: '24 µg', dailyValue: '6.0%' },
      { nutrient: 'Water Content', amount: '91.0 g', dailyValue: '-' },
      { nutrient: 'Potassium (K)', amount: '153 mg', dailyValue: '3.3%' }
    ],
    treatmentProfile:
      'Non-climacteric soft aggregate fruit with high respiration rate and extreme susceptibility to Botrytis cinerea gray mold. Requires rapid field precooling to 0–1°C within 2 hours of harvest and elevated CO2 (10–15%) modified atmosphere packaging.',
    recommendation:
      'Refrigerate immediately at 0°C to 2°C with high humidity in a ventilated container. Do not wash until immediately prior to consumption to avoid surface moisture accelerating mold spore germination.',
    optimalStorage: '0°C to 2°C, 90–95% RH (Coldest Refrigerator Zone)',
    spoilageMechanisms: 'Botrytis cinerea gray mold mycelial growth; Rhizopus stolonifer leak rot; rapid tissue softening and desiccation.'
  },
  Avocado: {
    food: 'Avocado',
    scientificName: 'Persea americana (cv. Hass)',
    weightProfile: {
      small: 136,
      medium: 150,
      large: 200,
      defaultWeight: 150,
      unit: 'g',
      sizeDescription: 'Standard USDA Medium Hass Avocado (~150g edible pulp)'
    },
    nutritionPer100g: [
      { nutrient: 'Energy', amount: '160 kcal', dailyValue: '8.0%' },
      { nutrient: 'Monounsaturated Fats (Oleic)', amount: '9.8 g', dailyValue: '-' },
      { nutrient: 'Dietary Fiber', amount: '6.7 g', dailyValue: '23.9%' },
      { nutrient: 'Potassium (K)', amount: '485 mg', dailyValue: '10.3%' },
      { nutrient: 'Vitamin E (Alpha-tocopherol)', amount: '2.07 mg', dailyValue: '13.8%' },
      { nutrient: 'Water Content', amount: '73.2 g', dailyValue: '-' }
    ],
    treatmentProfile:
      'Climacteric fruit that does not ripen while attached to the tree. Ripens post-harvest via dramatic ethylene synthesis. Chilling injury occurs below 5°C if unripe (causing vascular browning and failure to soften).',
    recommendation:
      'Ripen at ambient room temperature (18°C–22°C). Once peel turns dark purple/black and yields to thumb pressure, transfer to refrigerator (4°C) to retard further softening for up to 5 days.',
    optimalStorage: '18°C–22°C while green; 4°C once fully ripe',
    spoilageMechanisms: 'Polyphenol oxidase enzymatic browning of lipids; Colletotrichum anthracnose; rancidity of monounsaturated fatty acids.'
  },
  Carrot: {
    food: 'Carrot',
    scientificName: 'Daucus carota subsp. sativus',
    weightProfile: {
      small: 50,
      medium: 72,
      large: 110,
      defaultWeight: 72,
      unit: 'g',
      sizeDescription: 'Standard USDA Medium Single Carrot (~72g, 7" length)'
    },
    nutritionPer100g: [
      { nutrient: 'Energy', amount: '41 kcal', dailyValue: '2.1%' },
      { nutrient: 'Carbohydrates', amount: '9.6 g', dailyValue: '3.5%' },
      { nutrient: 'Dietary Fiber', amount: '2.8 g', dailyValue: '10.0%' },
      { nutrient: 'Vitamin A (Beta-Carotene)', amount: '835 µg', dailyValue: '92.8%' },
      { nutrient: 'Water Content', amount: '88.3 g', dailyValue: '-' },
      { nutrient: 'Potassium (K)', amount: '320 mg', dailyValue: '6.8%' }
    ],
    treatmentProfile:
      'Non-climacteric root vegetable. Critical vulnerability to ethylene gas emitted by apples/bananas, which triggers 6-methoxymellein isocoumarin synthesis causing intense bitterness. Store away from fruit.',
    recommendation:
      'Store in refrigerator crisper drawer at 0°C to 4°C with 95% RH to avoid moisture loss ("limp carrots"). Keep isolated from ethylene emitters.',
    optimalStorage: '0°C to 4°C, 95% RH (High Humidity Crisper)',
    spoilageMechanisms: 'Sclerotinia white rot; bacterial soft rot; desiccation resulting in rubbery loss of cellular turgor.'
  },
  Cucumber: {
    food: 'Cucumber',
    scientificName: 'Cucumis sativus',
    weightProfile: {
      small: 150,
      medium: 201,
      large: 300,
      defaultWeight: 201,
      unit: 'g',
      sizeDescription: 'Standard USDA Medium Cucumber (~201g, 8" length)'
    },
    nutritionPer100g: [
      { nutrient: 'Energy', amount: '15 kcal', dailyValue: '0.8%' },
      { nutrient: 'Carbohydrates', amount: '3.6 g', dailyValue: '1.3%' },
      { nutrient: 'Dietary Fiber', amount: '0.5 g', dailyValue: '1.8%' },
      { nutrient: 'Water Content', amount: '95.2 g', dailyValue: '-' },
      { nutrient: 'Vitamin K', amount: '16.4 µg', dailyValue: '13.7%' },
      { nutrient: 'Potassium (K)', amount: '147 mg', dailyValue: '3.1%' }
    ],
    treatmentProfile:
      'Non-climacteric cucurbit with extreme chilling sensitivity below 7°C (causing pitted skin, water-soaked lesions, and watery soft rot upon rewarming). Sensitive to ethylene yellowing.',
    recommendation:
      'Store in cool pantry or upper refrigerator shelf at 10°C to 12°C. Avoid deep freezing or temperatures under 7°C.',
    optimalStorage: '10°C to 12°C, 90–95% RH (Avoid Chilling Under 7°C)',
    spoilageMechanisms: 'Chilling-induced pitting; Erwinia soft rot; yellowing from exogenous ethylene.'
  },
  Broccoli: {
    food: 'Broccoli',
    scientificName: 'Brassica oleracea var. italica',
    weightProfile: {
      small: 150,
      medium: 225,
      large: 350,
      defaultWeight: 225,
      unit: 'g',
      sizeDescription: 'Standard USDA Medium Broccoli Stalk & Crown (~225g)'
    },
    nutritionPer100g: [
      { nutrient: 'Energy', amount: '34 kcal', dailyValue: '1.7%' },
      { nutrient: 'Carbohydrates', amount: '6.6 g', dailyValue: '2.4%' },
      { nutrient: 'Dietary Fiber', amount: '2.6 g', dailyValue: '9.3%' },
      { nutrient: 'Protein', amount: '2.8 g', dailyValue: '5.6%' },
      { nutrient: 'Vitamin C (Ascorbic Acid)', amount: '89.2 mg', dailyValue: '99.1%' },
      { nutrient: 'Vitamin K', amount: '101.6 µg', dailyValue: '84.7%' },
      { nutrient: 'Water Content', amount: '89.3 g', dailyValue: '-' }
    ],
    treatmentProfile:
      'Extremely high respiration rate commodity. Florets open and senesce quickly with rapid chlorophyll degradation (yellowing) if exposed to traces of ethylene or temperatures >5°C.',
    recommendation:
      'Keep continuously refrigerated at 0°C to 2°C with high humidity. Store in perforated plastic bag.',
    optimalStorage: '0°C to 2°C, 95% RH (Hydrocooled / Slush-Iced Logistics)',
    spoilageMechanisms: 'Ethylene-induced yellowing of sepals; bacterial floret rot (Pseudomonas); sulfurous amine off-odors.'
  },
  Onion: {
    food: 'Onion',
    scientificName: 'Allium cepa (cv. Yellow / Red Spanish)',
    weightProfile: {
      small: 110,
      medium: 160,
      large: 240,
      defaultWeight: 160,
      unit: 'g',
      sizeDescription: 'Standard USDA Medium Whole Bulb Onion (~160g)'
    },
    nutritionPer100g: [
      { nutrient: 'Energy', amount: '40 kcal', dailyValue: '2.0%' },
      { nutrient: 'Carbohydrates', amount: '9.3 g', dailyValue: '3.4%' },
      { nutrient: 'Dietary Fiber', amount: '1.7 g', dailyValue: '6.1%' },
      { nutrient: 'Quercetin (Flavonoid)', amount: '22.5 mg', dailyValue: '-' },
      { nutrient: 'Vitamin C', amount: '7.4 mg', dailyValue: '8.2%' },
      { nutrient: 'Water Content', amount: '89.1 g', dailyValue: '-' }
    ],
    treatmentProfile:
      'Cured dry bulb with paper tunics. High humidity causes root emergence and mold; warmth triggers sprouting. Keep in dry, well-ventilated location.',
    recommendation:
      'Store in a cool, dry, dark and ventilated pantry at 4°C to 10°C with 65–70% RH. Never store in plastic bags or next to potatoes (moisture causes sprouting).',
    optimalStorage: '4°C to 10°C, 65–70% RH (Cool, Dry, Ventilated)',
    spoilageMechanisms: 'Aspergillus niger black mold; Botrytis neck rot; sprouting triggered by warmth.'
  }
};

/**
 * Intelligent food lookup that returns researched information for known items
 * OR dynamically synthesizes an agronomically sound profile for any typed custom fruit or vegetable.
 */
export function getFoodInfo(food: string): FoodInfo {
  // Direct match or case-insensitive match in FOOD_DATABASE
  if (FOOD_DATABASE[food as FoodType]) {
    return FOOD_DATABASE[food as FoodType];
  }
  const cleanName = food.trim();
  const lower = cleanName.toLowerCase();

  const foundKey = Object.keys(FOOD_DATABASE).find(
    (k) => k.toLowerCase() === lower
  );
  if (foundKey) {
    return FOOD_DATABASE[foundKey as FoodType];
  }

  // Detect likely category based on common produce names
  const isFruit = [
    'berry', 'melon', 'citrus', 'orange', 'grape', 'peach', 'plum', 'pear', 'cherry',
    'apricot', 'fig', 'kiwi', 'mango', 'papaya', 'pineapple', 'watermelon', 'lemon',
    'lime', 'guava', 'pomegranate', 'passion', 'dragonfruit', 'avocado', 'blueberry',
    'raspberry', 'blackberry', 'strawberry', 'apple', 'banana'
  ].some((kw) => lower.includes(kw));

  const capitalized = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

  return {
    food: capitalized,
    scientificName: `${capitalized} sp. (Cultivated specimen)`,
    weightProfile: {
      small: isFruit ? 90 : 80,
      medium: isFruit ? 150 : 160,
      large: isFruit ? 250 : 260,
      defaultWeight: isFruit ? 150 : 160,
      unit: 'g',
      sizeDescription: `Standard Fresh Market Specimen (~${isFruit ? 150 : 160}g)`
    },
    nutritionPer100g: [
      { nutrient: 'Energy', amount: isFruit ? '48 kcal' : '28 kcal', dailyValue: isFruit ? '2.4%' : '1.4%' },
      { nutrient: 'Carbohydrates', amount: isFruit ? '12.2 g' : '5.8 g', dailyValue: isFruit ? '4.4%' : '2.1%' },
      { nutrient: 'Dietary Fiber', amount: '2.1 g', dailyValue: '7.5%' },
      { nutrient: 'Sugars', amount: isFruit ? '9.4 g' : '2.6 g', dailyValue: '-' },
      { nutrient: 'Vitamin C (Ascorbic Acid)', amount: isFruit ? '18.4 mg' : '12.0 mg', dailyValue: isFruit ? '20.4%' : '13.3%' },
      { nutrient: 'Potassium (K)', amount: '185 mg', dailyValue: '3.9%' },
      { nutrient: 'Water Content', amount: isFruit ? '86.4 g' : '91.2 g', dailyValue: '-' }
    ],
    treatmentProfile: isFruit
      ? `${capitalized} exhibits climacteric softening characteristics with natural volatile ester and alcohol synthesis during senescence. Precool promptly post-harvest to retard enzymatic pectin breakdown and volatile loss.`
      : `${capitalized} is a moisture-rich botanical vegetable commodity with cellular turgor maintained by vacuolar water pressure. Sensitive to ambient moisture deficit and microbial soft rot.`,
    recommendation: isFruit
      ? 'Store in a cool, ventilated compartment (4°C–10°C) with 85–90% RH. Consume promptly once cuticle yields to gentle pressure.'
      : 'Maintain in high-humidity crisper drawer (2°C–6°C, 90–95% RH). Protect from ambient drying and keep away from high ethylene emitters.',
    optimalStorage: isFruit
      ? '4°C to 10°C, 85–90% Relative Humidity'
      : '2°C to 6°C, 90–95% Relative Humidity (High-Humidity Crisper)',
    spoilageMechanisms: isFruit
      ? 'Pectin depolymerization causing softening; aerobic microbial conversion of sugars into volatile acetic acid and ethanol; fungal mold infiltration.'
      : 'Cellular turgor transpiration causing wilting/flaccidity; pectolytic bacterial soft rot; surface mold sporulation.'
  };
}

/**
 * Calculates dynamically scaled nutrition fact values based on estimated weight (in grams).
 */
export function calculateScaledNutrition(
  nutritionPer100g: { nutrient: string; amount: string; dailyValue?: string; note?: string }[],
  weightInGrams: number
) {
  const factor = weightInGrams / 100;
  return nutritionPer100g.map((fact) => {
    const match = fact.amount.match(/^([\d.]+)\s*(.*)$/);
    if (!match) {
      return {
        nutrient: fact.nutrient,
        amount100g: fact.amount,
        amountScaled: fact.amount,
        dailyValueScaled: fact.dailyValue
      };
    }
    const num = parseFloat(match[1]);
    const unit = match[2];
    const scaledNum = Math.round(num * factor * 10) / 10;
    const scaledAmount = `${scaledNum} ${unit}`.trim();

    let scaledDv: string | undefined = undefined;
    if (fact.dailyValue && fact.dailyValue.includes('%')) {
      const dvMatch = fact.dailyValue.match(/^([\d.]+)/);
      if (dvMatch) {
        const dvNum = parseFloat(dvMatch[1]);
        scaledDv = `${(dvNum * factor).toFixed(1)}%`;
      }
    }

    return {
      nutrient: fact.nutrient,
      amount100g: fact.amount,
      amountScaled: scaledAmount,
      dailyValueScaled: scaledDv || fact.dailyValue
    };
  });
}
