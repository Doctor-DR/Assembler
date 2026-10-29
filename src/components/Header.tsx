import React from 'react';
import { Beaker, BookOpen, Clock, Download, FileText, Layers, RefreshCw, Smartphone } from 'lucide-react';

interface HeaderProps {
  activeTab: 'calculator' | 'protocol' | 'reference';
  setActiveTab: (tab: 'calculator' | 'protocol' | 'reference') => void;
  onOpenBatchModal: () => void;
  onOpenExportModal: () => void;
  onOpenDeployModal: () => void;
  onReset: () => void;
  isInstalled?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenBatchModal,
  onOpenExportModal,
  onOpenDeployModal,
  onReset,
  isInstalled,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand wordmark (single line, no pill islands) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Beaker className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">
                HiFi &amp; Gibson Assembly
              </span>
              <span className="text-[11px] text-slate-500 font-mono tracking-tight block">
                NEB-E2621 · Precision Bench Calculator
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (single line, clean typography) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'calculator'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              Reaction Calculator
            </button>

            <button
              onClick={() => setActiveTab('protocol')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'protocol'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              Bench Protocol &amp; Timers
            </button>

            <button
              onClick={() => setActiveTab('reference')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'reference'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Manual &amp; Troubleshooting
            </button>

            <button
              onClick={onOpenBatchModal}
              className="flex items-center gap-1.5 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 border-transparent"
            >
              <FileText className="w-4 h-4" />
              Batch Master Mix
            </button>
          </nav>

          {/* Zone 3: Primary Action & Reset */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onReset}
              title="Reset parameters to default"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenDeployModal}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap border ${
                isInstalled
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
              }`}
              title="Install as mobile/desktop app or publish as custom website"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{isInstalled ? 'App Installed' : 'Install App'}</span>
            </button>

            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Export Lab Sheet
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
