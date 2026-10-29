import React from 'react';
import { CalculatedInsert, InsertItem } from '../types/assembly';
import { InsertCard } from './InsertCard';
import { Plus, Dna, FileQuestion } from 'lucide-react';

interface InsertsListProps {
  calculatedInserts: CalculatedInsert[];
  onAddInsert: (strandedness?: 'dsDNA' | 'ssDNA') => void;
  onUpdateInsert: (id: string, updates: Partial<InsertItem>) => void;
  onDeleteInsert: (id: string) => void;
  onOpenPcrInfo?: () => void;
}

export const InsertsList: React.FC<InsertsListProps> = ({
  calculatedInserts,
  onAddInsert,
  onUpdateInsert,
  onDeleteInsert,
  onOpenPcrInfo,
}) => {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Dna className="w-4 h-4 text-emerald-600" />
            Assembly Inserts ({calculatedInserts.length})
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">
            Support for dsDNA fragments (650 Da/bp) and ssDNA oligonucleotides (330 Da/nt)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddInsert('dsDNA')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            + Add dsDNA Insert
          </button>
          <button
            onClick={() => onAddInsert('ssDNA')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            + Add ssDNA Oligo
          </button>
        </div>
      </div>

      {calculatedInserts.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center">
          <FileQuestion className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-700">No Inserts Added</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Add at least one double-stranded DNA insert or single-stranded oligonucleotide linker to complete the assembly reaction.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => onAddInsert('dsDNA')}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
            >
              Add dsDNA Fragment
            </button>
            <button
              onClick={() => onAddInsert('ssDNA')}
              className="px-4 py-2 text-xs font-semibold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-300 rounded-lg"
            >
              Add ssDNA Oligo
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {calculatedInserts.map((item, idx) => (
            <InsertCard
              key={item.insert.id}
              index={idx}
              calculatedInsert={item}
              onUpdate={(updates) => onUpdateInsert(item.insert.id, updates)}
              onDelete={() => onDeleteInsert(item.insert.id)}
              canDelete={calculatedInserts.length > 1}
              onOpenPcrInfo={onOpenPcrInfo}
            />
          ))}
        </div>
      )}
    </div>
  );
};
