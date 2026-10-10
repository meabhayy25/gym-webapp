import {
  User,
  Subscription,
  WorkoutProgram,
  Exercise,
  WorkoutLog,
  ProgressData,
  SystemConfig,
  AdminOverview,
  AuditLog
} from '../types';

const TOKEN_KEY = 'forge_session_token';

export const getSessionToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setSessionToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearSessionToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getSessionToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Public
  getConfig: () => request<{ config: SystemConfig; pricing: any }>('/api/config'),

  // Auth
  register: (data: { email: string; password: string; firstName: string }) =>
    request<{ token: string; user: User; subscription: Subscription }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  login: (data: { email: string; password: string }) =>
    request<{ token: string; user: User; subscription: Subscription }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getMe: () => request<{ user: User; subscription: Subscription }>('/api/auth/me'),

  forgotPassword: (email: string) =>
    request<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  // User Onboarding & Program selection
  saveOnboarding: (data: any) =>
    request<{ success: boolean; user: User }>('/api/user/onboarding', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  selectProgram: (programId: string) =>
    request<{ success: boolean; activeProgramId: string }>('/api/user/select-program', {
      method: 'POST',
      body: JSON.stringify({ programId })
    }),

  updateProfile: (data: { firstName?: string; lastName?: string; password?: string }) =>
    request<{ success: boolean; user: User }>('/api/user/profile', {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  // Subscription
  getSubscription: () => request<Subscription>('/api/subscription'),

  upgradeSubscription: (data: { providerToken?: string; provider?: string }) =>
    request<{ success: boolean; subscription: Subscription; receipt: any }>('/api/subscription/upgrade', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  cancelSubscription: () =>
    request<{ success: boolean; message: string; subscription: Subscription }>('/api/subscription/cancel', {
      method: 'POST'
    }),

  // Programs & Exercises
  getPrograms: () => request<WorkoutProgram[]>('/api/programs'),
  getProgram: (id: string) => request<WorkoutProgram>(`/api/programs/${id}`),

  getExercises: (params?: { muscle?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.muscle && params.muscle !== 'All') query.set('muscle', params.muscle);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    return request<Exercise[]>(`/api/exercises${qs ? `?${qs}` : ''}`);
  },

  getExercise: (id: string) => request<Exercise>(`/api/exercises/${id}`),

  updateExerciseVideo: (id: string, videoUrl: string, thumbnail?: string) =>
    request<{ success: boolean; exercise: Exercise }>(`/api/exercises/${id}/video`, {
      method: 'PUT',
      body: JSON.stringify({ videoUrl, thumbnail })
    }),

  // Workouts
  logWorkout: (data: any) =>
    request<{ success: boolean; workout: WorkoutLog }>('/api/workouts/log', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getWorkoutHistory: () => request<WorkoutLog[]>('/api/workouts/history'),

  // Progress
  getProgress: () => request<ProgressData>('/api/progress'),

  logWeight: (data: { weightKg: number; notes?: string; date?: string }) =>
    request<{ success: boolean; metric: any }>('/api/progress/weight', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  deleteWeight: (id: string) =>
    request<{ success: boolean }>(`/api/progress/weight/${id}`, {
      method: 'DELETE'
    }),

  logMeasurements: (data: any) =>
    request<{ success: boolean; measurement: any }>('/api/progress/measurements', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Admin
  getAdminOverview: () => request<AdminOverview>('/api/admin/overview'),
  getAdminUsers: (params?: { search?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();
    return request<any[]>(`/api/admin/users${qs ? `?${qs}` : ''}`);
  },

  updateUserStatus: (userId: string, status: 'active' | 'suspended') =>
    request<{ success: boolean; user: User }>(`/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  grantSubscription: (userId: string, data: { days: number; reason: string }) =>
    request<{ success: boolean; subscription: Subscription }>(`/api/admin/users/${userId}/grant-subscription`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateProgram: (id: string, data: any) =>
    request<{ success: boolean; program: WorkoutProgram }>(`/api/admin/programs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  createProgram: (data: any) =>
    request<{ success: boolean; program: WorkoutProgram }>('/api/admin/programs', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  createExercise: (data: any) =>
    request<{ success: boolean; exercise: Exercise }>('/api/admin/exercises', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateExercise: (id: string, data: any) =>
    request<{ success: boolean; exercise: Exercise }>(`/api/admin/exercises/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  getAdminSettings: () => request<SystemConfig>('/api/admin/settings'),
  updateAdminSettings: (data: any) =>
    request<{ success: boolean; config: SystemConfig }>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  getAuditLogs: () => request<AuditLog[]>('/api/admin/audit-logs'),
  getPayments: () => request<any[]>('/api/admin/payments')
};
