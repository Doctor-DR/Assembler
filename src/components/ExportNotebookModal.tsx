import React, { useState } from 'react';
import { AssemblyCalculationResult } from '../types/assembly';
import { Check, Copy, Download, Printer, X } from 'lucide-react';

interface ExportNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculation: AssemblyCalculationResult;
}

export const ExportNotebookModal: React.FC<ExportNotebookModalProps> = ({
  isOpen,
  onClose,
  calculation,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [format, setFormat] = useState<'markdown' | 'tsv' | 'bench_text'>('bench_text');

  if (!isOpen) return null;

  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const { vector, inserts, masterMixVolumeUl, waterVolumeUl, totalReactionVolumeUl, totalDnaPmol } =
    calculation;

  // Build plain text bench sheet
  const generateBenchText = () => {
    let out = `======================================================
GIBSON & NEBUILDER HIFI DNA ASSEMBLY BENCH PROTOCOL
Date: ${dateStr}
Construct: ${vector.name || 'Vector'} + ${inserts.length} Insert(s)
Total Volume: ${totalReactionVolumeUl.toFixed(1)} µL | Total DNA: ${totalDnaPmol.toFixed(3)} pmol
======================================================

1. REACTION MIX PIPETTING RECIPE (ON ICE):
------------------------------------------------------
[ ] 1. Nuclease-free H2O:        ${Math.max(0, waterVolumeUl).toFixed(2)} µL
[ ] 2. Vector (${vector.name || 'Vector'}):    ${vector.volumeUl.toFixed(2)} µL (${vector.massNg.toFixed(1)} ng, ${vector.pmol.toFixed(4)} pmol)
`;

    inserts.forEach((item, idx) => {
      const isDil = item.insert.useDilution;
      out += `[ ] ${3 + idx}. ${item.insert.name || `Insert ${idx + 1}`} (${item.insert.strandedness}):  ${item.actualVolumeUl.toFixed(2)} µL ${
        isDil ? `[1:${item.insert.dilutionFactor} Dilution]` : '[Direct stock]'
      } (${item.massNg.toFixed(1)} ng, ${item.pmol.toFixed(4)} pmol)\n`;
    });

    out += `[ ] ${3 + inserts.length}. 2X HiFi Master Mix:     ${masterMixVolumeUl.toFixed(2)} µL
------------------------------------------------------
TOTAL REACTION VOLUME:           ${totalReactionVolumeUl.toFixed(1)} µL

2. DILUTION RECIPES (IF APPLICABLE):
`;

    const dilutedInserts = inserts.filter((i) => i.insert.useDilution);
    if (dilutedInserts.length === 0) {
      out += `None (all components pipetted directly from stock).\n`;
    } else {
      dilutedInserts.forEach((item) => {
        const waterFor3ul = (3 * (item.insert.dilutionFactor - 1)).toFixed(1);
        out += `- ${item.insert.name}: 3.0 µL Stock + ${waterFor3ul} µL H2O (1:${item.insert.dilutionFactor} Dilution) -> Pipette ${item.actualVolumeUl.toFixed(2)} µL\n`;
      });
    }

    out += `
3. THERMOCYCLER PROTOCOL:
- Temperature: 50.0°C Isothermal
- Incubation Time: ${inserts.length <= 2 ? '15 minutes' : '60 minutes'} (or custom set)
- Post-incubation: Place on ice immediately or store at -20°C.

4. E. COLI TRANSFORMATION (NEB 5-alpha):
- Add 2.0 µL assembled product to thawed cells
- Ice: 30 minutes
- Heat shock: 42°C for 45 seconds
- Ice: 2 minutes
- SOC outgrowth: 950 µL SOC @ 37°C for 60 min (250 rpm)
- Plating: Spread 100 µL on selection plate, incubate 37°C overnight.
======================================================`;

    return out;
  };

  // Build Markdown format for Electronic Lab Notebooks (Benchling / Notion)
  const generateMarkdown = () => {
    let md = `## Gibson & HiFi DNA Assembly Protocol (${dateStr})

### Construct Overview
- **Vector**: ${vector.name || 'Vector'} (${vector.length} bp, dsDNA)
- **Total Reaction Volume**: ${totalReactionVolumeUl.toFixed(1)} µL
- **Total DNA Amount**: ${totalDnaPmol.toFixed(3)} pmol

### Benchtop Assembly Pipetting Recipe
| Step | Component | Type | Stock Conc. | Amount | Pipetted Vol |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Nuclease-free H₂O | Buffer | — | — | **${Math.max(0, waterVolumeUl).toFixed(2)} µL** |
| 2 | ${vector.name || 'Vector'} | dsDNA | ${vector.concentration} ng/µL | ${vector.massNg.toFixed(1)} ng (${vector.pmol.toFixed(3)} pmol) | **${vector.volumeUl.toFixed(2)} µL** |
`;

    inserts.forEach((item, idx) => {
      const isDil = item.insert.useDilution;
      md += `| ${3 + idx} | ${item.insert.name} | ${item.insert.strandedness} | ${item.insert.concentration} ng/µL ${isDil ? `(1:${item.insert.dilutionFactor})` : ''} | ${item.massNg.toFixed(1)} ng (${item.pmol.toFixed(3)} pmol) | **${item.actualVolumeUl.toFixed(2)} µL** |\n`;
    });

    md += `| ${3 + inserts.length} | 2X HiFi Master Mix | Enzyme Mix | 2X | — | **${masterMixVolumeUl.toFixed(2)} µL** |
| **Total** | | | | | **${totalReactionVolumeUl.toFixed(1)} µL** |

### Thermocycling & Transformation
- **Thermocycler**: 50°C for ${inserts.length <= 2 ? '15 minutes' : '60 minutes'}
- **Transformation**: 2 µL reaction into competent cells -> 30 min on ice -> 42°C for 45s -> 2 min ice -> 950 µL SOC 37°C for 60 min -> Plate 100 µL
`;
    return md;
  };

  const getExportText = () => {
    if (format === 'markdown') return generateMarkdown();
    return generateBenchText();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getExportText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              Export Bench Protocol &amp; Lab Notebook Sheet
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Format:</span>
            <div className="flex items-center gap-1 p-0.5 bg-slate-200/70 rounded-md">
              <button
                onClick={() => setFormat('bench_text')}
                className={`px-3 py-1 text-xs font-semibold rounded ${
                  format === 'bench_text'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bench Plaintext (Printable)
              </button>
              <button
                onClick={() => setFormat('markdown')}
                className={`px-3 py-1 text-xs font-semibold rounded ${
                  format === 'markdown'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Markdown (Benchling / Notion)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 rounded-md bg-white hover:bg-slate-50 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
          </div>
        </div>

        {/* Content Box */}
        <div className="p-6 overflow-y-auto flex-1">
          <textarea
            readOnly
            value={getExportText()}
            rows={16}
            className="w-full font-mono text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none resize-none leading-relaxed select-all"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500">
            Click inside or use button to copy directly
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy All'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
