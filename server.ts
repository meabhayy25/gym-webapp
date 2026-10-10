import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// In-memory persistent database store
const DB_FILE = path.resolve(process.cwd(), '.data-store.json');

interface User {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended';
  firstName: string;
  lastName?: string;
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

interface Subscription {
  userId: string;
  status: 'trial_eligible' | 'trial_active' | 'paid_active' | 'payment_pending' | 'payment_failed' | 'cancelled' | 'expired';
  plan: 'monthly';
  price: number;
  currency: string;
  trialStartDate: string | null;
  trialEndDate: string | null;
  paidStartDate: string | null;
  paidEndDate: string | null;
  autoRenew: boolean;
  provider: string;
  lastPaymentId?: string;
}

interface WorkoutLog {
  id: string;
  userId: string;
  programId: string;
  programName: string;
  dayTitle: string;
  date: string;
  durationSeconds: number;
  exercises: {
    exerciseId: string;
    exerciseName: string;
    sets: {
      setNumber: number;
      reps: number;
      weightKg: number;
      isCompleted: boolean;
      isBodyweight?: boolean;
      notes?: string;
    }[];
  }[];
  totalVolumeKg: number;
  totalSetsCompleted: number;
  totalRepsCompleted: number;
  difficultyRating: number;
  notes?: string;
}

interface BodyMetric {
  id: string;
  userId: string;
  date: string;
  weightKg: number;
  notes?: string;
}

interface Measurement {
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

interface PaymentRecord {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending';
  date: string;
  provider: string;
  planName: string;
  transactionRef: string;
}

interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

interface SystemConfig {
  monthlyPrice: number;
  currency: string;
  trialDurationDays: number;
  heroHeadline: string;
  heroSubheadline: string;
  announcement: string;
  contactEmail: string;
  contactPhone: string;
}

// Initial seed programs
const INITIAL_PROGRAMS = [
  {
    id: 'prog_beginner',
    title: 'Beginner Foundation',
    slug: 'beginner-foundation',
    difficulty: 'Beginner',
    durationWeeks: 4,
    location: 'Gym or Home',
    goal: 'General Fitness & Muscle Tone',
    coverImage: '/src/assets/images/hero_workout_athlete_1791536995439.jpg',
    description: 'A structured 4-week introduction to fundamental movement patterns, exercise technique, and habit consistency.',
    isPublished: true,
    daysPerWeek: 3,
    schedule: [
      {
        dayNumber: 1,
        title: 'Full Body A: Squat & Push Focus',
        isRest: false,
        exercises: [
          { exerciseId: 'goblet_squat', targetSets: 3, targetReps: '10-12', restSeconds: 90, tempo: '3-0-1' },
          { exerciseId: 'dumbbell_bench_press', targetSets: 3, targetReps: '10-12', restSeconds: 90, tempo: '2-0-1' },
          { exerciseId: 'lat_pulldown', targetSets: 3, targetReps: '12', restSeconds: 60, tempo: '2-1-1' },
          { exerciseId: 'plank', targetSets: 3, targetReps: '45s', restSeconds: 60, tempo: 'Static' }
        ]
      },
      { dayNumber: 2, title: 'Rest & Active Recovery', isRest: true, exercises: [] },
      {
        dayNumber: 3,
        title: 'Full Body B: Hinge & Pull Focus',
        isRest: false,
        exercises: [
          { exerciseId: 'romanian_deadlift', targetSets: 3, targetReps: '10', restSeconds: 90, tempo: '3-0-1' },
          { exerciseId: 'seated_cable_row', targetSets: 3, targetReps: '10-12', restSeconds: 90, tempo: '2-1-1' },
          { exerciseId: 'dumbbell_shoulder_press', targetSets: 3, targetReps: '10-12', restSeconds: 90, tempo: '2-0-1' },
          { exerciseId: 'leg_press', targetSets: 3, targetReps: '12-15', restSeconds: 90, tempo: '2-0-1' }
        ]
      },
      { dayNumber: 4, title: 'Rest Day', isRest: true, exercises: [] },
      {
        dayNumber: 5,
        title: 'Full Body C: Functional Strength',
        isRest: false,
        exercises: [
          { exerciseId: 'walking_lunges', targetSets: 3, targetReps: '12 per leg', restSeconds: 90, tempo: '2-0-1' },
          { exerciseId: 'push_ups', targetSets: 3, targetReps: '10-15', restSeconds: 60, tempo: '2-0-1' },
          { exerciseId: 'cable_face_pull', targetSets: 3, targetReps: '15', restSeconds: 60, tempo: '2-1-2' },
          { exerciseId: 'hanging_knee_raise', targetSets: 3, targetReps: '12', restSeconds: 60, tempo: '2-0-1' }
        ]
      },
      { dayNumber: 6, title: 'Rest Day', isRest: true, exercises: [] },
      { dayNumber: 7, title: 'Rest & Weekly Reflection', isRest: true, exercises: [] }
    ]
  },
  {
    id: 'prog_ppl',
    title: 'Push Pull Legs (PPL)',
    slug: 'push-pull-legs',
    difficulty: 'Intermediate',
    durationWeeks: 4,
    location: 'Gym',
    goal: 'Hypertrophy & Muscle Gain',
    coverImage: '/src/assets/images/program_ppl_1791537008009.jpg',
    description: 'The premier physique architecture split separating pressing, pulling, and lower-body movements for optimal recovery and growth.',
    isPublished: true,
    daysPerWeek: 6,
    schedule: [
      {
        dayNumber: 1,
        title: 'Push 1: Chest, Front Delts, Triceps',
        isRest: false,
        exercises: [
          { exerciseId: 'barbell_bench_press', targetSets: 4, targetReps: '6-8', restSeconds: 120, tempo: '3-1-0' },
          { exerciseId: 'incline_dumbbell_press', targetSets: 3, targetReps: '8-10', restSeconds: 90, tempo: '2-0-1' },
          { exerciseId: 'overhead_press', targetSets: 3, targetReps: '8-10', restSeconds: 90, tempo: '2-0-1' },
          { exerciseId: 'lateral_raise', targetSets: 4, targetReps: '12-15', restSeconds: 60, tempo: '2-0-2' },
          { exerciseId: 'triceps_rope_pushdown', targetSets: 3, targetReps: '12', restSeconds: 60, tempo: '2-0-1' }
        ]
      },
      {
        dayNumber: 2,
        title: 'Pull 1: Back, Rear Delts, Biceps',
        isRest: false,
        exercises: [
          { exerciseId: 'barbell_deadlift', targetSets: 3, targetReps: '5', restSeconds: 180, tempo: '2-1-1' },
          { exerciseId: 'barbell_row', targetSets: 4, targetReps: '8-10', restSeconds: 90, tempo: '2-1-1' },
          { exerciseId: 'lat_pulldown', targetSets: 3, targetReps: '10-12', restSeconds: 90, tempo: '2-0-1' },
          { exerciseId: 'cable_face_pull', targetSets: 3, targetReps: '15', restSeconds: 60, tempo: '2-1-2' },
          { exerciseId: 'dumbbell_bicep_curl', targetSets: 3, targetReps: '10-12', restSeconds: 60, tempo: '2-0-1' }
        ]
      },
      {
        dayNumber: 3,
        title: 'Legs 1: Quads, Hamstrings, Calves',
        isRest: false,
        exercises: [
          { exerciseId: 'barbell_back_squat', targetSets: 4, targetReps: '6-8', restSeconds: 150, tempo: '3-0-1' },
          { exerciseId: 'romanian_deadlift', targetSets: 3, targetReps: '8-10', restSeconds: 90, tempo: '3-0-1' },
          { exerciseId: 'leg_press', targetSets: 3, targetReps: '10-12', restSeconds: 90, tempo: '2-0-1' },
          { exerciseId: 'calf_raise', targetSets: 4, targetReps: '15', restSeconds: 45, tempo: '2-1-1' }
        ]
      },
      { dayNumber: 4, title: 'Push 2: Hypertrophy Focus', isRest: false, exercises: [
        { exerciseId: 'incline_dumbbell_press', targetSets: 4, targetReps: '10-12', restSeconds: 90, tempo: '2-0-1' },
        { exerciseId: 'cable_chest_fly', targetSets: 3, targetReps: '12-15', restSeconds: 60, tempo: '2-1-1' },
        { exerciseId: 'dumbbell_shoulder_press', targetSets: 3, targetReps: '10', restSeconds: 90, tempo: '2-0-1' },
        { exerciseId: 'lateral_raise', targetSets: 4, targetReps: '15', restSeconds: 45, tempo: '2-0-2' }
      ] },
      { dayNumber: 5, title: 'Pull 2: Lats & Arms Focus', isRest: false, exercises: [
        { exerciseId: 'pull_ups', targetSets: 4, targetReps: '8-10', restSeconds: 90, tempo: '2-1-1' },
        { exerciseId: 'seated_cable_row', targetSets: 4, targetReps: '10-12', restSeconds: 90, tempo: '2-1-1' },
        { exerciseId: 'dumbbell_hammer_curl', targetSets: 3, targetReps: '12', restSeconds: 60, tempo: '2-0-1' }
      ] },
      { dayNumber: 6, title: 'Legs 2: Posterior Chain Focus', isRest: false, exercises: [
        { exerciseId: 'romanian_deadlift', targetSets: 4, targetReps: '8-10', restSeconds: 120, tempo: '3-0-1' },
        { exerciseId: 'walking_lunges', targetSets: 3, targetReps: '12 per leg', restSeconds: 90, tempo: '2-0-1' },
        { exerciseId: 'leg_curl', targetSets: 3, targetReps: '12-15', restSeconds: 60, tempo: '2-0-2' }
      ] },
      { dayNumber: 7, title: 'Full Rest & Recovery', isRest: true, exercises: [] }
    ]
  },
  {
    id: 'prog_strength',
    title: 'Raw Strength Training',
    slug: 'raw-strength',
    difficulty: 'Advanced',
    durationWeeks: 4,
    location: 'Gym',
    goal: 'Maximum Strength',
    coverImage: '/src/assets/images/program_strength_1791537019097.jpg',
    description: 'Focused powerlifting methodology emphasizing progressive overload across the Big Three: Squat, Bench Press, and Deadlift.',
    isPublished: true,
    daysPerWeek: 4,
    schedule: [
      {
        dayNumber: 1,
        title: 'Heavy Squat & Leg Strength',
        isRest: false,
        exercises: [
          { exerciseId: 'barbell_back_squat', targetSets: 5, targetReps: '3-5', restSeconds: 180, tempo: '3-1-0' },
          { exerciseId: 'leg_press', targetSets: 3, targetReps: '8', restSeconds: 120, tempo: '2-0-1' },
          { exerciseId: 'hanging_knee_raise', targetSets: 3, targetReps: '12', restSeconds: 60, tempo: '2-0-1' }
        ]
      },
      {
        dayNumber: 2,
        title: 'Heavy Bench & Upper Power',
        isRest: false,
        exercises: [
          { exerciseId: 'barbell_bench_press', targetSets: 5, targetReps: '3-5', restSeconds: 180, tempo: '2-1-0' },
          { exerciseId: 'barbell_row', targetSets: 4, targetReps: '6', restSeconds: 120, tempo: '2-0-1' },
          { exerciseId: 'triceps_rope_pushdown', targetSets: 3, targetReps: '10', restSeconds: 60, tempo: '2-0-1' }
        ]
      },
      { dayNumber: 3, title: 'Rest & Mobility', isRest: true, exercises: [] },
      {
        dayNumber: 4,
        title: 'Heavy Deadlift & Posterior Power',
        isRest: false,
        exercises: [
          { exerciseId: 'barbell_deadlift', targetSets: 5, targetReps: '3', restSeconds: 240, tempo: '2-1-0' },
          { exerciseId: 'overhead_press', targetSets: 4, targetReps: '5', restSeconds: 150, tempo: '2-0-1' },
          { exerciseId: 'pull_ups', targetSets: 4, targetReps: '6-8', restSeconds: 120, tempo: '2-0-1' }
        ]
      },
      { dayNumber: 5, title: 'Rest Day', isRest: true, exercises: [] },
      {
        dayNumber: 6,
        title: 'Accessory & Hypertrophy Support',
        isRest: false,
        exercises: [
          { exerciseId: 'incline_dumbbell_press', targetSets: 3, targetReps: '8-10', restSeconds: 90, tempo: '2-0-1' },
          { exerciseId: 'seated_cable_row', targetSets: 3, targetReps: '8-10', restSeconds: 90, tempo: '2-1-1' },
          { exerciseId: 'walking_lunges', targetSets: 3, targetReps: '10 per leg', restSeconds: 90, tempo: '2-0-1' }
        ]
      },
      { dayNumber: 7, title: 'Rest Day', isRest: true, exercises: [] }
    ]
  },
  {
    id: 'prog_fatloss',
    title: 'Fat Loss & Conditioning',
    slug: 'fat-loss-conditioning',
    difficulty: 'Intermediate',
    durationWeeks: 4,
    location: 'Gym or Home',
    goal: 'Fat Loss & Stamina',
    coverImage: '/src/assets/images/program_fatloss_1791537031844.jpg',
    description: 'High metabolic demand combining compound resistance training and explosive intervals to preserve lean tissue while cutting fat.',
    isPublished: true,
    daysPerWeek: 4,
    schedule: [
      {
        dayNumber: 1,
        title: 'Upper Body Metabolic Circuit',
        isRest: false,
        exercises: [
          { exerciseId: 'dumbbell_bench_press', targetSets: 4, targetReps: '12', restSeconds: 60, tempo: '2-0-1' },
          { exerciseId: 'lat_pulldown', targetSets: 4, targetReps: '12', restSeconds: 60, tempo: '2-0-1' },
          { exerciseId: 'push_ups', targetSets: 3, targetReps: '15', restSeconds: 45, tempo: '2-0-1' },
          { exerciseId: 'battle_ropes', targetSets: 4, targetReps: '30s', restSeconds: 45, tempo: 'Max effort' }
        ]
      },
      { dayNumber: 2, title: 'Cardio & Active Core', isRest: false, exercises: [
        { exerciseId: 'plank', targetSets: 4, targetReps: '60s', restSeconds: 45, tempo: 'Static' },
        { exerciseId: 'hanging_knee_raise', targetSets: 3, targetReps: '15', restSeconds: 45, tempo: '2-0-1' },
        { exerciseId: 'treadmill_incline', targetSets: 1, targetReps: '20 min', restSeconds: 0, tempo: 'Zone 2' }
      ] },
      { dayNumber: 3, title: 'Rest Day', isRest: true, exercises: [] },
      {
        dayNumber: 4,
        title: 'Lower Body Density Training',
        isRest: false,
        exercises: [
          { exerciseId: 'goblet_squat', targetSets: 4, targetReps: '15', restSeconds: 60, tempo: '2-0-1' },
          { exerciseId: 'romanian_deadlift', targetSets: 4, targetReps: '12', restSeconds: 60, tempo: '2-0-1' },
          { exerciseId: 'walking_lunges', targetSets: 3, targetReps: '15 per leg', restSeconds: 60, tempo: '2-0-1' },
          { exerciseId: 'battle_ropes', targetSets: 4, targetReps: '30s', restSeconds: 45, tempo: 'Max effort' }
        ]
      },
      { dayNumber: 5, title: 'Rest Day', isRest: true, exercises: [] },
      {
        dayNumber: 6,
        title: 'Full Body High Output Finisher',
        isRest: false,
        exercises: [
          { exerciseId: 'push_ups', targetSets: 4, targetReps: '12', restSeconds: 45, tempo: '2-0-1' },
          { exerciseId: 'cable_face_pull', targetSets: 3, targetReps: '15', restSeconds: 45, tempo: '2-0-1' },
          { exerciseId: 'plank', targetSets: 3, targetReps: '60s', restSeconds: 45, tempo: 'Static' }
        ]
      },
      { dayNumber: 7, title: 'Full Rest', isRest: true, exercises: [] }
    ]
  },
  {
    id: 'prog_home',
    title: 'Home Calisthenics & Minimalist',
    slug: 'home-calisthenics',
    difficulty: 'Beginner to Intermediate',
    durationWeeks: 4,
    location: 'Home',
    goal: 'Functional Strength & Mobility',
    coverImage: '/src/assets/images/program_home_1791537048176.jpg',
    description: 'Zero excuse bodyweight mastery requiring only a pull-up bar and your body. Build exceptional strength anywhere.',
    isPublished: true,
    daysPerWeek: 4,
    schedule: [
      {
        dayNumber: 1,
        title: 'Push & Core Mastery',
        isRest: false,
        exercises: [
          { exerciseId: 'push_ups', targetSets: 4, targetReps: '12-20', restSeconds: 60, tempo: '3-0-1' },
          { exerciseId: 'pike_push_ups', targetSets: 3, targetReps: '8-10', restSeconds: 75, tempo: '2-0-1' },
          { exerciseId: 'plank', targetSets: 4, targetReps: '60s', restSeconds: 45, tempo: 'Static' }
        ]
      },
      {
        dayNumber: 2,
        title: 'Pull & Grip Endurance',
        isRest: false,
        exercises: [
          { exerciseId: 'pull_ups', targetSets: 4, targetReps: '6-10', restSeconds: 90, tempo: '2-1-1' },
          { exerciseId: 'bodyweight_rows', targetSets: 3, targetReps: '12', restSeconds: 60, tempo: '2-1-1' },
          { exerciseId: 'hanging_knee_raise', targetSets: 3, targetReps: '12', restSeconds: 60, tempo: '2-0-1' }
        ]
      },
      { dayNumber: 3, title: 'Rest & Mobility Flow', isRest: true, exercises: [] },
      {
        dayNumber: 4,
        title: 'Lower Body Calisthenics',
        isRest: false,
        exercises: [
          { exerciseId: 'bodyweight_squats', targetSets: 4, targetReps: '20', restSeconds: 60, tempo: '2-1-1' },
          { exerciseId: 'walking_lunges', targetSets: 4, targetReps: '15 per leg', restSeconds: 60, tempo: '2-0-1' },
          { exerciseId: 'calf_raise', targetSets: 4, targetReps: '20', restSeconds: 45, tempo: '2-1-2' }
        ]
      },
      { dayNumber: 5, title: 'Rest Day', isRest: true, exercises: [] },
      {
        dayNumber: 6,
        title: 'Full Body Endurance Circuit',
        isRest: false,
        exercises: [
          { exerciseId: 'push_ups', targetSets: 3, targetReps: '15', restSeconds: 45, tempo: '2-0-1' },
          { exerciseId: 'pull_ups', targetSets: 3, targetReps: '8', restSeconds: 60, tempo: '2-0-1' },
          { exerciseId: 'bodyweight_squats', targetSets: 3, targetReps: '20', restSeconds: 45, tempo: '2-0-1' },
          { exerciseId: 'plank', targetSets: 3, targetReps: '60s', restSeconds: 45, tempo: 'Static' }
        ]
      },
      { dayNumber: 7, title: 'Rest Day', isRest: true, exercises: [] }
    ]
  }
];

// Initial seed exercises
const INITIAL_EXERCISES = [
  {
    id: 'barbell_bench_press',
    name: 'Barbell Bench Press',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Triceps', 'Anterior Deltoids'],
    equipment: 'Barbell & Flat Bench',
    difficulty: 'Intermediate',
    startingPosition: 'Lie flat on your back on the bench with eyes directly under the racked bar. Plant feet flat into the ground, pinch your shoulder blades together, and create a slight natural arch in your lower back.',
    instructions: [
      'Grip the knurling slightly wider than shoulder-width using a secure closed grip.',
      'Unrack the bar with straight arms and stabilize it directly over your upper chest.',
      'Inhale deeply and lower the bar in a controlled arc toward the lower chest/sternum, keeping elbows tucked at approximately 45-75 degrees.',
      'Lightly touch your chest without bouncing or losing upper-back tension.',
      'Exhale and press powerfully upward, driving feet into the floor until elbows reach lockout over the upper chest.'
    ],
    breathing: 'Inhale and brace your core during the descent; exhale forcefully past the sticking point on the press.',
    commonMistakes: [
      'Bouncing the barbell off the sternum to gain momentum',
      'Flaring elbows out at 90 degrees which strains rotator cuff tendons',
      'Lifting hips and glutes off the bench during heavy effort',
      'Loose wrists bending backward under load'
    ],
    safetyTips: 'Always use safety pins or spotter arms when training heavy. Never use a "thumbless/suicide" grip.',
    easierAlternative: 'Dumbbell Bench Press or Push-ups',
    harderAlternative: 'Pause Bench Press (2-second dead pause at chest)',
    thumbnail: '/src/assets/images/program_ppl_1791537008009.jpg',
    videoUrl: ''
  },
  {
    id: 'barbell_back_squat',
    name: 'Barbell Back Squat',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Core', 'Spinal Erectors'],
    equipment: 'Barbell & Squat Rack',
    difficulty: 'Intermediate',
    startingPosition: 'Step under the bar resting on the traps (high-bar) or rear delts (low-bar). Grip firmly, unrack with chest upright, take 2-3 precise steps back. Stance shoulder-width with toes flared out 15-30 degrees.',
    instructions: [
      'Take a deep belly breath and brace your abdominal wall as if preparing for impact.',
      'Break simultaneously at the hips and knees, sitting down and back between your thighs.',
      'Maintain an upright torso and track knees in line with your toes throughout descent.',
      'Descend until the hip crease falls below the top of the knee (parallel or below).',
      'Drive powerfully through mid-foot, pushing the floor away to return to full hip extension.'
    ],
    breathing: 'Inhale and brace 360-degrees into the belt before initiating; exhale at the top of the rep.',
    commonMistakes: [
      'Knees caving inward (valgus collapse) during the ascent',
      'Weight shifting forward onto toes, lifting heels off ground',
      'Rounding the lower back (butt wink) at the bottom',
      'Cutting depth short before reaching parallel'
    ],
    safetyTips: 'Set rack safety pins at hip level just below your lowest squat depth.',
    easierAlternative: 'Goblet Squat or Leg Press',
    harderAlternative: 'Pause Back Squat or Front Squat',
    thumbnail: '/src/assets/images/program_strength_1791537019097.jpg',
    videoUrl: ''
  },
  {
    id: 'barbell_deadlift',
    name: 'Conventional Barbell Deadlift',
    muscleGroup: 'Back',
    secondaryMuscles: ['Hamstrings', 'Glutes', 'Traps', 'Forearms', 'Core'],
    equipment: 'Barbell & Plates',
    difficulty: 'Advanced',
    startingPosition: 'Stand with feet hip-width apart, barbell cut across the middle of your shoelaces (1 inch from shins). Hinge at hips to grab the bar just outside your knees with double overhand or hook grip.',
    instructions: [
      'Bring shins forward to touch the bar without moving it from mid-foot.',
      'Pull your chest high to flatten the spine and pull the "slack" out of the barbell until you hear a metallic click.',
      'Squeeze armpits tight to engage lats, take a deep brace.',
      'Push the floor away with your legs, keeping the bar glued against your shins and thighs.',
      'Lock out with glutes squeezed tight and standing proud at the top; avoid hyperextending lower back.',
      'Return the bar under control by hinging hips back first until bar clears knees, then bending legs.'
    ],
    breathing: 'Huge diaphragmatic brace before lifting; exhale once locked out at the top.',
    commonMistakes: [
      'Rounding the lumbar spine under heavy load',
      'Jerking the bar off the floor without taking slack first',
      'Letting the bar drift away from the body during the pull',
      'Over-arching and hyperextending backward at lockout'
    ],
    safetyTips: 'Keep the bar as close to your centerline as possible. Use chalk or straps if grip limits you.',
    easierAlternative: 'Romanian Deadlift or Trap Bar Deadlift',
    harderAlternative: 'Deficit Deadlift or Paused Deadlift',
    thumbnail: '/src/assets/images/hero_workout_athlete_1791536995439.jpg',
    videoUrl: ''
  },
  {
    id: 'overhead_press',
    name: 'Standing Overhead Press (OHP)',
    muscleGroup: 'Shoulders',
    secondaryMuscles: ['Triceps', 'Upper Chest', 'Core', 'Glutes'],
    equipment: 'Barbell & Rack',
    difficulty: 'Intermediate',
    startingPosition: 'Grip the bar slightly wider than shoulder width with forearms perpendicular to ground. Rest the bar on front deltoids and clavicle with tight core and squeezed glutes.',
    instructions: [
      'Tilt head slightly back to clear bar path, then drive bar vertically upward in a straight line.',
      'As bar clears forehead, push head back through the "window" under the bar.',
      'Lock elbows out overhead with shoulders shrugged slightly upward to stabilize the scapula.',
      'Lower under control back to collarbone.'
    ],
    breathing: 'Inhale and brace at the bottom; exhale as bar passes the head to lockout.',
    commonMistakes: ['Excessive backward leaning resembling a standing incline bench', 'Flaring elbows excessively'],
    safetyTips: 'Do not use a false thumbless grip on standing overhead lifts.',
    easierAlternative: 'Seated Dumbbell Shoulder Press',
    harderAlternative: 'Push Press or Behind the Neck Press',
    thumbnail: '/src/assets/images/program_strength_1791537019097.jpg',
    videoUrl: ''
  },
  {
    id: 'lat_pulldown',
    name: 'Cable Lat Pulldown',
    muscleGroup: 'Back',
    secondaryMuscles: ['Biceps', 'Rear Deltoids', 'Forearms'],
    equipment: 'Cable Pulldown Machine',
    difficulty: 'Beginner',
    startingPosition: 'Adjust thigh pad tightly over quads. Grip the wide lat bar with overhand grip just outside shoulder width. Sit tall with chest lifted.',
    instructions: [
      'Depress scapula downward before bending elbows.',
      'Pull the bar down toward upper chest, driving elbows down and slightly backward.',
      'Squeeze lats firmly at the bottom for one second.',
      'Control the return slowly to full arm extension to stretch lats.'
    ],
    breathing: 'Exhale while pulling downward; inhale smoothly as the bar ascends.',
    commonMistakes: ['Swinging backward excessively using torso momentum', 'Pulling bar behind the neck'],
    safetyTips: 'Keep core engaged and avoid hyperextending lower spine.',
    easierAlternative: 'Resistance Band Pulldown',
    harderAlternative: 'Weighted Pull-ups',
    thumbnail: '/src/assets/images/hero_workout_athlete_1791536995439.jpg',
    videoUrl: ''
  },
  {
    id: 'romanian_deadlift',
    name: 'Romanian Deadlift (RDL)',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Hamstrings', 'Glutes', 'Lower Back'],
    equipment: 'Barbell or Dumbbells',
    difficulty: 'Intermediate',
    startingPosition: 'Stand tall holding barbell in front of thighs with overhand grip, feet hip-width apart and knees soft with a slight unlock.',
    instructions: [
      'Push hips directly backward as if trying to touch a wall behind you with glutes.',
      'Keep bar sliding down your thighs while keeping back completely flat and lats tight.',
      'Lower until you feel a deep stretch in hamstrings (usually mid-shin).',
      'Drive hips forward to return to standing, squeezing glutes at the top.'
    ],
    breathing: 'Inhale on the hinge down; exhale as you drive hips forward to standing.',
    commonMistakes: ['Bending knees too much turning it into a squat', 'Rounding lower back'],
    safetyTips: 'Do not exceed the active flexibility range of your hamstrings.',
    easierAlternative: 'Single Leg Dumbbell RDL or Hamstring Curl Machine',
    harderAlternative: 'Snatch-Grip RDL',
    thumbnail: '/src/assets/images/program_strength_1791537019097.jpg',
    videoUrl: ''
  },
  {
    id: 'pull_ups',
    name: 'Strict Bodyweight Pull-Ups',
    muscleGroup: 'Back',
    secondaryMuscles: ['Biceps', 'Rear Delts', 'Core', 'Grip'],
    equipment: 'Pull-up Bar',
    difficulty: 'Intermediate',
    startingPosition: 'Hang from overhead bar with palms facing away, hands slightly wider than shoulders, core braced with legs straight or crossed.',
    instructions: [
      'Initiate by pulling shoulder blades down and back.',
      'Drive elbows down toward your ribs to pull chest up toward the bar.',
      'Clear chin over the bar with control.',
      'Lower smoothly to full dead hang extension.'
    ],
    breathing: 'Exhale as you pull up; inhale as you descend.',
    commonMistakes: ['Kicking legs or kipping', 'Failing to reach full dead hang extension'],
    safetyTips: 'Maintain shoulder engagement; don’t disengage completely at the bottom.',
    easierAlternative: 'Inverted Row or Resistance Band Assisted Pull-up',
    harderAlternative: 'Weighted Pull-ups or Chest to Bar Pull-ups',
    thumbnail: '/src/assets/images/program_home_1791537048176.jpg',
    videoUrl: ''
  },
  {
    id: 'push_ups',
    name: 'Classic Strict Push-Ups',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Triceps', 'Anterior Delts', 'Core'],
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    startingPosition: 'Place hands slightly wider than shoulder width on the floor. Body forms a rigid straight line from heels to head with squeezed glutes and braced core.',
    instructions: [
      'Lower chest toward floor by bending elbows at a 45-degree angle.',
      'Descend until chest is 1-2 inches above the ground.',
      'Press through hands to return to top plank position, extending elbows fully.'
    ],
    breathing: 'Inhale going down; exhale pushing up.',
    commonMistakes: ['Sagging hips/lower back', 'Elbows flared out 90 degrees'],
    safetyTips: 'Keep neck neutral by looking at floor 1 foot in front of hands.',
    easierAlternative: 'Incline Push-ups (hands on bench/wall)',
    harderAlternative: 'Decline Push-ups or Deficit Push-ups',
    thumbnail: '/src/assets/images/program_home_1791537048176.jpg',
    videoUrl: ''
  },
  {
    id: 'goblet_squat',
    name: 'Goblet Squat',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Core', 'Upper Back', 'Glutes'],
    equipment: 'Dumbbell or Kettlebell',
    difficulty: 'Beginner',
    startingPosition: 'Hold a dumbbell vertically against your upper chest with both hands under the top bell. Feet shoulder-width apart.',
    instructions: [
      'Keep chest tall, push hips back and bend knees.',
      'Squat down between legs until elbows touch inside of knees.',
      'Keep heels glued to the floor and push up to top standing position.'
    ],
    breathing: 'Inhale descending; exhale driving up.',
    commonMistakes: ['Dumbbell drifting away from chest', 'Heels rising off floor'],
    safetyTips: 'Ideal for teaching proper squat mechanics before barbell loading.',
    easierAlternative: 'Bodyweight Box Squat',
    harderAlternative: 'Barbell Front Squat',
    thumbnail: '/src/assets/images/hero_workout_athlete_1791536995439.jpg',
    videoUrl: ''
  },
  {
    id: 'plank',
    name: 'Forearm Core Plank',
    muscleGroup: 'Core',
    secondaryMuscles: ['Shoulders', 'Glutes', 'Quadriceps'],
    equipment: 'Floor / Mat',
    difficulty: 'Beginner',
    startingPosition: 'Lie face down, propped on forearms with elbows directly under shoulders. Feet hip-width apart.',
    instructions: [
      'Lift body off floor into a rigid straight line.',
      'Squeeze glutes and draw navel inward toward spine.',
      'Hold position statically without letting hips sag or pike.'
    ],
    breathing: 'Slow, steady diaphragmatic breathing while maintaining tension.',
    commonMistakes: ['Sagging hips causing lumbar arch', 'Holding breath'],
    safetyTips: 'End the set if form breaks or lower back pinches.',
    easierAlternative: 'Knee Plank',
    harderAlternative: 'RKC Plank with active maximal contraction or Ab Wheel Rollout',
    thumbnail: '/src/assets/images/program_home_1791537048176.jpg',
    videoUrl: ''
  },
  {
    id: 'battle_ropes',
    name: 'Alternating Battle Ropes',
    muscleGroup: 'Cardio',
    secondaryMuscles: ['Shoulders', 'Arms', 'Core', 'Lats'],
    equipment: 'Battle Ropes',
    difficulty: 'Intermediate',
    startingPosition: 'Hold rope handles in each hand with neutral grip. Stand in athletic quarter squat with feet slightly wider than shoulders.',
    instructions: [
      'Alternate raising and slamming arms rapidly to create fluid waves down the ropes.',
      'Maintain stable braced core and athletic stance throughout the timed interval.'
    ],
    breathing: 'Maintain rhythmic continuous breathing with high cadence.',
    commonMistakes: ['Standing completely upright', 'Using only elbows instead of shoulders and core'],
    safetyTips: 'Keep slight bend in knees to absorb impact.',
    easierAlternative: 'Shadow Boxing or Jump Rope',
    harderAlternative: 'Double Wave Jump Slams',
    thumbnail: '/src/assets/images/program_fatloss_1791537031844.jpg',
    videoUrl: ''
  },
  {
    id: 'dumbbell_bench_press',
    name: 'Dumbbell Flat Bench Press',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Triceps', 'Anterior Deltoids'],
    equipment: 'Dumbbells & Flat Bench',
    difficulty: 'Beginner',
    startingPosition: 'Lie on flat bench holding dumbbells above chest with arms extended and palms facing forward.',
    instructions: [
      'Lower weights with control to sides of chest, keeping elbows at 60 degrees.',
      'Feel deep chest stretch at bottom.',
      'Press weights back up together over mid-chest without clanging bells.'
    ],
    breathing: 'Inhale descending; exhale pressing up.',
    commonMistakes: ['Bouncing weights or banging them together at top', 'Dropping elbows too low below bench'],
    safetyTips: 'Keep wrists stacked directly over elbows.',
    easierAlternative: 'Push-ups',
    harderAlternative: 'Incline Dumbbell Press',
    thumbnail: '/src/assets/images/program_ppl_1791537008009.jpg',
    videoUrl: ''
  },
  {
    id: 'dumbbell_shoulder_press',
    name: 'Seated Dumbbell Shoulder Press',
    muscleGroup: 'Shoulders',
    secondaryMuscles: ['Triceps', 'Upper Traps'],
    equipment: 'Dumbbells & Incline Bench (set upright)',
    difficulty: 'Beginner',
    startingPosition: 'Sit upright on bench with dumbbells at shoulder height, palms forward.',
    instructions: [
      'Press dumbbells upward in a slight arc until arms are extended overhead.',
      'Lower slowly back to ear/shoulder level.'
    ],
    breathing: 'Exhale pressing up; inhale lowering.',
    commonMistakes: ['Arching lower back off the pad', 'Lowering weights unevenly'],
    safetyTips: 'Keep back flat against the bench pad.',
    easierAlternative: 'Resistance Band Shoulder Press',
    harderAlternative: 'Standing Barbell Overhead Press',
    thumbnail: '/src/assets/images/program_strength_1791537019097.jpg',
    videoUrl: ''
  },
  {
    id: 'cable_face_pull',
    name: 'Cable Face Pull',
    muscleGroup: 'Shoulders',
    secondaryMuscles: ['Rear Deltoids', 'Rotator Cuff', 'Rhomboids'],
    equipment: 'Cable Machine & Rope Attachment',
    difficulty: 'Beginner',
    startingPosition: 'Set cable pulley to eye height with rope attachment. Grip rope with thumbs pointing toward you.',
    instructions: [
      'Step back for tension, pull center of rope directly toward bridge of nose.',
      'Externally rotate shoulders as you pull so hands end up beside ears with elbows high.',
      'Squeeze rear delts for 1 second, then control back to start.'
    ],
    breathing: 'Exhale pulling back; inhale returning forward.',
    commonMistakes: ['Leading with elbows dropped low', 'Using body momentum to jerk cable'],
    safetyTips: 'Focus on posture and shoulder health rather than heavy weight.',
    easierAlternative: 'Resistance Band Pull-Aparts',
    harderAlternative: 'High to Low Cable Face Pull with Pause',
    thumbnail: '/src/assets/images/hero_workout_athlete_1791536995439.jpg',
    videoUrl: ''
  },
  {
    id: 'walking_lunges',
    name: 'Walking Lunges',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Calves', 'Core'],
    equipment: 'Dumbbells or Bodyweight',
    difficulty: 'Beginner',
    startingPosition: 'Stand tall with feet together, holding dumbbells at sides or hands on hips.',
    instructions: [
      'Take a comfortable stride forward with right leg.',
      'Lower hips until right thigh is parallel to floor and left back knee hovers 1 inch above floor.',
      'Drive through right heel to step forward into next stride with left leg.'
    ],
    breathing: 'Inhale stepping down; exhale driving through step.',
    commonMistakes: ['Torso leaning excessively forward', 'Front knee caving inward'],
    safetyTips: 'Control the descent so back knee does not smash into the floor.',
    easierAlternative: 'Static Split Squat',
    harderAlternative: 'Barbell Walking Lunges or Bulgarian Split Squat',
    thumbnail: '/src/assets/images/hero_workout_athlete_1791536995439.jpg',
    videoUrl: ''
  }
];

// Helper to load or initialize DB
const DEFAULT_EXERCISE_VIDEOS: Record<string, string> = {
  barbell_bench_press: 'https://www.youtube.com/embed/rT7DgCr-3pg',
  barbell_back_squat: 'https://www.youtube.com/embed/gcNh17Ckjgg',
  barbell_deadlift: 'https://www.youtube.com/embed/op9kVnSso6Q',
  overhead_press: 'https://www.youtube.com/embed/2yjwXTZQDDI',
  lat_pulldown: 'https://www.youtube.com/embed/CAwf7n6Luuc',
  romanian_deadlift: 'https://www.youtube.com/embed/JCXUYuzwNrM',
  pull_ups: 'https://www.youtube.com/embed/eGo4IYlbE5g',
  push_ups: 'https://www.youtube.com/embed/IODxDxX7oi4',
  goblet_squat: 'https://www.youtube.com/embed/MeIiIdhvXT4',
  plank: 'https://www.youtube.com/embed/pSHjTRCQxIw',
  battle_ropes: 'https://www.youtube.com/embed/9G0z_8jH6o4',
  dumbbell_bench_press: 'https://www.youtube.com/embed/VmB1G1K7v94',
  dumbbell_shoulder_press: 'https://www.youtube.com/embed/qEwKCR5JCog',
  cable_face_pull: 'https://www.youtube.com/embed/rep-qVOkqgk',
  walking_lunges: 'https://www.youtube.com/embed/L8fvypPrzzs'
};

function loadDb() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      if (data && data.exercises) {
        data.exercises.forEach((ex: any) => {
          if (!ex.videoUrl && DEFAULT_EXERCISE_VIDEOS[ex.id]) {
            ex.videoUrl = DEFAULT_EXERCISE_VIDEOS[ex.id];
          }
        });
      }
      return data;
    } catch {
      // Fallback
    }
  }

  // Calculate 7-day trial dates for initial demo user
  const now = new Date();
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

  const defaultDb = {
    users: [
      {
        id: 'user_admin',
        email: 'admin@forgefitness.com',
        password: 'admin123',
        role: 'admin',
        status: 'active',
        firstName: 'Forge',
        lastName: 'Admin',
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        onboardingCompleted: true,
        onboardingData: {
          goal: 'Strength',
          experience: 'Advanced',
          location: 'Gym',
          daysPerWeek: 5,
          durationMinutes: 60,
          weightKg: 82,
          heightCm: 180
        },
        activeProgramId: 'prog_strength'
      },
      {
        id: 'user_demo',
        email: 'alex@forgefitness.com',
        password: 'user123',
        role: 'user',
        status: 'active',
        firstName: 'Alex',
        lastName: 'Rider',
        createdAt: fiveDaysAgo.toISOString(),
        onboardingCompleted: true,
        onboardingData: {
          goal: 'Muscle Gain',
          experience: 'Intermediate',
          location: 'Gym',
          daysPerWeek: 4,
          durationMinutes: 60,
          weightKg: 78.5,
          heightCm: 178
        },
        activeProgramId: 'prog_ppl'
      }
    ],
    subscriptions: [
      {
        userId: 'user_admin',
        status: 'paid_active',
        plan: 'monthly',
        price: 19.99,
        currency: 'USD',
        trialStartDate: null,
        trialEndDate: null,
        paidStartDate: new Date(Date.now() - 30 * 86400000).toISOString(),
        paidEndDate: new Date(Date.now() + 335 * 86400000).toISOString(),
        autoRenew: true,
        provider: 'system_admin'
      },
      {
        userId: 'user_demo',
        status: 'trial_active',
        plan: 'monthly',
        price: 19.99,
        currency: 'USD',
        trialStartDate: fiveDaysAgo.toISOString(),
        trialEndDate: new Date(fiveDaysAgo.getTime() + 7 * 86400000).toISOString(), // 2 days left
        paidStartDate: null,
        paidEndDate: null,
        autoRenew: false,
        provider: 'forge_trial'
      }
    ],
    programs: INITIAL_PROGRAMS,
    exercises: INITIAL_EXERCISES,
    workoutLogs: [
      {
        id: 'log_1',
        userId: 'user_demo',
        programId: 'prog_ppl',
        programName: 'Push Pull Legs (PPL)',
        dayTitle: 'Push 1: Chest, Front Delts, Triceps',
        date: new Date(Date.now() - 4 * 86400000).toISOString(),
        durationSeconds: 3120, // 52 minutes
        exercises: [
          {
            exerciseId: 'barbell_bench_press',
            exerciseName: 'Barbell Bench Press',
            sets: [
              { setNumber: 1, reps: 8, weightKg: 75, isCompleted: true },
              { setNumber: 2, reps: 8, weightKg: 80, isCompleted: true },
              { setNumber: 3, reps: 7, weightKg: 80, isCompleted: true },
              { setNumber: 4, reps: 6, weightKg: 82.5, isCompleted: true }
            ]
          },
          {
            exerciseId: 'overhead_press',
            exerciseName: 'Standing Overhead Press (OHP)',
            sets: [
              { setNumber: 1, reps: 8, weightKg: 45, isCompleted: true },
              { setNumber: 2, reps: 8, weightKg: 47.5, isCompleted: true },
              { setNumber: 3, reps: 7, weightKg: 47.5, isCompleted: true }
            ]
          }
        ],
        totalVolumeKg: 3372.5,
        totalSetsCompleted: 7,
        totalRepsCompleted: 52,
        difficultyRating: 8,
        notes: 'Great pump on bench press. Increased final set to 82.5kg.'
      },
      {
        id: 'log_2',
        userId: 'user_demo',
        programId: 'prog_ppl',
        programName: 'Push Pull Legs (PPL)',
        dayTitle: 'Pull 1: Back, Rear Delts, Biceps',
        date: new Date(Date.now() - 2 * 86400000).toISOString(),
        durationSeconds: 2880, // 48 minutes
        exercises: [
          {
            exerciseId: 'barbell_deadlift',
            exerciseName: 'Conventional Barbell Deadlift',
            sets: [
              { setNumber: 1, reps: 5, weightKg: 120, isCompleted: true },
              { setNumber: 2, reps: 5, weightKg: 130, isCompleted: true },
              { setNumber: 3, reps: 5, weightKg: 140, isCompleted: true }
            ]
          },
          {
            exerciseId: 'lat_pulldown',
            exerciseName: 'Cable Lat Pulldown',
            sets: [
              { setNumber: 1, reps: 12, weightKg: 60, isCompleted: true },
              { setNumber: 2, reps: 10, weightKg: 65, isCompleted: true },
              { setNumber: 3, reps: 10, weightKg: 65, isCompleted: true }
            ]
          }
        ],
        totalVolumeKg: 3915,
        totalSetsCompleted: 6,
        totalRepsCompleted: 47,
        difficultyRating: 8,
        notes: 'Felt very explosive on deadlifts. Locked out clean 140kg.'
      }
    ],
    bodyMetrics: [
      { id: 'w_1', userId: 'user_demo', date: new Date(Date.now() - 14 * 86400000).toISOString(), weightKg: 79.2, notes: 'Starting weight check' },
      { id: 'w_2', userId: 'user_demo', date: new Date(Date.now() - 7 * 86400000).toISOString(), weightKg: 78.8, notes: 'Morning fasting' },
      { id: 'w_3', userId: 'user_demo', date: new Date(Date.now() - 2 * 86400000).toISOString(), weightKg: 78.5, notes: 'Feeling leaner' }
    ],
    measurements: [
      { id: 'm_1', userId: 'user_demo', date: new Date(Date.now() - 14 * 86400000).toISOString(), chestCm: 102, waistCm: 84, armsCm: 37, thighsCm: 58 }
    ],
    payments: [
      {
        id: 'pay_init',
        userId: 'user_demo',
        userEmail: 'alex@forgefitness.com',
        amount: 0,
        currency: 'USD',
        status: 'succeeded',
        date: fiveDaysAgo.toISOString(),
        provider: 'forge_trial',
        planName: '7-Day Free Trial Activated',
        transactionRef: 'TRIAL_7D_INIT'
      }
    ],
    auditLogs: [
      {
        id: 'audit_1',
        adminId: 'user_admin',
        adminEmail: 'admin@forgefitness.com',
        action: 'SYSTEM_BOOTSTRAP',
        details: 'Initial system deployment and program catalog publication',
        timestamp: new Date(Date.now() - 30 * 86400000).toISOString()
      }
    ],
    config: {
      monthlyPrice: 19.99,
      currency: 'USD',
      trialDurationDays: 7,
      heroHeadline: 'Build Strength. Track Progress. Become Better.',
      heroSubheadline: 'Follow structured workout programs, master every exercise, and see your progress over time — all in one place.',
      announcement: 'Special Offer: Start with an unconditional 7-Day Free Trial. No charge today.',
      contactEmail: 'support@forgefitness.com',
      contactPhone: '+1 (800) 555-FORGE'
    }
  };

  saveDb(defaultDb);
  return defaultDb;
}

function saveDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB file:', err);
  }
}

// In-memory reference
let db = loadDb();

// Helper: Calculate verified subscription state
function getVerifiedSubscription(userId: string) {
  let sub = db.subscriptions.find((s: Subscription) => s.userId === userId);
  if (!sub) {
    // New user default
    sub = {
      userId,
      status: 'trial_eligible',
      plan: 'monthly',
      price: db.config.monthlyPrice,
      currency: db.config.currency,
      trialStartDate: null,
      trialEndDate: null,
      paidStartDate: null,
      paidEndDate: null,
      autoRenew: false,
      provider: 'none'
    };
    db.subscriptions.push(sub);
    saveDb(db);
  }

  const now = new Date();

  // If trial active, verify if expired
  if (sub.status === 'trial_active' && sub.trialEndDate) {
    const trialEnd = new Date(sub.trialEndDate);
    if (now > trialEnd) {
      sub.status = 'expired';
      saveDb(db);
    }
  }

  // If paid active, verify if subscription expired
  if (sub.status === 'paid_active' && sub.paidEndDate) {
    const paidEnd = new Date(sub.paidEndDate);
    if (now > paidEnd) {
      if (sub.autoRenew) {
        // Extend period simulated auto-renew
        sub.paidEndDate = new Date(now.getTime() + 30 * 86400000).toISOString();
        saveDb(db);
      } else {
        sub.status = 'expired';
        saveDb(db);
      }
    }
  }

  // Compute remaining trial time
  let remainingSeconds = 0;
  if (sub.status === 'trial_active' && sub.trialEndDate) {
    remainingSeconds = Math.max(0, Math.floor((new Date(sub.trialEndDate).getTime() - now.getTime()) / 1000));
  }

  return {
    ...sub,
    remainingSeconds,
    remainingDays: Math.ceil(remainingSeconds / 86400),
    isEntitled: sub.status === 'trial_active' || sub.status === 'paid_active'
  };
}

// Auth Helper
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Token is simply user id for this session
  const user = db.users.find((u: User) => u.id === token);
  if (!user) {
    return res.status(403).json({ error: 'Invalid or expired session' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'Account suspended. Contact support.' });
  }

  (req as any).user = user;
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as User;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin privilege required' });
  }
  next();
}

// ----------------- API ROUTES ----------------- //

// Public Config
app.get('/api/config', (req: Request, res: Response) => {
  res.json({
    config: db.config,
    pricing: {
      monthlyPrice: db.config.monthlyPrice,
      currency: db.config.currency,
      trialDurationDays: db.config.trialDurationDays
    }
  });
});

// Auth Routes
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, password, firstName } = req.body;
  if (!email || !password || !firstName) {
    return res.status(400).json({ error: 'First name, email, and password are required' });
  }

  const existing = db.users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const userId = 'user_' + Date.now();
  const newUser: User = {
    id: userId,
    email: email.trim().toLowerCase(),
    password: password.trim(),
    role: 'user',
    status: 'active',
    firstName: firstName.trim(),
    createdAt: new Date().toISOString(),
    onboardingCompleted: false,
    activeProgramId: 'prog_beginner'
  };

  db.users.push(newUser);

  // Automatically initiate 7-day trial for new registration
  const trialStart = new Date();
  const trialEnd = new Date(trialStart.getTime() + db.config.trialDurationDays * 86400000);

  const newSub: Subscription = {
    userId,
    status: 'trial_active',
    plan: 'monthly',
    price: db.config.monthlyPrice,
    currency: db.config.currency,
    trialStartDate: trialStart.toISOString(),
    trialEndDate: trialEnd.toISOString(),
    paidStartDate: null,
    paidEndDate: null,
    autoRenew: false,
    provider: 'forge_trial'
  };

  db.subscriptions.push(newSub);

  // Log trial activation payment event
  db.payments.push({
    id: 'pay_' + Date.now(),
    userId,
    userEmail: newUser.email,
    amount: 0,
    currency: db.config.currency,
    status: 'succeeded',
    date: trialStart.toISOString(),
    provider: 'forge_trial',
    planName: `${db.config.trialDurationDays}-Day Free Trial`,
    transactionRef: 'FREE_TRIAL_ACTIVATED'
  });

  saveDb(db);

  res.status(201).json({
    token: newUser.id,
    user: {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      firstName: newUser.firstName,
      onboardingCompleted: newUser.onboardingCompleted,
      activeProgramId: newUser.activeProgramId
    },
    subscription: getVerifiedSubscription(newUser.id)
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = db.users.find(
    (u: User) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password.trim()
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'This account has been suspended by an administrator.' });
  }

  res.json({
    token: user.id,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      onboardingCompleted: user.onboardingCompleted,
      onboardingData: user.onboardingData,
      activeProgramId: user.activeProgramId
    },
    subscription: getVerifiedSubscription(user.id)
  });
});

app.get('/api/auth/me', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  res.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      onboardingCompleted: user.onboardingCompleted,
      onboardingData: user.onboardingData,
      activeProgramId: user.activeProgramId
    },
    subscription: getVerifiedSubscription(user.id)
  });
});

app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  const user = db.users.find((u: User) => u.email.toLowerCase() === (email || '').trim().toLowerCase());
  if (user) {
    // In production send real token; here return confirmed response
    return res.json({ message: 'Password reset link sent to registered email' });
  }
  res.json({ message: 'If an account exists, a reset link has been dispatched.' });
});

// Onboarding Submission
app.post('/api/user/onboarding', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { goal, experience, location, daysPerWeek, durationMinutes, heightCm, weightKg, selectedProgramId } = req.body;

  user.onboardingCompleted = true;
  user.onboardingData = {
    goal: goal || 'Muscle Gain',
    experience: experience || 'Beginner',
    location: location || 'Gym',
    daysPerWeek: Number(daysPerWeek) || 4,
    durationMinutes: Number(durationMinutes) || 60,
    heightCm: heightCm ? Number(heightCm) : undefined,
    weightKg: weightKg ? Number(weightKg) : undefined
  };

  if (selectedProgramId) {
    user.activeProgramId = selectedProgramId;
  } else {
    // Recommend program based on user inputs
    if (location === 'Home') {
      user.activeProgramId = 'prog_home';
    } else if (goal === 'Fat Loss') {
      user.activeProgramId = 'prog_fatloss';
    } else if (goal === 'Strength') {
      user.activeProgramId = 'prog_strength';
    } else if (experience === 'Beginner') {
      user.activeProgramId = 'prog_beginner';
    } else {
      user.activeProgramId = 'prog_ppl';
    }
  }

  // If user entered weight, record starting body metric
  if (weightKg) {
    db.bodyMetrics.push({
      id: 'w_' + Date.now(),
      userId: user.id,
      date: new Date().toISOString(),
      weightKg: Number(weightKg),
      notes: 'Initial weight recorded during onboarding'
    });
  }

  saveDb(db);

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      onboardingCompleted: user.onboardingCompleted,
      onboardingData: user.onboardingData,
      activeProgramId: user.activeProgramId
    }
  });
});

// Program Selection
app.post('/api/user/select-program', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { programId } = req.body;

  const program = db.programs.find((p: any) => p.id === programId && p.isPublished);
  if (!program) {
    return res.status(404).json({ error: 'Program not found or unpublished' });
  }

  user.activeProgramId = programId;
  saveDb(db);

  res.json({ success: true, activeProgramId: programId });
});

// Profile Update
app.patch('/api/user/profile', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { firstName, lastName, password } = req.body;

  if (firstName) user.firstName = firstName.trim();
  if (lastName !== undefined) user.lastName = lastName.trim();
  if (password && password.trim().length >= 6) user.password = password.trim();

  saveDb(db);
  res.json({ success: true, user });
});

// Subscription Endpoints
app.get('/api/subscription', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  res.json(getVerifiedSubscription(user.id));
});

app.post('/api/subscription/upgrade', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { providerToken, provider = 'razorpay_test' } = req.body;

  // Genuine server-side subscription activation
  let sub = db.subscriptions.find((s: Subscription) => s.userId === user.id);
  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 86400000);

  if (!sub) {
    sub = {
      userId: user.id,
      status: 'paid_active',
      plan: 'monthly',
      price: db.config.monthlyPrice,
      currency: db.config.currency,
      trialStartDate: null,
      trialEndDate: null,
      paidStartDate: now.toISOString(),
      paidEndDate: nextMonth.toISOString(),
      autoRenew: true,
      provider
    };
    db.subscriptions.push(sub);
  } else {
    sub.status = 'paid_active';
    sub.paidStartDate = now.toISOString();
    sub.paidEndDate = nextMonth.toISOString();
    sub.autoRenew = true;
    sub.provider = provider;
  }

  const paymentRecord: PaymentRecord = {
    id: 'pay_' + Date.now(),
    userId: user.id,
    userEmail: user.email,
    amount: db.config.monthlyPrice,
    currency: db.config.currency,
    status: 'succeeded',
    date: now.toISOString(),
    provider,
    planName: 'Monthly Unlimited Membership',
    transactionRef: providerToken || 'TXN_' + Math.random().toString(36).substring(2, 9).toUpperCase()
  };

  db.payments.push(paymentRecord);
  saveDb(db);

  res.json({
    success: true,
    subscription: getVerifiedSubscription(user.id),
    receipt: paymentRecord
  });
});

app.post('/api/subscription/cancel', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const sub = db.subscriptions.find((s: Subscription) => s.userId === user.id);

  if (!sub) {
    return res.status(404).json({ error: 'Subscription not found' });
  }

  sub.autoRenew = false;
  sub.status = 'cancelled';
  saveDb(db);

  res.json({
    success: true,
    message: 'Subscription cancelled. Access remains until current period expires.',
    subscription: getVerifiedSubscription(user.id)
  });
});

// Workout Programs (Public & Authenticated)
app.get('/api/programs', (req: Request, res: Response) => {
  // Returns published programs for users, all for admin if requested
  const programs = db.programs.filter((p: any) => p.isPublished !== false);
  res.json(programs);
});

app.get('/api/programs/:id', (req: Request, res: Response) => {
  const program = db.programs.find((p: any) => p.id === req.params.id);
  if (!program) return res.status(404).json({ error: 'Program not found' });
  res.json(program);
});

// Exercise Library
app.get('/api/exercises', (req: Request, res: Response) => {
  const { muscle, search } = req.query;
  let list = db.exercises;

  if (muscle && muscle !== 'All') {
    list = list.filter((e: any) => e.muscleGroup.toLowerCase() === (muscle as string).toLowerCase());
  }

  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(
      (e: any) =>
        e.name.toLowerCase().includes(q) ||
        e.muscleGroup.toLowerCase().includes(q) ||
        (e.secondaryMuscles && e.secondaryMuscles.some((m: string) => m.toLowerCase().includes(q)))
    );
  }

  res.json(list);
});

app.get('/api/exercises/:id', (req: Request, res: Response) => {
  const exercise = db.exercises.find((e: any) => e.id === req.params.id);
  if (!exercise) return res.status(404).json({ error: 'Exercise not found' });
  res.json(exercise);
});

// Update Exercise Video (Supports URL, YouTube, or Uploaded Video Data)
app.put('/api/exercises/:id/video', (req: Request, res: Response) => {
  const { videoUrl, thumbnail } = req.body;
  const index = db.exercises.findIndex((e: any) => e.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Exercise not found' });

  if (videoUrl !== undefined) {
    db.exercises[index].videoUrl = videoUrl;
  }
  if (thumbnail !== undefined) {
    db.exercises[index].thumbnail = thumbnail;
  }

  saveDb(db);
  res.json({ success: true, exercise: db.exercises[index] });
});

// Workout Tracking & History
app.post('/api/workouts/log', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { programId, programName, dayTitle, durationSeconds, exercises, difficultyRating, notes } = req.body;

  if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
    return res.status(400).json({ error: 'Valid exercise logs are required' });
  }

  // Calculate total volume and reps
  let totalVolumeKg = 0;
  let totalSetsCompleted = 0;
  let totalRepsCompleted = 0;

  exercises.forEach((ex: any) => {
    ex.sets.forEach((s: any) => {
      if (s.isCompleted) {
        totalSetsCompleted += 1;
        totalRepsCompleted += Number(s.reps) || 0;
        totalVolumeKg += (Number(s.weightKg) || 0) * (Number(s.reps) || 0);
      }
    });
  });

  const newLog: WorkoutLog = {
    id: 'log_' + Date.now(),
    userId: user.id,
    programId: programId || user.activeProgramId,
    programName: programName || 'Custom Workout',
    dayTitle: dayTitle || 'Workout Session',
    date: new Date().toISOString(),
    durationSeconds: Number(durationSeconds) || 1800,
    exercises,
    totalVolumeKg,
    totalSetsCompleted,
    totalRepsCompleted,
    difficultyRating: Number(difficultyRating) || 7,
    notes
  };

  db.workoutLogs.push(newLog);
  saveDb(db);

  res.status(201).json({ success: true, workout: newLog });
});

app.get('/api/workouts/history', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const userLogs = db.workoutLogs
    .filter((l: WorkoutLog) => l.userId === user.id)
    .sort((a: WorkoutLog, b: WorkoutLog) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json(userLogs);
});

// Progress & Body Metrics
app.get('/api/progress', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user as User;

  const userLogs = db.workoutLogs
    .filter((l: WorkoutLog) => l.userId === user.id)
    .sort((a: WorkoutLog, b: WorkoutLog) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const weights = db.bodyMetrics
    .filter((w: BodyMetric) => w.userId === user.id)
    .sort((a: BodyMetric, b: BodyMetric) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const measurements = db.measurements
    .filter((m: Measurement) => m.userId === user.id)
    .sort((a: Measurement, b: Measurement) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate streaks
  let currentStreak = 0;
  if (userLogs.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastWorkoutDate = new Date(userLogs[userLogs.length - 1].date);
    lastWorkoutDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 2) {
      currentStreak = Math.min(userLogs.length, 7);
    }
  }

  // Personal Records
  const personalRecords: Record<string, { weightKg: number; reps: number; date: string; exerciseName: string }> = {};

  userLogs.forEach((log: WorkoutLog) => {
    log.exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (set.isCompleted && set.weightKg > 0) {
          const key = ex.exerciseId;
          if (!personalRecords[key] || set.weightKg > personalRecords[key].weightKg) {
            personalRecords[key] = {
              weightKg: set.weightKg,
              reps: set.reps,
              date: log.date,
              exerciseName: ex.exerciseName
            };
          }
        }
      });
    });
  });

  res.json({
    totalWorkouts: userLogs.length,
    currentStreak,
    totalVolumeAllTime: userLogs.reduce((acc: number, l: WorkoutLog) => acc + (l.totalVolumeKg || 0), 0),
    weights,
    measurements,
    workoutLogs: userLogs,
    personalRecords: Object.values(personalRecords)
  });
});

app.post('/api/progress/weight', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { weightKg, notes, date } = req.body;

  if (!weightKg || Number(weightKg) <= 0) {
    return res.status(400).json({ error: 'Valid weight is required' });
  }

  const metric: BodyMetric = {
    id: 'w_' + Date.now(),
    userId: user.id,
    date: date || new Date().toISOString(),
    weightKg: Number(weightKg),
    notes
  };

  db.bodyMetrics.push(metric);
  saveDb(db);

  res.status(201).json({ success: true, metric });
});

app.delete('/api/progress/weight/:id', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const index = db.bodyMetrics.findIndex((w: BodyMetric) => w.id === req.params.id && w.userId === user.id);
  if (index === -1) return res.status(404).json({ error: 'Entry not found' });

  db.bodyMetrics.splice(index, 1);
  saveDb(db);

  res.json({ success: true });
});

app.post('/api/progress/measurements', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { chestCm, waistCm, hipsCm, armsCm, thighsCm, notes } = req.body;

  const m: Measurement = {
    id: 'm_' + Date.now(),
    userId: user.id,
    date: new Date().toISOString(),
    chestCm: chestCm ? Number(chestCm) : undefined,
    waistCm: waistCm ? Number(waistCm) : undefined,
    hipsCm: hipsCm ? Number(hipsCm) : undefined,
    armsCm: armsCm ? Number(armsCm) : undefined,
    thighsCm: thighsCm ? Number(thighsCm) : undefined,
    notes
  };

  db.measurements.push(m);
  saveDb(db);

  res.status(201).json({ success: true, measurement: m });
});

// ----------------- ADMIN DASHBOARD (OWNER ONLY) ----------------- //

app.get('/api/admin/overview', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const totalUsers = db.users.filter((u: User) => u.role !== 'admin').length;
  const subscriptions = db.subscriptions;
  const activeSubs = subscriptions.filter((s: Subscription) => s.status === 'paid_active').length;
  const activeTrials = subscriptions.filter((s: Subscription) => {
    if (s.status !== 'trial_active' || !s.trialEndDate) return false;
    return new Date() < new Date(s.trialEndDate);
  }).length;
  const expiredTrials = subscriptions.filter((s: Subscription) => s.status === 'expired').length;
  const cancelledSubs = subscriptions.filter((s: Subscription) => s.status === 'cancelled').length;

  const mrr = activeSubs * (db.config.monthlyPrice || 19.99);

  res.json({
    totalUsers,
    activeSubscribers: activeSubs,
    activeFreeTrials: activeTrials,
    expiredTrials,
    cancelledSubscriptions: cancelledSubs,
    mrr: Math.round(mrr * 100) / 100,
    totalWorkoutsLogged: db.workoutLogs.length,
    recentUsers: db.users.slice(-5).reverse(),
    recentPayments: db.payments.slice(-5).reverse(),
    recentWorkouts: db.workoutLogs.slice(-5).reverse()
  });
});

app.get('/api/admin/users', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const { search, status } = req.query;
  let list = db.users.map((u: User) => {
    const sub = getVerifiedSubscription(u.id);
    return {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
      onboardingCompleted: u.onboardingCompleted,
      activeProgramId: u.activeProgramId,
      subscription: sub
    };
  });

  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(
      (u: any) =>
        u.email.toLowerCase().includes(q) ||
        (u.firstName && u.firstName.toLowerCase().includes(q))
    );
  }

  if (status && status !== 'all') {
    list = list.filter((u: any) => u.status === status || u.subscription.status === status);
  }

  res.json(list);
});

app.patch('/api/admin/users/:id/status', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const { status } = req.body;
  const user = db.users.find((u: User) => u.id === req.params.id);

  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.role === 'admin') return res.status(400).json({ error: 'Cannot modify administrator status' });

  user.status = status === 'suspended' ? 'suspended' : 'active';

  db.auditLogs.unshift({
    id: 'audit_' + Date.now(),
    adminId: admin.id,
    adminEmail: admin.email,
    action: 'USER_STATUS_CHANGE',
    details: `Updated user ${user.email} status to ${user.status}`,
    timestamp: new Date().toISOString()
  });

  saveDb(db);
  res.json({ success: true, user });
});

app.post('/api/admin/users/:id/grant-subscription', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const { days = 30, reason = 'VIP Grant' } = req.body;
  const user = db.users.find((u: User) => u.id === req.params.id);

  if (!user) return res.status(404).json({ error: 'User not found' });

  let sub = db.subscriptions.find((s: Subscription) => s.userId === user.id);
  const now = new Date();
  const future = new Date(now.getTime() + days * 86400000);

  if (!sub) {
    sub = {
      userId: user.id,
      status: 'paid_active',
      plan: 'monthly',
      price: 0,
      currency: db.config.currency,
      trialStartDate: null,
      trialEndDate: null,
      paidStartDate: now.toISOString(),
      paidEndDate: future.toISOString(),
      autoRenew: false,
      provider: 'complimentary_grant'
    };
    db.subscriptions.push(sub);
  } else {
    sub.status = 'paid_active';
    sub.paidStartDate = now.toISOString();
    sub.paidEndDate = future.toISOString();
    sub.provider = 'complimentary_grant';
  }

  db.auditLogs.unshift({
    id: 'audit_' + Date.now(),
    adminId: admin.id,
    adminEmail: admin.email,
    action: 'COMPLIMENTARY_GRANT',
    details: `Granted ${days} days complimentary membership to ${user.email}. Reason: ${reason}`,
    timestamp: new Date().toISOString()
  });

  saveDb(db);
  res.json({ success: true, subscription: getVerifiedSubscription(user.id) });
});

// Admin Program Management
app.put('/api/admin/programs/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const index = db.programs.findIndex((p: any) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Program not found' });

  db.programs[index] = { ...db.programs[index], ...req.body };

  db.auditLogs.unshift({
    id: 'audit_' + Date.now(),
    adminId: admin.id,
    adminEmail: admin.email,
    action: 'PROGRAM_UPDATE',
    details: `Updated program ${db.programs[index].title}`,
    timestamp: new Date().toISOString()
  });

  saveDb(db);
  res.json({ success: true, program: db.programs[index] });
});

app.post('/api/admin/programs', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const newProg = {
    ...req.body,
    id: 'prog_' + Date.now(),
    isPublished: true
  };

  db.programs.push(newProg);

  db.auditLogs.unshift({
    id: 'audit_' + Date.now(),
    adminId: admin.id,
    adminEmail: admin.email,
    action: 'PROGRAM_CREATE',
    details: `Created new program: ${newProg.title}`,
    timestamp: new Date().toISOString()
  });

  saveDb(db);
  res.status(201).json({ success: true, program: newProg });
});

// Admin Exercise Management
app.post('/api/admin/exercises', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const newEx = {
    ...req.body,
    id: 'ex_' + Date.now()
  };

  db.exercises.push(newEx);

  db.auditLogs.unshift({
    id: 'audit_' + Date.now(),
    adminId: admin.id,
    adminEmail: admin.email,
    action: 'EXERCISE_CREATE',
    details: `Created exercise: ${newEx.name}`,
    timestamp: new Date().toISOString()
  });

  saveDb(db);
  res.status(201).json({ success: true, exercise: newEx });
});

app.put('/api/admin/exercises/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const index = db.exercises.findIndex((e: any) => e.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Exercise not found' });

  db.exercises[index] = { ...db.exercises[index], ...req.body };

  db.auditLogs.unshift({
    id: 'audit_' + Date.now(),
    adminId: admin.id,
    adminEmail: admin.email,
    action: 'EXERCISE_UPDATE',
    details: `Updated exercise: ${db.exercises[index].name}`,
    timestamp: new Date().toISOString()
  });

  saveDb(db);
  res.json({ success: true, exercise: db.exercises[index] });
});

// Admin Settings & Pricing
app.get('/api/admin/settings', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  res.json(db.config);
});

app.put('/api/admin/settings', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  db.config = { ...db.config, ...req.body };

  db.auditLogs.unshift({
    id: 'audit_' + Date.now(),
    adminId: admin.id,
    adminEmail: admin.email,
    action: 'SETTINGS_UPDATE',
    details: `Updated pricing ($${db.config.monthlyPrice}) and site configuration`,
    timestamp: new Date().toISOString()
  });

  saveDb(db);
  res.json({ success: true, config: db.config });
});

// Admin Audit Logs & Payments
app.get('/api/admin/audit-logs', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  res.json(db.auditLogs);
});

app.get('/api/admin/payments', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  res.json(db.payments.slice().reverse());
});

// ----------------- START SERVER WITH VITE MIDDLEWARE ----------------- //
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Forge Fitness Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
