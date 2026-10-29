import React, { useState } from 'react';
import { AssemblyCalculationResult } from '../types/assembly';
import { Layers, X, Check, Copy } from 'lucide-react';

interface BatchCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculation: AssemblyCalculationResult;
  recipeName?: string;
}

export const BatchCalculatorModal: React.FC<BatchCalculatorModalProps> = ({
  isOpen,
  onClose,
  calculation,
  recipeName,
}) => {
  const [reactionCount, setReactionCount] = useState<number>(4);
  const [overagePercent, setOveragePercent] = useState<number>(10);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const multiplier = reactionCount * (1 + overagePercent / 100);
  const totalMasterMixUl = calculation.masterMixVolumeUl * multiplier;
  const totalWaterUl = Math.max(0, calculation.waterVolumeUl) * multiplier;
  const masterMixPerTubeUl = calculation.masterMixVolumeUl;

  const handleCopy = () => {
    const text = `HiFi Assembly Batch Master Mix Recipe (${reactionCount} Reactions + ${overagePercent}% Overage):
- 2X Master Mix: ${totalMasterMixUl.toFixed(1)} µL
- Aliquot per tube: ${masterMixPerTubeUl.toFixed(1)} µL
- Water per tube: ${calculation.waterVolumeUl.toFixed(2)} µL (or dispense individually)
- Vector: ${calculation.vector.volumeUl.toFixed(2)} µL per tube`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Batch Master Mix Pipetting Calculator
              </h3>
              {recipeName && (
                <span className="text-xs font-mono text-blue-600 font-semibold block">
                  Target: {recipeName}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Practical Lab Explanation Box */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 text-xs text-blue-950 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-blue-900">
              <Layers className="w-4 h-4 text-blue-600" />
              What is the purpose of this Batch Calculator?
            </div>
            <p className="text-slate-700 leading-relaxed">
              When setting up multiple cloning assemblies (e.g. 4 tubes) at the bench, preparing a pooled <strong>Master Mix Cocktail</strong> offers three critical advantages:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
              <li>
                <strong>Prevents Running Out of Enzyme (+Overage):</strong> The 2X HiFi Master Mix contains viscous glycerol that adheres to pipette tips. Without +10% overage, your last reaction tube will inevitably fall short.
              </li>
              <li>
                <strong>Assures Uniformity:</strong> Every reaction tube receives exactly identical enzyme concentration, buffer salt ratios, and pH.
              </li>
              <li>
                <strong>Saves 70% Pipetting Time:</strong> Instead of pipetting enzyme and water into 4 separate tubes individually (12 tedious steps on ice), you mix the pool once and dispense 1 aliquot per tube.
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Number of Reactions
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 3, 4, 6, 8, 12].map((num) => (
                  <button
                    key={num}
                    onClick={() => setReactionCount(num)}
                    className={`flex-1 py-1 text-xs font-mono font-semibold rounded border transition-colors ${
                      reactionCount === num
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pipetting Overage (%)
              </label>
              <div className="flex items-center gap-1.5">
                {[5, 10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setOveragePercent(pct)}
                    className={`flex-1 py-1 text-xs font-mono font-semibold rounded border transition-colors ${
                      overagePercent === pct
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    +{pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Master Mix Pool Recipe Table */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Master Stock Preparation Tube ({multiplier.toFixed(2)}x Multiplier):
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-800 font-sans font-medium">
                  2X HiFi / Gibson Master Mix:
                </span>
                <span className="font-bold text-blue-700 tabular-nums">
                  {totalMasterMixUl.toFixed(1)} µL
                </span>
              </div>

              {calculation.waterVolumeUl > 0 && (
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-800 font-sans font-medium">
                    Common Nuclease-free H₂O:
                  </span>
                  <span className="font-bold text-slate-700 tabular-nums">
                    {totalWaterUl.toFixed(1)} µL
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500 font-sans text-[11px]">
                  Dispense to each reaction tube:
                </span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {masterMixPerTubeUl.toFixed(1)} µL Mix
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-t border-slate-100">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Batch Recipe' : 'Copy Recipe'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
