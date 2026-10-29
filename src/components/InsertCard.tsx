import React from 'react';
import { CalculatedInsert, InsertItem, Strandedness } from '../types/assembly';
import { AlertCircle, CheckCircle, Dna, Droplets, Trash2, Zap } from 'lucide-react';
import { NumericInput } from './NumericInput';

interface InsertCardProps {
  index: number;
  calculatedInsert: CalculatedInsert;
  onUpdate: (updates: Partial<InsertItem>) => void;
  onDelete: () => void;
  canDelete: boolean;
  onOpenPcrInfo?: () => void;
}

export const InsertCard: React.FC<InsertCardProps> = ({
  index,
  calculatedInsert,
  onUpdate,
  onDelete,
  canDelete,
  onOpenPcrInfo,
}) => {
  const { insert, pmol, massNg, rawVolumeUl, actualVolumeUl, dilution } = calculatedInsert;

  const handleStrandednessChange = (newStrand: Strandedness) => {
    onUpdate({
      strandedness: newStrand,
      // Default to 200x for ssDNA (Vector:ssDNA = 1:200) or 2x for dsDNA
      molarRatio: newStrand === 'ssDNA' ? 200.0 : insert.length < 200 && insert.length > 0 ? 5.0 : 2.0,
      isCustomRatio: false,
    });
  };

  const isSmallDsDna = insert.strandedness === 'dsDNA' && insert.length > 0 && insert.length < 200;
  const isSsDna = insert.strandedness === 'ssDNA';
  const ratioPresets = isSsDna ? [1, 50, 100, 200] : [1, 2, 3, 5];

  // Dilution recipe based on 3.0 µL of original DNA liquid
  const stockAliquotUl = 3.0;
  const waterAliquotUl = (stockAliquotUl * (insert.dilutionFactor - 1)).toFixed(1);
  const totalDilutedStockUl = (stockAliquotUl * insert.dilutionFactor).toFixed(1);

  return (
    <div
      className={`bg-white border rounded-xl p-5 shadow-xs transition-all ${
        dilution.needed && !insert.useDilution
          ? 'border-amber-300 ring-1 ring-amber-200'
          : insert.useDilution
          ? 'border-blue-300 bg-blue-50/20'
          : 'border-slate-200'
      }`}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs ${
              insert.strandedness === 'ssDNA'
                ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
          >
            #{index + 1}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                {insert.name || `Insert #${index + 1}`}
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                {insert.strandedness === 'dsDNA'
                  ? 'dsDNA (650 Da/bp)'
                  : 'ssDNA Oligo (330 Da/nt · 1:200 Molar)'}
              </span>
            </div>
          </div>
        </div>

        {/* Strandedness Selector: dsDNA vs ssDNA */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
            <button
              onClick={() => handleStrandednessChange('dsDNA')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                insert.strandedness === 'dsDNA'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              dsDNA Fragment
            </button>
            <button
              onClick={() => handleStrandednessChange('ssDNA')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                insert.strandedness === 'ssDNA'
                  ? 'bg-white text-cyan-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ssDNA Oligo (1:200)
            </button>
          </div>

          {canDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Remove insert"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Inputs Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Insert Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Insert Name
          </label>
          <input
            type="text"
            value={insert.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="e.g. GFP, Target cDNA, Overlap oligo"
            className="w-full px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
          />
        </div>

        {/* Length (bp or nt) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {insert.strandedness === 'dsDNA' ? 'Length (base pairs)' : 'Length (nucleotides)'}
          </label>
          <div className="relative">
            <NumericInput
              min={10}
              max={20000}
              value={insert.length}
              onChange={(len) => {
                const updates: Partial<InsertItem> = { length: len };
                if (!insert.isCustomRatio && insert.strandedness === 'dsDNA') {
                  if (len > 0 && len < 200 && insert.molarRatio === 2.0) {
                    updates.molarRatio = 5.0;
                  } else if (len >= 200 && insert.molarRatio === 5.0) {
                    updates.molarRatio = 2.0;
                  }
                }
                onUpdate(updates);
              }}
              onBlurDefault={insert.strandedness === 'ssDNA' ? 60 : 1000}
              className="w-full px-3 py-1.5 text-xs font-mono font-medium border border-slate-300 rounded-lg focus:outline-blue-600 bg-white pr-9"
            />
            <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 font-mono">
              {insert.strandedness === 'dsDNA' ? 'bp' : 'nt'}
            </span>
          </div>
          {isSmallDsDna && (
            <span className="text-[10px] text-amber-600 font-medium block mt-0.5">
              &lt; 200 bp: 5-fold molar excess recommended
            </span>
          )}
          {isSsDna && (
            <span className="text-[10px] text-cyan-700 font-medium block mt-0.5">
              1:200 Vector:ssDNA ratio applied
            </span>
          )}
        </div>

        {/* Stock Concentration */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Stock Concentration
          </label>
          <div className="relative">
            <NumericInput
              min={0.01}
              max={5000}
              value={insert.concentration}
              onChange={(conc) => onUpdate({ concentration: conc })}
              onBlurDefault={50}
              placeholder="e.g. 50"
              className="w-full px-3 py-1.5 text-xs font-mono font-medium border border-slate-300 rounded-lg focus:outline-blue-600 bg-white pr-14"
            />
            <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 font-mono">
              ng/µL
            </span>
          </div>
        </div>

        {/* Molar Ratio Relative to Vector */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">
              Molar Ratio (vs Vector)
            </label>
            <span className="text-[10px] font-mono text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
              {insert.molarRatio === 1
                ? '1:1 Equimolar'
                : insert.molarRatio === 2
                ? '1:2 (2x Excess)'
                : insert.molarRatio === 3
                ? '1:3 (3x Excess)'
                : insert.molarRatio === 5
                ? '1:5 (5x for <200 bp)'
                : insert.molarRatio === 200
                ? '1:200 (ssDNA Excess)'
                : `1:${insert.molarRatio} (${insert.molarRatio}x)`}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {/* Presets in responsive grid */}
            <div className="grid grid-cols-4 gap-1">
              {ratioPresets.map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => onUpdate({ molarRatio: ratio, isCustomRatio: true })}
                  className={`py-1 text-xs font-mono font-semibold rounded border text-center transition-all ${
                    insert.molarRatio === ratio
                      ? 'border-blue-600 bg-blue-600 text-white font-bold shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  {ratio}x
                </button>
              ))}
            </div>
            {/* Custom Input */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500 font-sans shrink-0">Custom:</span>
              <div className="relative flex-1">
                <NumericInput
                  min={0.1}
                  max={2000}
                  value={insert.molarRatio}
                  onChange={(val) => {
                    if (val > 0) onUpdate({ molarRatio: val, isCustomRatio: true });
                  }}
                  onBlurDefault={insert.strandedness === 'ssDNA' ? 200 : 2}
                  className="w-full py-0.5 px-2 text-center text-xs font-mono font-bold border border-slate-300 rounded focus:outline-blue-600 bg-white"
                  title="Custom molar ratio"
                />
              </div>
              <span className="text-xs font-mono text-slate-500 shrink-0">x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calculated Readout Metrics: Order: Undiluted Stock Vol -> Working Dilution Volume -> Target Moles -> Target Mass */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/70 p-3 rounded-lg">
        <div className="flex flex-wrap items-center gap-6">
          {/* 1. Undiluted Stock Vol (without highlight) */}
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[11px] font-mono uppercase text-slate-500 block">
                Undiluted Stock Vol
              </span>
              {!insert.useDilution && rawVolumeUl > 0 && (
                <span className="text-[9px] font-sans font-bold bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded border border-emerald-300">
                  Pipette to tube
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-mono font-bold text-slate-800 tabular-nums">
                {rawVolumeUl > 0 ? rawVolumeUl.toFixed(3) : '—'}
              </span>
              <span className="text-xs font-mono text-slate-500">µL</span>
            </div>
          </div>

          {/* 2. Working Dilution Volume (highlighted when active) */}
          <div className="border-l border-slate-200 pl-4">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[11px] font-mono uppercase text-slate-500 block">
                Working Dilution Volume
              </span>
              {insert.useDilution && (
                <span className="text-[9px] font-sans font-bold bg-blue-100 text-blue-800 px-1 py-0.2 rounded border border-blue-300">
                  Pipette to tube
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              {insert.useDilution ? (
                <>
                  <span
                    className={`text-xl font-mono font-bold tabular-nums ${
                      actualVolumeUl < 0.7
                        ? 'text-amber-600 font-extrabold'
                        : 'text-blue-700 font-bold'
                    }`}
                  >
                    {actualVolumeUl.toFixed(2)}
                  </span>
                  <span className="text-xs font-mono text-slate-500">µL</span>
                  <span className="text-[11px] font-mono text-blue-700 ml-1 font-semibold">
                    (1:{insert.dilutionFactor} dilution)
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm font-mono text-slate-400 font-medium">
                    —
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 ml-1">
                    (Direct stock used: {rawVolumeUl > 0 ? `${rawVolumeUl.toFixed(3)} µL` : '—'})
                  </span>
                </>
              )}
            </div>
          </div>

          {/* 3. Target Moles */}
          <div className="border-l border-slate-200 pl-4">
            <span className="text-[11px] font-mono uppercase text-slate-500 block">
              Target Moles
            </span>
            <span className="text-xs font-mono font-semibold text-slate-800 tabular-nums">
              {pmol.toFixed(4)} pmol
            </span>
          </div>

          {/* 4. Target Mass */}
          <div className="border-l border-slate-200 pl-4">
            <span className="text-[11px] font-mono uppercase text-slate-500 block">
              Target Mass
            </span>
            <span className="text-xs font-mono font-semibold text-slate-800 tabular-nums">
              {massNg.toFixed(1)} ng
            </span>
          </div>
        </div>

        {/* PCR carryover checkbox with clickable interactive explanation */}
        <div className="flex items-center gap-1.5">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 hover:text-slate-900 select-none">
            <input
              type="checkbox"
              checked={insert.isUnpurifiedPcr}
              onChange={(e) => onUpdate({ isUnpurifiedPcr: e.target.checked })}
              className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <span>Unpurified PCR insert</span>
          </label>
          <button
            type="button"
            onClick={onOpenPcrInfo}
            className="p-0.5 text-slate-400 hover:text-blue-600 hover:bg-slate-200/60 rounded-full transition-colors"
            title="Click to view NEB guidelines on unpurified PCR products"
          >
            <AlertCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          INTELLIGENT DILUTION ADVISOR
          Triggers if raw volume < 0.7 µL OR if current diluted volume is STILL < 0.7 µL
         ========================================================================= */}
      {(dilution.needed || insert.useDilution) && (
        (() => {
          const isDilutedStillBelowThreshold = insert.useDilution && actualVolumeUl < 0.7;

          return (
            <div
              className={`mt-3 p-3 rounded-lg border text-xs transition-all ${
                isDilutedStillBelowThreshold
                  ? 'bg-amber-50/90 border-amber-300 ring-1 ring-amber-300 text-amber-950'
                  : insert.useDilution
                  ? 'bg-blue-50/70 border-blue-200'
                  : 'bg-amber-50/80 border-amber-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-start gap-2">
                  {isDilutedStillBelowThreshold ? (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  ) : insert.useDilution ? (
                    <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        {isDilutedStillBelowThreshold
                          ? `Warning: 1:${insert.dilutionFactor} Dilution Still Below Threshold (< 0.7 µL)`
                          : insert.useDilution
                          ? `Dilution Active (1:${insert.dilutionFactor})`
                          : 'Pipetting Precision Advisory (< 0.7 µL)'}
                      </span>
                      <span className="text-[10px] font-mono uppercase text-slate-500">
                        {insert.useDilution ? `Dispensing: ${actualVolumeUl.toFixed(3)} µL` : `Raw: ${rawVolumeUl.toFixed(3)} µL`}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5">
                      {isDilutedStillBelowThreshold
                        ? `At 1:${insert.dilutionFactor} dilution, the pipetted volume (${actualVolumeUl.toFixed(2)} µL) remains below the standard 0.7 µL micropipette threshold. Please increase the dilution factor to at least 1:${Math.ceil(0.7 / rawVolumeUl)} (suggested: 1:${dilution.suggestedFactor}).`
                        : dilution.reason}
                    </p>
                  </div>
                </div>

                {/* Quick Action Button */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {isDilutedStillBelowThreshold ? (
                    <button
                      onClick={() =>
                        onUpdate({
                          useDilution: true,
                          dilutionFactor: dilution.suggestedFactor,
                        })
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-md transition-colors shadow-xs"
                    >
                      <Droplets className="w-3.5 h-3.5" />
                      <span>Increase to 1:{dilution.suggestedFactor} ({(rawVolumeUl * dilution.suggestedFactor).toFixed(2)} µL)</span>
                    </button>
                  ) : !insert.useDilution ? (
                    <button
                      onClick={() =>
                        onUpdate({
                          useDilution: true,
                          dilutionFactor: dilution.suggestedFactor,
                        })
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-md transition-colors shadow-xs"
                    >
                      <Droplets className="w-3.5 h-3.5" />
                      <span>Apply 1:{dilution.suggestedFactor} Dilution</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onUpdate({ useDilution: false })}
                      className="px-2.5 py-1 text-slate-600 hover:text-slate-900 border border-slate-300 bg-white rounded-md text-xs font-medium"
                    >
                      Use Direct Stock
                    </button>
                  )}
                </div>
              </div>

              {/* Detailed Dilution Recipe & Controls (3 µL DNA Basis) */}
              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-[11px]">
                <div className="flex flex-wrap items-center gap-1.5 text-slate-700">
                  <span className="font-semibold text-slate-900 font-sans">
                    Bench Recipe (3 µL stock basis):
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-bold text-slate-800">
                    3.0 µL Stock + {waterAliquotUl} µL H₂O
                  </span>
                  <span className="text-slate-400">({totalDilutedStockUl} µL total)</span>
                  <span>➔</span>
                  <span
                    className={`px-2 py-0.5 rounded font-bold ${
                      actualVolumeUl < 0.7
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-blue-100 text-blue-900'
                    }`}
                  >
                    Pipette {(rawVolumeUl * insert.dilutionFactor).toFixed(2)} µL into reaction
                  </span>
                </div>

                {/* Change dilution factor */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-slate-500 font-sans">Factor:</span>
                  {[2, 3, 4, 5, 10, 20, 50].map((f) => {
                    const resultingVol = rawVolumeUl * f;
                    const isBelow = resultingVol < 0.7;
                    const isSelected = insert.useDilution && insert.dilutionFactor === f;

                    return (
                      <button
                        key={f}
                        onClick={() =>
                          onUpdate({ useDilution: true, dilutionFactor: f })
                        }
                        className={`px-1.5 py-0.5 rounded border text-[10px] font-bold transition-all ${
                          isSelected
                            ? isBelow
                              ? 'bg-amber-600 text-white border-amber-600 ring-1 ring-amber-400'
                              : 'bg-blue-600 text-white border-blue-600'
                            : isBelow
                            ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                        title={
                          isBelow
                            ? `1:${f} gives ${resultingVol.toFixed(2)} µL (< 0.7 µL: still too low)`
                            : `1:${f}: 3 µL DNA + ${3 * (f - 1)} µL H2O -> ${resultingVol.toFixed(2)} µL`
                        }
                      >
                        1:{f}
                        {isBelow && <span className="ml-0.5 text-[8px]">!</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
};
