export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  onboardingCompleted: boolean;
  onboardingData?: {
    goal: string;
    experience: string;
    location: string;
    daysPerWeek: number;
    durationMinutes: number;
    heightCm?: number;
    weightKg?: number;
  };
  activeProgramId: string;
}

export type SubscriptionStatus =
  | 'trial_eligible'
  | 'trial_active'
  | 'paid_active'
  | 'payment_pending'
  | 'payment_failed'
  | 'cancelled'
  | 'expired';

export interface Subscription {
  userId: string;
  status: SubscriptionStatus;
  plan: 'monthly';
  price: number;
  currency: string;
  trialStartDate: string | null;
  trialEndDate: string | null;
  paidStartDate: string | null;
  paidEndDate: string | null;
  autoRenew: boolean;
  provider: string;
  remainingSeconds?: number;
  remainingDays?: number;
  isEntitled?: boolean;
}

export interface ProgramScheduleDay {
  dayNumber: number;
  title: string;
  isRest: boolean;
  exercises: {
    exerciseId: string;
    targetSets: number;
    targetReps: string;
    restSeconds: number;
    tempo?: string;
  }[];
}

export interface WorkoutProgram {
  id: string;
  title: string;
  slug: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  durationWeeks: number;
  location: string;
  goal: string;
  coverImage: string;
  description: string;
  isPublished: boolean;
  daysPerWeek: number;
  schedule: ProgramScheduleDay[];
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  secondaryMuscles?: string[];
  equipment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  startingPosition: string;
  instructions: string[];
  breathing: string;
  commonMistakes: string[];
  safetyTips: string;
  easierAlternative: string;
  harderAlternative: string;
  thumbnail: string;
  videoUrl?: string;
}

export interface LoggedSet {
  setNumber: number;
  reps: number;
  weightKg: number;
  isCompleted: boolean;
  isBodyweight?: boolean;
  notes?: string;
}

export interface LoggedExercise {
  exerciseId: string;
  exerciseName: string;
  sets: LoggedSet[];
}

export interface WorkoutLog {
  id: string;
  userId: string;
  programId: string;
  programName: string;
  dayTitle: string;
  date: string;
  durationSeconds: number;
  exercises: LoggedExercise[];
  totalVolumeKg: number;
  totalSetsCompleted: number;
  totalRepsCompleted: number;
  difficultyRating: number;
  notes?: string;
}

export interface BodyMetric {
  id: string;
  userId: string;
  date: string;
  weightKg: number;
  notes?: string;
}

export interface Measurement {
  id: string;
  userId: string;
  date: string;
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  armsCm?: number;
  thighsCm?: number;
  notes?: string;
}

export interface PersonalRecord {
  exerciseId?: string;
  exerciseName: string;
  weightKg: number;
  reps: number;
  date: string;
}

export interface ProgressData {
  totalWorkouts: number;
  currentStreak: number;
  totalVolumeAllTime: number;
  weights: BodyMetric[];
  measurements: Measurement[];
  workoutLogs: WorkoutLog[];
  personalRecords: PersonalRecord[];
}

export interface SystemConfig {
  monthlyPrice: number;
  currency: string;
  trialDurationDays: number;
  heroHeadline: string;
  heroSubheadline: string;
  announcement: string;
  contactEmail: string;
  contactPhone: string;
}

export interface AdminOverview {
  totalUsers: number;
  activeSubscribers: number;
  activeFreeTrials: number;
  expiredTrials: number;
  cancelledSubscriptions: number;
  mrr: number;
  totalWorkoutsLogged: number;
  recentUsers: User[];
  recentPayments: any[];
  recentWorkouts: WorkoutLog[];
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  details: string;
  timestamp: string;
}
