import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Globe, 
  Laptop, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  Share2, 
  PlusSquare, 
  Server, 
  Copy, 
  Check,
  WifiOff
} from 'lucide-react';

interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstallPWA?: () => void;
  isInstallable?: boolean;
  isInstalled?: boolean;
  isIOS?: boolean;
}

export const DeploymentModal: React.FC<DeploymentModalProps> = ({
  isOpen,
  onClose,
  onInstallPWA,
  isInstallable,
  isInstalled,
  isIOS,
}) => {
  const [activeTab, setActiveTab] = useState<'app' | 'website'>('app');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                Use as an App &amp; Website
              </h2>
              <p className="text-xs text-slate-500">
                Install on your lab phone/laptop, run offline, or publish to custom domain
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            onClick={() => setActiveTab('app')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'app'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            1. Install as Mobile &amp; Desktop App (PWA)
          </button>
          <button
            onClick={() => setActiveTab('website')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'website'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Server className="w-4 h-4" />
            2. Host on Custom Domain / Web Server
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 leading-relaxed">
          {activeTab === 'app' ? (
            <div className="space-y-6">
              {/* Direct Install Banner */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-blue-900">
                    <Download className="w-4 h-4 text-blue-600" />
                    <span>Instant Lab Bench App Installation</span>
                  </div>
                  <p className="text-xs text-blue-800/90 leading-relaxed">
                    This calculator is fully enabled as a <strong>Progressive Web App (PWA)</strong>. It launches fullscreen like a native app, has an icon on your home screen or dock, and <strong>works offline without Wi-Fi</strong> at the bench.
                  </p>
                </div>
                {isInstalled ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold whitespace-nowrap">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Already Installed
                  </span>
                ) : (
                  <button
                    onClick={onInstallPWA}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Install App Now
                  </button>
                )}
              </div>

              {/* Instructions by Device */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* iPhone / iPad */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-slate-900 text-xs">
                    <Smartphone className="w-4 h-4 text-slate-700" />
                    <span>iOS (iPhone &amp; iPad)</span>
                  </div>
                  <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside pl-0.5">
                    <li>Open this URL in <strong>Safari</strong>.</li>
                    <li className="flex items-start gap-1">
                      <span>Tap the <strong>Share</strong> icon</span>
                      <Share2 className="w-3.5 h-3.5 text-blue-600 inline shrink-0 mt-0.5" />
                    </li>
                    <li className="flex items-start gap-1">
                      <span>Scroll &amp; tap <strong>Add to Home Screen</strong></span>
                      <PlusSquare className="w-3.5 h-3.5 text-blue-600 inline shrink-0 mt-0.5" />
                    </li>
                    <li>Tap <strong>Add</strong> in the top right. An app icon appears on your home screen!</li>
                  </ol>
                </div>

                {/* Android Phone / Tablet */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-slate-900 text-xs">
                    <Smartphone className="w-4 h-4 text-emerald-700" />
                    <span>Android (Chrome)</span>
                  </div>
                  <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside pl-0.5">
                    <li>Open this page in <strong>Google Chrome</strong>.</li>
                    <li>Tap <strong>Install App</strong> above or tap the three dots <strong>(⋮)</strong> in Chrome.</li>
                    <li>Select <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
                    <li>The app installs with its own isolated window and offline storage.</li>
                  </ol>
                </div>

                {/* Desktop Chrome / Edge / Mac / Windows */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-slate-900 text-xs">
                    <Laptop className="w-4 h-4 text-indigo-700" />
                    <span>Desktop (Mac / Windows)</span>
                  </div>
                  <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside pl-0.5">
                    <li>Look in your browser's address bar (URL bar).</li>
                    <li>Click the <strong>Install icon</strong> (a computer monitor with down arrow).</li>
                    <li>Click <strong>Install</strong> to add GibsonCalc to your Applications / Start Menu.</li>
                    <li>Opens as a dedicated window without browser clutter.</li>
                  </ol>
                </div>
              </div>

              {/* Offline Bench Mode highlight */}
              <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <WifiOff className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 leading-relaxed">
                  <span className="font-bold">100% Offline Bench Support: </span>
                  All molecular mass calculations, NEB BioCalculator molar algorithms, incubation timers, and your saved reaction repository run locally in the browser/app. You can take your tablet into the laminar flow hood or cold room without internet.
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Live URL sharing */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Current Live Application URL
                  </span>
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Active &amp; Online Now
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Your application is <strong>already hosted live right now</strong>. You can share this URL directly with your lab team, collaborators, or students:
                </p>
                <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg p-2 font-mono text-xs text-slate-800">
                  <span className="truncate flex-1">{currentUrl || 'Current app URL'}</span>
                  <button
                    onClick={() => handleCopy(currentUrl, 'url')}
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors shrink-0"
                    title="Copy URL"
                  >
                    {copiedText === 'url' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Custom Domain Hosting Options */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Deploying to Your Own Custom Domain (e.g. yourlab.org / gibsoncalc.com)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  This project is built with <strong>React + Vite + Tailwind CSS</strong>. It compiles into a 100% self-contained static web application with zero backend server dependencies or ongoing database fees.
                </p>

                {/* Option 1: Vercel / Netlify */}
                <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 text-xs">Option A: Vercel or Netlify (Fastest &amp; Free)</span>
                    <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold">Recommended</span>
                  </div>
                  <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                    <li>Push this codebase to a GitHub repository.</li>
                    <li>Log into <strong>vercel.com</strong> or <strong>netlify.com</strong> and click <em>Add New Project &gt; Import from Git</em>.</li>
                    <li>Vercel/Netlify auto-detects Vite and deploys in ~20 seconds with free SSL HTTPS.</li>
                    <li>Under <em>Project Settings &gt; Domains</em>, add your own custom domain (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded">cloning.lab.edu</code>).</li>
                  </ol>
                </div>

                {/* Option 2: GitHub Pages */}
                <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2">
                  <span className="font-semibold text-slate-900 text-xs block">Option B: GitHub Pages (Free academic hosting)</span>
                  <p className="text-xs text-slate-600">
                    Run <code className="bg-slate-100 px-1 py-0.5 rounded">npm run build</code>, which outputs the production bundle to the <code className="bg-slate-100 px-1 py-0.5 rounded">dist/</code> directory. You can host this directly on GitHub Pages under your lab's GitHub organization (<code className="bg-slate-100 px-1 py-0.5 rounded">yourlab.github.io/gibson-calculator</code>).
                  </p>
                </div>

                {/* Option 3: Lab Docker / Apache / Nginx Server */}
                <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2">
                  <span className="font-semibold text-slate-900 text-xs block">Option C: Lab Institutional Intranet / Nginx</span>
                  <p className="text-xs text-slate-600">
                    Copy the generated <code className="bg-slate-100 px-1 py-0.5 rounded">dist/</code> static files to any internal Apache or Nginx root directory (<code className="bg-slate-100 px-1 py-0.5 rounded">/var/www/html</code>). No Node.js runtime or database daemon is required in production!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Vite PWA · Service Worker Cache v1.0
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
