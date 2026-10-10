import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Scale,
  Award,
  Ruler,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Dumbbell,
  CheckCircle2,
  X
} from 'lucide-react';
import { ProgressData, BodyMetric, Measurement } from '../types';
import { api } from '../services/api';

interface ProgressViewProps {
  progressData: ProgressData | null;
  onRefresh: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ progressData, onRefresh }) => {
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [showLogWeightModal, setShowLogWeightModal] = useState(false);
  const [showLogMeasureModal, setShowLogMeasureModal] = useState(false);

  // Weight entry form
  const [weightInput, setWeightInput] = useState('');
  const [weightNotes, setWeightNotes] = useState('');
  const [weightDate, setWeightDate] = useState(new Date().toISOString().split('T')[0]);

  // Measurements entry form
  const [measureChest, setMeasureChest] = useState('');
  const [measureWaist, setMeasureWaist] = useState('');
  const [measureHips, setMeasureHips] = useState('');
  const [measureArms, setMeasureArms] = useState('');
  const [measureThighs, setMeasureThighs] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Filter weights by date
  const filteredWeights = useMemo(() => {
    if (!progressData?.weights) return [];
    const now = Date.now();
    let daysCutoff = 3650; // all
    if (timeFilter === '7d') daysCutoff = 7;
    if (timeFilter === '30d') daysCutoff = 30;
    if (timeFilter === '90d') daysCutoff = 90;

    const cutoffMs = now - daysCutoff * 86400000;
    return progressData.weights.filter((w) => new Date(w.date).getTime() >= cutoffMs);
  }, [progressData?.weights, timeFilter]);

  // Handlers
  const handleSaveWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightInput) return;
    setSubmitting(true);
    try {
      await api.logWeight({
        weightKg: Number(weightInput),
        notes: weightNotes,
        date: new Date(weightDate).toISOString()
      });
      setShowLogWeightModal(false);
      setWeightInput('');
      setWeightNotes('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error recording weight');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWeight = async (id: string) => {
    if (!confirm('Are you sure you want to delete this weight entry?')) return;
    try {
      await api.deleteWeight(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error deleting weight');
    }
  };

  const handleSaveMeasurements = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.logMeasurements({
        chestCm: measureChest ? Number(measureChest) : undefined,
        waistCm: measureWaist ? Number(measureWaist) : undefined,
        hipsCm: measureHips ? Number(measureHips) : undefined,
        armsCm: measureArms ? Number(measureArms) : undefined,
        thighsCm: measureThighs ? Number(measureThighs) : undefined
      });
      setShowLogMeasureModal(false);
      setMeasureChest('');
      setMeasureWaist('');
      setMeasureHips('');
      setMeasureArms('');
      setMeasureThighs('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error recording measurements');
    } finally {
      setSubmitting(false);
    }
  };

  // SVG Chart calculation for Weight
  const chartSvgData = useMemo(() => {
    if (filteredWeights.length < 2) return null;

    const weights = filteredWeights.map((w) => w.weightKg);
    const minW = Math.floor(Math.min(...weights) - 1);
    const maxW = Math.ceil(Math.max(...weights) + 1);
    const rangeW = maxW - minW || 1;

    const width = 600;
    const height = 200;
    const padding = 30;

    const points = filteredWeights.map((w, idx) => {
      const x = padding + (idx / (filteredWeights.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((w.weightKg - minW) / rangeW) * (height - 2 * padding);
      return { x, y, weight: w.weightKg, date: w.date };
    });

    const pathD = points.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    return { points, pathD, minW, maxW, width, height };
  }, [filteredWeights]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            PROGRESS & METRICS
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1">
            Track body composition, weight trends, and progressive strength records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLogWeightModal(true)}
            className="px-4 py-2 bg-[#FF6B35] hover:bg-[#e05824] text-white text-xs font-bold rounded-xl shadow-md shadow-[#FF6B35]/20 transition-all flex items-center gap-1.5 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Log Weight</span>
          </button>

          <button
            onClick={() => setShowLogMeasureModal(true)}
            className="px-4 py-2 bg-[#15151D] hover:bg-[#1f1f2b] text-white text-xs font-bold rounded-xl border border-white/10 transition-colors flex items-center gap-1.5 min-h-[44px]"
          >
            <Ruler className="w-4 h-4 text-[#A1A1AA]" />
            <span>Measurements</span>
          </button>
        </div>
      </div>

      {/* Body Weight Progression Card */}
      <div className="bg-[#15151D] rounded-2xl border border-white/5 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/10 border border-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Body Weight Trend</h2>
              <span className="text-xs text-[#A1A1AA]">
                {filteredWeights.length > 0
                  ? `Current: ${filteredWeights[filteredWeights.length - 1].weightKg} kg`
                  : 'No weight entries logged'}
              </span>
            </div>
          </div>

          {/* Time Filter Buttons */}
          <div className="flex items-center gap-1 bg-[#1C1C26] p-1 rounded-xl border border-white/5">
            {(['7d', '30d', '90d', 'all'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors min-h-[36px] ${
                  timeFilter === filter
                    ? 'bg-[#FF6B35] text-white'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                {filter.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Real Dynamic SVG Line Chart */}
        {chartSvgData ? (
          <div className="w-full overflow-x-auto py-2">
            <svg
              viewBox={`0 0 ${chartSvgData.width} ${chartSvgData.height}`}
              className="w-full h-48 sm:h-60"
            >
              {/* Grid Lines */}
              <line
                x1="30"
                y1={chartSvgData.height - 30}
                x2={chartSvgData.width - 30}
                y2={chartSvgData.height - 30}
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray="4 4"
              />
              <line
                x1="30"
                y1="30"
                x2={chartSvgData.width - 30}
                y2="30"
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray="4 4"
              />

              {/* Data Path */}
              <path
                d={chartSvgData.pathD}
                fill="none"
                stroke="#FF6B35"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points */}
              {chartSvgData.points.map((p, idx) => (
                <g key={idx}>
                  <circle cx={p.x} cy={p.y} r="5" fill="#15151D" stroke="#FF6B35" strokeWidth="3" />
                  <text
                    x={p.x}
                    y={p.y - 12}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="11"
                    fontFamily="sans-serif"
                    fontWeight="bold"
                  >
                    {p.weight} kg
                  </text>
                </g>
              ))}
            </svg>
          </div>
        ) : (
          <div className="text-center py-12 bg-[#1C1C26] rounded-xl border border-white/5">
            <Scale className="w-8 h-8 text-[#A1A1AA] mx-auto mb-2 opacity-30" />
            <p className="text-xs font-semibold text-white">Need at least 2 entries for chart trend</p>
            <p className="text-[11px] text-[#A1A1AA] mt-1">
              Log your body weight periodically to reveal your true trend line.
            </p>
          </div>
        )}

        {/* Recent Weight Entries Table */}
        {filteredWeights.length > 0 && (
          <div className="pt-4 border-t border-white/5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Chronological Entries ({filteredWeights.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filteredWeights.slice().reverse().map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#1C1C26] text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white tabular-nums text-sm">
                      {entry.weightKg} kg
                    </span>
                    <span className="text-[11px] text-[#A1A1AA]">
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                    {entry.notes && (
                      <span className="text-[11px] text-[#A1A1AA]/80 italic">· {entry.notes}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteWeight(entry.id)}
                    className="p-1.5 text-[#A1A1AA]/60 hover:text-rose-400 transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Personal Records (PRs) */}
      <div className="bg-[#15151D] rounded-2xl border border-white/5 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Personal Best Records</h2>
            <span className="text-xs text-[#A1A1AA]">
              Calculated automatically from your heaviest verified completed sets.
            </span>
          </div>
        </div>

        {progressData?.personalRecords && progressData.personalRecords.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {progressData.personalRecords.map((pr, idx) => (
              <div
                key={idx}
                className="bg-[#1C1C26] p-4 rounded-xl border border-white/5 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-white truncate max-w-[160px]">
                    {pr.exerciseName}
                  </h4>
                  <span className="text-[10px] text-[#A1A1AA]">
                    {new Date(pr.date).toLocaleDateString()} · {pr.reps} reps
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-display text-xl font-bold text-amber-400 tabular-nums">
                    {pr.weightKg} kg
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-[#1C1C26] rounded-xl border border-white/5">
            <Award className="w-8 h-8 text-[#A1A1AA] mx-auto mb-2 opacity-30" />
            <p className="text-xs font-semibold text-white">No personal records yet</p>
            <p className="text-[11px] text-[#A1A1AA] mt-1">
              Complete sets with weights during workout sessions to unlock badges.
            </p>
          </div>
        )}
      </div>

      {/* Body Measurements Log History */}
      <div className="bg-[#15151D] rounded-2xl border border-white/5 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Body Circumference Measurements</h2>
            <span className="text-xs text-[#A1A1AA]">
              Track changes in chest, waist, hips, arms, and thighs over time.
            </span>
          </div>
        </div>

        {progressData?.measurements && progressData.measurements.length > 0 ? (
          <div className="space-y-3">
            {progressData.measurements.map((m) => (
              <div
                key={m.id}
                className="p-4 bg-[#1C1C26] rounded-xl border border-white/5 grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs"
              >
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-[#A1A1AA] block">Date</span>
                  <span className="font-bold text-white">{new Date(m.date).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#A1A1AA] block">Chest</span>
                  <span className="font-bold text-white">{m.chestCm ? `${m.chestCm} cm` : '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#A1A1AA] block">Waist</span>
                  <span className="font-bold text-white">{m.waistCm ? `${m.waistCm} cm` : '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#A1A1AA] block">Hips</span>
                  <span className="font-bold text-white">{m.hipsCm ? `${m.hipsCm} cm` : '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#A1A1AA] block">Arms</span>
                  <span className="font-bold text-white">{m.armsCm ? `${m.armsCm} cm` : '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#A1A1AA] block">Thighs</span>
                  <span className="font-bold text-white">{m.thighsCm ? `${m.thighsCm} cm` : '—'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-[#1C1C26] rounded-xl border border-white/5">
            <Ruler className="w-8 h-8 text-[#A1A1AA] mx-auto mb-2 opacity-30" />
            <p className="text-xs font-semibold text-white">No circumference entries logged</p>
            <p className="text-[11px] text-[#A1A1AA] mt-1">
              Measure key body parts every few weeks to quantify muscular development.
            </p>
          </div>
        )}
      </div>

      {/* Log Weight Modal */}
      {showLogWeightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-[#15151D] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Log Body Weight</h3>
              <button
                onClick={() => setShowLogWeightModal(false)}
                className="p-1 text-[#A1A1AA] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWeight} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  autoFocus
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="e.g. 78.5"
                  className="w-full bg-[#1C1C26] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF6B35]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">Date</label>
                <input
                  type="date"
                  value={weightDate}
                  onChange={(e) => setWeightDate(e.target.value)}
                  className="w-full bg-[#1C1C26] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF6B35]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  value={weightNotes}
                  onChange={(e) => setWeightNotes(e.target.value)}
                  placeholder="e.g. Morning fasting"
                  className="w-full bg-[#1C1C26] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF6B35]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#FF6B35] hover:bg-[#e05824] text-white font-bold rounded-xl shadow-md min-h-[44px]"
              >
                {submitting ? 'Saving...' : 'Save Entry'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Log Measurements Modal */}
      {showLogMeasureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#15151D] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Log Measurements (cm)</h3>
              <button
                onClick={() => setShowLogMeasureModal(false)}
                className="p-1 text-[#A1A1AA] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMeasurements} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1">Chest (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={measureChest}
                    onChange={(e) => setMeasureChest(e.target.value)}
                    placeholder="100"
                    className="w-full bg-[#1C1C26] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF6B35]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1">Waist (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={measureWaist}
                    onChange={(e) => setMeasureWaist(e.target.value)}
                    placeholder="82"
                    className="w-full bg-[#1C1C26] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF6B35]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1">Hips (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={measureHips}
                    onChange={(e) => setMeasureHips(e.target.value)}
                    placeholder="98"
                    className="w-full bg-[#1C1C26] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF6B35]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1">Arms (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={measureArms}
                    onChange={(e) => setMeasureArms(e.target.value)}
                    placeholder="38"
                    className="w-full bg-[#1C1C26] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF6B35]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">Thighs (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={measureThighs}
                  onChange={(e) => setMeasureThighs(e.target.value)}
                  placeholder="58"
                  className="w-full bg-[#1C1C26] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF6B35]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#FF6B35] hover:bg-[#e05824] text-white font-bold rounded-xl shadow-md min-h-[44px] mt-2"
              >
                {submitting ? 'Saving...' : 'Record Measurements'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
