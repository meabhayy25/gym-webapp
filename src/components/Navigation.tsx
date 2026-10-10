import React from 'react';
import {
  Flame,
  LayoutDashboard,
  Dumbbell,
  TrendingUp,
  CalendarDays,
  User,
  ShieldCheck,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenUpgradeModal: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAuth,
  onOpenUpgradeModal
}) => {
  const { user, subscription, logout } = useAuth();

  // Visitor Navigation (Public)
  if (!user) {
    return (
      <header className="sticky top-0 z-50 bg-[#0B0B0F]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-2.5 text-left group transition-transform active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FF6B35] flex items-center justify-center text-white shadow-lg shadow-[#FF6B35]/25">
              <Flame className="w-5 h-5 fill-white" />
            </div>
            <span className="font-display text-xl font-bold tracking-wider text-white">
              FORGE <span className="text-[#FF6B35]">FITNESS</span>
            </span>
          </button>

          {/* Zone 2: Clean single-line text links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#A1A1AA]">
            <button
              onClick={() => setCurrentTab('programs')}
              className={`hover:text-white transition-colors whitespace-nowrap ${currentTab === 'programs' ? 'text-white' : ''}`}
            >
              Programs
            </button>
            <button
              onClick={() => setCurrentTab('exercises')}
              className={`hover:text-white transition-colors whitespace-nowrap ${currentTab === 'exercises' ? 'text-white' : ''}`}
            >
              Exercise Library
            </button>
            <a
              href="#pricing"
              onClick={(e) => {
                if (currentTab !== 'home') setCurrentTab('home');
              }}
              className="hover:text-white transition-colors whitespace-nowrap"
            >
              Pricing
            </a>
            <a
              href="#faq"
              onClick={(e) => {
                if (currentTab !== 'home') setCurrentTab('home');
              }}
              className="hover:text-white transition-colors whitespace-nowrap"
            >
              FAQ
            </a>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenAuth('login')}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-white/90 hover:text-white transition-colors whitespace-nowrap min-h-[44px] flex items-center"
            >
              Log In
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="px-4 py-2 text-xs sm:text-sm font-bold bg-[#FF6B35] text-white rounded-xl hover:bg-[#e05824] shadow-md shadow-[#FF6B35]/20 transition-all active:scale-95 whitespace-nowrap min-h-[44px] flex items-center"
            >
              Start 7-Day Free Trial
            </button>
          </div>
        </div>
      </header>
    );
  }

  // Logged-in User Navigation (Desktop Top Bar + Mobile Bottom Bar)
  const isTrialActive = subscription?.status === 'trial_active';
  const isPaid = subscription?.status === 'paid_active';
  const remainingDays = subscription?.remainingDays ?? 0;

  return (
    <>
      {/* Desktop Top Bar */}
      <header className="sticky top-0 z-40 bg-[#0B0B0F]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentTab('home')}
              className="flex items-center gap-2.5 text-left group transition-transform active:scale-95"
            >
              <div className="w-8 h-8 rounded-lg bg-[#FF6B35] flex items-center justify-center text-white shadow-md shadow-[#FF6B35]/25">
                <Flame className="w-4 h-4 fill-white" />
              </div>
              <span className="font-display text-lg font-bold tracking-wider text-white">
                FORGE <span className="text-[#FF6B35]">FITNESS</span>
              </span>
            </button>

            {/* Trial / Subscription State indicator */}
            {isTrialActive && (
              <button
                onClick={onOpenUpgradeModal}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FF6B35]/10 border border-[#FF6B35]/30 text-xs font-semibold text-[#FF6B35] hover:bg-[#FF6B35]/20 transition-colors"
                title="Click to manage subscription"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Trial: {remainingDays}d remaining</span>
              </button>
            )}
            {isPaid && (
              <span className="hidden lg:inline-flex items-center px-2 py-0.5 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded-md">
                Pro Member
              </span>
            )}
          </div>

          {/* Zone 2: Navigation Links for Desktop */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => setCurrentTab('home')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-h-[44px] flex items-center gap-2 ${
                currentTab === 'home'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setCurrentTab('workouts')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-h-[44px] flex items-center gap-2 ${
                currentTab === 'workouts' || currentTab === 'programs'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              Workouts
            </button>
            <button
              onClick={() => setCurrentTab('exercises')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-h-[44px] flex items-center gap-2 ${
                currentTab === 'exercises'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
              }`}
            >
              Exercises
            </button>
            <button
              onClick={() => setCurrentTab('progress')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-h-[44px] flex items-center gap-2 ${
                currentTab === 'progress'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Progress
            </button>
            <button
              onClick={() => setCurrentTab('history')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-h-[44px] flex items-center gap-2 ${
                currentTab === 'history'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              History
            </button>
            {user.role === 'admin' && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap min-h-[44px] flex items-center gap-2 ${
                  currentTab === 'admin'
                    ? 'bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/25'
                    : 'text-[#FF6B35] hover:bg-[#FF6B35]/10'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin
              </button>
            )}
          </nav>

          {/* Zone 3: Profile / User action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setCurrentTab('profile')}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-colors min-h-[44px] ${
                currentTab === 'profile'
                  ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-white'
                  : 'border-white/10 bg-[#15151D] text-[#A1A1AA] hover:text-white'
              }`}
              title="Account & Subscription Settings"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FF6B35] to-amber-500 flex items-center justify-center text-white text-xs font-bold">
                {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
              </div>
              <span className="hidden sm:inline text-xs font-medium text-white max-w-[100px] truncate">
                {user.firstName}
              </span>
            </button>

            <button
              onClick={logout}
              className="p-2 text-[#A1A1AA] hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (Pattern 1 from Mobile Touch Apps) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0B0F]/95 backdrop-blur-lg border-t border-white/10 pb-safe">
        <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-2">
          <button
            onClick={() => setCurrentTab('home')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              currentTab === 'home' ? 'text-[#FF6B35]' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-1">Home</span>
          </button>

          <button
            onClick={() => setCurrentTab('workouts')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              currentTab === 'workouts' || currentTab === 'programs'
                ? 'text-[#FF6B35]'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <Dumbbell className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-1">Workouts</span>
          </button>

          <button
            onClick={() => setCurrentTab('progress')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              currentTab === 'progress' ? 'text-[#FF6B35]' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-1">Progress</span>
          </button>

          <button
            onClick={() => setCurrentTab('history')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              currentTab === 'history' ? 'text-[#FF6B35]' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <CalendarDays className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-1">History</span>
          </button>

          <button
            onClick={() => setCurrentTab('profile')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              currentTab === 'profile' ? 'text-[#FF6B35]' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-1">Profile</span>
          </button>
        </div>
      </nav>
    </>
  );
};
