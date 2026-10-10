import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Dumbbell,
  CreditCard,
  Settings,
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Gift,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  TrendingUp,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { AdminOverview, WorkoutProgram, Exercise, AuditLog, SystemConfig } from '../types';
import { ExerciseVideoPlayer } from './ExerciseVideoPlayer';

interface AdminDashboardViewProps {
  onBackToApp: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onBackToApp }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'programs' | 'exercises' | 'settings' | 'audit' | 'payments'>('overview');
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [programsList, setProgramsList] = useState<WorkoutProgram[]>([]);
  const [exercisesList, setExercisesList] = useState<Exercise[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);

  const [loading, setLoading] = useState(true);

  // Modals inside Admin
  const [grantSubModalUser, setGrantSubModalUser] = useState<any | null>(null);
  const [grantDays, setGrantDays] = useState(30);
  const [grantReason, setGrantReason] = useState('VIP Grant');

  // Program Edit Modal
  const [editingProgram, setEditingProgram] = useState<WorkoutProgram | null>(null);

  // Exercise Create Modal
  const [showCreateExerciseModal, setShowCreateExerciseModal] = useState(false);
  const [selectedVideoExercise, setSelectedVideoExercise] = useState<Exercise | null>(null);
  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState('Chest');
  const [newExEquipment, setNewExEquipment] = useState('Barbell');
  const [newExDifficulty, setNewExDifficulty] = useState('Intermediate');
  const [newExStartingPos, setNewExStartingPos] = useState('');
  const [newExStep1, setNewExStep1] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [ov, usrs, progs, exs, logs, pays, cfg] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminUsers({ search: userSearch, status: userStatusFilter }),
        api.getPrograms(),
        api.getExercises(),
        api.getAuditLogs(),
        api.getPayments(),
        api.getAdminSettings()
      ]);
      setOverview(ov);
      setUsersList(usrs);
      setProgramsList(progs);
      setExercisesList(exs);
      setAuditLogs(logs);
      setPaymentsList(pays);
      setSystemConfig(cfg);
    } catch (err: any) {
      alert(err.message || 'Error loading admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userStatusFilter]);

  const handleUserSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.getAdminUsers({ search: userSearch, status: userStatusFilter });
    setUsersList(res);
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (!confirm(`Are you sure you want to change this user status to ${nextStatus}?`)) return;
    try {
      await api.updateUserStatus(userId, nextStatus);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleGrantSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantSubModalUser) return;
    try {
      await api.grantSubscription(grantSubModalUser.id, {
        days: grantDays,
        reason: grantReason
      });
      setGrantSubModalUser(null);
      loadData();
      alert('Complimentary subscription successfully granted and audited.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!systemConfig) return;
    try {
      await api.updateAdminSettings(systemConfig);
      alert('Pricing and system configuration saved successfully.');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createExercise({
        name: newExName,
        muscleGroup: newExMuscle,
        equipment: newExEquipment,
        difficulty: newExDifficulty,
        startingPosition: newExStartingPos,
        instructions: [newExStep1],
        breathing: 'Breathe smoothly with brace',
        commonMistakes: ['Rushing reps'],
        safetyTips: 'Always maintain stable base',
        easierAlternative: 'Bodyweight regression',
        harderAlternative: 'Tempo progression',
        thumbnail: '/src/assets/images/program_strength_1791537019097.jpg'
      });
      setShowCreateExerciseModal(false);
      setNewExName('');
      setNewExStartingPos('');
      setNewExStep1('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const toggleProgramPublish = async (prog: WorkoutProgram) => {
    try {
      await api.updateProgram(prog.id, { isPublished: !prog.isPublished });
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Top Header */}
      <div className="bg-[#15151D] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF6B35] flex items-center justify-center text-white shadow-lg shadow-[#FF6B35]/25">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white">
                FORGE ADMIN DASHBOARD
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Owner Access
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA] mt-0.5">
              Authorized operations with server-side audit trail.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2.5 bg-[#1C1C26] hover:bg-[#252533] text-[#A1A1AA] hover:text-white rounded-xl border border-white/5 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onBackToApp}
            className="px-4 py-2.5 bg-[#1C1C26] hover:bg-[#252533] text-white text-xs font-bold rounded-xl border border-white/10 transition-colors min-h-[44px]"
          >
            ← Return to App
          </button>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'users', label: 'User Directory', icon: Users },
          { id: 'programs', label: 'Programs', icon: Dumbbell },
          { id: 'exercises', label: 'Exercises', icon: Dumbbell },
          { id: 'settings', label: 'Pricing & Site Config', icon: Settings },
          { id: 'payments', label: 'Payments', icon: DollarSign },
          { id: 'audit', label: 'Audit Logs', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all min-h-[44px] flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/20'
                  : 'bg-[#15151D] text-[#A1A1AA] hover:text-white border border-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && overview && (
        <div className="space-y-6">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#15151D] p-5 rounded-2xl border border-white/5">
              <span className="text-xs text-[#A1A1AA] uppercase">Total Users</span>
              <p className="font-display text-3xl font-bold text-white mt-1 tabular-nums">
                {overview.totalUsers}
              </p>
              <span className="text-[10px] text-[#A1A1AA]">Registered accounts</span>
            </div>

            <div className="bg-[#15151D] p-5 rounded-2xl border border-white/5">
              <span className="text-xs text-emerald-400 uppercase font-semibold">Active Subscribers</span>
              <p className="font-display text-3xl font-bold text-emerald-400 mt-1 tabular-nums">
                {overview.activeSubscribers}
              </p>
              <span className="text-[10px] text-[#A1A1AA]">Paying members</span>
            </div>

            <div className="bg-[#15151D] p-5 rounded-2xl border border-white/5">
              <span className="text-xs text-[#FF6B35] uppercase font-semibold">Active Free Trials</span>
              <p className="font-display text-3xl font-bold text-[#FF6B35] mt-1 tabular-nums">
                {overview.activeFreeTrials}
              </p>
              <span className="text-[10px] text-[#A1A1AA]">Within 7-day window</span>
            </div>

            <div className="bg-[#15151D] p-5 rounded-2xl border border-white/5">
              <span className="text-xs text-[#A1A1AA] uppercase">Est. Monthly Revenue</span>
              <p className="font-display text-3xl font-bold text-white mt-1 tabular-nums">
                ${overview.mrr}
              </p>
              <span className="text-[10px] text-[#A1A1AA]">MRR run-rate</span>
            </div>
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#15151D] p-6 rounded-2xl border border-white/5 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Recent Signups
              </h3>
              <div className="space-y-2">
                {overview.recentUsers.map((u) => (
                  <div
                    key={u.id}
                    className="p-3 bg-[#1C1C26] rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">{u.firstName}</span>
                      <span className="text-[#A1A1AA] text-[11px]">{u.email}</span>
                    </div>
                    <span className="text-[11px] text-[#A1A1AA]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#15151D] p-6 rounded-2xl border border-white/5 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                System Health & Audit Activity
              </h3>
              <div className="space-y-2 text-xs text-[#A1A1AA]">
                <div className="p-3 bg-[#1C1C26] rounded-xl flex items-center justify-between">
                  <span>Total Logged Workouts in DB</span>
                  <span className="font-bold text-white">{overview.totalWorkoutsLogged}</span>
                </div>
                <div className="p-3 bg-[#1C1C26] rounded-xl flex items-center justify-between">
                  <span>Expired Trials</span>
                  <span className="font-bold text-white">{overview.expiredTrials}</span>
                </div>
                <div className="p-3 bg-[#1C1C26] rounded-xl flex items-center justify-between">
                  <span>Cancelled Subscriptions</span>
                  <span className="font-bold text-white">{overview.cancelledSubscriptions}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="bg-[#15151D] rounded-2xl border border-white/5 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-base font-bold text-white">Registered Users ({usersList.length})</h2>

            <form onSubmit={handleUserSearch} className="flex items-center gap-2">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="bg-[#1C1C26] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-[#A1A1AA]/50 focus:outline-none focus:border-[#FF6B35]"
              />
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="bg-[#1C1C26] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B35]"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="trial_active">Trial Active</option>
                <option value="paid_active">Paid Active</option>
              </select>
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1C1C26] text-[#A1A1AA] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-xl">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Subscription</th>
                  <th className="p-3">Account Status</th>
                  <th className="p-3">Registered</th>
                  <th className="p-3 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3">
                      <span className="font-bold text-white block">{u.firstName} {u.lastName || ''}</span>
                      <span className="text-[#A1A1AA] text-[11px]">{u.email}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'admin' ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10 text-white'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-white">
                        {u.subscription?.status === 'trial_active'
                          ? `Trial (${u.subscription.remainingDays}d left)`
                          : u.subscription?.status === 'paid_active'
                          ? 'Paid Member'
                          : u.subscription?.status || 'Eligible'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.status === 'active' ? 'text-emerald-400 bg-emerald-950/40' : 'text-rose-400 bg-rose-950/40'
                      }`}>
                        {u.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-[#A1A1AA]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      {u.role !== 'admin' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setGrantSubModalUser(u)}
                            className="p-1.5 bg-[#1C1C26] hover:bg-[#252533] text-amber-400 rounded-lg text-xs"
                            title="Grant complimentary subscription"
                          >
                            <Gift className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleUserStatus(u.id, u.status)}
                            className={`p-1.5 rounded-lg text-xs ${
                              u.status === 'active'
                                ? 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/50'
                                : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50'
                            }`}
                            title={u.status === 'active' ? 'Suspend user' : 'Reactivate user'}
                          >
                            {u.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: WORKOUT PROGRAMS MANAGEMENT */}
      {activeTab === 'programs' && (
        <div className="bg-[#15151D] rounded-2xl border border-white/5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Program Catalog ({programsList.length})</h2>
          </div>

          <div className="space-y-3">
            {programsList.map((prog) => (
              <div
                key={prog.id}
                className="p-4 bg-[#1C1C26] rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">{prog.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      prog.isPublished ? 'bg-emerald-950/40 text-emerald-300' : 'bg-white/10 text-[#A1A1AA]'
                    }`}>
                      {prog.isPublished ? 'PUBLISHED' : 'UNPUBLISHED'}
                    </span>
                  </div>
                  <p className="text-xs text-[#A1A1AA] mt-1">
                    {prog.difficulty} · {prog.durationWeeks} Weeks · {prog.daysPerWeek} Days/Wk · {prog.location}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleProgramPublish(prog)}
                    className="px-3 py-1.5 bg-[#15151D] hover:bg-[#252533] text-xs font-semibold text-white rounded-lg border border-white/10 min-h-[36px]"
                  >
                    {prog.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: EXERCISES MANAGEMENT */}
      {activeTab === 'exercises' && (
        <div className="bg-[#15151D] rounded-2xl border border-white/5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Exercise Directory ({exercisesList.length})</h2>
            <button
              onClick={() => setShowCreateExerciseModal(true)}
              className="px-4 py-2 bg-[#FF6B35] hover:bg-[#e05824] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Exercise</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {exercisesList.map((ex) => (
              <div key={ex.id} className="p-3.5 bg-[#1C1C26] rounded-xl border border-white/5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#FF6B35] uppercase">{ex.muscleGroup}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      ex.videoUrl ? 'bg-emerald-950/40 text-emerald-400' : 'bg-white/10 text-[#A1A1AA]'
                    }`}>
                      {ex.videoUrl ? 'Video Ready' : 'No Video'}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm mt-1">{ex.name}</h4>
                  <p className="text-xs text-[#A1A1AA] mt-0.5">{ex.equipment}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setSelectedVideoExercise(ex)}
                    className="w-full py-2 bg-[#15151D] hover:bg-[#FF6B35] text-white rounded-lg text-xs font-bold border border-white/10 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Manage Video / Upload</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PRICING & SITE CONFIG */}
      {activeTab === 'settings' && systemConfig && (
        <div className="bg-[#15151D] rounded-2xl border border-white/5 p-6 space-y-4">
          <h2 className="text-base font-bold text-white pb-3 border-b border-white/5">
            Configure Subscription Pricing & Public Content
          </h2>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white mb-1.5">
                  Monthly Subscription Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={systemConfig.monthlyPrice}
                  onChange={(e) =>
                    setSystemConfig({ ...systemConfig, monthlyPrice: Number(e.target.value) })
                  }
                  className="w-full bg-[#1C1C26] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF6B35]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1.5">
                  Free Trial Duration (Days)
                </label>
                <input
                  type="number"
                  required
                  value={systemConfig.trialDurationDays}
                  onChange={(e) =>
                    setSystemConfig({ ...systemConfig, trialDurationDays: Number(e.target.value) })
                  }
                  className="w-full bg-[#1C1C26] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF6B35]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1.5">
                  Currency Code
                </label>
                <input
                  type="text"
                  required
                  value={systemConfig.currency}
                  onChange={(e) =>
                    setSystemConfig({ ...systemConfig, currency: e.target.value })
                  }
                  className="w-full bg-[#1C1C26] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF6B35]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white mb-1.5">
                Top Announcement Banner (Displayed at top of landing page)
              </label>
              <input
                type="text"
                value={systemConfig.announcement}
                onChange={(e) =>
                  setSystemConfig({ ...systemConfig, announcement: e.target.value })
                }
                className="w-full bg-[#1C1C26] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF6B35]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white mb-1.5">
                Support Email
              </label>
              <input
                type="email"
                value={systemConfig.contactEmail}
                onChange={(e) =>
                  setSystemConfig({ ...systemConfig, contactEmail: e.target.value })
                }
                className="w-full bg-[#1C1C26] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF6B35]"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#FF6B35] hover:bg-[#e05824] text-white text-xs font-bold rounded-xl shadow-md min-h-[44px]"
            >
              Save Configuration Changes
            </button>
          </form>
        </div>
      )}

      {/* TAB 6: PAYMENTS LOG */}
      {activeTab === 'payments' && (
        <div className="bg-[#15151D] rounded-2xl border border-white/5 p-6 space-y-4">
          <h2 className="text-base font-bold text-white">Payment & Billing Events ({paymentsList.length})</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1C1C26] text-[#A1A1AA] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-xl">Transaction ID</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-xl">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paymentsList.map((p) => (
                  <tr key={p.id}>
                    <td className="p-3 font-mono text-[#A1A1AA]">{p.transactionRef}</td>
                    <td className="p-3 text-white font-medium">{p.userEmail}</td>
                    <td className="p-3 text-white">{p.planName}</td>
                    <td className="p-3 font-bold text-[#FF6B35]">${p.amount}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/40 text-emerald-400">
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-[#A1A1AA]">{new Date(p.date).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-[#15151D] rounded-2xl border border-white/5 p-6 space-y-4">
          <h2 className="text-base font-bold text-white">Administrative Audit Trail ({auditLogs.length})</h2>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-[#1C1C26] rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2"
              >
                <div>
                  <span className="font-bold text-[#FF6B35] block">{log.action}</span>
                  <p className="text-white mt-0.5">{log.details}</p>
                </div>
                <div className="text-right text-[11px] text-[#A1A1AA] shrink-0">
                  <span>{log.adminEmail}</span>
                  <span className="block mt-0.5">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Grant Complimentary Subscription */}
      {grantSubModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#15151D] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">
              Grant Complimentary Membership
            </h3>
            <p className="text-xs text-[#A1A1AA] mb-4">
              Granting for: <strong className="text-white">{grantSubModalUser.email}</strong>
            </p>

            <form onSubmit={handleGrantSubscription} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white mb-1">
                  Duration (Days)
                </label>
                <input
                  type="number"
                  required
                  value={grantDays}
                  onChange={(e) => setGrantDays(Number(e.target.value))}
                  className="w-full bg-[#1C1C26] border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">
                  Audit Reason
                </label>
                <input
                  type="text"
                  required
                  value={grantReason}
                  onChange={(e) => setGrantReason(e.target.value)}
                  placeholder="e.g. VIP Trial extension, beta testing"
                  className="w-full bg-[#1C1C26] border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGrantSubModalUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#A1A1AA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#FF6B35] hover:bg-[#e05824] text-white text-xs font-bold rounded-xl shadow-md min-h-[44px]"
                >
                  Grant & Record Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Exercise */}
      {showCreateExerciseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#15151D] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Create New Exercise</h3>
              <button onClick={() => setShowCreateExerciseModal(false)} className="text-[#A1A1AA]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExercise} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-white mb-1">Exercise Name</label>
                <input
                  type="text"
                  required
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  placeholder="e.g. Incline Dumbbell Curl"
                  className="w-full bg-[#1C1C26] border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">Muscle Group</label>
                  <select
                    value={newExMuscle}
                    onChange={(e) => setNewExMuscle(e.target.value)}
                    className="w-full bg-[#1C1C26] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {['Chest', 'Back', 'Shoulders', 'Legs', 'Core', 'Cardio'].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">Equipment</label>
                  <input
                    type="text"
                    value={newExEquipment}
                    onChange={(e) => setNewExEquipment(e.target.value)}
                    className="w-full bg-[#1C1C26] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">Starting Position</label>
                <textarea
                  rows={2}
                  required
                  value={newExStartingPos}
                  onChange={(e) => setNewExStartingPos(e.target.value)}
                  placeholder="Set bench to 45 degrees..."
                  className="w-full bg-[#1C1C26] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">Primary Step</label>
                <textarea
                  rows={2}
                  required
                  value={newExStep1}
                  onChange={(e) => setNewExStep1(e.target.value)}
                  placeholder="Curl the weights while keeping elbows pinned..."
                  className="w-full bg-[#1C1C26] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#FF6B35] hover:bg-[#e05824] text-white text-xs font-bold rounded-xl shadow-md min-h-[44px] mt-2"
              >
                Create Exercise
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Manage Video for Exercise */}
      {selectedVideoExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-[#15151D] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <div>
                <span className="text-[10px] font-bold text-[#FF6B35] uppercase tracking-wider">
                  Video Management
                </span>
                <h3 className="text-base font-bold text-white">
                  {selectedVideoExercise.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedVideoExercise(null)}
                className="p-1.5 text-[#A1A1AA] hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ExerciseVideoPlayer
              exercise={selectedVideoExercise}
              onVideoUpdated={(updated) => {
                setSelectedVideoExercise(updated);
                loadData();
              }}
              allowEdit={true}
            />

            <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
              <button
                onClick={() => setSelectedVideoExercise(null)}
                className="px-5 py-2 bg-[#1C1C26] hover:bg-[#252533] text-white text-xs font-bold rounded-xl border border-white/10"
              >
                Close Video Manager
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
