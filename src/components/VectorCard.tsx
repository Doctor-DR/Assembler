import React from 'react';
import { VectorItem } from '../types/assembly';
import { DSDNA_MW_PER_BP, massToPmol, pmolToMass } from '../utils/calculator';
import { CircleDot, Info, AlertTriangle } from 'lucide-react';
import { NumericInput } from './NumericInput';

interface VectorCardProps {
  vector: VectorItem;
  onChangeVector: (updates: Partial<VectorItem>) => void;
  calculatedVolumeUl: number;
  calculatedPmol: number;
  onOpenPcrInfo?: () => void;
}

export const VectorCard: React.FC<VectorCardProps> = ({
  vector,
  onChangeVector,
  calculatedVolumeUl,
  calculatedPmol,
  onOpenPcrInfo,
}) => {
  const isVolumeTooLow = calculatedVolumeUl > 0 && calculatedVolumeUl < 0.7;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
            <CircleDot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Linearized Cloning Vector</h3>
            <span className="text-[11px] text-slate-500 font-mono">
              dsDNA · 650 Da/bp · Target 0.015–0.05 pmol (50–100 ng)
            </span>
          </div>
        </div>

        {/* Input Mode Toggle: Mass vs pmol */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => {
              const currentPmol = massToPmol(vector.targetMassNg, vector.length, 'dsDNA');
              onChangeVector({ inputMode: 'mass', targetPmol: currentPmol });
            }}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
              vector.inputMode === 'mass'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Target Mass (ng)
          </button>
          <button
            onClick={() => {
              const currentPmol = massToPmol(vector.targetMassNg, vector.length, 'dsDNA');
              onChangeVector({ inputMode: 'pmol', targetPmol: currentPmol });
            }}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
              vector.inputMode === 'pmol'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Target Moles (pmol)
          </button>
        </div>
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vector Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Vector Name / ID
          </label>
          <input
            type="text"
            value={vector.name}
            onChange={(e) => onChangeVector({ name: e.target.value })}
            placeholder="e.g. pUC19, pET-28a"
            className="w-full px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
          />
        </div>

        {/* Vector Length (bp) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Length (base pairs)
          </label>
          <div className="relative">
            <NumericInput
              min={100}
              max={50000}
              value={vector.length}
              onChange={(len) => onChangeVector({ length: len })}
              onBlurDefault={5000}
              className="w-full px-3 py-1.5 text-xs font-mono font-medium border border-slate-300 rounded-lg focus:outline-blue-600 bg-white pr-9"
            />
            <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 font-mono">
              bp
            </span>
          </div>
        </div>

        {/* Stock Concentration */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Stock Concentration
          </label>
          <div className="relative">
            <NumericInput
              min={0.1}
              max={5000}
              value={vector.concentration}
              onChange={(conc) => onChangeVector({ concentration: conc })}
              onBlurDefault={50}
              placeholder="e.g. 50"
              className="w-full px-3 py-1.5 text-xs font-mono font-medium border border-slate-300 rounded-lg focus:outline-blue-600 bg-white pr-14"
            />
            <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 font-mono">
              ng/µL
            </span>
          </div>
        </div>

        {/* Target Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {vector.inputMode === 'mass' ? 'Target Mass (ng)' : 'Target Amount (pmol)'}
          </label>
          <div className="relative">
            {vector.inputMode === 'mass' ? (
              <NumericInput
                min={1}
                max={1000}
                value={vector.targetMassNg}
                onChange={(mass) => {
                  const pmol = massToPmol(mass, vector.length, 'dsDNA');
                  onChangeVector({ targetMassNg: mass, targetPmol: pmol });
                }}
                onBlurDefault={50}
                className="w-full px-3 py-1.5 text-xs font-mono font-medium border border-slate-300 rounded-lg focus:outline-blue-600 bg-white pr-9"
              />
            ) : (
              <NumericInput
                min={0.001}
                max={5}
                value={vector.targetPmol}
                onChange={(pmol) => {
                  const mass = pmolToMass(pmol, vector.length, 'dsDNA');
                  onChangeVector({ targetPmol: pmol, targetMassNg: mass });
                }}
                onBlurDefault={0.05}
                placeholder="e.g. 0.05"
                className="w-full px-3 py-1.5 text-xs font-mono font-medium border border-slate-300 rounded-lg focus:outline-blue-600 bg-white pr-12"
              />
            )}
            <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 font-mono">
              {vector.inputMode === 'mass' ? 'ng' : 'pmol'}
            </span>
          </div>
        </div>
      </div>

      {/* Vector Result Strip & PCR Flag */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-lg">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-500 block">
              Calculated Volume
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-mono font-bold text-slate-900 tabular-nums">
                {calculatedVolumeUl > 0 ? calculatedVolumeUl.toFixed(2) : '—'}
              </span>
              <span className="text-xs font-mono text-slate-500">µL</span>
            </div>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-[11px] font-mono uppercase text-slate-500 block">
              Moles
            </span>
            <span className="text-xs font-mono font-semibold text-slate-800 tabular-nums">
              {calculatedPmol.toFixed(4)} pmol
            </span>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-[11px] font-mono uppercase text-slate-500 block">
              Mass
            </span>
            <span className="text-xs font-mono font-semibold text-slate-800 tabular-nums">
              {(vector.inputMode === 'mass'
                ? vector.targetMassNg
                : pmolToMass(calculatedPmol, vector.length, 'dsDNA')
              ).toFixed(1)}{' '}
              ng
            </span>
          </div>
        </div>

        {/* PCR carryover toggle with explanation */}
        <div className="flex items-center gap-1.5">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 hover:text-slate-900 select-none">
            <input
              type="checkbox"
              checked={vector.isUnpurifiedPcr}
              onChange={(e) => onChangeVector({ isUnpurifiedPcr: e.target.checked })}
              className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <span>Unpurified PCR vector</span>
          </label>
          <button
            type="button"
            onClick={onOpenPcrInfo}
            className="p-0.5 text-slate-400 hover:text-blue-600 hover:bg-slate-200/60 rounded-full transition-colors"
            title="Click to view NEB guidelines on unpurified PCR products"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isVolumeTooLow && (
        <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            Vector volume ({calculatedVolumeUl.toFixed(2)} µL) is below the 0.7 µL threshold. Consider increasing target mass to 75–100 ng or diluting stock 1:2 for accurate pipetting.
          </span>
        </div>
      )}
    </div>
  );
};
