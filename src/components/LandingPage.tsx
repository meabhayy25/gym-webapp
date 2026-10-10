import React, { useState } from 'react';
import {
  Flame,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronDown,
  Sparkles,
  Dumbbell,
  LineChart,
  BookOpen,
  Timer
} from 'lucide-react';
import { WorkoutProgram, SystemConfig } from '../types';

interface LandingPageProps {
  programs: WorkoutProgram[];
  config?: SystemConfig;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onSelectProgramPreview: (program: WorkoutProgram) => void;
  onOpenPolicy: (type: 'privacy' | 'terms' | 'refund' | 'contact') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  programs,
  config,
  onOpenAuth,
  onSelectProgramPreview,
  onOpenPolicy
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const price = config?.monthlyPrice ?? 19.99;
  const currency = config?.currency ?? 'USD';
  const trialDays = config?.trialDurationDays ?? 7;

  const faqs = [
    {
      q: 'How does the 7-day free trial work?',
      a: `When you create your account, you get full access to all workout programs, exercise video guides, and logging tools for ${trialDays} days. No payment is charged upfront.`
    },
    {
      q: 'What happens after the seven days?',
      a: `Once your trial concludes, you can choose to activate the monthly membership for ${currency === 'USD' ? '$' : '₹'}${price}/month to continue tracking and following active plans. If you choose not to subscribe, your past history remains safe, but active workout logging pauses.`
    },
    {
      q: 'Can I cancel at any time?',
      a: 'Yes, with zero friction. You can cancel auto-renewal anytime directly from your profile settings with one click.'
    },
    {
      q: 'Is Forge Fitness suitable for complete beginners?',
      a: 'Absolutely. Our 4-Week Beginner Foundation program is engineered specifically for newcomers, featuring simple compound movements with full video technique breakdowns and safety tips.'
    },
    {
      q: 'How are workouts logged and tracked?',
      a: 'During each training session, you can log weight and repetitions set-by-step with an integrated rest timer. The app automatically calculates your training volume and records personal bests.'
    },
    {
      q: 'Can I do workouts at home without gym equipment?',
      a: 'Yes. We include a specialized Home Calisthenics program that uses only bodyweight movements and a pull-up bar.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white">
      {/* Announcement banner if set by admin */}
      {config?.announcement && (
        <div className="bg-[#15151D] border-b border-white/5 py-2.5 px-4 text-center">
          <p className="text-xs sm:text-sm font-medium text-white/90">
            <span className="text-[#FF6B35] font-bold mr-1.5">⚡ Update:</span>
            {config.announcement}
          </p>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Copy & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              {/* Unboxed editorial kicker - Zero Pill Rule */}
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#FF6B35]">
                <span>Premium Training Protocol</span>
                <span aria-hidden="true">·</span>
                <span>Version 2.4</span>
              </div>

              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05]">
                BUILD STRENGTH.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#FF6B35]">
                  TRACK PROGRESS.
                </span>{' '}
                BECOME BETTER.
              </h1>

              <p className="text-base sm:text-lg text-[#A1A1AA] max-w-xl leading-relaxed">
                Follow structured periodized workout programs, master technique with step-by-step exercise guides,
                and log every set with millisecond precision — all in one focused application.
              </p>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-6 py-4 bg-[#FF6B35] hover:bg-[#e05824] text-white font-bold rounded-xl shadow-lg shadow-[#FF6B35]/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 min-h-[48px]"
                >
                  <span>Start Your 7-Day Free Trial</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <a
                  href="#programs"
                  className="px-6 py-4 bg-[#15151D] hover:bg-[#1f1f2b] text-white font-semibold rounded-xl border border-white/10 transition-colors flex items-center justify-center min-h-[48px]"
                >
                  Explore Workouts
                </a>
              </div>

              {/* Unboxed claim-to-proof strip - Zero Pill Rule */}
              <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#A1A1AA]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6B35]" />
                  <span>5 Periodized Programs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6B35]" />
                  <span>Real-Time Set & Rest Logging</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6B35]" />
                  <span>No Upfront Credit Card Required</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Asset */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#15151D] aspect-[4/3] lg:aspect-[4/5] group">
                <img
                  src="/src/assets/images/hero_workout_athlete_1791536995439.jpg"
                  alt="Athlete lifting barbell in dark gym"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-transparent to-transparent opacity-80" />

                {/* Overlaid stat snippet */}
                <div className="absolute bottom-4 left-4 right-4 bg-[#15151D]/90 backdrop-blur-md p-4 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#A1A1AA]">Active Protocol</p>
                      <p className="text-sm font-bold text-white">Deadlift · 140 kg PR</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#A1A1AA]">Volume</p>
                      <p className="text-sm font-bold text-[#FF6B35]">3,915 kg Logged</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-20 md:py-28 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#FF6B35] mb-2">Designed for Mastery</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
              ENGINEERED FOR SERIOUS PROGRESS
            </h2>
            <p className="text-sm sm:text-base text-[#A1A1AA] mt-3">
              Everything you need to plan, execute, and analyze your physical development without unnecessary clutter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#15151D] p-6 rounded-2xl border border-white/5 hover:border-white/15 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#FF6B35]/10 border border-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35] mb-5">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Structured Programs</h3>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                4-week periodized plans built for hypertrophy, raw strength, fat loss, or calisthenics with daily workout schedules.
              </p>
            </div>

            <div className="bg-[#15151D] p-6 rounded-2xl border border-white/5 hover:border-white/15 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#FF6B35]/10 border border-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35] mb-5">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Step-by-Step Exercise Guides</h3>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Detailed breakdowns covering starting positions, breathing cues, common errors, and safer regression alternatives.
              </p>
            </div>

            <div className="bg-[#15151D] p-6 rounded-2xl border border-white/5 hover:border-white/15 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#FF6B35]/10 border border-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35] mb-5">
                <Timer className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Live Session Tracker</h3>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Log weights and reps set-by-set in real time with an automatic rest countdown timer that remembers previous metrics.
              </p>
            </div>

            <div className="bg-[#15151D] p-6 rounded-2xl border border-white/5 hover:border-white/15 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#FF6B35]/10 border border-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35] mb-5">
                <LineChart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Visual Progress Analytics</h3>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Clear weight curves, personal record badges, and training volume calculations driven strictly by your real log entries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workout Programs Showcase */}
      <section id="programs" className="py-20 md:py-28 border-b border-white/5 bg-[#0e0e13]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase text-[#FF6B35] mb-2">Curated Protocols</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
                EXPLORE WORKOUT PROGRAMS
              </h2>
            </div>
            <p className="text-sm text-[#A1A1AA] max-w-md">
              Choose from 5 distinct pathways engineered for specific training environments and athletic goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((prog) => (
              <div
                key={prog.id}
                className="bg-[#15151D] rounded-2xl border border-white/5 overflow-hidden flex flex-col group hover:border-white/20 transition-all"
              >
                {/* Cover Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#1c1c26]">
                  <img
                    src={prog.coverImage}
                    alt={prog.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#15151D] via-transparent to-transparent" />
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Unboxed metadata row */}
                    <div className="flex items-center gap-2 text-xs text-[#A1A1AA] mb-2">
                      <span className="text-[#FF6B35] font-semibold">{prog.difficulty}</span>
                      <span aria-hidden="true">·</span>
                      <span>{prog.durationWeeks} Weeks</span>
                      <span aria-hidden="true">·</span>
                      <span>{prog.location}</span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{prog.title}</h3>
                    <p className="text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed mb-4">
                      {prog.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs font-medium text-white/80">{prog.daysPerWeek} Days / Week</span>
                    <button
                      onClick={() => onSelectProgramPreview(prog)}
                      className="text-xs font-bold text-[#FF6B35] hover:text-white transition-colors flex items-center gap-1 min-h-[44px]"
                    >
                      View Details <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-28 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#FF6B35] mb-2">The Framework</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
              HOW FORGE FITNESS WORKS
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-3">
              <span className="font-display text-4xl font-bold text-[#FF6B35]">01.</span>
              <h3 className="text-lg font-bold text-white">Create an Account</h3>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Sign up in seconds and instantly start your unconditional 7-day free trial.
              </p>
            </div>

            <div className="space-y-3">
              <span className="font-display text-4xl font-bold text-[#FF6B35]">02.</span>
              <h3 className="text-lg font-bold text-white">Set Your Baseline</h3>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Complete a rapid onboarding questionnaire to match with your optimal program.
              </p>
            </div>

            <div className="space-y-3">
              <span className="font-display text-4xl font-bold text-[#FF6B35]">03.</span>
              <h3 className="text-lg font-bold text-white">Follow Your Program</h3>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Execute structured daily workouts with built-in rest timers and video guides.
              </p>
            </div>

            <div className="space-y-3">
              <span className="font-display text-4xl font-bold text-[#FF6B35]">04.</span>
              <h3 className="text-lg font-bold text-white">Log Sets & Progress</h3>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Watch your volume and body composition metrics compound week over week.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-28 border-b border-white/5 bg-[#0e0e13]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#FF6B35] mb-2">Transparent Pricing</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
              START FREE. UPGRADE WHEN READY.
            </h2>
            <p className="text-sm text-[#A1A1AA] mt-3">
              Experience all programs and features for 7 full days. Cancel anytime with no commitments.
            </p>
          </div>

          <div className="max-w-lg mx-auto bg-[#15151D] rounded-3xl border border-[#FF6B35]/30 p-8 shadow-2xl relative overflow-hidden">
            {/* Ambient accent glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF6B35]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-bold text-[#FF6B35] uppercase tracking-wider">All-Access Pass</span>
                <h3 className="text-2xl font-bold text-white mt-1">Unlimited Membership</h3>
              </div>
              <div className="text-right">
                <span className="text-3xl font-extrabold text-white">
                  {currency === 'USD' ? '$' : '₹'}{price}
                </span>
                <span className="text-xs text-[#A1A1AA] block">/ month</span>
              </div>
            </div>

            <div className="bg-[#1C1C26] rounded-xl p-4 mb-6 border border-white/5">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Sparkles className="w-4 h-4 text-[#FF6B35]" />
                <span>Includes {trialDays}-Day Free Trial</span>
              </div>
              <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
                Full access for {trialDays} days. If you love it, continue for {currency === 'USD' ? '$' : '₹'}{price}/mo.
                Cancel anytime directly from your profile settings.
              </p>
            </div>

            <ul className="space-y-3 mb-8 text-sm text-white/90">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#FF6B35] shrink-0" />
                <span>All 5 complete 4-week workout programs</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#FF6B35] shrink-0" />
                <span>Interactive live session set & rest logging</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#FF6B35] shrink-0" />
                <span>Comprehensive exercise technique library</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#FF6B35] shrink-0" />
                <span>Bodyweight & measurement progression charts</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#FF6B35] shrink-0" />
                <span>Data export to CSV / JSON format</span>
              </li>
            </ul>

            <button
              onClick={() => onOpenAuth('register')}
              className="w-full py-4 bg-[#FF6B35] hover:bg-[#e05824] text-white font-bold rounded-xl shadow-lg shadow-[#FF6B35]/25 transition-all active:scale-[0.98] min-h-[48px] flex items-center justify-center gap-2"
            >
              <span>Start Your 7-Day Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-[11px] text-[#A1A1AA] mt-4">
              No charge today · Auto-renewal can be disabled at any time
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 md:py-28 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#FF6B35] mb-2">Got Questions?</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
              FREQUENTLY ASKED QUESTIONS
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#15151D] rounded-xl border border-white/5 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold text-white min-h-[44px]"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#A1A1AA] transition-transform ${openFaq === idx ? 'rotate-180 text-[#FF6B35]' : ''}`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 text-xs sm:text-sm text-[#A1A1AA] leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#0B0B0F] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FF6B35] flex items-center justify-center text-white">
                <Flame className="w-4 h-4 fill-white" />
              </div>
              <span className="font-display text-lg font-bold tracking-wider text-white">
                FORGE <span className="text-[#FF6B35]">FITNESS</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#A1A1AA]">
              <button onClick={() => onOpenPolicy('terms')} className="hover:text-white transition-colors">
                Terms of Service
              </button>
              <button onClick={() => onOpenPolicy('privacy')} className="hover:text-white transition-colors">
                Privacy Policy
              </button>
              <button onClick={() => onOpenPolicy('refund')} className="hover:text-white transition-colors">
                Refund Policy
              </button>
              <button onClick={() => onOpenPolicy('contact')} className="hover:text-white transition-colors">
                Contact & Support
              </button>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#A1A1AA]/70 gap-4">
            <p>© {new Date().getFullYear()} Forge Fitness Inc. All rights reserved.</p>
            <p className="text-center sm:text-right">
              Support: {config?.contactEmail || 'support@forgefitness.com'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
