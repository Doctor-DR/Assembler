import React from 'react';
import { AssemblyCalculationResult, AssemblyConfig, AssemblyMode } from '../types/assembly';
import { PRESET_SCENARIOS, PresetScenario } from '../utils/presets';
import {
  Bookmark,
  Sparkles,
  Sliders,
  Clock,
  Dna,
  Layers,
  Scale,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { NumericInput } from './NumericInput';

interface AssemblyModeSelectorProps {
  config: AssemblyConfig;
  calculation: AssemblyCalculationResult;
  onChangeConfig: (updates: Partial<AssemblyConfig>) => void;
  onSelectMode: (mode: AssemblyMode) => void;
  onApplyPreset: (preset: PresetScenario) => void;
  activePresetId?: string;
}

export const AssemblyModeSelector: React.FC<AssemblyModeSelectorProps> = ({
  config,
  calculation,
  onChangeConfig,
  onSelectMode,
  onApplyPreset,
  activePresetId,
}) => {
  const { modeRules } = calculation;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-xs">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            Assembly Configuration &amp; Presets
          </h2>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 font-mono">
            <span>NEBuilder HiFi Master Mix (NEB #E2621)</span>
            <span>·</span>
            <span>Gibson Isothermal Method</span>
            <span>·</span>
            <span>50°C Thermocycling</span>
          </div>
        </div>

        {/* Reaction Scale Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Reaction Volume:
          </span>
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => onChangeConfig({ totalVolumeUl: 20 })}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                config.totalVolumeUl === 20
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              20 µL (Standard)
            </button>
            <button
              onClick={() => onChangeConfig({ totalVolumeUl: 10 })}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                config.totalVolumeUl === 10
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              10 µL (Half-Reaction)
            </button>
            <div className="flex items-center pl-2 pr-1 gap-1">
              <NumericInput
                min={5}
                max={100}
                value={config.totalVolumeUl}
                onChange={(val) => {
                  if (val > 0) onChangeConfig({ totalVolumeUl: val });
                }}
                onBlurDefault={20}
                className="w-14 px-1.5 py-1 text-xs font-mono font-bold text-center border border-slate-300 rounded bg-white text-slate-900 focus:outline-blue-500"
              />
              <span className="text-xs text-slate-500 font-mono">µL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assembly Mode Segmented Buttons */}
      <div className="mt-4">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Select Reaction Architecture / Assembly Mode:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
          {/* 1. 2-3 Fragments */}
          <button
            onClick={() => onSelectMode('2-3_fragments')}
            className={`text-left p-3.5 rounded-xl border transition-all ${
              config.mode === '2-3_fragments'
                ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/20 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/40 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                2–3 Fragments
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                1:2 Molar
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              Vector + 1–2 inserts. 2-fold molar excess (5x if &lt;200 bp). 15 min @ 50°C.
            </p>
          </button>

          {/* 2. 4-6 Fragments */}
          <button
            onClick={() => onSelectMode('4-6_fragments')}
            className={`text-left p-3.5 rounded-xl border transition-all ${
              config.mode === '4-6_fragments'
                ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/40 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                4–6 Fragments
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                1:1 Equimolar
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              Multi-fragment assembly. Equimolar (1:1 ratio). 60 min @ 50°C.
            </p>
          </button>

          {/* 3. ssDNA / Oligo Bridging */}
          <button
            onClick={() => onSelectMode('ssdna_bridging')}
            className={`text-left p-3.5 rounded-xl border transition-all ${
              config.mode === 'ssdna_bridging'
                ? 'border-cyan-600 bg-cyan-50/70 ring-2 ring-cyan-600/20 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/40 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Dna className="w-3.5 h-3.5 text-cyan-600" />
                ssDNA Bridging
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800">
                1:200 Molar
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              Single-stranded oligos (330 Da/nt). 1:200 molar excess (or 45 nM).
            </p>
          </button>

          {/* 4. Custom Assembly */}
          <button
            onClick={() => onSelectMode('custom')}
            className={`text-left p-3.5 rounded-xl border transition-all ${
              config.mode === 'custom'
                ? 'border-slate-700 bg-slate-100 ring-2 ring-slate-700/20 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/40 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-slate-700" />
                Custom Assembly
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                User Ratios
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              Fully custom molar ratios, arbitrary fragment sizes, and targets.
            </p>
          </button>
        </div>
      </div>

      {/* =========================================================================
          ACTIVE MODE RULES & BENCH IMPACT PANEL
          Directly shows what parameters and calculations change based on the mode!
         ========================================================================= */}
      <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Active NEB Manual Rules ({modeRules.mode.replace('_', ' ').toUpperCase()})
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            NEB HiFi Manual v5.0 Specifications
          </span>
        </div>

        {/* 4 Key Bench Impact Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          {/* 1. Molar Ratio Rule */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase text-slate-400 block font-semibold">
              Molar Ratio Rule
            </span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5 truncate">
              {modeRules.molarRatioLabel}
            </span>
            <span className="text-[10px] text-slate-500 font-sans block mt-0.5">
              {config.mode === '4-6_fragments'
                ? 'Equimolar across pieces'
                : config.mode === 'ssdna_bridging'
                ? '200x excess for ssDNA'
                : '2x excess (5x if <200 bp)'}
            </span>
          </div>

          {/* 2. Incubation Time */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase text-slate-400 block font-semibold">
              50°C Incubation Timer
            </span>
            <span className="text-xs font-bold text-blue-600 flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              {modeRules.recommendedIncubationMinutes} minutes
            </span>
            <span className="text-[10px] text-slate-500 font-sans block mt-0.5">
              {config.mode === '4-6_fragments' ? 'Extended multi-way annealing' : 'Standard rapid reaction'}
            </span>
          </div>

          {/* 3. Recommended Total DNA */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase text-slate-400 block font-semibold">
              Total DNA Target
            </span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5">
              {modeRules.recommendedPmolRange[0]} – {modeRules.recommendedPmolRange[1]} pmol
            </span>
            <span className="text-[10px] text-slate-500 font-sans block mt-0.5">
              {config.mode === '4-6_fragments' ? '~0.05 pmol per fragment' : 'Optimal cloning range'}
            </span>
          </div>

          {/* 4. Homology Overlap */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase text-slate-400 block font-semibold">
              Recommended Overlap
            </span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5">
              {modeRules.recommendedOverlapBp}
            </span>
            <span className="text-[10px] text-slate-500 font-sans block mt-0.5">
              Tm ≥ 48°C required
            </span>
          </div>
        </div>

        {/* Dynamic Scientific Explanation */}
        <div className="mt-3 text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200/80 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {config.mode === '4-6_fragments' ? (
              <>
                <strong>Why 4–6 Fragments require different parameters:</strong> According to NEB Manual Page 8 &amp; 10, multi-fragment assemblies require equimolarity (<strong>1:1 ratio, ~0.05 pmol each</strong>) to prevent one fragment from out-competing others. The thermocycler incubation is extended to <strong>60 minutes at 50°C</strong> to allow all multiple junctions to chew-back and find correct annealing partners. Overlaps are increased to <strong>20–30 bp</strong> to prevent misannealing.
              </>
            ) : config.mode === '2-3_fragments' ? (
              <>
                <strong>Why 2–3 Fragments use 1:2 ratio and 15 min:</strong> For simple 2–3 fragment cloning, adding a <strong>2-fold molar excess</strong> of insert drives the equilibrium toward complete vector circularization. With 15–20 bp overlaps, exonuclease and ligase complete the reaction in just <strong>15 minutes at 50°C</strong>. Any small dsDNA fragment (&lt; 200 bp) should be used in <strong>5-fold excess</strong>.
              </>
            ) : config.mode === 'ssdna_bridging' ? (
              <>
                <strong>Why ssDNA Oligos use 1:200 ratio:</strong> Because single-stranded oligonucleotides (<strong>330 Da/nt</strong>) have high conformational entropy and lack a duplex partner, NEB recommends high molar excess (<strong>1:200 ratio</strong> or ~45 nM starting concentration) to achieve efficient bridging between dsDNA vector arms.
              </>
            ) : (
              <>
                <strong>Custom Assembly:</strong> Independent settings without automatic NEB preset overrides. You can freely specify arbitrary molar ratios, custom incubation durations, and custom total picomole amounts.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Preset Scenarios Strip */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-700">
          <Bookmark className="w-3.5 h-3.5 text-blue-600" />
          <span>Quick Lab Bench Presets:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {PRESET_SCENARIOS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onApplyPreset(preset)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-md border transition-all whitespace-nowrap ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
                title={preset.description}
              >
                <Sparkles className="w-3 h-3 text-blue-500" />
                <span>{preset.title}</span>
                <span className="text-[10px] text-slate-500 font-mono">[{preset.tag}]</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
