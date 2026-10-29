export type Strandedness = 'dsDNA' | 'ssDNA';

export interface InsertItem {
  id: string;
  name: string;
  strandedness: Strandedness;
  length: number; // bp for dsDNA, nt for ssDNA
  concentration: number; // ng/µL
  molarRatio: number; // e.g., 2.0 = 2x molar excess relative to vector
  isCustomRatio: boolean;
  useDilution: boolean;
  dilutionFactor: number; // e.g. 10 for 1:10
  isUnpurifiedPcr: boolean;
}

export interface VectorItem {
  name: string;
  length: number; // bp (always dsDNA)
  concentration: number; // ng/µL
  inputMode: 'mass' | 'pmol';
  targetMassNg: number; // e.g. 50-100 ng
  targetPmol: number;
  isUnpurifiedPcr: boolean;
}

export type AssemblyMode = '2-3_fragments' | '4-6_fragments' | 'ssdna_bridging' | 'custom';

export interface AssemblyConfig {
  mode: AssemblyMode;
  totalVolumeUl: number; // default 20 µL
  masterMixConcentration: 2; // 2X Master Mix
  batchCount: number; // number of reactions for batch prep
  pipettingOveragePercent: number; // e.g. 10%
}

export interface DilutionAdvice {
  needed: boolean;
  rawVolumeUl: number;
  suggestedFactor: number;
  dilutedVolumeUl: number;
  stockUl: number;
  waterUl: number;
  reason: string;
}

export interface CalculatedInsert {
  insert: InsertItem;
  pmol: number;
  massNg: number;
  rawVolumeUl: number;
  actualVolumeUl: number;
  dilution: DilutionAdvice;
}

export interface AssemblyCalculationResult {
  vector: {
    name: string;
    length: number;
    concentration: number;
    pmol: number;
    massNg: number;
    volumeUl: number;
  };
  inserts: CalculatedInsert[];
  masterMixVolumeUl: number;
  waterVolumeUl: number;
  totalDnaVolumeUl: number;
  totalDnaPmol: number;
  totalReactionVolumeUl: number;
  unpurifiedPcrVolumeUl: number;
  unpurifiedPcrFraction: number; // e.g. 0.15 = 15%
  modeRules: {
    mode: AssemblyMode;
    molarRatioLabel: string;
    recommendedPmolRange: [number, number];
    recommendedIncubationMinutes: number;
    recommendedOverlapBp: string;
    summary: string;
  };
  validation: {
    status: 'optimal' | 'warning' | 'error';
    messages: string[];
    pmolStatus: 'low' | 'optimal' | 'high';
    recommendedPmolRange: [number, number];
    isWaterNegative: boolean;
    hasLowPipetteVolume: boolean;
    isPcrExceeding20Percent: boolean;
  };
}

export interface SavedRecipe {
  id: string;
  name: string;
  notes?: string;
  createdAt: number;
  config: AssemblyConfig;
  vector: VectorItem;
  inserts: InsertItem[];
}

