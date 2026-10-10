import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Clock,
  Dumbbell,
  Flame,
  Award,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Layers
} from 'lucide-react';
import { WorkoutLog } from '../types';

interface HistoryCalendarViewProps {
  workoutLogs: WorkoutLog[];
  onStartNewWorkout: () => void;
}

export const HistoryCalendarView: React.FC<HistoryCalendarViewProps> = ({
  workoutLogs,
  onStartNewWorkout
}) => {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Calendar calculations
  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth();

  const monthName = selectedMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // Map of completed workout dates in this month
  const workoutsByDate = useMemo(() => {
    const map: Record<number, WorkoutLog[]> = {};
    workoutLogs.forEach((log) => {
      const d = new Date(log.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const dateNum = d.getDate();
        if (!map[dateNum]) map[dateNum] = [];
        map[dateNum].push(log);
      }
    });
    return map;
  }, [workoutLogs, year, month]);

  const prevMonth = () => {
    setSelectedMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setSelectedMonth(new Date(year, month + 1, 1));
  };

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            WORKOUT HISTORY & CALENDAR
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1">
            Review past training logs, volume load, and individual set performance.
          </p>
        </div>

        <button
          onClick={onStartNewWorkout}
          className="px-4 py-2 bg-[#FF6B35] hover:bg-[#e05824] text-white text-xs font-bold rounded-xl shadow-md transition-all min-h-[44px] flex items-center justify-center gap-1.5"
        >
          <Dumbbell className="w-4 h-4" />
          <span>Start Workout</span>
        </button>
      </div>

      {/* Interactive Month Calendar */}
      <div className="bg-[#15151D] rounded-2xl border border-white/5 p-6 space-y-4">
        {/* Month Selector */}
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[#FF6B35]" />
            <span>{monthName}</span>
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 text-[#A1A1AA] hover:text-white bg-[#1C1C26] rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 text-[#A1A1AA] hover:text-white bg-[#1C1C26] rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar Day Labels */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA] pb-2 border-b border-white/5">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {/* Empty padding slots before first day of month */}
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-12 sm:h-16 rounded-xl bg-transparent" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dayWorkouts = workoutsByDate[dayNum];
            const hasWorkout = Boolean(dayWorkouts && dayWorkouts.length > 0);

            return (
              <div
                key={dayNum}
                className={`h-12 sm:h-16 p-1.5 rounded-xl border flex flex-col justify-between transition-colors ${
                  hasWorkout
                    ? 'bg-[#FF6B35]/15 border-[#FF6B35]/40 text-white'
                    : 'bg-[#1C1C26] border-white/5 text-[#A1A1AA]'
                }`}
              >
                <span className="text-xs font-bold tabular-nums">{dayNum}</span>

                {hasWorkout && (
                  <div className="flex items-center justify-between text-[10px] text-[#FF6B35] font-semibold">
                    <span className="truncate hidden sm:inline">Completed</span>
                    <div className="w-2 h-2 rounded-full bg-[#FF6B35]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chronological Logs List */}
      <div className="bg-[#15151D] rounded-2xl border border-white/5 p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center justify-between">
          <span>Completed Sessions ({workoutLogs.length})</span>
          <span className="text-xs text-[#A1A1AA] font-normal">Click to view sets</span>
        </h2>

        {workoutLogs.length > 0 ? (
          <div className="space-y-3">
            {workoutLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const dateObj = new Date(log.date);

              return (
                <div
                  key={log.id}
                  className="bg-[#1C1C26] rounded-xl border border-white/5 overflow-hidden transition-all"
                >
                  {/* Header Row */}
                  <div
                    onClick={() => toggleExpand(log.id)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-[#A1A1AA]">
                        <span className="text-[#FF6B35] font-bold">{log.programName}</span>
                        <span aria-hidden="true">·</span>
                        <span>{dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-0.5">{log.dayTitle}</h3>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 text-xs">
                      <div className="text-right">
                        <span className="font-bold text-white tabular-nums block">
                          {Math.round(log.totalVolumeKg).toLocaleString()} kg
                        </span>
                        <span className="text-[10px] text-[#A1A1AA]">
                          {Math.round(log.durationSeconds / 60)} min · {log.totalSetsCompleted} sets
                        </span>
                      </div>

                      <div className="text-[#A1A1AA]">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Sets Detail */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-white/5 bg-[#15151D]/60 space-y-4">
                      {log.notes && (
                        <div className="p-3 rounded-lg bg-[#1C1C26] border border-white/5 text-xs text-white/90 italic">
                          "{log.notes}"
                        </div>
                      )}

                      <div className="space-y-3">
                        {log.exercises.map((ex, exIdx) => (
                          <div key={exIdx} className="bg-[#1C1C26] p-3 rounded-xl border border-white/5">
                            <span className="font-bold text-sm text-white block mb-2">
                              {ex.exerciseName}
                            </span>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {ex.sets.map((set, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="p-2 rounded-lg bg-[#15151D] border border-white/5 text-xs flex items-center justify-between"
                                >
                                  <span className="text-[10px] text-[#A1A1AA]">Set {set.setNumber}</span>
                                  <span className="font-bold text-white">
                                    {set.isBodyweight ? 'BW' : `${set.weightKg}kg`} × {set.reps}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#A1A1AA] pt-2 border-t border-white/5">
                        <span>Difficulty Rating: RPE {log.difficultyRating || 7}/10</span>
                        <span>Total Reps: {log.totalRepsCompleted} reps</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Dumbbell className="w-8 h-8 text-[#A1A1AA] mx-auto mb-2 opacity-30" />
            <p className="text-xs font-semibold text-white">No workout history found</p>
            <p className="text-[11px] text-[#A1A1AA] mt-1">
              Start a workout to record sets and view detailed session histories here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
