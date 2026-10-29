import {
  AssemblyCalculationResult,
  AssemblyConfig,
  CalculatedInsert,
  DilutionAdvice,
  InsertItem,
  Strandedness,
  VectorItem,
} from '../types/assembly';

export const DSDNA_MW_PER_BP = 650; // daltons per bp (NEB standard manual formula)
export const SSDNA_MW_PER_NT = 330; // daltons per nucleotide for ssDNA oligos

/**
 * Convert DNA mass in nanograms to picomoles (pmol)
 * Formula from NEB HiFi manual page 8:
 * pmol = (weight in ng) * 1000 / (length * MW_per_unit)
 */
export function massToPmol(
  massNg: number,
  length: number,
  strandedness: Strandedness = 'dsDNA'
): number {
  if (length <= 0 || massNg <= 0) return 0;
  const mw = strandedness === 'dsDNA' ? DSDNA_MW_PER_BP : SSDNA_MW_PER_NT;
  return (massNg * 1000) / (length * mw);
}

/**
 * Convert DNA picomoles (pmol) to mass in nanograms
 * Formula: weight in ng = (pmol * length * MW_per_unit) / 1000
 */
export function pmolToMass(
  pmol: number,
  length: number,
  strandedness: Strandedness = 'dsDNA'
): number {
  if (length <= 0 || pmol <= 0) return 0;
  const mw = strandedness === 'dsDNA' ? DSDNA_MW_PER_BP : SSDNA_MW_PER_NT;
  return (pmol * length * mw) / 1000;
}

export const PIPETTING_ACCURACY_THRESHOLD_UL = 0.7; // Standard micropipette accuracy limit requested
export const DEFAULT_STOCK_DILUTION_ALIQUOT_UL = 3.0; // Standard dilution aliquot of original DNA liquid

/**
 * Calculate recommended dilution factor and recipe when pipetting volume is too low
 * Standard lab threshold: < 0.7 µL
 * Recipe designed around 3 µL of original DNA liquid (e.g. 4x dilution = 3 µL DNA + 9 µL H2O)
 */
export function calculateDilutionAdvice(
  rawVolumeUl: number,
  availableWaterVolumeUl: number = 10,
  stockAliquotUl: number = DEFAULT_STOCK_DILUTION_ALIQUOT_UL
): DilutionAdvice {
  if (rawVolumeUl <= 0) {
    return {
      needed: false,
      rawVolumeUl: 0,
      suggestedFactor: 1,
      dilutedVolumeUl: 0,
      stockUl: stockAliquotUl,
      waterUl: 0,
      reason: 'No volume calculated',
    };
  }

  // If raw volume is at least 0.7 µL, it can be reliably pipetted directly
  if (rawVolumeUl >= PIPETTING_ACCURACY_THRESHOLD_UL) {
    return {
      needed: false,
      rawVolumeUl,
      suggestedFactor: 1,
      dilutedVolumeUl: rawVolumeUl,
      stockUl: stockAliquotUl,
      waterUl: 0,
      reason: `Volume is within standard micropipette accuracy range (≥ ${PIPETTING_ACCURACY_THRESHOLD_UL} µL)`,
    };
  }

  // Candidate standard dilution factors commonly used in molecular biology labs
  const standardFactors = [2, 3, 4, 5, 10, 20, 50, 100, 200];

  // We want the resulting pipetted volume to be between 1.0 µL and 4.0 µL, ideally ~2.0 µL
  let bestFactor = 10;
  let minDiff = Infinity;

  for (const factor of standardFactors) {
    const dilutedVol = rawVolumeUl * factor;
    // Check if it fits reaction water budget and provides comfortable pipetting (≥ 1.0 µL)
    if (dilutedVol <= Math.max(availableWaterVolumeUl * 0.9, 3.0) && dilutedVol >= 1.0) {
      const diff = Math.abs(dilutedVol - 2.0);
      if (diff < minDiff) {
        minDiff = diff;
        bestFactor = factor;
      }
    }
  }

  // Fallback if none satisfied strict bounds
  if (minDiff === Infinity) {
    for (const factor of standardFactors) {
      if (rawVolumeUl * factor >= PIPETTING_ACCURACY_THRESHOLD_UL) {
        bestFactor = factor;
        break;
      }
    }
  }

  const dilutedVolumeUl = rawVolumeUl * bestFactor;
  const stockUl = stockAliquotUl; // 3.0 µL of original DNA liquid
  const waterUl = Number((stockUl * (bestFactor - 1)).toFixed(1));

  const reason = `Volume (${rawVolumeUl.toFixed(
    3
  )} µL) is below the micropipette accuracy threshold (0.7 µL). Suggested: prepare a 1:${bestFactor} dilution using 3 µL stock DNA + ${waterUl} µL H₂O to ensure accuracy.`;

  return {
    needed: true,
    rawVolumeUl,
    suggestedFactor: bestFactor,
    dilutedVolumeUl,
    stockUl,
    waterUl,
    reason,
  };
}

/**
 * Determine default recommended molar ratio according to user preference & NEB manual:
 * - ssDNA oligo: 200.0x (Vector:ssDNA = 1:200 user-preferred molar ratio)
 * - 2-3 Fragments dsDNA:
 *   - dsDNA ≥ 200 bp: 2.0x (Vector:Insert = 1:2)
 *   - dsDNA < 200 bp: 5.0x (Page 8 note: 5-fold molar excess for < 200 bp dsDNA)
 * - 4-6 Fragments: 1.0x (equimolar)
 */
export function getDefaultMolarRatio(
  strandedness: Strandedness,
  length: number,
  mode: AssemblyConfig['mode']
): number {
  if (strandedness === 'ssDNA') {
    return 200.0; // User preference: Vector : ssDNA = 1:200
  }
  if (mode === '4-6_fragments') {
    return 1.0;
  }
  if (length > 0 && length < 200) {
    return 5.0; // Manual page 8: 5-fold molar excess for < 200 bp dsDNA
  }
  return 2.0; // Standard 2-fold molar excess for 2-3 fragment assembly
}

/**
 * Full Gibson / NEBuilder HiFi Assembly calculation engine
 */
export function calculateAssembly(
  vector: VectorItem,
  inserts: InsertItem[],
  config: AssemblyConfig
): AssemblyCalculationResult {
  // 1. Calculate Vector pmol and mass
  let vectorPmol = 0;
  let vectorMassNg = 0;

  if (vector.inputMode === 'mass') {
    vectorMassNg = Math.max(0, vector.targetMassNg);
    vectorPmol = massToPmol(vectorMassNg, vector.length, 'dsDNA');
  } else {
    vectorPmol = Math.max(0, vector.targetPmol);
    vectorMassNg = pmolToMass(vectorPmol, vector.length, 'dsDNA');
  }

  const vectorVolumeUl =
    vector.concentration > 0 ? vectorMassNg / vector.concentration : 0;

  // 2. Master Mix volume: 2X mix takes 50% of the total reaction volume
  const masterMixVolumeUl = config.totalVolumeUl / config.masterMixConcentration;

  // Available initial volume for all DNA components + water
  const remainingForDnaAndWater = config.totalVolumeUl - masterMixVolumeUl;

  // 3. Calculate Inserts
  let totalDnaPmol = vectorPmol;
  let totalDnaVolumeUl = vectorVolumeUl;
  let unpurifiedPcrVolumeUl = vector.isUnpurifiedPcr ? vectorVolumeUl : 0;

  const calculatedInserts: CalculatedInsert[] = inserts.map((insert) => {
    // Determine effective molar ratio:
    // Always use insert.molarRatio when provided and > 0, whether selected via preset button or typed in custom box.
    const effectiveRatio =
      typeof insert.molarRatio === 'number' && insert.molarRatio > 0
        ? insert.molarRatio
        : getDefaultMolarRatio(insert.strandedness, insert.length, config.mode);

    const requiredPmol = vectorPmol * effectiveRatio;
    const requiredMassNg = pmolToMass(
      requiredPmol,
      insert.length,
      insert.strandedness
    );
    const rawVolumeUl =
      insert.concentration > 0 ? requiredMassNg / insert.concentration : 0;

    // Calculate dilution advice
    const dilution = calculateDilutionAdvice(
      rawVolumeUl,
      remainingForDnaAndWater - vectorVolumeUl
    );

    // Actual volume pipetted depends on whether dilution toggle is ON
    let actualVolumeUl = rawVolumeUl;
    if (insert.useDilution && insert.dilutionFactor > 1) {
      actualVolumeUl = rawVolumeUl * insert.dilutionFactor;
    }

    totalDnaPmol += requiredPmol;
    totalDnaVolumeUl += actualVolumeUl;

    if (insert.isUnpurifiedPcr) {
      unpurifiedPcrVolumeUl += actualVolumeUl;
    }

    return {
      insert,
      pmol: requiredPmol,
      massNg: requiredMassNg,
      rawVolumeUl,
      actualVolumeUl,
      dilution,
    };
  });

  // 4. Water volume needed to bring reaction to totalVolumeUl
  const waterVolumeUl = config.totalVolumeUl - masterMixVolumeUl - totalDnaVolumeUl;

  // 5. Validation and mode-specific recommendations based on NEB manual
  const fragmentCount = 1 + inserts.length; // 1 vector + N inserts

  let recommendedPmolRange: [number, number] = [0.03, 0.2];
  let recommendedIncubationMinutes = 15;
  let recommendedOverlapBp = '15–20 bp';
  let molarRatioLabel = '1:2 Vector:Insert (5x if <200 bp)';
  let summary = 'Standard 2–3 fragment assembly: 2-fold molar excess (5x for <200 bp), 15 min @ 50°C, 0.03–0.2 pmol total.';

  if (config.mode === '4-6_fragments') {
    recommendedPmolRange = [0.2, 0.5];
    recommendedIncubationMinutes = 60;
    recommendedOverlapBp = '20–30 bp';
    molarRatioLabel = '1:1 Equimolar';
    summary = 'Multi-fragment 4–6 assembly: 1:1 equimolar ratio for all fragments, 60 min @ 50°C, 0.2–0.5 pmol total DNA.';
  } else if (config.mode === 'ssdna_bridging') {
    recommendedPmolRange = [0.03, 0.2];
    recommendedIncubationMinutes = 15;
    recommendedOverlapBp = '15–30 nt';
    molarRatioLabel = '1:200 Vector:ssDNA';
    summary = 'ssDNA oligonucleotide bridging: 1:200 molar excess (330 Da/nt), 15 min @ 50°C, 0.03–0.2 pmol total.';
  } else if (config.mode === 'custom') {
    recommendedPmolRange = fragmentCount <= 3 ? [0.03, 0.2] : [0.2, 0.5];
    recommendedIncubationMinutes = fragmentCount <= 3 ? 15 : 60;
    recommendedOverlapBp = 'Custom (15–30 bp)';
    molarRatioLabel = 'Custom User Ratios';
    summary = 'Custom assembly: user-defined molar ratios, incubation times, and custom parameters.';
  }

  const modeRules = {
    mode: config.mode,
    molarRatioLabel,
    recommendedPmolRange,
    recommendedIncubationMinutes,
    recommendedOverlapBp,
    summary,
  };

  let pmolStatus: 'low' | 'optimal' | 'high' = 'optimal';
  if (totalDnaPmol < recommendedPmolRange[0] * 0.9) {
    pmolStatus = 'low';
  } else if (totalDnaPmol > recommendedPmolRange[1] * 1.1) {
    pmolStatus = 'high';
  }

  const isWaterNegative = waterVolumeUl < -0.01;
  const isPcrExceeding20Percent =
    unpurifiedPcrVolumeUl > config.totalVolumeUl * 0.2 + 0.01;
  const unpurifiedPcrFraction =
    config.totalVolumeUl > 0 ? unpurifiedPcrVolumeUl / config.totalVolumeUl : 0;

  const hasLowPipetteVolume =
    vectorVolumeUl > 0 && vectorVolumeUl < PIPETTING_ACCURACY_THRESHOLD_UL
      ? true
      : calculatedInserts.some(
          (c) =>
            c.actualVolumeUl > 0 &&
            c.actualVolumeUl < PIPETTING_ACCURACY_THRESHOLD_UL
        );

  const messages: string[] = [];
  let status: 'optimal' | 'warning' | 'error' = 'optimal';

  if (isWaterNegative) {
    status = 'error';
    messages.push(
      `Total DNA volume (${totalDnaVolumeUl.toFixed(
        2
      )} µL) exceeds reaction capacity. Reduce DNA volumes or turn off excessive dilution factors.`
    );
  }

  if (isPcrExceeding20Percent) {
    if (status !== 'error') status = 'warning';
    messages.push(
      `Unpurified PCR products (${unpurifiedPcrVolumeUl.toFixed(
        2
      )} µL = ${(unpurifiedPcrFraction * 100).toFixed(
        1
      )}%) exceed the 20% manual limit. Column purify PCR fragments to avoid enzyme inhibition.`
    );
  }

  if (hasLowPipetteVolume) {
    if (status !== 'error') status = 'warning';
    messages.push(
      `One or more components have a pipetted volume < ${PIPETTING_ACCURACY_THRESHOLD_UL} µL (even with dilution). Increase dilution factor to ensure pipetting accuracy.`
    );
  }

  if (pmolStatus === 'low') {
    messages.push(
      `Total DNA amount (${totalDnaPmol.toFixed(
        3
      )} pmol) is below the recommended range (${recommendedPmolRange[0]}–${
        recommendedPmolRange[1]
      } pmol) for ${config.mode === '4-6_fragments' ? '4–6 fragment' : `${fragmentCount}-fragment`} assembly.`
    );
  } else if (pmolStatus === 'high') {
    messages.push(
      `Total DNA amount (${totalDnaPmol.toFixed(
        3
      )} pmol) exceeds the recommended ceiling (${
        recommendedPmolRange[1]
      } pmol). Assembly efficiency may decrease.`
    );
  }

  return {
    vector: {
      name: vector.name,
      length: vector.length,
      concentration: vector.concentration,
      pmol: vectorPmol,
      massNg: vectorMassNg,
      volumeUl: vectorVolumeUl,
    },
    inserts: calculatedInserts,
    masterMixVolumeUl,
    waterVolumeUl,
    totalDnaVolumeUl,
    totalDnaPmol,
    totalReactionVolumeUl: config.totalVolumeUl,
    unpurifiedPcrVolumeUl,
    unpurifiedPcrFraction,
    modeRules,
    validation: {
      status,
      messages,
      pmolStatus,
      recommendedPmolRange,
      isWaterNegative,
      hasLowPipetteVolume,
      isPcrExceeding20Percent,
    },
  };
}
