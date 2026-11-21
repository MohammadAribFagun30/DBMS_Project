import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  Compass,
  Trophy,
  Award,
  ArrowRight,
  Bell,
  Building2,
  FileCheck,
  Bookmark
} from 'lucide-react';

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="w-full bg-[var(--bg)] text-[var(--text)] transition-colors scroll-smooth">
      {/* SECTION 1: OVERVIEW & HEADER */}
      <section
        id="overview"
        className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8"
      >
        <div className="bg-[var(--surface)] p-6 sm:p-10 rounded-[6px] border border-[var(--border)] space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--primary)] text-xs font-mono">
            <Bookmark className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>{t('International Islamic University Chittagong · Campus Portal')}</span>
          </div>

          <div className="space-y-3 max-w-2xl">
            <h1 className="font-heading font-semibold text-3xl sm:text-4xl text-[var(--text)] tracking-tight">
              Centralized Campus Club & Workshop Management System
            </h1>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              {t('Explore our vibrant student clubs, technical workshops, campus events, and verified digital certificates — all in one centralized university platform.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleGetStarted}
              className="btn-primary text-xs py-2 px-4 cursor-pointer"
            >
              <span>{t('Get Started')}</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
            <Link
              to="/events"
              className="btn-secondary text-xs py-2 px-4"
            >
              Browse Events Catalog
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-[var(--border)]">
            <div className="p-3 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] text-left">
              <span className="font-mono text-xl font-semibold text-[var(--text)] block">40+</span>
              <span className="text-[11px] font-mono uppercase text-[var(--muted)]">{t('Campus Events')}</span>
            </div>
            <div className="p-3 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] text-left">
              <span className="font-mono text-xl font-semibold text-[var(--text)] block">12+</span>
              <span className="text-[11px] font-mono uppercase text-[var(--muted)]">{t('Student Clubs')}</span>
            </div>
            <div className="p-3 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] text-left">
              <span className="font-mono text-xl font-semibold text-[var(--text)] block">1,200+</span>
              <span className="text-[11px] font-mono uppercase text-[var(--muted)]">{t('Issued Passes')}</span>
            </div>
            <div className="p-3 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] text-left">
              <span className="font-mono text-xl font-semibold text-[var(--text)] block">100%</span>
              <span className="text-[11px] font-mono uppercase text-[var(--muted)]">{t('Verified QR Certs')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: FEATURES */}
      <section
        id="features"
        className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 py-10 space-y-6"
      >
        <div className="border-b border-[var(--border)] pb-3">
          <h2 className="font-heading font-semibold text-xl text-[var(--text)]">
            Institutional Platform Capabilities
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Purpose-built tools for IIUC students, faculty advisors, and departmental club executives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-[6px] bg-[var(--surface)] border border-[var(--border)] space-y-2">
            <div className="w-8 h-8 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text)] flex items-center justify-center">
              <Compass className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <h3 className="font-heading font-semibold text-sm text-[var(--text)]">Events & Workshops</h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Discover hands-on coding bootcamps, robotics competitions, and academic seminars. Claim instant digital passes with your IIUC ID.
            </p>
          </div>

          <div className="p-5 rounded-[6px] bg-[var(--surface)] border border-[var(--border)] space-y-2">
            <div className="w-8 h-8 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text)] flex items-center justify-center">
              <Trophy className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <h3 className="font-heading font-semibold text-sm text-[var(--text)]">Clubs & Annual Rankings</h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Explore campus clubs across departments. Rankings are dynamically generated using the IIUC 3-factor normalization model (Events, Sponsors, Feedback).
            </p>
          </div>

          <div className="p-5 rounded-[6px] bg-[var(--surface)] border border-[var(--border)] space-y-2">
            <div className="w-8 h-8 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text)] flex items-center justify-center">
              <Award className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <h3 className="font-heading font-semibold text-sm text-[var(--text)]">Verified Digital Credentials</h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Receive verifiable digital certificates upon event completion. Anyone can verify certificate validity instantly with the verification portal.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: NOTICE BOARD */}
      <section
        id="notice-board"
        className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 py-10 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
          <div>
            <h2 className="font-heading font-semibold text-xl text-[var(--text)]">
              Campus Notice Board
            </h2>
            <p className="text-xs text-[var(--muted)]">Official institutional notices and policy updates.</p>
          </div>
          <span className="text-[11px] font-mono text-[var(--muted)]">Central Directorate of Student Affairs</span>
        </div>

        <div className="space-y-2.5">
          <div className="p-3.5 rounded-[6px] bg-[var(--surface)] border border-[var(--border)] flex items-start gap-3">
            <Bell className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" strokeWidth={1.5} />
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[var(--text)]">
                  Spring 2026 Central Club Registration & Executive Induction
                </span>
                <span className="px-1.5 py-0.2 rounded-[4px] text-[10px] font-mono text-[#2F6B4F] bg-[#E4EFE8] dark:text-[#7CC09E] dark:bg-[#1C2E25]">
                  Active
                </span>
              </div>
              <p className="text-xs text-[var(--muted)]">
                All department student clubs are required to submit their semester activity schedules and budget proposals via the executive portal.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-[6px] bg-[var(--surface)] border border-[var(--border)] flex items-start gap-3">
            <Trophy className="w-4 h-4 text-[var(--highlight)] shrink-0 mt-0.5" strokeWidth={1.5} />
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[var(--text)]">
                  IIUC Annual 3-Factor Normalization Algorithm Rules Published
                </span>
                <span className="px-1.5 py-0.2 rounded-[4px] text-[10px] font-mono text-[#8A6414] bg-[#F4EBD3] dark:text-[#D9AE5B] dark:bg-[#33291A]">
                  Policy
                </span>
              </div>
              <p className="text-xs text-[var(--muted)]">
                Annual club standings factor: 35% Event Execution, 35% Sponsorship Raised, and 30% Student Feedback Scores.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-[6px] bg-[var(--surface)] border border-[var(--border)] flex items-start gap-3">
            <FileCheck className="w-4 h-4 text-[var(--muted)] shrink-0 mt-0.5" strokeWidth={1.5} />
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[var(--text)]">
                  Digital Certificate QR Authentication System Live
                </span>
                <span className="px-1.5 py-0.2 rounded-[4px] text-[10px] font-mono text-[#35567A] bg-[#E1E9F2] dark:text-[#86A9D1] dark:bg-[#1A2433]">
                  Feature
                </span>
              </div>
              <p className="text-xs text-[var(--muted)]">
                Students can share public verification links for their event certificates directly on academic portfolios or resumes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: ABOUT IIUC */}
      <section
        id="about-iiuc"
        className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 py-10"
      >
        <div className="bg-[var(--surface)] p-6 rounded-[6px] border border-[var(--border)] space-y-3">
          <h2 className="font-heading font-semibold text-lg text-[var(--text)]">
            About IIUC ClubVerse
          </h2>
          <p className="text-xs text-[var(--muted)] max-w-2xl leading-relaxed">
            International Islamic University Chittagong (IIUC) is committed to academic and extracurricular excellence. ClubVerse serves as the official digital infrastructure connecting students with clubs, seminars, corporate sponsors, and verified credentials across Kumira Campus.
          </p>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-[var(--muted)] font-mono">
        © {new Date().getFullYear()} ClubVerse · International Islamic University Chittagong. All rights reserved.
      </footer>
    </div>
  );
};
