import React, { useState } from 'react';
import {
  User,
  CreditCard,
  Shield,
  Bell,
  Download,
  LogOut,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { WorkoutLog } from '../types';

interface ProfileSettingsViewProps {
  workoutLogs: WorkoutLog[];
  onOpenUpgradeModal: () => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  workoutLogs,
  onOpenUpgradeModal
}) => {
  const { user, subscription, logout, updateUser, updateSubscription } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [newPassword, setNewPassword] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Notification toggles
  const [notifyWorkouts, setNotifyWorkouts] = useState(true);
  const [notifyTrial, setNotifyTrial] = useState(true);

  const isTrialActive = subscription?.status === 'trial_active';
  const isPaid = subscription?.status === 'paid_active';
  const isExpired = subscription?.status === 'expired';

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await api.updateProfile({
        firstName,
        lastName,
        password: newPassword || undefined
      });
      updateUser(res.user);
      setSaveSuccess(true);
      setNewPassword('');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription auto-renewal?')) return;
    try {
      const res = await api.cancelSubscription();
      updateSubscription(res.subscription);
      alert('Your subscription auto-renewal has been cancelled.');
    } catch (err: any) {
      alert(err.message || 'Error cancelling subscription');
    }
  };

  // Export Data as JSON
  const handleExportData = () => {
    const exportPayload = {
      user: {
        id: user?.id,
        email: user?.email,
        firstName: user?.firstName,
        onboarding: user?.onboardingData
      },
      subscription,
      workouts: workoutLogs,
      exportedAt: new Date().toISOString()
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `forge_fitness_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
          PROFILE & SETTINGS
        </h1>
        <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1">
          Manage personal credentials, subscription status, and data preferences.
        </p>
      </div>

      {/* Subscription Card */}
      <div className="bg-[#15151D] rounded-2xl border border-white/5 p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/10 border border-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Membership & Subscription</h2>
              <span className="text-xs text-[#A1A1AA]">
                Verified server-side billing lifecycle
              </span>
            </div>
          </div>

          <div>
            {isTrialActive && (
              <span className="px-3 py-1 bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/30 rounded-lg text-xs font-bold">
                7-Day Free Trial Active
              </span>
            )}
            {isPaid && (
              <span className="px-3 py-1 bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold">
                Unlimited Pro Member
              </span>
            )}
            {isExpired && (
              <span className="px-3 py-1 bg-rose-950/40 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-bold">
                Subscription Expired
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#1C1C26] p-3.5 rounded-xl border border-white/5">
            <span className="text-[10px] text-[#A1A1AA] uppercase">Current Plan</span>
            <p className="font-bold text-white text-sm mt-0.5">
              {isPaid ? 'Monthly Unlimited' : isTrialActive ? '7-Day Free Trial' : 'Expired'}
            </p>
          </div>

          <div className="bg-[#1C1C26] p-3.5 rounded-xl border border-white/5">
            <span className="text-[10px] text-[#A1A1AA] uppercase">Billing Status</span>
            <p className="font-bold text-white text-sm mt-0.5">
              {isTrialActive
                ? `${subscription?.remainingDays ?? 0} days remaining`
                : isPaid
                ? 'Active (Renews monthly)'
                : 'Access restricted'}
            </p>
          </div>

          <div className="bg-[#1C1C26] p-3.5 rounded-xl border border-white/5">
            <span className="text-[10px] text-[#A1A1AA] uppercase">Pricing</span>
            <p className="font-bold text-[#FF6B35] text-sm mt-0.5">
              ${subscription?.price || 19.99} / month
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-[#A1A1AA]">
            {isTrialActive
              ? 'No credit card charge until you explicitly confirm full membership.'
              : 'You can cancel auto-renewal at any time without penalty.'}
          </p>

          <div className="flex items-center gap-2">
            {!isPaid ? (
              <button
                onClick={onOpenUpgradeModal}
                className="px-5 py-2.5 bg-[#FF6B35] hover:bg-[#e05824] text-white text-xs font-bold rounded-xl shadow-md min-h-[44px]"
              >
                Upgrade to Pro Unlimited
              </button>
            ) : (
              <button
                onClick={handleCancelSubscription}
                className="px-4 py-2 bg-[#1C1C26] hover:bg-rose-950/40 text-[#A1A1AA] hover:text-rose-400 text-xs font-semibold rounded-xl border border-white/10 transition-colors min-h-[44px]"
              >
                Cancel Auto-Renewal
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Account Profile Form */}
      <div className="bg-[#15151D] rounded-2xl border border-white/5 p-6 space-y-4">
        <h2 className="text-base font-bold text-white pb-3 border-b border-white/5">
          Account Credentials
        </h2>

        {saveSuccess && (
          <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile successfully updated!</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white mb-1.5">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-[#1C1C26] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF6B35]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white mb-1.5">Last Name (Optional)</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-[#1C1C26] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF6B35]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white mb-1.5">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full bg-[#1C1C26]/50 border border-white/5 rounded-xl px-3 py-2 text-sm text-[#A1A1AA] cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white mb-1.5">
              Change Password (Leave blank to keep current)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#1C1C26] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF6B35]"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#FF6B35] hover:bg-[#e05824] text-white text-xs font-bold rounded-xl shadow-md min-h-[44px]"
          >
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* Fitness Baseline Preferences */}
      <div className="bg-[#15151D] rounded-2xl border border-white/5 p-6 space-y-4">
        <h2 className="text-base font-bold text-white pb-3 border-b border-white/5">
          Fitness Baseline Preferences
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#1C1C26] p-3 rounded-xl border border-white/5">
            <span className="text-[10px] text-[#A1A1AA] block">Goal</span>
            <span className="font-bold text-white mt-0.5 block">{user?.onboardingData?.goal || 'Muscle Gain'}</span>
          </div>
          <div className="bg-[#1C1C26] p-3 rounded-xl border border-white/5">
            <span className="text-[10px] text-[#A1A1AA] block">Experience</span>
            <span className="font-bold text-white mt-0.5 block">{user?.onboardingData?.experience || 'Intermediate'}</span>
          </div>
          <div className="bg-[#1C1C26] p-3 rounded-xl border border-white/5">
            <span className="text-[10px] text-[#A1A1AA] block">Location</span>
            <span className="font-bold text-white mt-0.5 block">{user?.onboardingData?.location || 'Gym'}</span>
          </div>
          <div className="bg-[#1C1C26] p-3 rounded-xl border border-white/5">
            <span className="text-[10px] text-[#A1A1AA] block">Schedule</span>
            <span className="font-bold text-white mt-0.5 block">{user?.onboardingData?.daysPerWeek || 4} Days / Wk</span>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-[#15151D] rounded-2xl border border-white/5 p-6 space-y-4">
        <h2 className="text-base font-bold text-white pb-3 border-b border-white/5">
          Notifications & Alerts
        </h2>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-xl bg-[#1C1C26] cursor-pointer">
            <div>
              <p className="font-bold text-white">Workout Session Reminders</p>
              <p className="text-[11px] text-[#A1A1AA]">Alerts for upcoming scheduled workout days</p>
            </div>
            <input
              type="checkbox"
              checked={notifyWorkouts}
              onChange={(e) => setNotifyWorkouts(e.target.checked)}
              className="w-5 h-5 accent-[#FF6B35] rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-[#1C1C26] cursor-pointer">
            <div>
              <p className="font-bold text-white">Subscription & Trial Updates</p>
              <p className="text-[11px] text-[#A1A1AA]">Notifications before trial expiry or renewal events</p>
            </div>
            <input
              type="checkbox"
              checked={notifyTrial}
              onChange={(e) => setNotifyTrial(e.target.checked)}
              className="w-5 h-5 accent-[#FF6B35] rounded"
            />
          </label>
        </div>
      </div>

      {/* Data Export & Sign Out */}
      <div className="bg-[#15151D] rounded-2xl border border-white/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white">Data Privacy & Export</h3>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Download an archive of all your logged sets, workouts, and body metrics.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleExportData}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-[#1C1C26] hover:bg-[#252533] text-white text-xs font-bold rounded-xl border border-white/10 transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>

          <button
            onClick={logout}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 text-xs font-bold rounded-xl border border-rose-500/30 transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
