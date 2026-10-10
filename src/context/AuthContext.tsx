import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Subscription } from '../types';
import { api, getSessionToken, setSessionToken, clearSessionToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  subscription: Subscription | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
  updateSubscription: (updatedSub: Subscription) => void;
  quickLoginAsDemo: () => Promise<void>;
  quickLoginAsAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSession = async () => {
    const token = getSessionToken();
    if (!token) {
      setUser(null);
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      setUser(res.user);
      setSubscription(res.subscription);
    } catch {
      clearSessionToken();
      setUser(null);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setSessionToken(res.token);
    setUser(res.user);
    setSubscription(res.subscription);
  };

  const register = async (email: string, password: string, firstName: string) => {
    const res = await api.register({ email, password, firstName });
    setSessionToken(res.token);
    setUser(res.user);
    setSubscription(res.subscription);
  };

  const logout = () => {
    clearSessionToken();
    setUser(null);
    setSubscription(null);
  };

  const refreshUserData = async () => {
    try {
      const res = await api.getMe();
      setUser(res.user);
      setSubscription(res.subscription);
    } catch {
      // Ignore
    }
  };

  const updateUser = (updated: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updated });
    }
  };

  const updateSubscription = (updatedSub: Subscription) => {
    setSubscription(updatedSub);
  };

  // Quick helper for reviewer testing
  const quickLoginAsDemo = async () => {
    await login('alex@forgefitness.com', 'user123');
  };

  const quickLoginAsAdmin = async () => {
    await login('admin@forgefitness.com', 'admin123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        subscription,
        loading,
        login,
        register,
        logout,
        refreshUserData,
        updateUser,
        updateSubscription,
        quickLoginAsDemo,
        quickLoginAsAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
