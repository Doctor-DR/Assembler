import React, { useState } from 'react';
import { AssemblyCalculationResult, SavedRecipe } from '../types/assembly';
import { calculateAssembly } from '../utils/calculator';
import {
  Archive,
  ArrowRight,
  Check,
  Copy,
  Droplets,
  ExternalLink,
  Layers,
  Plus,
  Trash2,
  FolderOpen,
  Beaker,
  Sparkles,
  Save,
  RotateCcw,
} from 'lucide-react';

interface ReactionRepositoryProps {
  recipes: SavedRecipe[];
  activeRecipeId: string | null;
  onSelectRecipe: (recipe: SavedRecipe) => void;
  onUpdateActiveRecipe: () => void;
  onSaveAsNewRecipe: (name: string, notes?: string) => void;
  onRevertActiveRecipe?: () => void;
  onDeleteRecipe: (id: string) => void;
  onDuplicateRecipe: (recipe: SavedRecipe) => void;
  onNewRecipe: () => void;
  onOpenBatchForRecipe: (recipe: SavedRecipe) => void;
  currentIsUnsaved: boolean;
}

export const ReactionRepository: React.FC<ReactionRepositoryProps> = ({
  recipes,
  activeRecipeId,
  onSelectRecipe,
  onUpdateActiveRecipe,
  onSaveAsNewRecipe,
  onRevertActiveRecipe,
  onDeleteRecipe,
  onDuplicateRecipe,
  onNewRecipe,
  onOpenBatchForRecipe,
  currentIsUnsaved,
}) => {
  const [isSavingModalOpen, setIsSavingModalOpen] = useState(false);
  const [recipeName, setRecipeName] = useState('');
  const [recipeNotes, setRecipeNotes] = useState('');
  const [roundOveragePct, setRoundOveragePct] = useState<number>(10);
  const [justSaved, setJustSaved] = useState(false);

  const activeRecipe = recipes.find((r) => r.id === activeRecipeId);

  // Compute total 2X Master Mix across all distinct recipes in this round
  const totalMasterMixAcrossRound = recipes.reduce((sum, r) => {
    return sum + r.config.totalVolumeUl / r.config.masterMixConcentration;
  }, 0);

  const roundMultiplier = 1 + roundOveragePct / 100;
  const pooledMasterMixUl = totalMasterMixAcrossRound * roundMultiplier;

  const handleOpenSaveAs = () => {
    if (activeRecipe) {
      setRecipeName(`${activeRecipe.name} (Copy)`);
      setRecipeNotes(activeRecipe.notes || '');
    } else {
      setRecipeName(`Construct #${recipes.length + 1}`);
      setRecipeNotes('');
    }
    setIsSavingModalOpen(true);
  };

  const handleConfirmSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeName.trim()) return;
    onSaveAsNewRecipe(recipeName.trim(), recipeNotes.trim());
    setIsSavingModalOpen(false);
  };

  const handleDirectSave = () => {
    if (activeRecipe) {
      onUpdateActiveRecipe();
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2200);
    } else {
      handleOpenSaveAs();
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs mb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Assembly Reaction Repository (Current Experiment Round)
            </h3>
            <span className="text-xs font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-semibold border border-blue-200">
              {recipes.length} Saved Construct{recipes.length === 1 ? '' : 's'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Store distinct constructs for your cloning session. Save adjustments in place or save as new recipes.
          </p>
        </div>

        {/* Action Controls: Save, Save As, New Construct */}
        <div className="flex flex-wrap items-center gap-2">
          {/* If there is an active construct and it has been adjusted: show prominent Save button */}
          {activeRecipe && currentIsUnsaved ? (
            <button
              onClick={handleDirectSave}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
              title={`Save adjustments directly to ${activeRecipe.name}`}
            >
              {justSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          ) : activeRecipe && !currentIsUnsaved ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="truncate max-w-[140px] font-semibold">{activeRecipe.name}</span>
              <span className="text-slate-400 font-mono text-[11px]">(Saved)</span>
            </span>
          ) : (
            <button
              onClick={handleOpenSaveAs}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Construct</span>
            </button>
          )}

          {/* Save As New Button */}
          <button
            onClick={handleOpenSaveAs}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 transition-colors shadow-2xs"
            title="Save current parameters as a new construct"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Save As New...</span>
          </button>

          {/* Revert Button (if uncommitted edits) */}
          {activeRecipe && currentIsUnsaved && onRevertActiveRecipe && (
            <button
              onClick={onRevertActiveRecipe}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
              title="Discard current adjustments and reload saved construct parameters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Revert</span>
            </button>
          )}

          {/* New Construct */}
          <button
            onClick={onNewRecipe}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Construct</span>
          </button>
        </div>
      </div>

      {/* Round-Wide Master Mix Pool Bar (When running multiple distinct constructs) */}
      {recipes.length > 1 && (
        <div className="mt-4 p-3.5 bg-slate-900 text-white rounded-lg text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">
                Round Master Mix Cocktail Pool ({recipes.length} Distinct Reactions):
              </span>
              <span className="text-[11px] text-slate-400">
                All {recipes.length} reactions require 2X Enzyme Mix. Prepare one pooled tube to save pipetting steps!
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-center shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">
                Pooled 2X Master Mix (+{roundOveragePct}% overage):
              </span>
              <span className="text-base font-bold text-blue-400 tabular-nums">
                {pooledMasterMixUl.toFixed(1)} µL
              </span>
              <span className="text-[10px] text-slate-400 ml-1">
                ({(pooledMasterMixUl / recipes.length).toFixed(1)} µL/tube)
              </span>
            </div>

            <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
              {[5, 10, 15].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setRoundOveragePct(pct)}
                  className={`px-1.5 py-0.5 rounded text-[10px] ${
                    roundOveragePct === pct
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  +{pct}%
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid of Saved Recipes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
        {recipes.map((recipe, index) => {
          const isActive = recipe.id === activeRecipeId;
          const isModified = isActive && currentIsUnsaved;
          const calc = calculateAssembly(recipe.vector, recipe.inserts, recipe.config);
          const needsDilutionCount = calc.inserts.filter(
            (i) => i.actualVolumeUl < 0.7
          ).length;

          return (
            <div
              key={recipe.id}
              onClick={() => onSelectRecipe(recipe)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                isModified
                  ? 'border-amber-400 bg-amber-50/20 ring-2 ring-amber-400/30 shadow-xs'
                  : isActive
                  ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div>
                {/* Recipe Card Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-xs ${
                        isModified
                          ? 'bg-amber-600 text-white'
                          : isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      #{index + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {recipe.name}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500">
                        {recipe.config.totalVolumeUl} µL Reaction · {1 + recipe.inserts.length} Frags
                      </span>
                    </div>
                  </div>

                  {isModified ? (
                    <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded shrink-0">
                      Unsaved Edits
                    </span>
                  ) : isActive ? (
                    <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded shrink-0">
                      Active on Bench
                    </span>
                  ) : null}
                </div>

                {recipe.notes && (
                  <p className="text-[11px] text-slate-500 mb-2 line-clamp-1 italic">
                    {recipe.notes}
                  </p>
                )}

                {/* Recipe Summary Data */}
                <div className="bg-slate-50/80 rounded-lg p-2.5 space-y-1 font-mono text-[11px] text-slate-600 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">Vector:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[140px]">
                      {recipe.vector.name || 'Vector'} ({recipe.vector.length} bp)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">Inserts:</span>
                    <span className="text-slate-800">
                      {recipe.inserts.length} ({recipe.inserts.map((i) => i.strandedness).join(', ')})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">Total DNA:</span>
                    <span className="text-slate-800 font-semibold">
                      {calc.totalDnaPmol.toFixed(3)} pmol
                    </span>
                  </div>

                  {needsDilutionCount > 0 && (
                    <div className="pt-1 text-[10px] text-amber-700 flex items-center gap-1 font-sans font-medium">
                      <Droplets className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>{needsDilutionCount} component requires dilution (&lt;0.7 µL)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons for this specific Recipe */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenBatchForRecipe(recipe);
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 rounded-md bg-white hover:bg-slate-50 transition-colors"
                    title="Prepare multiple replicates of this specific recipe"
                  >
                    <Layers className="w-3 h-3 text-blue-600" />
                    <span>Batch Mix</span>
                  </button>

                  {/* If active and modified, allow quick 1-click save right on card */}
                  {isModified && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDirectSave();
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-md transition-colors"
                      title="Save bench edits into this recipe"
                    >
                      <Save className="w-3 h-3 text-emerald-600" />
                      <span>Save</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateRecipe(recipe);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                    title="Duplicate construct"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {recipes.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRecipe(recipe.id);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                      title="Delete construct"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save As / Save Modal */}
      {isSavingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Save As New Recipe to Repository
              </h3>
              <button
                onClick={() => setIsSavingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmSave} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Construct / Recipe Name
                </label>
                <input
                  type="text"
                  required
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  placeholder="e.g. pET28a-GFP Mutant K120A"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:outline-blue-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Experiment Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={recipeNotes}
                  onChange={(e) => setRecipeNotes(e.target.value)}
                  placeholder="e.g. Screening clone with FLAG linker and Kan resistance..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-blue-600 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSavingModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Save As New Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
