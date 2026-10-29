import React from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

interface UnpurifiedPcrInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UnpurifiedPcrInfoModal: React.FC<UnpurifiedPcrInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Unpurified PCR Product Guideline (≤ 20% Limit)
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                NEBuilder® HiFi Assembly Manual (Page 7 &amp; Page 8)
              </span>
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
        <div className="p-5 space-y-4 text-xs text-slate-700 leading-relaxed">
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg">
            <span className="font-bold text-blue-950 block mb-1">
              Can I use PCR products directly without column purification?
            </span>
            <p className="text-slate-700">
              <strong>Yes!</strong> Purification of PCR products is generally not necessary as long as the amplification product is clean (<strong>&gt; 90% pure</strong> on an agarose gel). You can pipette unpurified PCR products straight from your PCR tube into the assembly reaction.
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-slate-900 block">
              Why must unpurified PCR volume not exceed 20%?
            </span>
            <p>
              Crude PCR mixtures contain elevated concentrations of:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1 font-mono text-[11px] text-slate-600">
              <li>High divalent magnesium salts (Mg²⁺) and PCR reaction buffer</li>
              <li>Free residual dNTPs</li>
              <li>Unused primers and primer-dimers</li>
            </ul>
            <p>
              If unpurified PCR volume exceeds <strong>20% of the total reaction volume</strong> (e.g. <strong>&gt; 4.0 µL</strong> in a 20 µL reaction, or <strong>&gt; 2.0 µL</strong> in a 10 µL reaction), these carryover components significantly inhibit both the <strong>5&apos; exonuclease chew-back</strong> and downstream <strong>E. coli transformation</strong>.
            </p>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">What the Checkbox Does:</span>
              <p className="text-slate-700 mt-0.5">
                Checking this box tells the calculator that this specific component is raw PCR liquid. The app tracks the sum of all unpurified PCR liquid and triggers an immediate warning if it crosses the 20% threshold, prompting you to column-purify the fragment.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
