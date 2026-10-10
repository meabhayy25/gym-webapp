import React, { useMemo } from 'react';
import {
  Flame,
  Play,
  Calendar,
  Dumbbell,
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Scale
} from 'lucide-react';
import { WorkoutProgram, WorkoutLog, BodyMetric, Subscription } from '../types';

interface DashboardViewProps {
  userName: string;
  activeProgram?: WorkoutProgram | null;
  subscription: Subscription | null;
  workoutLogs: WorkoutLog[];
  bodyMetrics: BodyMetric[];
  onStartWorkout: () => void;
  onOpenUpgradeModal: () => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userName,
  activeProgram,
  subscription,
  workoutLogs,
  bodyMetrics,
  onStartWorkout,
  onOpenUpgradeModal,
  onNavigateTab
}) => {
  // Time of day greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  // Compute Weekly Workout completion (last 7 days)
  const pastWeekLogs = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86400000;
    return workoutLogs.filter((l) => new Date(l.date).getTime() >= weekAgo);
  }, [workoutLogs]);

  const targetWorkoutsPerWeek = activeProgram?.daysPerWeek || 4;
  const weeklyCompletionPercent = Math.min(
    100,
    Math.round((pastWeekLogs.length / targetWorkoutsPerWeek) * 100)
  );

  // Latest body weight
  const latestWeight = bodyMetrics.length > 0 ? bodyMetrics[bodyMetrics.length - 1] : null;

  // Streak calculation
  const streak = useMemo(() => {
    if (workoutLogs.length === 0) return 0;
    return Math.min(workoutLogs.length, 7);
  }, [workoutLogs]);

  // Total volume
  const totalVolume = workoutLogs.reduce((acc, l) => acc + (l.totalVolumeKg || 0), 0);

  // Today's scheduled workout lookup
  const todayWorkoutTitle = useMemo(() => {
    if (!activeProgram || !activeProgram.schedule || activeProgram.schedule.length === 0) {
      return 'Full Body Introductory Session';
    }
    // Determine day based on completed workouts
    const nextDayIdx = workoutLogs.length % activeProgram.schedule.length;
    const scheduled = activeProgram.schedule[nextDayIdx];
    return scheduled ? scheduled.title : activeProgram.schedule[0].title;
  }, [activeProgram, workoutLogs]);

  // Last 7 days activity dots/bars
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyActivityMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const hasWorkout = workoutLogs.some((l) => l.date.split('T')[0] === dateStr);
      map[dateStr] = hasWorkout;
    }
    return map;
  }, [workoutLogs]);

  return (
    <div className="space-y-6">
      {/* Welcome Area Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#15151D] p-6 rounded-2xl border border-white/5">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#A1A1AA] mb-1">
            <Calendar className="w-3.5 h-3.5 text-[#FF6B35]" />
            <span>{todayFormatted}</span>
            <span aria-hidden="true">·</span>
            <span>{activeProgram?.title || 'Program Assigned'}</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {greeting}, {userName || 'Athlete'}
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1">
            "Consistency is the true compound interest of physical strength."
          </p>
        </div>

        {/* Subscription Status Chip */}
        {subscription && (
          <div className="flex items-center gap-3 shrink-0">
            {subscription.status === 'trial_active' ? (
              <div className="bg-[#1C1C26] p-3 rounded-xl border border-white/5 text-right">
                <span className="text-[10px] text-[#A1A1AA] block">Free Trial Status</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-bold text-[#FF6B35]">
                    {subscription.remainingDays} Days Left
                  </span>
                  <button
                    onClick={onOpenUpgradeModal}
                    className="text-[11px] font-bold text-white bg-[#FF6B35] px-2.5 py-1 rounded-lg hover:bg-[#e05824] transition-colors"
                  >
                    Upgrade
                  </button>
                </div>
              </div>
            ) : subscription.status === 'paid_active' ? (
              <div className="bg-emerald-950/30 border border-emerald-500/30 p-2.5 rounded-xl text-right">
                <span className="text-[10px] text-emerald-400 font-bold block">PRO MEMBERSHIP</span>
                <span className="text-xs text-white">Full Access Active</span>
              </div>
            ) : (
              <div className="bg-rose-950/30 border border-rose-500/30 p-2.5 rounded-xl text-right">
                <span className="text-[10px] text-rose-400 font-bold block">TRIAL EXPIRED</span>
                <button
                  onClick={onOpenUpgradeModal}
                  className="text-xs font-bold text-white bg-[#FF6B35] px-2 py-0.5 rounded mt-0.5"
                >
                  Reactivate Access
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Primary Action Hero: Today's Workout */}
      <div className="relative bg-gradient-to-r from-[#15151D] to-[#1C1C26] rounded-2xl border border-white/10 p-6 sm:p-8 overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none hidden md:block">
          {activeProgram?.coverImage && (
            <img
              src={activeProgram.coverImage}
              alt=""
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="relative z-10 max-w-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF6B35]">
            <Dumbbell className="w-4 h-4" />
            <span>Today's Prescribed Session</span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            {todayWorkoutTitle}
          </h2>

          <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
            Ready to log your sets? Execute target volume with built-in rest intervals and automatic load suggestions.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onStartWorkout}
              className="px-6 py-3.5 bg-[#FF6B35] hover:bg-[#e05824] text-white font-bold rounded-xl shadow-lg shadow-[#FF6B35]/25 transition-all active:scale-95 flex items-center gap-2.5 min-h-[48px]"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Today's Workout</span>
            </button>

            <button
              onClick={() => onNavigateTab('workouts')}
              className="px-4 py-3.5 bg-[#15151D] hover:bg-[#1f1f2b] text-[#A1A1AA] hover:text-white font-semibold rounded-xl border border-white/5 transition-colors text-xs sm:text-sm min-h-[48px]"
            >
              View Plan Details
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Weekly Progress */}
        <div className="bg-[#15151D] p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
          <span className="text-xs text-[#A1A1AA] font-medium">Weekly Goal</span>
          <div className="my-2">
            <div className="flex items-baseline justify-between">
              <span className="font-display text-2xl sm:text-3xl font-bold text-white tabular-nums">
                {pastWeekLogs.length} / {targetWorkoutsPerWeek}
              </span>
              <span className="text-xs font-bold text-[#FF6B35] tabular-nums">
                {weeklyCompletionPercent}%
              </span>
            </div>
            <div className="w-full bg-[#1C1C26] h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-[#FF6B35] h-full rounded-full transition-all"
                style={{ width: `${weeklyCompletionPercent}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] text-[#A1A1AA]">Sessions this week</span>
        </div>

        {/* Metric 2: Total Workouts */}
        <div className="bg-[#15151D] p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
          <span className="text-xs text-[#A1A1AA] font-medium">Total Workouts</span>
          <div className="my-2">
            <span className="font-display text-2xl sm:text-3xl font-bold text-white tabular-nums">
              {workoutLogs.length}
            </span>
          </div>
          <span className="text-[10px] text-[#A1A1AA]">Logged in history</span>
        </div>

        {/* Metric 3: Current Streak */}
        <div className="bg-[#15151D] p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
          <span className="text-xs text-[#A1A1AA] font-medium">Workout Streak</span>
          <div className="my-2 flex items-center gap-2">
            <span className="font-display text-2xl sm:text-3xl font-bold text-white tabular-nums">
              {streak}
            </span>
            <Flame className="w-6 h-6 text-[#FF6B35] fill-[#FF6B35]" />
          </div>
          <span className="text-[10px] text-[#A1A1AA]">Days active</span>
        </div>

        {/* Metric 4: Latest Weight */}
        <div className="bg-[#15151D] p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
          <span className="text-xs text-[#A1A1AA] font-medium">Body Weight</span>
          <div className="my-2">
            {latestWeight ? (
              <span className="font-display text-2xl sm:text-3xl font-bold text-white tabular-nums">
                {latestWeight.weightKg} kg
              </span>
            ) : (
              <span className="text-sm font-semibold text-[#A1A1AA]">No Entry</span>
            )}
          </div>
          <button
            onClick={() => onNavigateTab('progress')}
            className="text-[10px] font-bold text-[#FF6B35] hover:underline text-left"
          >
            Log Weight →
          </button>
        </div>
      </div>

      {/* Activity Chart & Recent Workouts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Activity Heatmap/Bars */}
        <div className="lg:col-span-7 bg-[#15151D] p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              7-Day Activity Rhythm
            </h3>
            <span className="text-xs text-[#A1A1AA]">
              {pastWeekLogs.length} Completed
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-2">
            {Object.entries(weeklyActivityMap).map(([dateStr, active], idx) => {
              const dayDate = new Date(dateStr);
              const dayName = daysOfWeek[dayDate.getDay()];
              const dayNum = dayDate.getDate();

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-center flex flex-col items-center justify-between min-h-[72px] transition-colors ${
                    active
                      ? 'bg-[#FF6B35]/15 border-[#FF6B35]/40 text-white'
                      : 'bg-[#1C1C26] border-white/5 text-[#A1A1AA]'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-[#A1A1AA]">{dayName}</span>
                  <span className="text-xs font-bold mt-1 tabular-nums">{dayNum}</span>
                  <div className="mt-2">
                    {active ? (
                      <CheckCircle2 className="w-4 h-4 text-[#FF6B35]" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-white/10" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-[#A1A1AA] leading-relaxed pt-2">
            Aim for consistent training frequency without skipping consecutive programmed sessions.
          </p>
        </div>

        {/* Recent Workouts or Empty State */}
        <div className="lg:col-span-5 bg-[#15151D] p-6 rounded-2xl border border-white/5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Recent Training Logs
              </h3>
              <button
                onClick={() => onNavigateTab('history')}
                className="text-xs font-bold text-[#FF6B35] hover:underline"
              >
                Full History →
              </button>
            </div>

            {workoutLogs.length > 0 ? (
              <div className="space-y-3">
                {workoutLogs.slice(0, 3).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-[#1C1C26] rounded-xl border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{log.dayTitle}</p>
                      <p className="text-[10px] text-[#A1A1AA]">
                        {new Date(log.date).toLocaleDateString()} · {Math.round(log.durationSeconds / 60)}m
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#FF6B35] tabular-nums block">
                        {Math.round(log.totalVolumeKg).toLocaleString()} kg
                      </span>
                      <span className="text-[10px] text-[#A1A1AA]">
                        {log.totalSetsCompleted} sets
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Dumbbell className="w-8 h-8 text-[#A1A1AA] mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold text-white">No workouts recorded yet</p>
                <p className="text-[11px] text-[#A1A1AA] mt-1">
                  Complete your first workout to start generating your progress stats and charts.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={onStartWorkout}
            className="w-full py-2.5 bg-[#1C1C26] hover:bg-[#252533] text-white rounded-xl border border-white/10 text-xs font-bold transition-colors min-h-[44px]"
          >
            Launch Today's Session
          </button>
        </div>
      </div>
    </div>
  );
};
