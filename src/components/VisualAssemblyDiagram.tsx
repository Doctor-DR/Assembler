import React, { useState } from 'react';
import { AssemblyCalculationResult } from '../types/assembly';
import { Dna, HelpCircle, Layers, ShieldCheck } from 'lucide-react';

interface VisualAssemblyDiagramProps {
  calculation: AssemblyCalculationResult;
}

export const VisualAssemblyDiagram: React.FC<VisualAssemblyDiagramProps> = ({ calculation }) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const { vector, inserts, validation } = calculation;

  const totalBp =
    vector.length +
    inserts.reduce((sum, item) => sum + (item.insert.length || 0), 0);

  const colors = [
    'from-emerald-500 to-emerald-600',
    'from-cyan-500 to-cyan-600',
    'from-amber-500 to-amber-600',
    'from-purple-500 to-purple-600',
    'from-rose-500 to-rose-600',
  ];

  const steps = [
    {
      title: '1. Overlap Annealing',
      desc: "5' exonuclease chews back 5' ends, exposing 3' single-stranded overhangs (15–30 bp overlaps) that specifically anneal.",
    },
    {
      title: '2. High-Fidelity Polymerase Extension',
      desc: 'DNA polymerase fills in any gaps within the annealed overlapping junctions with high fidelity.',
    },
    {
      title: '3. DNA Ligase Sealing',
      desc: 'Taq DNA ligase covalently seals the nicks, creating a fully closed circular recombinant plasmid ready for E. coli transformation.',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Dna className="w-4 h-4 text-blue-600" />
            In Silico Assembly Construct Architecture
          </h3>
          <span className="text-[11px] font-mono text-slate-500">
            Total Assembled Construct Size: ~{totalBp.toLocaleString()} bp · {1 + inserts.length} Fragments
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Overlap: {inserts.length <= 2 ? '15–20 bp' : '20–30 bp'} (Tm ≥ 48°C)
          </span>
        </div>
      </div>

      {/* Assembly Linear Map */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/80">
        <div className="text-xs font-semibold text-slate-600 mb-2">
          Linear Recombination Map &amp; Junctions:
        </div>

        <div className="flex flex-col md:flex-row items-center gap-1.5 overflow-x-auto pb-2 pt-1">
          {/* Vector Left Arm */}
          <div className="flex-1 min-w-[130px] p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-center">
            <div className="text-[11px] font-bold text-indigo-900 truncate">
              {vector.name || 'Vector Backbone'}
            </div>
            <div className="text-[10px] font-mono text-indigo-700 mt-0.5">
              {vector.length} bp · dsDNA
            </div>
            <div className="mt-1.5 text-[9px] font-mono bg-indigo-100 text-indigo-800 rounded px-1 py-0.5">
              Left Overlap (5&apos; homology)
            </div>
          </div>

          {/* Inserts in order */}
          {inserts.map((item, idx) => {
            const isSsDna = item.insert.strandedness === 'ssDNA';
            return (
              <React.Fragment key={item.insert.id}>
                {/* Junction connector */}
                <div className="flex flex-col items-center justify-center shrink-0 px-1 text-slate-400">
                  <span className="text-[10px] font-mono font-bold text-blue-600 bg-white border border-blue-200 px-1 py-0.2 rounded shadow-2xs">
                    {inserts.length <= 2 ? '15–20 bp' : '20–30 bp'}
                  </span>
                  <div className="w-4 h-0.5 bg-blue-300 mt-0.5" />
                </div>

                <div
                  className={`flex-1 min-w-[140px] p-2.5 rounded-lg border text-center transition-all ${
                    isSsDna
                      ? 'bg-cyan-50 border-cyan-300'
                      : 'bg-emerald-50 border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-[11px] font-bold text-slate-900 truncate">
                      {item.insert.name || `Insert ${idx + 1}`}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1 rounded font-bold ${
                        isSsDna
                          ? 'bg-cyan-200 text-cyan-800'
                          : 'bg-emerald-200 text-emerald-800'
                      }`}
                    >
                      {item.insert.strandedness}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-600 mt-0.5">
                    {item.insert.length} {isSsDna ? 'nt' : 'bp'} · {item.insert.molarRatio}x molar
                  </div>
                  <div className="mt-1.5 text-[9px] font-mono bg-white/80 text-slate-700 rounded px-1 py-0.5 border border-slate-200 truncate">
                    Vol: {item.actualVolumeUl.toFixed(2)} µL
                    {item.insert.useDilution && ` (1:${item.insert.dilutionFactor})`}
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          {/* Right Vector Junction connector */}
          <div className="flex flex-col items-center justify-center shrink-0 px-1 text-slate-400">
            <span className="text-[10px] font-mono font-bold text-blue-600 bg-white border border-blue-200 px-1 py-0.2 rounded shadow-2xs">
              {inserts.length <= 2 ? '15–20 bp' : '20–30 bp'}
            </span>
            <div className="w-4 h-0.5 bg-blue-300 mt-0.5" />
          </div>

          {/* Vector Right Arm */}
          <div className="flex-1 min-w-[130px] p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-center">
            <div className="text-[11px] font-bold text-indigo-900 truncate">
              {vector.name || 'Vector Backbone'}
            </div>
            <div className="text-[10px] font-mono text-indigo-700 mt-0.5">
              Right Homology Junction
            </div>
            <div className="mt-1.5 text-[9px] font-mono bg-indigo-100 text-indigo-800 rounded px-1 py-0.5">
              Circularizes Plasmid
            </div>
          </div>
        </div>

        {/* Enzymatic Mechanism Interactive Explainer */}
        <div className="mt-4 pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              NEBuilder HiFi Master Mix 3-Enzyme Mechanism:
            </span>
            <div className="flex items-center gap-1">
              {steps.map((st, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  className={`px-2 py-0.5 text-[11px] font-mono rounded ${
                    activeStep === i
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Step {i + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
            <div className="font-semibold text-slate-900">
              {steps[activeStep].title}
            </div>
            <p className="text-slate-600 mt-0.5 leading-relaxed">
              {steps[activeStep].desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
