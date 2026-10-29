import React, { useState } from 'react';
import { AssemblyCalculationResult } from '../types/assembly';
import { AlertCircle, AlertTriangle, Check, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';

interface ReactionSummaryTableProps {
  calculation: AssemblyCalculationResult;
  onOpenBatchModal: () => void;
  onOpenExportModal: () => void;
}

export const ReactionSummaryTable: React.FC<ReactionSummaryTableProps> = ({
  calculation,
  onOpenBatchModal,
  onOpenExportModal,
}) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const resetChecklist = () => {
    setCheckedItems({});
  };

  const {
    vector,
    inserts,
    masterMixVolumeUl,
    waterVolumeUl,
    totalDnaVolumeUl,
    totalDnaPmol,
    totalReactionVolumeUl,
    validation,
  } = calculation;

  // Build the pipetting order sequence (Standard lab protocol: Water -> DNA -> 2X Enzyme Mix)
  const rows: Array<{
    id: string;
    order: number;
    name: string;
    type: 'water' | 'vector' | 'insert' | 'master_mix';
    stockConc: string;
    targetAmount: string;
    volumeUl: number;
    note: string;
    hasAlert?: boolean;
  }> = [];

  let step = 1;

  // 1. Deionized Water
  rows.push({
    id: 'comp-water',
    order: step++,
    name: 'Deionized Nuclease-Free H₂O',
    type: 'water',
    stockConc: '—',
    targetAmount: '—',
    volumeUl: Math.max(0, waterVolumeUl),
    note: 'Add first to PCR tube on ice to cushion components',
    hasAlert: waterVolumeUl < 0,
  });

  // 2. Vector
  rows.push({
    id: 'comp-vector',
    order: step++,
    name: `${vector.name || 'Cloning Vector'} (dsDNA)`,
    type: 'vector',
    stockConc: `${vector.concentration} ng/µL`,
    targetAmount: `${vector.massNg.toFixed(1)} ng (${vector.pmol.toFixed(3)} pmol)`,
    volumeUl: vector.volumeUl,
    note: 'Linearized vector',
    hasAlert: vector.volumeUl < 0.7,
  });

  // 3. Inserts
  inserts.forEach((item, idx) => {
    const isDiluted = item.insert.useDilution;
    const waterFor3ul = (3 * (item.insert.dilutionFactor - 1)).toFixed(1);
    const isStillTooLow = item.actualVolumeUl < 0.7;

    const note = isDiluted
      ? isStillTooLow
        ? `1:${item.insert.dilutionFactor} dilution (WARNING: ${item.actualVolumeUl.toFixed(2)} µL is still < 0.7 µL. Increase dilution factor!)`
        : `Working 1:${item.insert.dilutionFactor} dilution (Recipe: 3 µL stock + ${waterFor3ul} µL H₂O)`
      : isStillTooLow
      ? 'Direct stock (Dilution recommended: < 0.7 µL)'
      : 'Direct stock';

    rows.push({
      id: `comp-insert-${item.insert.id}`,
      order: step++,
      name: `${item.insert.name || `Insert #${idx + 1}`} (${item.insert.strandedness})`,
      type: 'insert',
      stockConc: isDiluted
        ? `${item.insert.concentration} ng/µL (1:${item.insert.dilutionFactor} Dilution)`
        : `${item.insert.concentration} ng/µL (Stock)`,
      targetAmount: `${item.massNg.toFixed(1)} ng (${item.pmol.toFixed(3)} pmol)`,
      volumeUl: item.actualVolumeUl,
      note,
      hasAlert: isStillTooLow,
    });
  });

  // 4. Master Mix (Added last)
  rows.push({
    id: 'comp-mastermix',
    order: step++,
    name: 'NEBuilder HiFi / Gibson 2X Master Mix',
    type: 'master_mix',
    stockConc: '2X Concentrated',
    targetAmount: 'Enzymes & Buffer',
    volumeUl: masterMixVolumeUl,
    note: `Thaw on ice. Add last, pipet gently up and down to mix. Incubate at 50°C for ${calculation.modeRules.recommendedIncubationMinutes} min.`,
    hasAlert: false,
  });

  const allChecked = rows.length > 0 && rows.every((r) => checkedItems[r.id]);

  // Proportions for visual volume progress
  const mmPercent = (masterMixVolumeUl / totalReactionVolumeUl) * 100;
  const dnaPercent = (totalDnaVolumeUl / totalReactionVolumeUl) * 100;
  const waterPercent = Math.max(0, (waterVolumeUl / totalReactionVolumeUl) * 100);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs mb-8">
      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Reaction Assembly Recipe (Ice Benchtop)
            </h3>
            <span className="text-xs font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-semibold border border-blue-200">
              Total {totalReactionVolumeUl.toFixed(1)} µL
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
            Follow the 1–{rows.length} pipetting order on ice. Tick checkboxes as you dispense each reagent.
          </span>
        </div>

        <div className="flex items-center gap-2">
          {Object.keys(checkedItems).length > 0 && (
            <button
              onClick={resetChecklist}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md bg-white hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Checks
            </button>
          )}

          <button
            onClick={onOpenBatchModal}
            className="px-3 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 rounded-md bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            Batch Calculator
          </button>
        </div>
      </div>

      {/* Validation Banner if there are errors or warnings */}
      {validation.status !== 'optimal' && (
        <div
          className={`mt-4 p-3 rounded-lg text-xs flex items-start gap-2.5 ${
            validation.status === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}
        >
          {validation.status === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <span className="font-bold">
              {validation.status === 'error'
                ? 'Reaction Volume Issue Detected:'
                : 'Assembly Protocol Notice:'}
            </span>
            <ul className="list-disc list-inside space-y-0.5">
              {validation.messages.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Benchtop Table */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-mono text-slate-500 uppercase tracking-wider bg-slate-50/50">
              <th className="py-2.5 px-3 w-12 text-center">Pipetted</th>
              <th className="py-2.5 px-3 w-10 text-center">#</th>
              <th className="py-2.5 px-3">Component / Reagent</th>
              <th className="py-2.5 px-3">Concentration</th>
              <th className="py-2.5 px-3">Amount</th>
              <th className="py-2.5 px-3 text-right">Volume to Add</th>
              <th className="py-2.5 px-3 hidden lg:table-cell">Bench Instructions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {rows.map((row) => {
              const isChecked = !!checkedItems[row.id];
              return (
                <tr
                  key={row.id}
                  onClick={() => toggleCheck(row.id)}
                  className={`cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-emerald-50/40 text-slate-500'
                      : row.hasAlert
                      ? 'bg-amber-50/40 hover:bg-amber-50/60'
                      : 'hover:bg-slate-50/70'
                  }`}
                >
                  {/* Checkbox */}
                  <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => toggleCheck(row.id)}
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors mx-auto ${
                        isChecked
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 bg-white hover:border-slate-400'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  </td>

                  {/* Pipetting Step Number */}
                  <td className="py-3 px-3 text-center font-mono font-semibold text-slate-400">
                    {row.order}
                  </td>

                  {/* Component Name */}
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className={isChecked ? 'line-through text-slate-400' : ''}>
                        {row.name}
                      </span>
                      {row.hasAlert && (
                        <span className="text-[10px] text-amber-600 font-mono font-normal bg-amber-100 px-1.5 py-0.2 rounded">
                          Low Vol
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Stock Concentration */}
                  <td className="py-3 px-3 font-mono text-slate-600">
                    {row.stockConc}
                  </td>

                  {/* Target Amount */}
                  <td className="py-3 px-3 font-mono text-slate-600">
                    {row.targetAmount}
                  </td>

                  {/* Pipetted Volume */}
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`text-sm font-mono font-bold tabular-nums ${
                        row.hasAlert
                          ? 'text-amber-700'
                          : row.type === 'master_mix'
                          ? 'text-blue-700'
                          : 'text-slate-900'
                      }`}
                    >
                      {row.volumeUl.toFixed(2)}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 ml-1">µL</span>
                  </td>

                  {/* Instructions */}
                  <td className="py-3 px-3 text-[11px] text-slate-500 hidden lg:table-cell">
                    {row.note}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-300 font-semibold bg-slate-50/80">
              <td colSpan={2} className="py-3 px-3 text-center">
                {allChecked ? (
                  <span className="text-emerald-700 text-xs font-bold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Ready for 50°C
                  </span>
                ) : (
                  <span className="text-slate-400 text-xs font-mono">
                    {Object.values(checkedItems).filter(Boolean).length}/{rows.length} Added
                  </span>
                )}
              </td>
              <td className="py-3 px-3 text-slate-900">Total Reaction Mix</td>
              <td className="py-3 px-3 font-mono text-slate-600">
                Total DNA: {totalDnaPmol.toFixed(3)} pmol
              </td>
              <td className="py-3 px-3 font-mono text-slate-600">
                DNA Vol: {totalDnaVolumeUl.toFixed(2)} µL
              </td>
              <td className="py-3 px-3 text-right font-mono font-bold text-base text-slate-900 tabular-nums">
                {totalReactionVolumeUl.toFixed(1)} µL
              </td>
              <td className="py-3 px-3 text-[11px] text-slate-500 hidden lg:table-cell">
                Incubate in thermocycler at 50°C
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Volume Visual Gauge */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-1.5">
          <span>Reaction Volume Distribution ({totalReactionVolumeUl} µL):</span>
          <span>
            DNA {totalDnaVolumeUl.toFixed(1)} µL ({((totalDnaVolumeUl / totalReactionVolumeUl) * 100).toFixed(0)}%) ·
            Master Mix {masterMixVolumeUl.toFixed(1)} µL ({mmPercent.toFixed(0)}%) ·
            H₂O {Math.max(0, waterVolumeUl).toFixed(1)} µL ({waterPercent.toFixed(0)}%)
          </span>
        </div>
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${mmPercent}%` }}
            className="bg-blue-600 h-full"
            title={`2X Master Mix: ${masterMixVolumeUl} µL`}
          />
          <div
            style={{ width: `${dnaPercent}%` }}
            className="bg-emerald-600 h-full"
            title={`DNA Components: ${totalDnaVolumeUl.toFixed(2)} µL`}
          />
          <div
            style={{ width: `${waterPercent}%` }}
            className="bg-sky-300 h-full"
            title={`Water: ${waterVolumeUl.toFixed(2)} µL`}
          />
        </div>
      </div>
    </div>
  );
};
