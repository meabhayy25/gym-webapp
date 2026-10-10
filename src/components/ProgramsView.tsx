import React, { useState } from 'react';
import {
  Calendar,
  Layers,
  Clock,
  MapPin,
  Target,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Dumbbell,
  Play,
  X
} from 'lucide-react';
import { WorkoutProgram, Exercise } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ProgramsViewProps {
  programs: WorkoutProgram[];
  exercises: Exercise[];
  onStartProgramDay: (program: WorkoutProgram, dayIndex: number) => void;
  onOpenUpgradeModal: () => void;
}

export const ProgramsView: React.FC<ProgramsViewProps> = ({
  programs,
  exercises,
  onStartProgramDay,
  onOpenUpgradeModal
}) => {
  const { user, subscription, updateUser } = useAuth();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [detailProgram, setDetailProgram] = useState<WorkoutProgram | null>(null);
  const [activeTabDay, setActiveTabDay] = useState<number>(0);
  const [switching, setSwitching] = useState(false);

  const isEntitled = subscription?.isEntitled ?? false;

  const filteredPrograms = programs.filter((p) => {
    if (selectedDifficulty === 'All') return true;
    return p.difficulty.toLowerCase().includes(selectedDifficulty.toLowerCase());
  });

  const handleSelectActiveProgram = async (programId: string) => {
    if (!user) return;
    setSwitching(true);
    try {
      await api.selectProgram(programId);
      updateUser({ activeProgramId: programId });
    } catch (err: any) {
      alert(err.message || 'Error updating active program');
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            WORKOUT PROGRAMS
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1">
            Choose from 5 periodized pathways. Customize your training split to match your physical goals.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['All', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors min-h-[44px] ${
                selectedDifficulty === diff
                  ? 'bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/20'
                  : 'bg-[#15151D] text-[#A1A1AA] hover:text-white border border-white/5'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrograms.map((prog) => {
          const isActive = user?.activeProgramId === prog.id;

          return (
            <div
              key={prog.id}
              className={`bg-[#15151D] rounded-2xl border overflow-hidden flex flex-col justify-between transition-all group ${
                isActive ? 'border-[#FF6B35] shadow-lg shadow-[#FF6B35]/15' : 'border-white/5 hover:border-white/20'
              }`}
            >
              <div className="relative aspect-[16/10] bg-[#1c1c26] overflow-hidden">
                <img
                  src={prog.coverImage}
                  alt={prog.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#15151D] via-transparent to-transparent opacity-80" />

                {isActive && (
                  <div className="absolute top-3 left-3 bg-[#FF6B35] text-white px-2.5 py-1 rounded-md text-[11px] font-bold shadow-md flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active Protocol</span>
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Unboxed metadata row */}
                  <div className="flex items-center gap-2 text-xs text-[#A1A1AA] mb-2">
                    <span className="text-[#FF6B35] font-semibold">{prog.difficulty}</span>
                    <span aria-hidden="true">·</span>
                    <span>{prog.durationWeeks} Weeks</span>
                    <span aria-hidden="true">·</span>
                    <span>{prog.daysPerWeek} Days/Wk</span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{prog.title}</h3>
                  <p className="text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed mb-4">
                    {prog.description}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
                    <span>Location: {prog.location}</span>
                    <span className="text-white/80">{prog.goal}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        setDetailProgram(prog);
                        setActiveTabDay(0);
                      }}
                      className="flex-1 py-2.5 bg-[#1C1C26] hover:bg-[#252533] text-white text-xs font-bold rounded-xl border border-white/10 transition-colors min-h-[44px]"
                    >
                      View Weekly Plan
                    </button>

                    {user && !isActive && (
                      <button
                        onClick={() => handleSelectActiveProgram(prog.id)}
                        disabled={switching}
                        className="px-4 py-2.5 bg-[#FF6B35] hover:bg-[#e05824] text-white text-xs font-bold rounded-xl shadow-md shadow-[#FF6B35]/20 transition-all min-h-[44px]"
                      >
                        Set Active
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Program Detail & Weekly Schedule Modal */}
      {detailProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-3xl max-h-[92vh] bg-[#15151D] border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-in fade-in">
            {/* Modal Top Bar */}
            <div className="h-16 px-6 bg-[#1c1c26] border-b border-white/5 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-bold text-[#FF6B35] uppercase tracking-wider">
                  {detailProgram.difficulty} · {detailProgram.durationWeeks} Weeks
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-md">
                  {detailProgram.title}
                </h2>
              </div>
              <button
                onClick={() => setDetailProgram(null)}
                className="p-2 text-[#A1A1AA] hover:text-white rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Program Overview */}
              <div className="bg-[#1C1C26] p-4 rounded-xl border border-white/5 space-y-2">
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                  {detailProgram.description}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#A1A1AA] pt-1">
                  <span>Goal: <strong className="text-white">{detailProgram.goal}</strong></span>
                  <span>Environment: <strong className="text-white">{detailProgram.location}</strong></span>
                  <span>Commitment: <strong className="text-white">{detailProgram.daysPerWeek} Days/Week</strong></span>
                </div>
              </div>

              {/* Day Selector Tabs */}
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                  Weekly Schedule & Splits
                </h3>
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {detailProgram.schedule.map((day, dIdx) => (
                    <button
                      key={day.dayNumber}
                      onClick={() => setActiveTabDay(dIdx)}
                      className={`p-2 rounded-xl text-center border transition-all min-h-[52px] ${
                        activeTabDay === dIdx
                          ? 'bg-[#FF6B35] border-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/20'
                          : day.isRest
                          ? 'bg-[#1C1C26]/50 border-white/5 text-[#A1A1AA]/60 hover:border-white/10'
                          : 'bg-[#1C1C26] border-white/5 text-[#A1A1AA] hover:text-white hover:border-white/15'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold block">Day {day.dayNumber}</span>
                      <span className="text-xs font-bold truncate block mt-0.5">
                        {day.isRest ? 'Rest' : `Day ${day.dayNumber}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Day Workout Details */}
              {detailProgram.schedule[activeTabDay] && (
                <div className="bg-[#1C1C26] rounded-2xl border border-white/5 p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div>
                      <span className="text-xs text-[#FF6B35] font-semibold">
                        Day {detailProgram.schedule[activeTabDay].dayNumber} Breakdown
                      </span>
                      <h4 className="text-base font-bold text-white mt-0.5">
                        {detailProgram.schedule[activeTabDay].title}
                      </h4>
                    </div>

                    {!detailProgram.schedule[activeTabDay].isRest && (
                      <button
                        onClick={() => {
                          if (!isEntitled) {
                            onOpenUpgradeModal();
                          } else {
                            onStartProgramDay(detailProgram, activeTabDay);
                            setDetailProgram(null);
                          }
                        }}
                        className="px-4 py-2 bg-[#FF6B35] hover:bg-[#e05824] text-white text-xs font-bold rounded-xl shadow-md shadow-[#FF6B35]/20 transition-all flex items-center gap-1.5 min-h-[44px]"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Start This Workout</span>
                      </button>
                    )}
                  </div>

                  {detailProgram.schedule[activeTabDay].isRest ? (
                    <div className="text-center py-8 text-[#A1A1AA]">
                      <Sparkles className="w-8 h-8 text-[#FF6B35] mx-auto mb-2 opacity-50" />
                      <p className="font-semibold text-white text-sm">Scheduled Rest & Muscle Recovery</p>
                      <p className="text-xs text-[#A1A1AA] mt-1 max-w-sm mx-auto">
                        Allow myofibrillar repair and central nervous system replenishment.
                        Focus on hydration, protein intake, and mobility.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-12 text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA] px-3 pb-1 border-b border-white/5">
                        <span className="col-span-5">Exercise</span>
                        <span className="col-span-2 text-center">Sets</span>
                        <span className="col-span-2 text-center">Reps</span>
                        <span className="col-span-3 text-right">Rest / Tempo</span>
                      </div>

                      {detailProgram.schedule[activeTabDay].exercises.map((pEx, idx) => {
                        const exData = exercises.find((e) => e.id === pEx.exerciseId);
                        const exName = exData?.name || pEx.exerciseId.replace(/_/g, ' ');

                        return (
                          <div
                            key={idx}
                            className="grid grid-cols-12 items-center p-3 rounded-xl bg-[#15151D] text-xs"
                          >
                            <div className="col-span-5">
                              <span className="font-bold text-white block truncate">{exName}</span>
                              <span className="text-[10px] text-[#A1A1AA]">{exData?.muscleGroup || 'Full Body'}</span>
                            </div>

                            <div className="col-span-2 text-center font-bold text-white">
                              {pEx.targetSets} sets
                            </div>

                            <div className="col-span-2 text-center font-bold text-white">
                              {pEx.targetReps}
                            </div>

                            <div className="col-span-3 text-right text-[#A1A1AA]">
                              <span className="text-white font-medium">{pEx.restSeconds}s rest</span>
                              {pEx.tempo && (
                                <span className="block text-[10px] text-[#A1A1AA]/80">Tempo: {pEx.tempo}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="h-16 px-6 bg-[#1c1c26] border-t border-white/5 flex items-center justify-between shrink-0">
              {user?.activeProgramId !== detailProgram.id ? (
                <button
                  type="button"
                  onClick={() => {
                    handleSelectActiveProgram(detailProgram.id);
                    setDetailProgram(null);
                  }}
                  className="px-5 py-2.5 bg-[#FF6B35] hover:bg-[#e05824] text-white text-xs font-bold rounded-xl shadow-md min-h-[44px]"
                >
                  Set as My Active Program
                </button>
              ) : (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Currently Active Plan
                </span>
              )}

              <button
                type="button"
                onClick={() => setDetailProgram(null)}
                className="px-4 py-2 text-xs font-bold text-[#A1A1AA] hover:text-white min-h-[44px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
