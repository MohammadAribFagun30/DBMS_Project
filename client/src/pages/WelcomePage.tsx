import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  Compass,
  Trophy,
  Award,
  ArrowRight,
  Sparkles,
  Bell,
  Building2,
  FileCheck
} from 'lucide-react';

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-slate-50 dark:bg-[#08090e] text-slate-900 dark:text-slate-100 transition-colors duration-200 scroll-smooth">
      {/* SECTION 1: OVERVIEW & HERO */}
      <section
        id="overview"
        className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-16 overflow-hidden"
      >
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-indigo-500/15 dark:bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[500px] h-[300px] bg-purple-500/10 dark:bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Grid Pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-4xl mx-auto text-center space-y-8 my-auto">
          {/* University Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-[#141524] border border-indigo-200/80 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>{t('International Islamic University Chittagong · Campus Portal')}</span>
          </div>

          {/* Welcome Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              {t('Welcome to')} <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-300 dark:to-indigo-200 bg-clip-text text-transparent">
                ClubVerse
              </span>
            </h1>

            {/* Short Description */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {t('Explore our vibrant student clubs, technical workshops, campus events, and verified digital certificates — all in one centralized university platform.')}
            </p>
          </div>

          {/* Primary CTA: Get Started Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={handleGetStarted}
              className="group w-full sm:w-auto flex items-center justify-center gap-3 px-9 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 dark:shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>{t('Get Started')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Quick Metrics Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-8 max-w-3xl mx-auto">
            <div className="p-3.5 rounded-xl bg-white/60 dark:bg-[#11121c]/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm text-center">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white block">40+</span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{t('Campus Events')}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/60 dark:bg-[#11121c]/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm text-center">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white block">12+</span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{t('Student Clubs')}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/60 dark:bg-[#11121c]/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm text-center">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white block">1,200+</span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{t('Issued Passes')}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/60 dark:bg-[#11121c]/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm text-center">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white block">100%</span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{t('Verified QR Certs')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: FEATURES */}
      <section
        id="features"
        className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-100/50 dark:bg-[#0b0c14]/50"
      >
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400">
              Platform Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Everything You Need for Campus Life
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Purpose-built tools for IIUC students, faculty advisors, and departmental club executives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#11121c] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Events & Workshops</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Discover hands-on coding bootcamps, robotics competitions, and academic seminars. Claim instant digital passes with your IIUC ID.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#11121c] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Clubs & Annual Rankings</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Explore campus clubs across departments. Rankings are dynamically generated using the IIUC 3-factor normalization model (Events, Sponsors, Feedback).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#11121c] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Verified Digital Passports</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Receive verifiable digital certificates upon event completion. Anyone can verify certificate validity instantly with the verification portal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section
        id="how-it-works"
        className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-[#08090e]"
      >
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400">
              Simple Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              How It Works for Students
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Getting involved in campus extracurriculars is fast, transparent, and rewarding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#11121c] border border-slate-200 dark:border-slate-800 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Explore & Select Events</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Browse all verified university events and technical workshops organized by IIUC clubs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#11121c] border border-slate-200 dark:border-slate-800 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">One-Click Entry Pass</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Login with your Student ID and register instantly. Your digital QR pass is generated immediately.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#11121c] border border-slate-200 dark:border-slate-800 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Attend & Get Certified</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Check in at the venue desk and download your verifiable certificate to your portfolio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: NOTICE BOARD */}
      <section
        id="notice-board"
        className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-100/40 dark:bg-[#0b0c14]/40"
      >
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400">
                Official Updates
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Campus Notice Board
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">Updated today · Central Directorate</span>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-white dark:bg-[#11121c] border border-slate-200 dark:border-slate-800 flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Spring 2026 Central Club Registration & Executive Induction
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 text-[10px] font-bold">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  All department student clubs are required to submit their semester activity schedules and budget proposals via the executive portal.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#11121c] border border-slate-200 dark:border-slate-800 flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    IIUC Annual 3-Factor Normalization Algorithm Rules Published
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 text-[10px] font-bold">
                    Policy
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Annual club standings will factor: 35% Event Execution, 35% Sponsorship Raised, and 30% Student Feedback Scores.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#11121c] border border-slate-200 dark:border-slate-800 flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <FileCheck className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Digital Certificate QR Authentication System Live
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 text-[10px] font-bold">
                    Feature
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Students can now share public verification links for their event certificates directly on LinkedIn or academic resumes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: ABOUT IIUC PORTAL */}
      <section
        id="about-iiuc"
        className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-[#08090e]"
      >
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            About IIUC ClubVerse
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            International Islamic University Chittagong (IIUC) is committed to holistic student development. ClubVerse serves as the official digital infrastructure connecting students with clubs, seminars, corporate sponsors, and verified credentials across Kumira Campus.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <button
              onClick={handleGetStarted}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Get Started Now
            </button>
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-xl bg-white dark:bg-[#141524] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="relative z-10 border-t border-slate-200/80 dark:border-slate-800/80 py-8 text-center text-xs text-slate-400 dark:text-slate-500">
        © {new Date().getFullYear()} ClubVerse · International Islamic University Chittagong. All rights reserved.
      </footer>
    </div>
  );
};
