import React, { useState } from 'react';
import { BookOpen, Check, ExternalLink, HelpCircle, ShieldAlert, X } from 'lucide-react';

interface LabProtocolReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LabProtocolReferenceModal: React.FC<LabProtocolReferenceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeSection, setActiveSection] = useState<'antibiotics' | 'dpni' | 'overlaps' | 'troubleshooting'>('antibiotics');

  if (!isOpen) return null;

  const antibiotics = [
    { name: 'Ampicillin', conc: '100 µg/ml', stock: '100 mg/ml (1000x)', solvent: 'Sterile H₂O' },
    { name: 'Carbenicillin', conc: '100 µg/ml', stock: '100 mg/ml (1000x)', solvent: 'Sterile H₂O' },
    { name: 'Kanamycin', conc: '30 µg/ml', stock: '30 mg/ml (1000x)', solvent: 'Sterile H₂O' },
    { name: 'Chloramphenicol', conc: '33 µg/ml', stock: '33 mg/ml (1000x)', solvent: '100% Ethanol' },
    { name: 'Streptomycin', conc: '25 µg/ml', stock: '25 mg/ml (1000x)', solvent: 'Sterile H₂O' },
    { name: 'Tetracycline', conc: '15 µg/ml', stock: '15 mg/ml (1000x)', solvent: '70% Ethanol' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              NEBuilder HiFi &amp; Gibson Bench Reference Guide
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveSection('antibiotics')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-t border-x ${
              activeSection === 'antibiotics'
                ? 'bg-white text-blue-700 border-slate-200 border-b-white -mb-px'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            Antibiotic Concentrations
          </button>
          <button
            onClick={() => setActiveSection('dpni')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-t border-x ${
              activeSection === 'dpni'
                ? 'bg-white text-blue-700 border-slate-200 border-b-white -mb-px'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            DpnI Digestion (Template Removal)
          </button>
          <button
            onClick={() => setActiveSection('overlaps')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-t border-x ${
              activeSection === 'overlaps'
                ? 'bg-white text-blue-700 border-slate-200 border-b-white -mb-px'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            Overlaps &amp; Design
          </button>
          <button
            onClick={() => setActiveSection('troubleshooting')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-t border-x ${
              activeSection === 'troubleshooting'
                ? 'bg-white text-blue-700 border-slate-200 border-b-white -mb-px'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            Troubleshooting
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {activeSection === 'antibiotics' && (
            <div>
              <p className="text-slate-600 mb-3">
                Standard working concentrations for LB agar selection plates from NEB Manual Appendix A:
              </p>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[11px] font-mono text-slate-500 uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Antibiotic</th>
                      <th className="py-2 px-3">Working Conc.</th>
                      <th className="py-2 px-3">Recommended Stock</th>
                      <th className="py-2 px-3">Solvent / Filter</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-xs">
                    {antibiotics.map((a) => (
                      <tr key={a.name} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-bold font-sans text-slate-900">{a.name}</td>
                        <td className="py-2.5 px-3 text-blue-700 font-semibold">{a.conc}</td>
                        <td className="py-2.5 px-3 text-slate-600">{a.stock}</td>
                        <td className="py-2.5 px-3 text-slate-500 font-sans">{a.solvent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'dpni' && (
            <div className="space-y-3 leading-relaxed text-slate-700">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                <strong>Why DpnI Digestion? (Manual Page 7)</strong>
                <p className="mt-1">
                  When PCR-amplifying a vector or fragment from plasmid template, methylated template carryover produces high background of original circular plasmid. DpnI targets only methylated GATC sites, destroying parental template while leaving unmethylated PCR products intact.
                </p>
              </div>

              <h4 className="font-bold text-slate-900">Standard DpnI Protocol (10 µL Reaction):</h4>
              <ol className="list-decimal list-inside space-y-1.5 pl-2 font-mono text-[11px]">
                <li>Mix 5–8 µL PCR product with 1 µL 10X CutSmart® Buffer and 1 µL (20 units) DpnI (NEB #R0176).</li>
                <li>Incubate at 37°C for 30 minutes.</li>
                <li>Heat-inactivate DpnI at 80°C for 20 minutes in a thermocycler.</li>
                <li>Directly add to NEBuilder HiFi Assembly reaction (or column purify if volume exceeds 20%).</li>
              </ol>
            </div>
          )}

          {activeSection === 'overlaps' && (
            <div className="space-y-3 text-slate-700 leading-relaxed">
              <h4 className="font-bold text-slate-900">Primer Overlap Design Rules (Manual Page 3–6):</h4>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li><strong>2–3 Fragment Assembly:</strong> 15–20 nt overlap with Tm ≥ 48°C. Incubate 15 min at 50°C.</li>
                <li><strong>4–6 Fragment Assembly:</strong> 20–30 nt overlap with Tm ≥ 48°C. Incubate 60 min at 50°C.</li>
                <li><strong>ssDNA Oligonucleotides:</strong> 30 nt overlaps recommended (FAQ 10). Initial concentration 45 nM in 20 µL (~0.9 pmol).</li>
                <li><strong>dsDNA &lt; 200 bp:</strong> Use 5-fold molar excess (Vector:Insert = 1:5) for optimal ligation.</li>
                <li><strong>Avoid Palindromic Junctions:</strong> Palindromic or repetitive ends can decrease recombinant colony yield by up to 10-fold.</li>
              </ul>
            </div>
          )}

          {activeSection === 'troubleshooting' && (
            <div className="space-y-3 text-slate-700">
              <div className="border border-slate-200 rounded-lg p-3">
                <span className="font-bold text-slate-900 block mb-1">No Colonies after Transformation:</span>
                <p className="text-slate-600">
                  Verify cell competency with 100 pg pUC19 control (should yield 1–3 × 10⁹ cfu/µg). Ensure heat shock is strictly 30s at 42°C. Check that total DNA was between 0.03–0.2 pmol (2–3 fragments) or 0.2–0.5 pmol (4–6 fragments).
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-3">
                <span className="font-bold text-slate-900 block mb-1">High Vector-Only Background:</span>
                <p className="text-slate-600">
                  Perform DpnI digestion on PCR-amplified vector to destroy methylated template plasmid. If restriction-digested, use double enzyme digestion to prevent self-ligation.
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-3">
                <span className="font-bold text-slate-900 block mb-1">Incorrect Insert Size:</span>
                <p className="text-slate-600">
                  Gel-purify PCR products if non-specific bands are present. Unpurified PCR primers or primer-dimers compete with the assembly reaction.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
