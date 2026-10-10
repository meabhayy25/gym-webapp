import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  Flame,
  Award,
  Timer,
  Info,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { Exercise, WorkoutProgram } from '../types';
import { api } from '../services/api';
import { ExerciseVideoPlayer } from './ExerciseVideoPlayer';

interface WorkoutSessionModalProps {
  program?: WorkoutProgram | null;
  dayIndex?: number;
  exercisesList: Exercise[];
  onClose: () => void;
  onWorkoutCompleted: () => void;
}

interface ActiveSet {
  setNumber: number;
  reps: number;
  weightKg: number;
  isCompleted: boolean;
  isBodyweight: boolean;
  notes?: string;
}

interface ActiveExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: ActiveSet[];
}

export const WorkoutSessionModal: React.FC<WorkoutSessionModalProps> = ({
  program,
  dayIndex = 0,
  exercisesList,
  onClose,
  onWorkoutCompleted
}) => {
  // Resolve day title and exercises
  const currentDay = program?.schedule?.[dayIndex];
  const dayTitle = currentDay?.title || 'Full Body Workout Session';

  // Build initial exercise list for session
  const [sessionExercises, setSessionExercises] = useState<ActiveExerciseLog[]>(() => {
    // If program provided, map its exercises
    if (currentDay && currentDay.exercises.length > 0) {
      return currentDay.exercises.map((pEx) => {
        const found = exercisesList.find((e) => e.id === pEx.exerciseId);
        const name = found?.name || pEx.exerciseId.replace(/_/g, ' ');
        const isBw = found?.equipment?.toLowerCase().includes('bodyweight') || false;

        const defaultSets: ActiveSet[] = [];
        for (let s = 1; s <= (pEx.targetSets || 3); s++) {
          defaultSets.push({
            setNumber: s,
            reps: parseInt(pEx.targetReps) || 10,
            weightKg: isBw ? 0 : 40,
            isCompleted: false,
            isBodyweight: isBw
          });
        }

        return {
          exerciseId: pEx.exerciseId,
          exerciseName: name,
          sets: defaultSets
        };
      });
    }

    // Default fallback: 3 standard exercises
    const fallbackExs = exercisesList.slice(0, 3);
    return fallbackExs.map((e) => ({
      exerciseId: e.id,
      exerciseName: e.name,
      sets: [
        { setNumber: 1, reps: 10, weightKg: 20, isCompleted: false, isBodyweight: false },
        { setNumber: 2, reps: 10, weightKg: 20, isCompleted: false, isBodyweight: false },
        { setNumber: 3, reps: 10, weightKg: 20, isCompleted: false, isBodyweight: false }
      ]
    }));
  });

  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  // Rest Timer State
  const [restSecondsLeft, setRestSecondsLeft] = useState<number | null>(null);
  const [restInitialSeconds, setRestInitialSeconds] = useState<number>(60);
  const [isResting, setIsResting] = useState(false);

  // Finish Summary State
  const [showSummary, setShowSummary] = useState(false);
  const [showVideoDemo, setShowVideoDemo] = useState(false);
  const [difficultyRating, setDifficultyRating] = useState(7);
  const [sessionNotes, setSessionNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Overall workout stopwatch timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTimerPaused && !showSummary) {
        setElapsedSeconds((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerPaused, showSummary]);

  // Rest countdown timer
  useEffect(() => {
    let interval: any = null;
    if (isResting && restSecondsLeft !== null && restSecondsLeft > 0) {
      interval = setInterval(() => {
        setRestSecondsLeft((prev) => {
          if (prev !== null && prev <= 1) {
            setIsResting(false);
            return null;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restSecondsLeft]);

  const startRestTimer = (seconds: number = 60) => {
    setRestInitialSeconds(seconds);
    setRestSecondsLeft(seconds);
    setIsResting(true);
  };

  const currentExerciseLog = sessionExercises[activeExerciseIndex] || sessionExercises[0];
  const currentExerciseData = exercisesList.find((e) => e.id === currentExerciseLog?.exerciseId);

  // Handle Set Update
  const updateSet = (setIdx: number, field: keyof ActiveSet, value: any) => {
    setSessionExercises((prev) => {
      const copy = [...prev];
      const curSets = [...copy[activeExerciseIndex].sets];
      curSets[setIdx] = { ...curSets[setIdx], [field]: value };
      copy[activeExerciseIndex].sets = curSets;
      return copy;
    });
  };

  // Toggle Set Complete and trigger rest timer
  const toggleSetComplete = (setIdx: number) => {
    const currentCompleted = currentExerciseLog.sets[setIdx].isCompleted;
    updateSet(setIdx, 'isCompleted', !currentCompleted);

    if (!currentCompleted) {
      // Set completed: trigger rest timer
      startRestTimer(60);
    }
  };

  const addSet = () => {
    setSessionExercises((prev) => {
      const copy = [...prev];
      const curSets = copy[activeExerciseIndex].sets;
      const lastSet = curSets[curSets.length - 1];
      const nextNum = curSets.length + 1;
      curSets.push({
        setNumber: nextNum,
        reps: lastSet ? lastSet.reps : 10,
        weightKg: lastSet ? lastSet.weightKg : 0,
        isCompleted: false,
        isBodyweight: lastSet ? lastSet.isBodyweight : false
      });
      return copy;
    });
  };

  const removeSet = (setIdx: number) => {
    if (currentExerciseLog.sets.length <= 1) return;
    setSessionExercises((prev) => {
      const copy = [...prev];
      copy[activeExerciseIndex].sets = copy[activeExerciseIndex].sets.filter((_, idx) => idx !== setIdx);
      // Re-index
      copy[activeExerciseIndex].sets = copy[activeExerciseIndex].sets.map((s, idx) => ({
        ...s,
        setNumber: idx + 1
      }));
      return copy;
    });
  };

  // Total stats computation
  const totalSetsCompleted = sessionExercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.isCompleted).length,
    0
  );

  const totalVolumeKg = sessionExercises.reduce((acc, ex) => {
    return (
      acc +
      ex.sets.reduce((sAcc, s) => {
        return s.isCompleted ? sAcc + s.weightKg * s.reps : sAcc;
      }, 0)
    );
  }, 0);

  const totalRepsCompleted = sessionExercises.reduce((acc, ex) => {
    return (
      acc +
      ex.sets.reduce((sAcc, s) => {
        return s.isCompleted ? sAcc + s.reps : sAcc;
      }, 0)
    );
  }, 0);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  // Handle Save
  const handleSaveWorkout = async () => {
    setSaving(true);
    try {
      await api.logWorkout({
        programId: program?.id || 'custom',
        programName: program?.title || 'Custom Session',
        dayTitle,
        durationSeconds: elapsedSeconds,
        exercises: sessionExercises,
        difficultyRating,
        notes: sessionNotes
      });
      onWorkoutCompleted();
    } catch (err: any) {
      alert(err.message || 'Failed to save workout log');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full h-full sm:h-auto sm:max-h-[92vh] max-w-2xl bg-[#0B0B0F] sm:border sm:border-white/10 sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Session Top Bar */}
        <div className="h-16 px-4 sm:px-6 bg-[#15151D] border-b border-white/5 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-bold text-[#FF6B35] uppercase tracking-wider">
              {program?.title || 'Live Workout'}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-[200px] sm:max-w-md">
              {dayTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Stopwatch pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#1C1C26] border border-white/5 rounded-lg text-xs font-mono font-bold text-white">
              <Timer className="w-3.5 h-3.5 text-[#FF6B35]" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>

            <button
              onClick={() => setIsTimerPaused(!isTimerPaused)}
              className="p-2 text-[#A1A1AA] hover:text-white rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title={isTimerPaused ? 'Resume Session' : 'Pause Session'}
            >
              {isTimerPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-[#A1A1AA] hover:text-rose-400 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Close Session"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Rest Timer Banner (Floating when active) */}
        {isResting && restSecondsLeft !== null && (
          <div className="bg-[#FF6B35] text-white px-4 py-2.5 flex items-center justify-between shrink-0 shadow-lg animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 animate-spin text-white" />
              <span className="text-xs font-bold uppercase tracking-wider">Rest Timer:</span>
              <span className="font-mono text-base font-extrabold">{restSecondsLeft}s</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRestSecondsLeft((prev) => (prev !== null ? prev + 30 : 30))}
                className="px-2.5 py-1 bg-black/20 hover:bg-black/30 text-xs font-bold rounded-md"
              >
                +30s
              </button>
              <button
                onClick={() => {
                  setIsResting(false);
                  setRestSecondsLeft(null);
                }}
                className="px-2.5 py-1 bg-black/30 hover:bg-black/40 text-xs font-bold rounded-md"
              >
                Skip Rest
              </button>
            </div>
          </div>
        )}

        {/* Modal Main Body */}
        {!showSummary ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Exercise Selector Carousel */}
            <div className="flex items-center justify-between bg-[#15151D] p-3 rounded-xl border border-white/5">
              <button
                disabled={activeExerciseIndex === 0}
                onClick={() => setActiveExerciseIndex((prev) => Math.max(0, prev - 1))}
                className="p-2 text-[#A1A1AA] hover:text-white disabled:opacity-30 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="text-center px-2">
                <span className="text-[11px] font-semibold text-[#A1A1AA]">
                  Exercise {activeExerciseIndex + 1} of {sessionExercises.length}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {currentExerciseLog?.exerciseName}
                </h3>
              </div>

              <button
                disabled={activeExerciseIndex === sessionExercises.length - 1}
                onClick={() => setActiveExerciseIndex((prev) => Math.min(sessionExercises.length - 1, prev + 1))}
                className="p-2 text-[#A1A1AA] hover:text-white disabled:opacity-30 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Exercise Technique Quick Cue & Video Player */}
            {currentExerciseData && (
              <div className="space-y-3">
                <div className="bg-[#15151D] rounded-xl p-4 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#FF6B35]">{currentExerciseData.muscleGroup}</span>
                      <span className="text-[#A1A1AA]">·</span>
                      <span className="text-white/80">{currentExerciseData.equipment}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowVideoDemo(!showVideoDemo)}
                      className="px-2.5 py-1 bg-[#1C1C26] hover:bg-[#FF6B35] text-white text-[11px] font-bold rounded-lg border border-white/10 transition-colors flex items-center gap-1.5"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>{showVideoDemo ? 'Hide Video' : 'Watch Form Video'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed">
                    {currentExerciseData.startingPosition}
                  </p>
                </div>

                {/* Expanded Video Player */}
                {showVideoDemo && (
                  <div className="bg-[#15151D] p-3 rounded-2xl border border-[#FF6B35]/30 animate-in fade-in">
                    <ExerciseVideoPlayer
                      exercise={currentExerciseData}
                      allowEdit={true}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Sets Table */}
            <div className="bg-[#15151D] rounded-2xl border border-white/5 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/5 text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                <div className="w-12 text-center">Set</div>
                <div className="w-24 text-center">Weight (kg)</div>
                <div className="w-20 text-center">Reps</div>
                <div className="w-16 text-center">Done</div>
                <div className="w-8" />
              </div>

              {currentExerciseLog?.sets.map((set, setIdx) => (
                <div
                  key={set.setNumber}
                  className={`flex items-center justify-between py-1.5 px-2 rounded-xl transition-colors ${
                    set.isCompleted ? 'bg-emerald-950/20 border border-emerald-500/20' : 'bg-[#1C1C26]'
                  }`}
                >
                  {/* Set number */}
                  <div className="w-12 text-center font-bold text-sm text-white">
                    {set.setNumber}
                  </div>

                  {/* Weight input */}
                  <div className="w-24 flex items-center justify-center">
                    {set.isBodyweight ? (
                      <span className="text-xs font-semibold text-[#A1A1AA]">Bodyweight</span>
                    ) : (
                      <input
                        type="number"
                        step="0.5"
                        value={set.weightKg}
                        onChange={(e) => updateSet(setIdx, 'weightKg', Number(e.target.value))}
                        className="w-18 bg-[#15151D] border border-white/10 rounded-lg py-1.5 text-center text-sm font-bold text-white focus:outline-none focus:border-[#FF6B35]"
                      />
                    )}
                  </div>

                  {/* Reps input */}
                  <div className="w-20 flex items-center justify-center">
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => updateSet(setIdx, 'reps', Number(e.target.value))}
                      className="w-16 bg-[#15151D] border border-white/10 rounded-lg py-1.5 text-center text-sm font-bold text-white focus:outline-none focus:border-[#FF6B35]"
                    />
                  </div>

                  {/* Complete Button */}
                  <div className="w-16 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => toggleSetComplete(setIdx)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all min-h-[44px] min-w-[44px] ${
                        set.isCompleted
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                          : 'bg-white/10 text-[#A1A1AA] hover:text-white hover:bg-white/15'
                      }`}
                    >
                      <Check className="w-5 h-5 stroke-[3]" />
                    </button>
                  </div>

                  {/* Delete Set */}
                  <div className="w-8 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeSet(setIdx)}
                      className="text-[#A1A1AA]/50 hover:text-rose-400 p-1 transition-colors"
                      title="Remove set"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addSet}
                className="w-full py-2.5 bg-[#1C1C26] hover:bg-[#252533] border border-dashed border-white/15 rounded-xl text-xs font-bold text-[#A1A1AA] hover:text-white transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                <Plus className="w-4 h-4 text-[#FF6B35]" />
                <span>Add Set</span>
              </button>
            </div>

            {/* Quick Rest Presets */}
            <div className="bg-[#15151D] rounded-xl p-3 border border-white/5 flex items-center justify-between text-xs text-[#A1A1AA]">
              <span className="font-semibold text-white">Manual Rest:</span>
              <div className="flex gap-2">
                {[45, 60, 90, 120].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => startRestTimer(sec)}
                    className="px-2.5 py-1 bg-[#1C1C26] hover:bg-[#252533] text-white rounded-lg text-xs font-mono font-semibold transition-colors"
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Post-Workout Completion Summary View */
          <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-[#FF6B35]/20 border border-[#FF6B35]/30 flex items-center justify-center mx-auto mb-3 text-[#FF6B35]">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white">WORKOUT COMPLETE!</h3>
              <p className="text-xs text-[#A1A1AA] mt-1">Excellent work. Your progress has been calculated.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#15151D] p-3 rounded-xl border border-white/5 text-center">
                <span className="text-[10px] text-[#A1A1AA] uppercase">Duration</span>
                <p className="font-display text-xl font-bold text-white mt-0.5">
                  {formatTime(elapsedSeconds)}
                </p>
              </div>

              <div className="bg-[#15151D] p-3 rounded-xl border border-white/5 text-center">
                <span className="text-[10px] text-[#A1A1AA] uppercase">Sets Finished</span>
                <p className="font-display text-xl font-bold text-white mt-0.5">
                  {totalSetsCompleted}
                </p>
              </div>

              <div className="bg-[#15151D] p-3 rounded-xl border border-white/5 text-center">
                <span className="text-[10px] text-[#A1A1AA] uppercase">Total Reps</span>
                <p className="font-display text-xl font-bold text-white mt-0.5">
                  {totalRepsCompleted}
                </p>
              </div>

              <div className="bg-[#15151D] p-3 rounded-xl border border-white/5 text-center">
                <span className="text-[10px] text-[#A1A1AA] uppercase">Volume</span>
                <p className="font-display text-xl font-bold text-[#FF6B35] mt-0.5">
                  {Math.round(totalVolumeKg).toLocaleString()} kg
                </p>
              </div>
            </div>

            {/* Rating RPE */}
            <div className="bg-[#15151D] p-4 rounded-xl border border-white/5 space-y-2">
              <label className="block text-xs font-bold text-white">
                How difficult was this workout? (RPE {difficultyRating}/10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={difficultyRating}
                onChange={(e) => setDifficultyRating(Number(e.target.value))}
                className="w-full accent-[#FF6B35]"
              />
              <div className="flex justify-between text-[10px] text-[#A1A1AA]">
                <span>1 - Very Easy</span>
                <span>5 - Moderate</span>
                <span>10 - Maximum Exertion</span>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-[#15151D] p-4 rounded-xl border border-white/5">
              <label className="block text-xs font-bold text-white mb-2">Session Notes</label>
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="How did you feel? Energy levels, equipment used, personal records..."
                rows={3}
                className="w-full bg-[#1C1C26] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-[#A1A1AA]/50 focus:outline-none focus:border-[#FF6B35]"
              />
            </div>
          </div>
        )}

        {/* Modal Bottom Bar */}
        <div className="h-18 px-4 sm:px-6 bg-[#15151D] border-t border-white/5 flex items-center justify-between shrink-0">
          {!showSummary ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-[#A1A1AA] hover:text-white transition-colors min-h-[44px]"
              >
                Discard Session
              </button>

              <button
                type="button"
                onClick={() => setShowSummary(true)}
                className="px-6 py-2.5 bg-[#FF6B35] hover:bg-[#e05824] text-white font-bold rounded-xl shadow-lg shadow-[#FF6B35]/20 transition-all flex items-center gap-2 min-h-[48px]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finish Workout</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setShowSummary(false)}
                className="px-4 py-2.5 text-xs font-bold text-[#A1A1AA] hover:text-white transition-colors min-h-[44px]"
              >
                Back to Session
              </button>

              <button
                type="button"
                onClick={handleSaveWorkout}
                disabled={saving}
                className="px-8 py-2.5 bg-[#FF6B35] hover:bg-[#e05824] text-white font-bold rounded-xl shadow-lg shadow-[#FF6B35]/20 transition-all flex items-center gap-2 disabled:opacity-50 min-h-[48px]"
              >
                <span>{saving ? 'Saving...' : 'Save to History'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
