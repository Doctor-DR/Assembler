import { AssemblyConfig, InsertItem, VectorItem } from '../types/assembly';

export interface PresetScenario {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  description: string;
  config: AssemblyConfig;
  vector: VectorItem;
  inserts: InsertItem[];
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'standard_1_insert',
    title: 'Standard 2-Fragment (1 Vector + 1 Insert)',
    subtitle: 'pET-28a (5.4 kb) + GFP Reporter (720 bp)',
    tag: '2-3 Fragments',
    description:
      'Classic protein expression cloning with a 1:2 vector-to-insert molar ratio and 15 min incubation at 50°C.',
    config: {
      mode: '2-3_fragments',
      totalVolumeUl: 20,
      masterMixConcentration: 2,
      batchCount: 1,
      pipettingOveragePercent: 10,
    },
    vector: {
      name: 'pET-28a(+) Linearized',
      length: 5369,
      concentration: 50, // 50 ng/µL
      inputMode: 'mass',
      targetMassNg: 50, // 50 ng = ~0.0143 pmol
      targetPmol: 0.0143,
      isUnpurifiedPcr: false,
    },
    inserts: [
      {
        id: 'ins-gfp-1',
        name: 'eGFP Insert',
        strandedness: 'dsDNA',
        length: 720,
        concentration: 40, // 40 ng/µL
        molarRatio: 2.0,
        isCustomRatio: false,
        useDilution: false,
        dilutionFactor: 5,
        isUnpurifiedPcr: false,
      },
    ],
  },
  {
    id: 'high_conc_dilution',
    title: 'High-Concentration Insert (Dilution Advisor Demo)',
    subtitle: '0.2 µL required volume -> Auto 1:10 dilution recommendation',
    tag: 'Dilution Needed',
    description:
      'High-yield miniprep DNA (250 ng/µL) results in 0.15 µL pipetting volume. The app automatically flags accuracy risk and suggests a 1:10 dilution recipe (1 µL DNA + 9 µL H₂O).',
    config: {
      mode: '2-3_fragments',
      totalVolumeUl: 20,
      masterMixConcentration: 2,
      batchCount: 1,
      pipettingOveragePercent: 10,
    },
    vector: {
      name: 'pUC19 Vector',
      length: 2686,
      concentration: 60,
      inputMode: 'mass',
      targetMassNg: 50,
      targetPmol: 0.0286,
      isUnpurifiedPcr: false,
    },
    inserts: [
      {
        id: 'ins-high-conc',
        name: 'High-Yield PCR Fragment',
        strandedness: 'dsDNA',
        length: 850,
        concentration: 250, // very high concentration: 250 ng/µL!
        molarRatio: 2.0,
        isCustomRatio: false,
        useDilution: true, // Dilution enabled
        dilutionFactor: 10,
        isUnpurifiedPcr: false,
      },
    ],
  },
  {
    id: 'ssdna_oligo_bridging',
    title: 'ssDNA Oligo Bridging / Mutagenesis',
    subtitle: 'Vector + Insert + 60 nt Single-Stranded Oligo (1:200 Molar)',
    tag: 'ssDNA & dsDNA',
    description:
      'Seamless junction bridging or site-directed mutagenesis using a single-stranded oligonucleotide (calculated at 330 Da/nt) with 1:200 vector:ssDNA molar ratio alongside double-stranded fragments.',
    config: {
      mode: 'ssdna_bridging',
      totalVolumeUl: 20,
      masterMixConcentration: 2,
      batchCount: 1,
      pipettingOveragePercent: 10,
    },
    vector: {
      name: 'pcDNA3.1 Mammalian Vector',
      length: 5428,
      concentration: 50,
      inputMode: 'mass',
      targetMassNg: 50,
      targetPmol: 0.0141,
      isUnpurifiedPcr: false,
    },
    inserts: [
      {
        id: 'ins-dsdna-1',
        name: 'Cas9 Fragment (dsDNA)',
        strandedness: 'dsDNA',
        length: 1400,
        concentration: 35,
        molarRatio: 2.0,
        isCustomRatio: false,
        useDilution: false,
        dilutionFactor: 5,
        isUnpurifiedPcr: false,
      },
      {
        id: 'ins-ssdna-oligo',
        name: 'FLAG-tag Overlap Linker (ssDNA)',
        strandedness: 'ssDNA',
        length: 60, // 60 nt ssDNA oligo
        concentration: 10, // 10 ng/µL (or ~0.5 µM)
        molarRatio: 200.0, // 200x molar excess for ssDNA (Vector:ssDNA = 1:200)
        isCustomRatio: false,
        useDilution: false,
        dilutionFactor: 10,
        isUnpurifiedPcr: false,
      },
    ],
  },
  {
    id: 'small_insert_5x',
    title: 'Small Insert (<200 bp) 5x Molar Excess',
    subtitle: 'Promoter / Terminator Linker (120 bp)',
    tag: '<200 bp Rule',
    description:
      'NEBuilder manual guideline (page 8): any insert under 200 bp requires a 5-fold molar excess (Vector:Insert = 1:5) instead of 1:2 to ensure high assembly efficiency.',
    config: {
      mode: '2-3_fragments',
      totalVolumeUl: 20,
      masterMixConcentration: 2,
      batchCount: 1,
      pipettingOveragePercent: 10,
    },
    vector: {
      name: 'pCAMBIA Plant Vector',
      length: 6800,
      concentration: 45,
      inputMode: 'mass',
      targetMassNg: 60,
      targetPmol: 0.0135,
      isUnpurifiedPcr: false,
    },
    inserts: [
      {
        id: 'ins-small-promoter',
        name: 'Synthetic Mini-Promoter',
        strandedness: 'dsDNA',
        length: 120, // <200 bp dsDNA!
        concentration: 15,
        molarRatio: 5.0,
        isCustomRatio: false,
        useDilution: false,
        dilutionFactor: 5,
        isUnpurifiedPcr: false,
      },
      {
        id: 'ins-reporter',
        name: 'mCherry cDNA',
        strandedness: 'dsDNA',
        length: 711,
        concentration: 40,
        molarRatio: 2.0,
        isCustomRatio: false,
        useDilution: false,
        dilutionFactor: 5,
        isUnpurifiedPcr: false,
      },
    ],
  },
  {
    id: 'multi_fragment_4way',
    title: '4-Fragment Multi-Assembly (Equimolar 1:1)',
    subtitle: 'Vector + 3 Inserts (60 min @ 50°C)',
    tag: '4-6 Fragments',
    description:
      'Assembly of 4 or more fragments requires equimolar ratios (1:1:1:1, ~0.05 pmol each) and extended 60-minute incubation at 50°C.',
    config: {
      mode: '4-6_fragments',
      totalVolumeUl: 20,
      masterMixConcentration: 2,
      batchCount: 1,
      pipettingOveragePercent: 10,
    },
    vector: {
      name: 'pACYC184 Backbone',
      length: 3373,
      concentration: 65,
      inputMode: 'pmol',
      targetMassNg: 109.6,
      targetPmol: 0.05,
      isUnpurifiedPcr: false,
    },
    inserts: [
      {
        id: 'ins-multi-1',
        name: 'Domain A (PCR)',
        strandedness: 'dsDNA',
        length: 1000,
        concentration: 35,
        molarRatio: 1.0,
        isCustomRatio: false,
        useDilution: false,
        dilutionFactor: 2,
        isUnpurifiedPcr: false,
      },
      {
        id: 'ins-multi-2',
        name: 'Domain B (PCR)',
        strandedness: 'dsDNA',
        length: 1000,
        concentration: 40,
        molarRatio: 1.0,
        isCustomRatio: false,
        useDilution: false,
        dilutionFactor: 2,
        isUnpurifiedPcr: false,
      },
      {
        id: 'ins-multi-3',
        name: 'Domain C (PCR)',
        strandedness: 'dsDNA',
        length: 1152,
        concentration: 50,
        molarRatio: 1.0,
        isCustomRatio: false,
        useDilution: false,
        dilutionFactor: 2,
        isUnpurifiedPcr: false,
      },
    ],
  },
];
