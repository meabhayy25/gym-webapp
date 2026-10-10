import React, { useState } from 'react';
import { Target, Dumbbell, MapPin, Calendar, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [goal, setGoal] = useState('Muscle Gain');
  const [experience, setExperience] = useState('Intermediate');
  const [location, setLocation] = useState('Gym');
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [heightCm, setHeightCm] = useState<string>('178');
  const [weightKg, setWeightKg] = useState<string>('75');

  const goals = [
    { id: 'Muscle Gain', label: 'Muscle Gain', desc: 'Build lean mass and physical structure' },
    { id: 'Fat Loss', label: 'Fat Loss', desc: 'Burn fat and condition cardiovascular health' },
    { id: 'Strength', label: 'Raw Strength', desc: 'Maximize compound squat, bench, and deadlift' },
    { id: 'General Fitness', label: 'General Fitness', desc: 'Move better, build consistency, and feel energized' }
  ];

  const experiences = [
    { id: 'Beginner', label: 'Beginner', desc: '< 1 year training experience, learning basic movements' },
    { id: 'Intermediate', label: 'Intermediate', desc: '1–3 years consistent training with barbell experience' },
    { id: 'Advanced', label: 'Advanced', desc: '3+ years training, comfortable with heavy progressive overload' }
  ];

  const locations = [
    { id: 'Gym', label: 'Commercial Gym', desc: 'Full access to barbells, cables, dumbbells, and racks' },
    { id: 'Home', label: 'Home / Calisthenics', desc: 'Pull-up bar, bodyweight, and minimal equipment' }
  ];

  const handleFinish = async () => {
    setLoading(true);
    try {
      const res = await api.saveOnboarding({
        goal,
        experience,
        location,
        daysPerWeek,
        durationMinutes,
        heightCm: heightCm ? Number(heightCm) : undefined,
        weightKg: weightKg ? Number(weightKg) : undefined
      });
      updateUser(res.user);
      onComplete();
    } catch (err: any) {
      alert(err.message || 'Error saving onboarding profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#15151D] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl">
        {/* Progress Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
          <div>
            <span className="text-xs font-bold text-[#FF6B35] uppercase tracking-wider">
              Step {step} of 4
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white mt-1">
              {step === 1 && 'What is your primary fitness goal?'}
              {step === 2 && 'What is your experience level?'}
              {step === 3 && 'Where do you prefer to train?'}
              {step === 4 && 'Your routine and baseline metrics'}
            </h2>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-6 h-1.5 rounded-full ${i <= step ? 'bg-[#FF6B35]' : 'bg-white/10'}`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Goal */}
        {step === 1 && (
          <div className="space-y-3">
            {goals.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGoal(g.id)}
                className={`w-full p-4 rounded-xl border text-left transition-all min-h-[52px] flex items-center justify-between ${
                  goal === g.id
                    ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-white'
                    : 'border-white/10 bg-[#1C1C26] text-[#A1A1AA] hover:border-white/20'
                }`}
              >
                <div>
                  <p className="font-bold text-sm text-white">{g.label}</p>
                  <p className="text-xs text-[#A1A1AA] mt-0.5">{g.desc}</p>
                </div>
                {goal === g.id && <CheckCircle2 className="w-5 h-5 text-[#FF6B35]" />}
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Experience */}
        {step === 2 && (
          <div className="space-y-3">
            {experiences.map((exp) => (
              <button
                key={exp.id}
                type="button"
                onClick={() => setExperience(exp.id)}
                className={`w-full p-4 rounded-xl border text-left transition-all min-h-[52px] flex items-center justify-between ${
                  experience === exp.id
                    ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-white'
                    : 'border-white/10 bg-[#1C1C26] text-[#A1A1AA] hover:border-white/20'
                }`}
              >
                <div>
                  <p className="font-bold text-sm text-white">{exp.label}</p>
                  <p className="text-xs text-[#A1A1AA] mt-0.5">{exp.desc}</p>
                </div>
                {experience === exp.id && <CheckCircle2 className="w-5 h-5 text-[#FF6B35]" />}
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <div className="space-y-3">
            {locations.map((loc) => (
              <button
                key={loc.id}
                type="button"
                onClick={() => setLocation(loc.id)}
                className={`w-full p-4 rounded-xl border text-left transition-all min-h-[52px] flex items-center justify-between ${
                  location === loc.id
                    ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-white'
                    : 'border-white/10 bg-[#1C1C26] text-[#A1A1AA] hover:border-white/20'
                }`}
              >
                <div>
                  <p className="font-bold text-sm text-white">{loc.label}</p>
                  <p className="text-xs text-[#A1A1AA] mt-0.5">{loc.desc}</p>
                </div>
                {location === loc.id && <CheckCircle2 className="w-5 h-5 text-[#FF6B35]" />}
              </button>
            ))}
          </div>
        )}

        {/* Step 4: Schedule & Baseline */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-2">
                Available training days per week: {daysPerWeek} days
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[2, 3, 4, 5, 6].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDaysPerWeek(d)}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all min-h-[44px] ${
                      daysPerWeek === d
                        ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                        : 'bg-[#1C1C26] text-[#A1A1AA] border-white/10 hover:border-white/20'
                    }`}
                  >
                    {d} Days
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-2">
                Workout session duration: {durationMinutes} mins
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[30, 45, 60, 90].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setDurationMinutes(dur)}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all min-h-[44px] ${
                      durationMinutes === dur
                        ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                        : 'bg-[#1C1C26] text-[#A1A1AA] border-white/10 hover:border-white/20'
                    }`}
                  >
                    {dur}m
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                  Starting Weight (kg) <span className="text-[10px] text-[#A1A1AA]/60">(Optional)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="e.g. 75"
                  className="w-full bg-[#1C1C26] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF6B35]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                  Height (cm) <span className="text-[10px] text-[#A1A1AA]/60">(Optional)</span>
                </label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="e.g. 178"
                  className="w-full bg-[#1C1C26] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF6B35]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors min-h-[44px]"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 bg-[#FF6B35] hover:bg-[#e05824] text-white font-bold rounded-xl shadow-md shadow-[#FF6B35]/20 transition-all flex items-center gap-2 min-h-[44px]"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={loading}
              className="px-6 py-2.5 bg-[#FF6B35] hover:bg-[#e05824] text-white font-bold rounded-xl shadow-md shadow-[#FF6B35]/20 transition-all flex items-center gap-2 disabled:opacity-50 min-h-[44px]"
            >
              <span>{loading ? 'Finalizing...' : 'Save & Launch Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
