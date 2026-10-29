import React, { useEffect, useMemo, useState } from 'react';
import { AssemblyCalculationResult, AssemblyConfig, AssemblyMode, InsertItem, SavedRecipe, VectorItem } from './types/assembly';
import { calculateAssembly } from './utils/calculator';
import { PRESET_SCENARIOS, PresetScenario } from './utils/presets';
import { Header } from './components/Header';
import { AssemblyModeSelector } from './components/AssemblyModeSelector';
import { VectorCard } from './components/VectorCard';
import { InsertsList } from './components/InsertsList';
import { ReactionSummaryTable } from './components/ReactionSummaryTable';
import { VisualAssemblyDiagram } from './components/VisualAssemblyDiagram';
import { LabBenchProtocol } from './components/LabBenchProtocol';
import { BatchCalculatorModal } from './components/BatchCalculatorModal';
import { LabProtocolReferenceModal } from './components/LabProtocolReferenceModal';
import { ExportNotebookModal } from './components/ExportNotebookModal';
import { UnpurifiedPcrInfoModal } from './components/UnpurifiedPcrInfoModal';
import { ReactionRepository } from './components/ReactionRepository';
import { DeploymentModal } from './components/DeploymentModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { usePWAInstall } from './hooks/usePWAInstall';
import { AlertCircle, AlertTriangle, BookOpen, Clock, Droplets, FolderArchive, Layers, Sparkles, Save, RotateCcw, Check } from 'lucide-react';

const STORAGE_KEY = 'hifi_gibson_assembly_round_recipes';

const INITIAL_ROUND_RECIPES: SavedRecipe[] = [
  {
    id: 'construct-1-gfp',
    name: 'Construct #1: pET28a + eGFP (2 Frags)',
    notes: 'Bacterial expression clone with 1:2 molar excess (15 min @ 50°C)',
    createdAt: Date.now() - 7200000,
    config: PRESET_SCENARIOS[0].config,
    vector: PRESET_SCENARIOS[0].vector,
    inserts: PRESET_SCENARIOS[0].inserts,
  },
  {
    id: 'construct-2-dual',
    name: 'Construct #2: pUC19 + Dual Inserts (3 Frags)',
    notes: 'Multi-fragment cloning with KanR marker and promoter',
    createdAt: Date.now() - 3600000,
    config: PRESET_SCENARIOS[2].config,
    vector: PRESET_SCENARIOS[2].vector,
    inserts: PRESET_SCENARIOS[2].inserts,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'protocol' | 'reference'>('calculator');
  const [activePresetId, setActivePresetId] = useState<string>(PRESET_SCENARIOS[0].id);

  // Repository state (Experiment Round)
  const [recipes, setRecipes] = useState<SavedRecipe[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_ROUND_RECIPES;
  });

  const [activeRecipeId, setActiveRecipeId] = useState<string | null>(
    INITIAL_ROUND_RECIPES[0].id
  );

  // Configuration state
  const [config, setConfig] = useState<AssemblyConfig>(INITIAL_ROUND_RECIPES[0].config);
  const [vector, setVector] = useState<VectorItem>(INITIAL_ROUND_RECIPES[0].vector);
  const [inserts, setInserts] = useState<InsertItem[]>(INITIAL_ROUND_RECIPES[0].inserts);

  // Track if current bench state has unsaved edits compared to active recipe
  const [currentIsUnsaved, setCurrentIsUnsaved] = useState<boolean>(false);

  // Modals state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [batchTarget, setBatchTarget] = useState<{
    calculation: AssemblyCalculationResult;
    recipeName?: string;
  } | null>(null);

  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState<boolean>(false);
  const [isPcrInfoModalOpen, setIsPcrInfoModalOpen] = useState<boolean>(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState<boolean>(false);

  const pwaInstall = usePWAInstall();

  // Persist recipes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
    } catch {
      // ignore
    }
  }, [recipes]);

  // Real-time calculation engine for the active bench construct
  const calculation = useMemo(() => {
    return calculateAssembly(vector, inserts, config);
  }, [vector, inserts, config]);

  // Apply a preset scenario
  const handleApplyPreset = (preset: PresetScenario) => {
    setActivePresetId(preset.id);
    setConfig(preset.config);
    setVector(preset.vector);
    setInserts(preset.inserts);
    setActiveRecipeId(null);
    setCurrentIsUnsaved(true);
  };

  // Handle switching Assembly Mode (2-3 fragments, 4-6 fragments, ssDNA, custom)
  // Handle switching Assembly Mode (2-3 fragments, 4-6 fragments, ssDNA, custom)
  // Dynamically applies NEB Manual rules to insert molar ratios, strandedness, and bench protocols
  const handleSelectMode = (newMode: AssemblyMode) => {
    setConfig((prev) => ({ ...prev, mode: newMode }));
    setActivePresetId('');
    setCurrentIsUnsaved(true);

    if (newMode === '4-6_fragments') {
      // NEB rule: 1:1 equimolar ratio for all fragments (dsDNA)
      setInserts((prev) =>
        prev.map((ins) => ({
          ...ins,
          strandedness: 'dsDNA',
          molarRatio: 1.0,
          isCustomRatio: false,
        }))
      );
    } else if (newMode === '2-3_fragments') {
      // NEB rule: 1:2 molar ratio (5x if <200 bp), dsDNA fragments
      setInserts((prev) =>
        prev.map((ins) => {
          const ratio = ins.length > 0 && ins.length < 200 ? 5.0 : 2.0;
          return {
            ...ins,
            strandedness: 'dsDNA',
            molarRatio: ratio,
            isCustomRatio: false,
          };
        })
      );
    } else if (newMode === 'ssdna_bridging') {
      // NEB rule: ssDNA oligo (330 Da/nt) at 1:200 molar excess
      setInserts((prev) =>
        prev.map((ins) => ({
          ...ins,
          strandedness: 'ssDNA',
          molarRatio: 200.0,
          isCustomRatio: false,
        }))
      );
    }
  };

  // Reset to initial standard cloning state
  const handleReset = () => {
    handleApplyPreset(PRESET_SCENARIOS[0]);
  };

  // Update Vector parameters
  const handleUpdateVector = (updates: Partial<VectorItem>) => {
    setVector((prev) => ({ ...prev, ...updates }));
    setActivePresetId('');
    setCurrentIsUnsaved(true);
  };

  // Add new insert (either dsDNA or ssDNA)
  const handleAddInsert = (strandedness: 'dsDNA' | 'ssDNA' = 'dsDNA') => {
    const newId = `insert-${Date.now()}`;
    const newInsert: InsertItem = {
      id: newId,
      name: strandedness === 'ssDNA' ? `ssDNA Oligo #${inserts.length + 1}` : `Insert #${inserts.length + 1}`,
      strandedness,
      length: strandedness === 'ssDNA' ? 60 : 1000,
      concentration: 50,
      molarRatio: strandedness === 'ssDNA' ? 200.0 : 2.0, // Vector:ssDNA = 1:200
      isCustomRatio: false,
      useDilution: false,
      dilutionFactor: 10,
      isUnpurifiedPcr: false,
    };
    setInserts((prev) => [...prev, newInsert]);
    setActivePresetId('');
    setCurrentIsUnsaved(true);
  };

  // Update insert
  const handleUpdateInsert = (id: string, updates: Partial<InsertItem>) => {
    setInserts((prev) =>
      prev.map((ins) => (ins.id === id ? { ...ins, ...updates } : ins))
    );
    setActivePresetId('');
    setCurrentIsUnsaved(true);
  };

  // Delete insert
  const handleDeleteInsert = (id: string) => {
    setInserts((prev) => prev.filter((ins) => ins.id !== id));
    setActivePresetId('');
    setCurrentIsUnsaved(true);
  };

  // Repository actions
  const handleSelectRecipe = (recipe: SavedRecipe) => {
    setActiveRecipeId(recipe.id);
    setConfig(recipe.config);
    setVector(recipe.vector);
    setInserts(recipe.inserts);
    setActivePresetId('');
    setCurrentIsUnsaved(false);
  };

  // Save adjustments in-place to currently active recipe
  const handleUpdateActiveRecipe = () => {
    if (!activeRecipeId) {
      // If no active recipe, save as new
      handleSaveAsNewRecipe(`Construct #${recipes.length + 1}`);
      return;
    }
    setRecipes((prev) =>
      prev.map((r) =>
        r.id === activeRecipeId
          ? {
              ...r,
              config: { ...config },
              vector: { ...vector },
              inserts: JSON.parse(JSON.stringify(inserts)),
            }
          : r
      )
    );
    setCurrentIsUnsaved(false);
  };

  // Save as a brand new recipe in the repository
  const handleSaveAsNewRecipe = (name: string, notes?: string) => {
    const newRecipe: SavedRecipe = {
      id: `recipe-${Date.now()}`,
      name,
      notes,
      createdAt: Date.now(),
      config: { ...config },
      vector: { ...vector },
      inserts: JSON.parse(JSON.stringify(inserts)),
    };
    setRecipes((prev) => [newRecipe, ...prev]);
    setActiveRecipeId(newRecipe.id);
    setCurrentIsUnsaved(false);
  };

  // Revert bench adjustments back to active recipe saved state
  const handleRevertActiveRecipe = () => {
    if (!activeRecipeId) return;
    const target = recipes.find((r) => r.id === activeRecipeId);
    if (!target) return;
    setConfig(target.config);
    setVector(target.vector);
    setInserts(JSON.parse(JSON.stringify(target.inserts)));
    setCurrentIsUnsaved(false);
  };

  const handleDeleteRecipe = (id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    if (activeRecipeId === id) {
      setActiveRecipeId(null);
    }
  };

  const handleDuplicateRecipe = (recipe: SavedRecipe) => {
    const cloned: SavedRecipe = {
      ...recipe,
      id: `recipe-${Date.now()}`,
      name: `${recipe.name} (Copy)`,
      createdAt: Date.now(),
      inserts: JSON.parse(JSON.stringify(recipe.inserts)),
    };
    setRecipes((prev) => [cloned, ...prev]);
  };

  const handleNewRecipe = () => {
    const blankPreset = PRESET_SCENARIOS[0];
    setConfig(blankPreset.config);
    setVector({
      ...blankPreset.vector,
      name: `New Vector ${recipes.length + 1}`,
    });
    setInserts([
      {
        id: `insert-${Date.now()}`,
        name: 'Insert #1',
        strandedness: 'dsDNA',
        length: 800,
        concentration: 40,
        molarRatio: 2.0,
        isCustomRatio: false,
        useDilution: false,
        dilutionFactor: 5,
        isUnpurifiedPcr: false,
      },
    ]);
    setActiveRecipeId(null);
    setCurrentIsUnsaved(true);
  };

  // Open batch calculator for an individual recipe from the repository
  const handleOpenBatchForRecipe = (recipe: SavedRecipe) => {
    const calc = calculateAssembly(recipe.vector, recipe.inserts, recipe.config);
    setBatchTarget({
      calculation: calc,
      recipeName: recipe.name,
    });
    setIsBatchModalOpen(true);
  };

  // Open batch calculator for the active bench recipe
  const handleOpenActiveBatch = () => {
    const activeRecipe = recipes.find((r) => r.id === activeRecipeId);
    setBatchTarget({
      calculation,
      recipeName: activeRecipe ? activeRecipe.name : vector.name || 'Current Bench Assembly',
    });
    setIsBatchModalOpen(true);
  };

  // Count how many inserts currently use dilution and how many are still below 0.7 µL
  const dilutedCount = inserts.filter((i) => i.useDilution).length;
  const needDilutionCount = calculation.inserts.filter(
    (i) => i.actualVolumeUl < 0.7
  ).length;

  const activeRecipe = recipes.find((r) => r.id === activeRecipeId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBatchModal={handleOpenActiveBatch}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
        onReset={handleReset}
        isInstalled={pwaInstall.isInstalled}
      />

      <OfflineIndicator />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Sub-Header Bench Telemetry Strip */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs bg-white border border-slate-200 rounded-lg px-4 py-2.5 shadow-2xs font-mono">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-500">BENCH STATUS:</span>
            <span
              className={`font-semibold ${
                calculation.validation.status === 'error'
                  ? 'text-rose-600'
                  : calculation.validation.status === 'warning'
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            >
              ●{' '}
              {calculation.validation.status === 'optimal'
                ? 'Nominal Reaction Parameters'
                : calculation.validation.status === 'warning'
                ? 'Attention Required (Check Volumes)'
                : 'Reaction Capacity Exceeded'}
            </span>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600">Active Construct:</span>
              <strong className="text-slate-900">
                {activeRecipe ? activeRecipe.name : 'Custom / Unsaved Construct'}
              </strong>
              {currentIsUnsaved && activeRecipe && (
                <div className="flex items-center gap-1 ml-1">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    Unsaved Edits
                  </span>
                  <button
                    onClick={handleUpdateActiveRecipe}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors"
                    title="Quick Save: overwrite active recipe with current bench edits"
                  >
                    <Save className="w-3 h-3" />
                    <span>Save</span>
                  </button>
                </div>
              )}
            </div>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">
              Total DNA: <strong className="text-slate-900">{calculation.totalDnaPmol.toFixed(3)} pmol</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">
              Reaction Vol: <strong className="text-slate-900">{calculation.totalReactionVolumeUl.toFixed(1)} µL</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {needDilutionCount > 0 && (
              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1 font-sans font-medium text-[11px]">
                <Droplets className="w-3 h-3 text-amber-600" />
                {needDilutionCount} insert {needDilutionCount === 1 ? 'volume' : 'volumes'} &lt; 0.7 µL
              </span>
            )}
            {dilutedCount > 0 && (
              <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1 font-sans font-medium text-[11px]">
                <Droplets className="w-3 h-3 text-blue-600" />
                {dilutedCount} working dilution active
              </span>
            )}
            <button
              onClick={() => setIsReferenceModalOpen(true)}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-sans font-medium text-xs ml-2"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Antibiotics &amp; Manual
            </button>
          </div>
        </div>

        {/* Tab 1: REACTION CALCULATOR */}
        {activeTab === 'calculator' && (
          <div>
            {/* Mode & Presets Bar */}
            <AssemblyModeSelector
              config={config}
              calculation={calculation}
              onChangeConfig={(updates) => {
                setConfig((prev) => ({ ...prev, ...updates }));
                setActivePresetId('');
                setCurrentIsUnsaved(true);
              }}
              onSelectMode={handleSelectMode}
              onApplyPreset={handleApplyPreset}
              activePresetId={activePresetId}
            />

            {/* Assembly Reaction Repository (Experiment Round View) */}
            <ReactionRepository
              recipes={recipes}
              activeRecipeId={activeRecipeId}
              onSelectRecipe={handleSelectRecipe}
              onUpdateActiveRecipe={handleUpdateActiveRecipe}
              onSaveAsNewRecipe={handleSaveAsNewRecipe}
              onRevertActiveRecipe={handleRevertActiveRecipe}
              onDeleteRecipe={handleDeleteRecipe}
              onDuplicateRecipe={handleDuplicateRecipe}
              onNewRecipe={handleNewRecipe}
              onOpenBatchForRecipe={handleOpenBatchForRecipe}
              currentIsUnsaved={currentIsUnsaved}
            />

            {/* Input Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
              {/* Left Column: Vector & Inserts */}
              <div className="lg:col-span-7 space-y-6">
                <VectorCard
                  vector={vector}
                  onChangeVector={handleUpdateVector}
                  calculatedVolumeUl={calculation.vector.volumeUl}
                  calculatedPmol={calculation.vector.pmol}
                  onOpenPcrInfo={() => setIsPcrInfoModalOpen(true)}
                />

                <InsertsList
                  calculatedInserts={calculation.inserts}
                  onAddInsert={handleAddInsert}
                  onUpdateInsert={handleUpdateInsert}
                  onDeleteInsert={handleDeleteInsert}
                  onOpenPcrInfo={() => setIsPcrInfoModalOpen(true)}
                />
              </div>

              {/* Right Column: Visual Diagram & Quick Protocol Callout */}
              <div className="lg:col-span-5 space-y-6">
                <VisualAssemblyDiagram calculation={calculation} />

                {/* Quick Bench Info Callout */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    NEBuilder HiFi Manual Protocol Summary
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    NEBuilder HiFi Master Mix (2X) works seamlessly with both <strong>dsDNA (650 Da/bp)</strong> and <strong>single-stranded oligonucleotides (330 Da/nt)</strong>. 
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 font-mono text-[11px]">
                    <li>2–3 Frags: 1:2 Vector:Insert ratio (15 min @ 50°C)</li>
                    <li>&lt;200 bp dsDNA: 5-fold molar excess required</li>
                    <li>ssDNA Oligos: 1:200 Vector:Insert molar ratio</li>
                    <li>4–6 Frags: 1:1 equimolar ratio (60 min @ 50°C)</li>
                    <li>Low volumes (&lt;0.7 µL): Dilute stock to avoid pipetting inaccuracy</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Full Width: Bench Reaction Summary Table */}
            <ReactionSummaryTable
              calculation={calculation}
              onOpenBatchModal={handleOpenActiveBatch}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          </div>
        )}

        {/* Tab 2: BENCH PROTOCOL & TIMERS */}
        {activeTab === 'protocol' && (
          <div>
            <LabBenchProtocol calculation={calculation} />
          </div>
        )}

        {/* Tab 3: REFERENCE & TROUBLESHOOTING */}
        {activeTab === 'reference' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              NEBuilder® HiFi DNA Assembly Instruction Reference (NEB #E2621)
            </h3>
            <p className="text-xs text-slate-500 mb-6 font-mono">
              Synthesized directly from NEB Product Manual Version 5.0_7/23
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Antibiotics Table */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <h4 className="text-sm font-bold text-slate-900 mb-2">
                  Antibiotics for Plasmid Selection (Appendix A)
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/70 font-mono text-[11px] text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="p-2">Antibiotic</th>
                        <th className="p-2">Working Conc.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-xs">
                      <tr><td className="p-2 font-sans font-medium">Ampicillin</td><td className="p-2 text-blue-700 font-bold">100 µg/ml</td></tr>
                      <tr><td className="p-2 font-sans font-medium">Carbenicillin</td><td className="p-2 text-blue-700 font-bold">100 µg/ml</td></tr>
                      <tr><td className="p-2 font-sans font-medium">Chloramphenicol</td><td className="p-2 text-blue-700 font-bold">33 µg/ml</td></tr>
                      <tr><td className="p-2 font-sans font-medium">Kanamycin</td><td className="p-2 text-blue-700 font-bold">30 µg/ml</td></tr>
                      <tr><td className="p-2 font-sans font-medium">Streptomycin</td><td className="p-2 text-blue-700 font-bold">25 µg/ml</td></tr>
                      <tr><td className="p-2 font-sans font-medium">Tetracycline</td><td className="p-2 text-blue-700 font-bold">15 µg/ml</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* DpnI Digestion */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <h4 className="text-sm font-bold text-slate-900 mb-2">
                  DpnI Digestion Protocol (Page 7)
                </h4>
                <p className="text-xs text-slate-600 mb-3">
                  Essential for destroying methylated parental plasmid templates before assembly.
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700 font-mono bg-white p-3 rounded-lg border border-slate-200">
                  <li>Mix 5–8 µL PCR product with 1 µL 10X CutSmart® Buffer and 1 µL (20 U) DpnI.</li>
                  <li>Incubate at 37°C for 30 minutes.</li>
                  <li>Heat-inactivate DpnI at 80°C for 20 minutes.</li>
                  <li>Directly load into assembly (if ≤ 20% total volume).</li>
                </ol>
              </div>

              {/* Troubleshooting: No Colonies */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <h4 className="text-sm font-bold text-slate-900 mb-2">
                  Troubleshooting: No Colonies Yielded (Page 12)
                </h4>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600">
                  <li>Transform competent cells with 100 pg pUC19 control to verify cell viability (&gt;10⁹ cfu/µg).</li>
                  <li>Use NEB 5-alpha or 10-beta competent cells (other vendors may show inhibition).</li>
                  <li>Do not vortex competent cells; flick gently. Thaw strictly on wet ice.</li>
                  <li>Strict 42°C for 45s heat shock timing; do not overheat or extend.</li>
                </ul>
              </div>

              {/* Troubleshooting: High Background */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <h4 className="text-sm font-bold text-slate-900 mb-2">
                  Troubleshooting: High Vector-Only Clones (Page 13)
                </h4>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600">
                  <li>Treat PCR-amplified vector with DpnI to destroy methylated plasmid template.</li>
                  <li>Double digest vector with two different restriction enzymes to prevent self-ligation.</li>
                  <li>Gel-purify linearized vector to eliminate uncut supercoiled DNA.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-mono">
          <div>
            NEBuilder® HiFi &amp; Gibson DNA Assembly Calculator · For Research &amp; Clinical Laboratory Use
          </div>
          <div className="flex items-center gap-4 font-sans text-slate-600">
            <span>dsDNA (650 Da/bp)</span>
            <span>·</span>
            <span>ssDNA (330 Da/nt · 1:200 Molar)</span>
            <span>·</span>
            <span>Reaction Repository</span>
            <span>·</span>
            <span>Dilution Advisor</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BatchCalculatorModal
        isOpen={isBatchModalOpen}
        onClose={() => {
          setIsBatchModalOpen(false);
          setBatchTarget(null);
        }}
        calculation={batchTarget ? batchTarget.calculation : calculation}
        recipeName={batchTarget?.recipeName}
      />

      <ExportNotebookModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        calculation={calculation}
      />

      <LabProtocolReferenceModal
        isOpen={isReferenceModalOpen}
        onClose={() => setIsReferenceModalOpen(false)}
      />

      <UnpurifiedPcrInfoModal
        isOpen={isPcrInfoModalOpen}
        onClose={() => setIsPcrInfoModalOpen(false)}
      />

      <DeploymentModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        onInstallPWA={async () => {
          await pwaInstall.install();
        }}
        isInstallable={pwaInstall.isInstallable}
        isInstalled={pwaInstall.isInstalled}
        isIOS={pwaInstall.isIOS}
      />
    </div>
  );
}
