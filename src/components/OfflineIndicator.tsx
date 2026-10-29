import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm sticky top-16 z-30 transition-all">
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>
        <strong>Offline Bench Mode:</strong> Working without internet connection. All Gibson calculations, timers, and saved reaction protocols remain fully functional.
      </span>
    </div>
  );
};
