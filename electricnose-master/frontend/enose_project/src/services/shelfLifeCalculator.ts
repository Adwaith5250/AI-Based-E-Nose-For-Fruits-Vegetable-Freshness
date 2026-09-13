import { FoodType, FreshnessStage, StorageEnvironment, StoragePresetKey, CalculatedShelfLife } from '../types';

export const STORAGE_PRESETS: Record<StoragePresetKey, StorageEnvironment> = {
  refrigerator: {
    id: 'refrigerator',
    presetKey: 'refrigerator',
    name: 'Refrigerator (Crisper Drawer)',
    tempC: 4,
    rhPct: 88,
    isDark: true,
    isVentilated: false,
    isCustom: false,
    customNotes: 'Chilled high-humidity compartment (3–5°C). Suppresses respiration & volatile decay.'
  },
  room_temp: {
    id: 'room_temp',
    presetKey: 'room_temp',
    name: 'Kitchen Countertop / Fruit Bowl',
    tempC: 21,
    rhPct: 55,
    isDark: false,
    isVentilated: true,
    isCustom: false,
    customNotes: 'Ambient open-air condition (20–22°C). Natural air exchange at normal ripening rate.'
  },
  pantry_cellar: {
    id: 'pantry_cellar',
    presetKey: 'pantry_cellar',
    name: 'Dark Pantry / Root Cellar',
    tempC: 11,
    rhPct: 70,
    isDark: true,
    isVentilated: true,
    isCustom: false,
    customNotes: 'Cool, dark, ventilated shelf (10–13°C). Ideal for root tubers and bulb vegetables.'
  },
  chilled_commercial: {
    id: 'chilled_commercial',
    presetKey: 'chilled_commercial',
    name: 'Cold-Chain / Walk-In Chiller',
    tempC: 2,
    rhPct: 92,
    isDark: true,
    isVentilated: false,
    isCustom: false,
    customNotes: 'Commercial chilled logistics (1–3°C) with controlled vapor pressure saturation.'
  },
  warm_sun: {
    id: 'warm_sun',
    presetKey: 'warm_sun',
    name: 'Warm / Direct Sunlight / Balcony',
    tempC: 29,
    rhPct: 45,
    isDark: false,
    isVentilated: true,
    isCustom: false,
    customNotes: 'Elevated thermal zone (>27°C). Greatly accelerates respiration and ethylene output.'
  },
  custom: {
    id: 'custom',
    presetKey: 'custom',
    name: 'Custom User Location',
    tempC: 20,
    rhPct: 60,
    isDark: false,
    isVentilated: true,
    isCustom: true,
    customNotes: 'User-specified storage microclimate.'
  }
};

/**
 * Intelligent keyword-based parser for user-typed storage locations.
 * Automatically recommends estimated temperature, humidity, and lighting.
 */
export function deduceMicroclimateFromText(text: string): {
  tempC: number;
  rhPct: number;
  isDark: boolean;
  isVentilated: boolean;
  suggestedPreset: StoragePresetKey;
} {
  const lower = text.toLowerCase();

  // Refrigerated / Freezing / Chilled keywords
  if (
    lower.includes('fridge') ||
    lower.includes('refrigerator') ||
    lower.includes('crisper') ||
    lower.includes('cooler') ||
    lower.includes('chiller') ||
    lower.includes('ice box') ||
    lower.includes('cold box')
  ) {
    return {
      tempC: 4,
      rhPct: 88,
      isDark: true,
      isVentilated: false,
      suggestedPreset: 'refrigerator'
    };
  }

  // Cool / Dark / Cellar / Pantry keywords
  if (
    lower.includes('cellar') ||
    lower.includes('pantry') ||
    lower.includes('basement') ||
    lower.includes('cupboard') ||
    lower.includes('cabinet') ||
    lower.includes('drawer') ||
    lower.includes('dark') ||
    lower.includes('closet') ||
    lower.includes('under sink')
  ) {
    return {
      tempC: 11,
      rhPct: 70,
      isDark: true,
      isVentilated: true,
      suggestedPreset: 'pantry_cellar'
    };
  }

  // Warm / Sun / Outdoor / Heated keywords
  if (
    lower.includes('balcony') ||
    lower.includes('sun') ||
    lower.includes('window') ||
    lower.includes('porch') ||
    lower.includes('terrace') ||
    lower.includes('garage') ||
    lower.includes('shed') ||
    lower.includes('heater') ||
    lower.includes('warm') ||
    lower.includes('attic')
  ) {
    return {
      tempC: 28,
      rhPct: 45,
      isDark: false,
      isVentilated: true,
      suggestedPreset: 'warm_sun'
    };
  }

  // Default to ambient countertop
  return {
    tempC: 21,
    rhPct: 55,
    isDark: false,
    isVentilated: true,
    suggestedPreset: 'room_temp'
  };
}

/**
 * Calculates remaining shelf life based on specimen, detected freshness stage,
 * and user's selected or typed storage area microclimate.
 */
export function calculateStorageShelfLife(
  food: FoodType,
  status: FreshnessStage,
  storage: StorageEnvironment
): CalculatedShelfLife {
  const now = new Date();
  const temp = storage.tempC;
  const isDark = storage.isDark;
  const storageName = storage.isCustom && storage.name ? storage.name : storage.name;

  // Rotten specimen has zero shelf life anywhere
  if (status === 'Rotten') {
    return {
      displayShelfLife: '0 Days (Spoiled)',
      daysMin: 0,
      daysMax: 0,
      expiryDate: 'Immediate Discard',
      storageSuitability: 'hazardous',
      suitabilityBadge: 'Bio-Hazard / Discard',
      storageImpactNote: `Specimen exhibits extensive microbial decomposition and cellular breakdown. Storage in ${storageName} cannot restore safety.`,
      temperatureFactor: 1.0,
      specialWarning: 'Pathogenic molds and bacterial rot active. Discard or direct to compost lot.'
    };
  }

  // Overripe specimen has very short shelf life anywhere
  if (status === 'Overripe') {
    const hoursMin = temp <= 5 ? 24 : temp <= 15 ? 18 : 8;
    const hoursMax = temp <= 5 ? 48 : temp <= 15 ? 30 : 16;
    const daysFraction = hoursMax / 24;
    const expiry = new Date(now.getTime() + daysFraction * 24 * 60 * 60 * 1000);

    return {
      displayShelfLife: `${hoursMin}–${hoursMax} Hours`,
      daysMin: Math.round((hoursMin / 24) * 10) / 10,
      daysMax: Math.round((hoursMax / 24) * 10) / 10,
      expiryDate: expiry.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      storageSuitability: temp <= 5 ? 'acceptable' : 'suboptimal',
      suitabilityBadge: 'Consume Promptly',
      storageImpactNote: `Cell wall structure collapsed and ethanol vapor detected. Storage in ${storageName} (${temp}°C) provides ${hoursMin}–${hoursMax} hours before unpalatable spoilage.`,
      temperatureFactor: temp > 22 ? 2.2 : 1.0,
      specialWarning: 'High fermentation volatile emission. Divert to cooking, pureeing, or freeze immediately.'
    };
  }

  // Calculations for Fresh and Ripe stages:
  let daysMin = 5;
  let daysMax = 7;
  let suitability: 'optimal' | 'acceptable' | 'suboptimal' | 'hazardous' = 'acceptable';
  let badge = 'Standard Holding';
  let impactNote = '';
  let warning: string | undefined = undefined;

  // Specimen-specific biological models:
  if (food === 'Apple') {
    if (temp <= 4) {
      // Refrigerator / Cold storage
      daysMin = status === 'Fresh' ? 21 : 10;
      daysMax = status === 'Fresh' ? 35 : 16;
      suitability = 'optimal';
      badge = 'Optimal Cold-Chain Storage';
      impactNote = `Cold temperatures (${temp}°C) sharply suppress apple ethylene emission and pectinase activity, extending crispness up to ~${daysMax} days.`;
    } else if (temp <= 14) {
      // Cool cellar / pantry
      daysMin = status === 'Fresh' ? 14 : 6;
      daysMax = status === 'Fresh' ? 21 : 9;
      suitability = 'optimal';
      badge = 'Good Cellar Longevity';
      impactNote = `Cool condition (${temp}°C) preserves cell turgor and decelerates starch-to-sugar conversion.`;
    } else if (temp <= 23) {
      // Ambient room temp
      daysMin = status === 'Fresh' ? 7 : 3;
      daysMax = status === 'Fresh' ? 10 : 5;
      suitability = 'acceptable';
      badge = 'Ambient Countertop Rate';
      impactNote = `At room temperature (${temp}°C), apples respire normally, retaining ideal crispness for ${daysMin}–${daysMax} days.`;
    } else {
      // Warm / Sun
      daysMin = status === 'Fresh' ? 3 : 1;
      daysMax = status === 'Fresh' ? 5 : 2;
      suitability = 'suboptimal';
      badge = 'Accelerated Softening';
      impactNote = `Elevated heat (${temp}°C) doubles respiration velocity, causing rapid moisture transpiration and mealiness.`;
      warning = 'Keep away from direct heat or sunny windows to prevent cuticle drying.';
    }
  } else if (food === 'Banana') {
    if (temp < 12) {
      // Banana chilling injury in refrigerator
      daysMin = status === 'Fresh' ? 2 : 1;
      daysMax = status === 'Fresh' ? 4 : 2;
      suitability = 'suboptimal';
      badge = 'Chilling Injury Alert (<12°C)';
      impactNote = `Bananas in ${storageName} (${temp}°C) suffer enzymatic chilling injury. Polyphenol oxidase darkens the peel rapidly, even though pulp stays edible for ${daysMin}–${daysMax} days.`;
      warning = 'Chilling injury: Skin turns dull brown/black. For best flavor and yellow ripening, store at room temperature (18–22°C).';
    } else if (temp <= 22) {
      // Ambient countertop is ideal for bananas
      daysMin = status === 'Fresh' ? 4 : 2;
      daysMax = status === 'Fresh' ? 6 : 3;
      suitability = 'optimal';
      badge = 'Optimal Ripening Climate';
      impactNote = `Ambient countertop temperature (${temp}°C) supports smooth ethylene-mediated chlorophyll degradation and sweetness development.`;
    } else {
      // Warm / Sun
      daysMin = status === 'Fresh' ? 2 : 1;
      daysMax = status === 'Fresh' ? 3 : 1;
      suitability = 'suboptimal';
      badge = 'Rapid Ethylene Autocatalysis';
      impactNote = `Warm temperatures (${temp}°C) trigger rapid autocatalytic ethylene synthesis, causing fast spotting and pulp liquefaction.`;
      warning = 'Separate bananas from other produce to prevent collective overripening.';
    }
  } else if (food === 'Tomato') {
    if (temp < 10) {
      // Tomato chilling injury in refrigerator
      daysMin = status === 'Fresh' ? 3 : 2;
      daysMax = status === 'Fresh' ? 5 : 4;
      suitability = 'suboptimal';
      badge = 'Flavor Ester Loss (<10°C)';
      impactNote = `Chilled storage in ${storageName} (${temp}°C) disrupts membrane lipids, arrests flavor volatile synthesis (Z-3-hexenal), and creates a mealy texture.`;
      warning = 'Cold exposure below 10°C reduces tomato aroma. Countertop storage (stem-side down) is recommended for best flavor.';
    } else if (temp <= 22) {
      // Room temp is ideal for tomatoes
      daysMin = status === 'Fresh' ? 5 : 2;
      daysMax = status === 'Fresh' ? 8 : 4;
      suitability = 'optimal';
      badge = 'Optimal Tomato Flavor Development';
      impactNote = `Room temperature (${temp}°C) preserves natural tomato acidity, lycopene pigmentation, and delicate volatile esters.`;
    } else {
      // Warm / Sun
      daysMin = status === 'Fresh' ? 2 : 1;
      daysMax = status === 'Fresh' ? 4 : 2;
      suitability = 'suboptimal';
      badge = 'Accelerated Transpiration';
      impactNote = `Heat (${temp}°C) drives moisture loss through the cuticle, resulting in wrinkling and faster fungal lesion development.`;
      warning = 'Keep out of direct sunlight to prevent sunscald and rapid skin shriveling.';
    }
  } else if (food === 'Potato') {
    // Potatoes need dark cool conditions
    if (temp <= 5) {
      // Refrigerator sweetening hazard
      daysMin = status === 'Fresh' ? 14 : 7;
      daysMax = status === 'Fresh' ? 21 : 12;
      suitability = 'suboptimal';
      badge = 'Cold-Induced Sweetening Hazard';
      impactNote = `Storing potatoes in ${storageName} (${temp}°C) triggers cold-induced sweetening: invertase enzymes convert starch into reducing sugars (glucose/fructose).`;
      warning = 'Health Advisory: Cooking cold-stored potatoes at high heat produces acrylamide. Store potatoes in a cool dark pantry (8–12°C), never in the fridge.';
    } else if (temp <= 14 && isDark) {
      // Dark pantry / root cellar is the absolute gold standard for potatoes
      daysMin = status === 'Fresh' ? 45 : 14;
      daysMax = status === 'Fresh' ? 90 : 25;
      suitability = 'optimal';
      badge = 'Golden Standard Root Storage';
      impactNote = `A cool (${temp}°C), dark, and ventilated location prevents dormancy break, halts sprouting, and keeps tubers firm for up to ${daysMax} days.`;
    } else if (!isDark) {
      // Light exposure causes green solanine
      daysMin = status === 'Fresh' ? 7 : 4;
      daysMax = status === 'Fresh' ? 12 : 7;
      suitability = 'hazardous';
      badge = 'Toxic Solanine Greening Hazard';
      impactNote = `Light exposure in ${storageName} initiates chlorophyll synthesis and toxic glycoalkaloids (solanine & chaconine) under the tuber skin.`;
      warning = 'Toxicity Risk: Exposure to light turns potatoes green and produces bitter, toxic solanine. Keep strictly in a dark, opaque container or cellar.';
    } else {
      // Warm room temp
      daysMin = status === 'Fresh' ? 14 : 6;
      daysMax = status === 'Fresh' ? 25 : 10;
      suitability = 'acceptable';
      badge = 'Moderate Ambient Longevity';
      impactNote = `In room conditions (${temp}°C), potatoes remain viable for ${daysMin}–${daysMax} days provided they are protected from light and moisture.`;
    }
  } else {
    // Dynamic calculation for user-typed custom fruits and vegetables
    const lower = food.toLowerCase();
    const isTropicalFruit = lower.includes('mango') || lower.includes('banana') || lower.includes('avocado') || lower.includes('papaya') || lower.includes('pineapple') || lower.includes('citrus');
    const isRootOrBulb = lower.includes('carrot') || lower.includes('onion') || lower.includes('garlic') || lower.includes('radish') || lower.includes('beet') || lower.includes('turnip');
    const isLeafyOrTender = lower.includes('berry') || lower.includes('lettuce') || lower.includes('spinach') || lower.includes('broccoli') || lower.includes('cucumber') || lower.includes('herb');

    if (isTropicalFruit) {
      if (temp < 10) {
        daysMin = status === 'Fresh' ? 3 : 1;
        daysMax = status === 'Fresh' ? 6 : 2;
        suitability = 'suboptimal';
        badge = 'Tropical Chilling Sensitivity';
        impactNote = `Cold temperatures (${temp}°C) induce chilling injury in ${food}, impairing aroma development and causing peel pitting.`;
        warning = `Advisory: Tropical specimens like ${food} develop chilling injury when refrigerated unripe. Store at 12–18°C.`;
      } else if (temp <= 22) {
        daysMin = status === 'Fresh' ? 5 : 2;
        daysMax = status === 'Fresh' ? 9 : 4;
        suitability = 'optimal';
        badge = 'Optimal Ambient Ripening';
        impactNote = `Ambient storage (${temp}°C) allows gradual, balanced ripening and peak sugar accumulation.`;
      } else {
        daysMin = status === 'Fresh' ? 2 : 1;
        daysMax = status === 'Fresh' ? 4 : 2;
        suitability = 'suboptimal';
        badge = 'Accelerated Thermal Decay';
        impactNote = `Elevated heat (${temp}°C) accelerates respiration rate, causing rapid cuticular wrinkling.`;
      }
    } else if (isRootOrBulb) {
      if (temp <= 12 && isDark) {
        daysMin = status === 'Fresh' ? 25 : 10;
        daysMax = status === 'Fresh' ? 45 : 18;
        suitability = 'optimal';
        badge = 'Ideal Root Cellar Storage';
        impactNote = `Cool, dark microclimate (${temp}°C) maintains subterranean dormancy and prevents sprouting.`;
      } else if (temp <= 5) {
        daysMin = status === 'Fresh' ? 14 : 7;
        daysMax = status === 'Fresh' ? 28 : 14;
        suitability = 'acceptable';
        badge = 'Chilled Preservation';
        impactNote = `Refrigeration preserves firmness, though humidity must be managed to prevent surface mold.`;
      } else {
        daysMin = status === 'Fresh' ? 7 : 3;
        daysMax = status === 'Fresh' ? 14 : 6;
        suitability = 'acceptable';
        badge = 'Standard Ambient Shelf';
        impactNote = `Room storage (${temp}°C) provides ${daysMin}–${daysMax} days before desiccation sets in.`;
      }
    } else if (isLeafyOrTender) {
      if (temp <= 4) {
        daysMin = status === 'Fresh' ? 5 : 2;
        daysMax = status === 'Fresh' ? 10 : 4;
        suitability = 'optimal';
        badge = 'Crisper Cold Preservation';
        impactNote = `Chilled high-humidity condition (${temp}°C) retards vascular turgor loss and moisture transpiration.`;
      } else {
        daysMin = status === 'Fresh' ? 2 : 1;
        daysMax = status === 'Fresh' ? 4 : 2;
        suitability = 'suboptimal';
        badge = 'Rapid Moisture Loss';
        impactNote = `Warm temperatures (${temp}°C) accelerate moisture transpiration, causing limpness or leaf yellowing.`;
      }
    } else {
      // General produce default
      if (temp <= 6) {
        daysMin = status === 'Fresh' ? 7 : 3;
        daysMax = status === 'Fresh' ? 14 : 6;
        suitability = 'optimal';
        badge = 'Chilled Storage Protocol';
        impactNote = `Chilled environment (${temp}°C) decelerates respiration and microbial metabolic rate.`;
      } else if (temp <= 22) {
        daysMin = status === 'Fresh' ? 4 : 2;
        daysMax = status === 'Fresh' ? 7 : 3;
        suitability = 'acceptable';
        badge = 'Ambient Storage';
        impactNote = `Normal room temperature (${temp}°C) provides standard post-harvest longevity.`;
      } else {
        daysMin = status === 'Fresh' ? 2 : 1;
        daysMax = status === 'Fresh' ? 4 : 2;
        suitability = 'suboptimal';
        badge = 'Thermal Acceleration';
        impactNote = `High storage temperature (${temp}°C) hastens moisture loss and volatile degradation.`;
      }
    }
  }

  const expiry = new Date(now.getTime() + daysMax * 24 * 60 * 60 * 1000);
  const formattedExpiry = expiry.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const displayShelfLife = daysMin === daysMax
    ? `${daysMax} Day${daysMax === 1 ? '' : 's'}`
    : `${daysMin}–${daysMax} Days`;

  // Arrhenius factor approximation: baseline 20°C
  const tempFactor = Math.round(Math.pow(2.0, (temp - 20) / 10) * 100) / 100;

  return {
    displayShelfLife,
    daysMin,
    daysMax,
    expiryDate: formattedExpiry,
    storageSuitability: suitability,
    suitabilityBadge: badge,
    storageImpactNote: impactNote,
    temperatureFactor: tempFactor,
    specialWarning: warning
  };
}
