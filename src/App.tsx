import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navigation } from './components/Navigation';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { ProgramsView } from './components/ProgramsView';
import { ExerciseLibraryView } from './components/ExerciseLibraryView';
import { ProgressView } from './components/ProgressView';
import { HistoryCalendarView } from './components/HistoryCalendarView';
import { ProfileSettingsView } from './components/ProfileSettingsView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { OnboardingFlow } from './components/OnboardingFlow';
import { AuthModal } from './components/AuthModals';
import { WorkoutSessionModal } from './components/WorkoutSessionModal';
import { UpgradeModal } from './components/UpgradeModal';
import { PolicyModal } from './components/PolicyModals';
import { api } from './services/api';
import { WorkoutProgram, Exercise, WorkoutLog, ProgressData, SystemConfig } from './types';

function MainApp() {
  const { user, subscription, loading: authLoading, refreshUserData } = useAuth();

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [systemConfig, setSystemConfig] = useState<SystemConfig | undefined>();

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [activeSessionOpen, setActiveSessionOpen] = useState(false);
  const [sessionProgram, setSessionProgram] = useState<WorkoutProgram | null>(null);
  const [sessionDayIndex, setSessionDayIndex] = useState(0);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [policyModalType, setPolicyModalType] = useState<'privacy' | 'terms' | 'refund' | 'contact' | null>(null);

  // Initial Data Fetch
  const loadInitialData = async () => {
    try {
      const [progs, exs, cfg] = await Promise.all([
        api.getPrograms(),
        api.getExercises(),
        api.getConfig().then((res) => res.config)
      ]);
      setPrograms(progs);
      setExercises(exs);
      setSystemConfig(cfg);
    } catch {
      // Ignore
    }
  };

  const loadUserData = async () => {
    if (!user) return;
    try {
      const [history, progData] = await Promise.all([
        api.getWorkoutHistory(),
        api.getProgress()
      ]);
      setWorkoutLogs(history);
      setProgressData(progData);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  // Active program lookup
  const activeProgram = programs.find((p) => p.id === user?.activeProgramId) || programs[0] || null;

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleStartWorkout = (prog?: WorkoutProgram, dayIdx: number = 0) => {
    setSessionProgram(prog || activeProgram);
    setSessionDayIndex(dayIdx);
    setActiveSessionOpen(true);
  };

  const handleWorkoutCompleted = () => {
    setActiveSessionOpen(false);
    loadUserData();
    refreshUserData();
  };

  const handleExerciseUpdated = (updated: Exercise) => {
    setExercises((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If user signed up but hasn't completed onboarding flow
  if (user && !user.onboardingCompleted) {
    return (
      <OnboardingFlow
        onComplete={() => {
          loadUserData();
          refreshUserData();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white flex flex-col selection:bg-[#FF6B35] selection:text-white pb-20 md:pb-0">
      {/* Top Navigation */}
      <Navigation
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAuth={handleOpenAuth}
        onOpenUpgradeModal={() => setUpgradeModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {!user ? (
          /* Public Visitor Views */
          currentTab === 'programs' ? (
            <ProgramsView
              programs={programs}
              exercises={exercises}
              onStartProgramDay={() => handleOpenAuth('register')}
              onOpenUpgradeModal={() => setUpgradeModalOpen(true)}
            />
          ) : currentTab === 'exercises' ? (
            <ExerciseLibraryView
              exercises={exercises}
              onStartSingleExerciseWorkout={() => handleOpenAuth('register')}
              onExerciseUpdated={handleExerciseUpdated}
            />
          ) : (
            <LandingPage
              programs={programs}
              config={systemConfig}
              onOpenAuth={handleOpenAuth}
              onSelectProgramPreview={(prog) => {
                setSessionProgram(prog);
                setCurrentTab('programs');
              }}
              onOpenPolicy={(type) => setPolicyModalType(type)}
            />
          )
        ) : (
          /* Logged-In User Views */
          <>
            {currentTab === 'home' && (
              <DashboardView
                userName={user.firstName}
                activeProgram={activeProgram}
                subscription={subscription}
                workoutLogs={workoutLogs}
                bodyMetrics={progressData?.weights || []}
                onStartWorkout={() => handleStartWorkout()}
                onOpenUpgradeModal={() => setUpgradeModalOpen(true)}
                onNavigateTab={setCurrentTab}
              />
            )}

            {(currentTab === 'workouts' || currentTab === 'programs') && (
              <ProgramsView
                programs={programs}
                exercises={exercises}
                onStartProgramDay={(prog, dIdx) => handleStartWorkout(prog, dIdx)}
                onOpenUpgradeModal={() => setUpgradeModalOpen(true)}
              />
            )}

            {currentTab === 'exercises' && (
              <ExerciseLibraryView
                exercises={exercises}
                onStartSingleExerciseWorkout={(ex) => handleStartWorkout()}
                onExerciseUpdated={handleExerciseUpdated}
              />
            )}

            {currentTab === 'progress' && (
              <ProgressView
                progressData={progressData}
                onRefresh={loadUserData}
              />
            )}

            {currentTab === 'history' && (
              <HistoryCalendarView
                workoutLogs={workoutLogs}
                onStartNewWorkout={() => handleStartWorkout()}
              />
            )}

            {currentTab === 'profile' && (
              <ProfileSettingsView
                workoutLogs={workoutLogs}
                onOpenUpgradeModal={() => setUpgradeModalOpen(true)}
              />
            )}

            {currentTab === 'admin' && user.role === 'admin' && (
              <AdminDashboardView
                onBackToApp={() => setCurrentTab('home')}
              />
            )}
          </>
        )}
      </main>

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          loadUserData();
          refreshUserData();
        }}
      />

      {activeSessionOpen && (
        <WorkoutSessionModal
          program={sessionProgram}
          dayIndex={sessionDayIndex}
          exercisesList={exercises}
          onClose={() => setActiveSessionOpen(false)}
          onWorkoutCompleted={handleWorkoutCompleted}
        />
      )}

      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        onSuccess={() => {
          refreshUserData();
        }}
      />

      <PolicyModal
        type={policyModalType}
        config={systemConfig}
        onClose={() => setPolicyModalType(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
