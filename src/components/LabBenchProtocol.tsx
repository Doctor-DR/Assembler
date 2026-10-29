import React, { useEffect, useState } from 'react';
import { AssemblyCalculationResult } from '../types/assembly';
import { playLabChime } from '../utils/sound';
import {
  Bell,
  CheckCircle,
  Clock,
  Flame,
  Pause,
  Play,
  RotateCcw,
  Snowflake,
  Sparkles,
  Thermometer,
} from 'lucide-react';

interface LabBenchProtocolProps {
  calculation: AssemblyCalculationResult;
}

export const LabBenchProtocol: React.FC<LabBenchProtocolProps> = ({ calculation }) => {
  const fragmentCount = 1 + calculation.inserts.length;
  const defaultIncubationMinutes = calculation.modeRules?.recommendedIncubationMinutes ?? (fragmentCount <= 3 ? 15 : 60);

  // Assembly Thermocycler Timer state
  const [incubationSecondsLeft, setIncubationSecondsLeft] = useState<number>(
    defaultIncubationMinutes * 60
  );
  const [isIncubationRunning, setIsIncubationRunning] = useState<boolean>(false);

  // Manual custom time state (in minutes)
  const [customIncubationMinutes, setCustomIncubationMinutes] = useState<number>(
    defaultIncubationMinutes
  );

  // Sync default time if fragment count changes and timer not modified by user
  useEffect(() => {
    if (!isIncubationRunning) {
      setCustomIncubationMinutes(defaultIncubationMinutes);
      setIncubationSecondsLeft(defaultIncubationMinutes * 60);
    }
  }, [defaultIncubationMinutes]);

  const handleSetCustomMinutes = (mins: number) => {
    const validMins = Math.max(1, Math.min(240, mins));
    setCustomIncubationMinutes(validMins);
    setIsIncubationRunning(false);
    setIncubationSecondsLeft(validMins * 60);
  };

  const handleAdjustSeconds = (deltaSeconds: number) => {
    setIsIncubationRunning(false);
    setIncubationSecondsLeft((prev) => {
      const next = Math.max(10, prev + deltaSeconds);
      setCustomIncubationMinutes(Math.ceil(next / 60));
      return next;
    });
  };

  // Thermocycler Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isIncubationRunning && incubationSecondsLeft > 0) {
      interval = setInterval(() => {
        setIncubationSecondsLeft((prev) => {
          if (prev <= 1) {
            playLabChime();
            setIsIncubationRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isIncubationRunning, incubationSecondsLeft]);

  // Transformation Step Timer state
  const [activeStepTimerId, setActiveStepTimerId] = useState<string | null>(null);
  const [stepSecondsLeft, setStepSecondsLeft] = useState<number>(0);
  const [isStepTimerRunning, setIsStepTimerRunning] = useState<boolean>(false);

  const startStepTimer = (id: string, durationSeconds: number) => {
    setActiveStepTimerId(id);
    setStepSecondsLeft(durationSeconds);
    setIsStepTimerRunning(true);
  };

  const pauseStepTimer = () => {
    setIsStepTimerRunning(false);
  };

  const resumeStepTimer = () => {
    setIsStepTimerRunning(true);
  };

  const resetStepTimer = (durationSeconds: number) => {
    setIsStepTimerRunning(false);
    setStepSecondsLeft(durationSeconds);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isStepTimerRunning && stepSecondsLeft > 0) {
      interval = setInterval(() => {
        setStepSecondsLeft((prev) => {
          if (prev <= 1) {
            playLabChime();
            setIsStepTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStepTimerRunning, stepSecondsLeft]);

  // Transformation Step Checkboxes
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const toggleStep = (id: string) => {
    setCompletedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 mb-8">
      {/* =========================================================================
          SECTION 1: 50°C THERMOCYCLER ASSEMBLY INCUBATION
         ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-rose-600" />
              Stage 1: Isothermal Thermocycler Incubation (50°C)
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              Recommended: {defaultIncubationMinutes} minutes for {fragmentCount} fragments
              ({fragmentCount <= 3 ? '2–3 fragments' : '4–6 fragments'})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Presets */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleSetCustomMinutes(mins)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                    incubationSecondsLeft === mins * 60 && !isIncubationRunning
                      ? 'bg-white text-blue-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>

            {/* Custom Minutes Input */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <label className="text-xs text-slate-500 font-semibold">Custom:</label>
              <div className="flex items-center">
                <input
                  type="number"
                  min="1"
                  max="240"
                  step="1"
                  disabled={isIncubationRunning}
                  value={customIncubationMinutes}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val > 0) {
                      handleSetCustomMinutes(val);
                    }
                  }}
                  className="w-14 px-1.5 py-1 text-xs font-mono font-bold text-center border border-slate-300 rounded bg-white text-slate-900 focus:outline-blue-500 disabled:bg-slate-100"
                />
                <span className="text-xs text-slate-500 font-mono ml-1">min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Thermocycler Bench Control */}
        <div className="bg-slate-900 text-white rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span>Incubation Temp: 50.0°C</span>
                <span>·</span>
                <span>Target: {customIncubationMinutes} min</span>
              </div>
              <div className="text-4xl font-mono font-bold tracking-tight mt-0.5 text-white tabular-nums">
                {formatTime(incubationSecondsLeft)}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Fine adjustment buttons */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => handleAdjustSeconds(-60)}
                disabled={isIncubationRunning}
                className="px-2 py-1 text-[11px] font-mono text-slate-300 hover:text-white hover:bg-slate-700 rounded disabled:opacity-40"
                title="Subtract 1 minute"
              >
                -1m
              </button>
              <button
                onClick={() => handleAdjustSeconds(60)}
                disabled={isIncubationRunning}
                className="px-2 py-1 text-[11px] font-mono text-slate-300 hover:text-white hover:bg-slate-700 rounded disabled:opacity-40"
                title="Add 1 minute"
              >
                +1m
              </button>
              <button
                onClick={() => handleAdjustSeconds(300)}
                disabled={isIncubationRunning}
                className="px-2 py-1 text-[11px] font-mono text-slate-300 hover:text-white hover:bg-slate-700 rounded disabled:opacity-40"
                title="Add 5 minutes"
              >
                +5m
              </button>
            </div>

            {!isIncubationRunning ? (
              <button
                onClick={() => setIsIncubationRunning(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                <Play className="w-4 h-4 fill-white" />
                Start 50°C Timer
              </button>
            ) : (
              <button
                onClick={() => setIsIncubationRunning(false)}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                <Pause className="w-4 h-4" />
                Pause
              </button>
            )}

            <button
              onClick={() => {
                setIsIncubationRunning(false);
                setIncubationSecondsLeft(customIncubationMinutes * 60);
              }}
              className="p-2.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-3 leading-relaxed">
          <strong>Protocol Note:</strong> Set the exact incubation time required by your assembly (e.g. 15 min for 2–3 fragments, 60 min for 4–6 fragments, or custom extended incubation up to 4 hours for challenging junctions). Following incubation, store samples on ice or at -20°C.
        </p>
      </div>

      {/* =========================================================================
          SECTION 2: E. COLI TRANSFORMATION BENCH PROTOCOL
         ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="pb-3 border-b border-slate-100 mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Stage 2: E. coli Transformation Protocol (NEB 5-alpha / 10-beta)
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              High-efficiency chemically competent cell protocol from instruction manual page 8
            </span>
          </div>

          <span className="text-xs font-mono text-slate-500">
            {Object.values(completedSteps).filter(Boolean).length} / 10 Steps Complete
          </span>
        </div>

        {/* Step-by-Step Interactive Workflow */}
        <div className="space-y-3">
          {/* Step 1 */}
          <div
            onClick={() => toggleStep('step-1')}
            className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
              completedSteps['step-1']
                ? 'bg-slate-50 border-slate-200 text-slate-500'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                completedSteps['step-1']
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'border-slate-300 bg-white'
              }`}
            >
              {completedSteps['step-1'] && <CheckCircle className="w-3.5 h-3.5" />}
            </div>
            <div className="flex-1 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span className={completedSteps['step-1'] ? 'line-through text-slate-400' : ''}>
                  Step 1: Thaw Competent Cells on Ice
                </span>
                <span className="text-[10px] font-mono text-cyan-700 bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-200">
                  <Snowflake className="w-3 h-3 inline mr-1" />
                  On Ice
                </span>
              </div>
              <p className="text-slate-600 mt-1">
                Thaw chemically competent cells (NEB 5-alpha or 10-beta) slowly on wet ice. Add DNA as soon as the last ice crystals disappear. Do not warm above 0°C.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div
            onClick={() => toggleStep('step-2')}
            className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
              completedSteps['step-2']
                ? 'bg-slate-50 border-slate-200 text-slate-500'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                completedSteps['step-2']
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'border-slate-300 bg-white'
              }`}
            >
              {completedSteps['step-2'] && <CheckCircle className="w-3.5 h-3.5" />}
            </div>
            <div className="flex-1 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span className={completedSteps['step-2'] ? 'line-through text-slate-400' : ''}>
                  Step 2: Add 2 µL Chilled Assembled Product
                </span>
                <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                  2.0 µL DNA
                </span>
              </div>
              <p className="text-slate-600 mt-1">
                Add 2 µL of the chilled assembled product to the competent cells. Mix gently by flicking the tube 4–5 times or pipetting slowly up and down. <strong>Do NOT vortex.</strong>
              </p>
            </div>
          </div>

          {/* Step 3 (With 30-min Timer) */}
          <div
            className={`p-3.5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              completedSteps['step-3']
                ? 'bg-slate-50 border-slate-200 text-slate-500'
                : 'bg-white border-slate-200'
            }`}
          >
            <div
              onClick={() => toggleStep('step-3')}
              className="flex items-start gap-3 cursor-pointer flex-1"
            >
              <div
                className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                  completedSteps['step-3']
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {completedSteps['step-3'] && <CheckCircle className="w-3.5 h-3.5" />}
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className={completedSteps['step-3'] ? 'line-through text-slate-400' : ''}>
                    Step 3: Incubate on Ice for 30 Minutes
                  </span>
                </div>
                <p className="text-slate-600 mt-1">
                  Place mixture on ice for 30 minutes. Do not mix. Shortening this step by 10 minutes leads to a 2-fold loss in efficiency.
                </p>
              </div>
            </div>

            {/* Integrated 30-min timer */}
            <div className="flex items-center gap-2 pl-8 sm:pl-0">
              {activeStepTimerId === 'step-3' ? (
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                  <span className="font-mono font-bold text-xs tabular-nums text-slate-800">
                    {formatTime(stepSecondsLeft)}
                  </span>
                  {isStepTimerRunning ? (
                    <button
                      onClick={pauseStepTimer}
                      className="p-1 hover:bg-slate-200 rounded text-slate-600"
                    >
                      <Pause className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={resumeStepTimer}
                      className="p-1 hover:bg-slate-200 rounded text-slate-600"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => resetStepTimer(30 * 60)}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startStepTimer('step-3', 30 * 60)}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Start 30m Timer
                </button>
              )}
            </div>
          </div>

          {/* Step 4: Heat shock 42°C for 45s (With 45-sec Timer) */}
          <div
            className={`p-3.5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              completedSteps['step-4']
                ? 'bg-slate-50 border-slate-200 text-slate-500'
                : 'bg-white border-slate-200'
            }`}
          >
            <div
              onClick={() => toggleStep('step-4')}
              className="flex items-start gap-3 cursor-pointer flex-1"
            >
              <div
                className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                  completedSteps['step-4']
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {completedSteps['step-4'] && <CheckCircle className="w-3.5 h-3.5" />}
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className={completedSteps['step-4'] ? 'line-through text-slate-400' : ''}>
                    Step 4: Heat Shock at 42°C Exactly 45 Seconds
                  </span>
                  <span className="text-[10px] font-mono text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                    42.0°C · 45s Critical Time
                  </span>
                </div>
                <p className="text-slate-600 mt-1">
                  Heat shock in 42°C water bath for exactly 45 seconds. Do not mix or shake.
                </p>
              </div>
            </div>

            {/* Integrated 45-sec timer */}
            <div className="flex items-center gap-2 pl-8 sm:pl-0">
              {activeStepTimerId === 'step-4' ? (
                <div className="flex items-center gap-2 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                  <span className="font-mono font-bold text-xs tabular-nums text-rose-900">
                    00:{stepSecondsLeft.toString().padStart(2, '0')}
                  </span>
                  {isStepTimerRunning ? (
                    <button
                      onClick={pauseStepTimer}
                      className="p-1 hover:bg-rose-100 rounded text-rose-700"
                    >
                      <Pause className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={resumeStepTimer}
                      className="p-1 hover:bg-rose-100 rounded text-rose-700"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => resetStepTimer(45)}
                    className="p-1 hover:bg-rose-100 rounded text-rose-500"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startStepTimer('step-4', 45)}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Flame className="w-3.5 h-3.5" />
                  Start 45s Heat Shock
                </button>
              )}
            </div>
          </div>

          {/* Step 5: Transfer to ice 2 min (With 2-min Timer) */}
          <div
            className={`p-3.5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              completedSteps['step-5']
                ? 'bg-slate-50 border-slate-200 text-slate-500'
                : 'bg-white border-slate-200'
            }`}
          >
            <div
              onClick={() => toggleStep('step-5')}
              className="flex items-start gap-3 cursor-pointer flex-1"
            >
              <div
                className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                  completedSteps['step-5']
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {completedSteps['step-5'] && <CheckCircle className="w-3.5 h-3.5" />}
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className={completedSteps['step-5'] ? 'line-through text-slate-400' : ''}>
                    Step 5: Ice Chill for 2 Minutes
                  </span>
                </div>
                <p className="text-slate-600 mt-1">
                  Transfer tubes immediately back to ice for 2 minutes to stabilize cell membrane.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pl-8 sm:pl-0">
              {activeStepTimerId === 'step-5' ? (
                <div className="flex items-center gap-2 bg-cyan-50 px-3 py-1.5 rounded-lg border border-cyan-200">
                  <span className="font-mono font-bold text-xs tabular-nums text-cyan-900">
                    {formatTime(stepSecondsLeft)}
                  </span>
                  {isStepTimerRunning ? (
                    <button
                      onClick={pauseStepTimer}
                      className="p-1 hover:bg-cyan-100 rounded text-cyan-700"
                    >
                      <Pause className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={resumeStepTimer}
                      className="p-1 hover:bg-cyan-100 rounded text-cyan-700"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => resetStepTimer(120)}
                    className="p-1 hover:bg-cyan-100 rounded text-cyan-500"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startStepTimer('step-5', 120)}
                  className="px-3 py-1.5 text-xs font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Snowflake className="w-3.5 h-3.5" />
                  Start 2m Chill
                </button>
              )}
            </div>
          </div>

          {/* Step 6 */}
          <div
            onClick={() => toggleStep('step-6')}
            className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
              completedSteps['step-6']
                ? 'bg-slate-50 border-slate-200 text-slate-500'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                completedSteps['step-6']
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'border-slate-300 bg-white'
              }`}
            >
              {completedSteps['step-6'] && <CheckCircle className="w-3.5 h-3.5" />}
            </div>
            <div className="flex-1 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span className={completedSteps['step-6'] ? 'line-through text-slate-400' : ''}>
                  Step 6: Add 950 µL Room-Temperature SOC Medium
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  950 µL SOC
                </span>
              </div>
              <p className="text-slate-600 mt-1">
                Pipette 950 µL of room-temperature SOC medium to the tube. (SOC gives 2-fold higher transformation efficiency than LB medium).
              </p>
            </div>
          </div>

          {/* Step 7: Outgrowth 37°C 60 min (With 60-min Timer) */}
          <div
            className={`p-3.5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              completedSteps['step-7']
                ? 'bg-slate-50 border-slate-200 text-slate-500'
                : 'bg-white border-slate-200'
            }`}
          >
            <div
              onClick={() => toggleStep('step-7')}
              className="flex items-start gap-3 cursor-pointer flex-1"
            >
              <div
                className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                  completedSteps['step-7']
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {completedSteps['step-7'] && <CheckCircle className="w-3.5 h-3.5" />}
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className={completedSteps['step-7'] ? 'line-through text-slate-400' : ''}>
                    Step 7: Outgrowth Shaking at 37°C for 60 Minutes
                  </span>
                  <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                    37°C · 250 rpm
                  </span>
                </div>
                <p className="text-slate-600 mt-1">
                  Incubate tube at 37°C for 60 minutes with vigorous shaking (250 rpm) or rotating to allow antibiotic resistance expression.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pl-8 sm:pl-0">
              {activeStepTimerId === 'step-7' ? (
                <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200">
                  <span className="font-mono font-bold text-xs tabular-nums text-purple-900">
                    {formatTime(stepSecondsLeft)}
                  </span>
                  {isStepTimerRunning ? (
                    <button
                      onClick={pauseStepTimer}
                      className="p-1 hover:bg-purple-100 rounded text-purple-700"
                    >
                      <Pause className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={resumeStepTimer}
                      className="p-1 hover:bg-purple-100 rounded text-purple-700"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => resetStepTimer(60 * 60)}
                    className="p-1 hover:bg-purple-100 rounded text-purple-500"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startStepTimer('step-7', 60 * 60)}
                  className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Start 60m Outgrowth
                </button>
              )}
            </div>
          </div>

          {/* Steps 8, 9, 10 */}
          <div
            onClick={() => toggleStep('step-8-10')}
            className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
              completedSteps['step-8-10']
                ? 'bg-slate-50 border-slate-200 text-slate-500'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                completedSteps['step-8-10']
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'border-slate-300 bg-white'
              }`}
            >
              {completedSteps['step-8-10'] && <CheckCircle className="w-3.5 h-3.5" />}
            </div>
            <div className="flex-1 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span className={completedSteps['step-8-10'] ? 'line-through text-slate-400' : ''}>
                  Steps 8–10: Selection Plating &amp; Overnight Incubation
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  Spread 100 µL
                </span>
              </div>
              <p className="text-slate-600 mt-1">
                Warm selection agar plates (with appropriate antibiotic: Amp 100 µg/ml, Kan 30 µg/ml, etc.) to 37°C. Spread 100 µL of outgrowth cells evenly with sterile glass beads or spreader. Invert plates and incubate overnight at 37°C.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
