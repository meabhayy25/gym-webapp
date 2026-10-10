import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register' | 'forgot';
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onSuccess
}) => {
  const { login, register, quickLoginAsDemo, quickLoginAsAdmin } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync mode if initialMode changes
  React.useEffect(() => {
    setMode(initialMode);
    setError(null);
    setInfoMessage(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        onSuccess();
        onClose();
      } else if (mode === 'register') {
        if (!firstName.trim()) {
          throw new Error('Please enter your first name');
        }
        await register(email, password, firstName);
        onSuccess();
        onClose();
      } else if (mode === 'forgot') {
        const res = await api.forgotPassword(email);
        setInfoMessage(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'user' | 'admin') => {
    setError(null);
    setLoading(true);
    try {
      if (role === 'user') {
        await quickLoginAsDemo();
      } else {
        await quickLoginAsAdmin();
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#15151D] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#A1A1AA] hover:text-white rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <h2 className="font-display text-2xl font-bold tracking-tight text-white">
            {mode === 'login' && 'WELCOME BACK'}
            {mode === 'register' && 'START 7-DAY FREE TRIAL'}
            {mode === 'forgot' && 'RESET PASSWORD'}
          </h2>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1">
            {mode === 'login' && 'Log in to continue tracking your workouts'}
            {mode === 'register' && 'Instant access to all programs and logging tools'}
            {mode === 'forgot' && 'Enter your email to receive a password reset link'}
          </p>
        </div>

        {/* Error / Info Banner */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2.5 text-emerald-300 text-xs">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">First Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full bg-[#1C1C26] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#A1A1AA]/50 focus:outline-none focus:border-[#FF6B35]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-[#1C1C26] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#A1A1AA]/50 focus:outline-none focus:border-[#FF6B35]"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-white/80">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-[#FF6B35] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1C1C26] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#A1A1AA]/50 focus:outline-none focus:border-[#FF6B35]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#FF6B35] hover:bg-[#e05824] text-white font-bold rounded-xl shadow-lg shadow-[#FF6B35]/20 transition-all active:scale-[0.98] disabled:opacity-50 min-h-[48px]"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Activate 7-Day Trial' : 'Send Reset Link'}
          </button>
        </form>

        {/* Quick Demo Switchers for Rapid Testing */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="text-center mb-3">
            <span className="text-xs text-[#A1A1AA] font-medium">Quick 1-Click Testing Access:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('user')}
              disabled={loading}
              className="px-3 py-2 bg-[#1C1C26] hover:bg-[#252533] border border-white/10 rounded-xl text-xs font-medium text-white transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              <UserIcon className="w-3.5 h-3.5 text-[#FF6B35]" />
              <span>Demo User (Alex)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              disabled={loading}
              className="px-3 py-2 bg-[#1C1C26] hover:bg-[#252533] border border-white/10 rounded-xl text-xs font-medium text-white transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin (Owner)</span>
            </button>
          </div>
        </div>

        {/* Mode Toggle Footer */}
        <div className="mt-6 text-center text-xs text-[#A1A1AA]">
          {mode === 'login' && (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-[#FF6B35] font-semibold hover:underline"
              >
                Start 7-Day Trial
              </button>
            </p>
          )}
          {mode === 'register' && (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[#FF6B35] font-semibold hover:underline"
              >
                Log In
              </button>
            </p>
          )}
          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-[#FF6B35] font-semibold hover:underline"
            >
              Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
