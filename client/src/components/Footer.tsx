import React from 'react';
import { Bookmark, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t, isBn } = useLanguage();
  return (
    <footer className="bg-[var(--surface-alt)] text-[var(--muted)] text-xs border-t border-[var(--border)] transition-colors">
      <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-6 h-6 rounded-[4px] bg-[var(--primary)] text-[var(--primary-contrast)] flex items-center justify-center">
                <Bookmark className="w-3.5 h-3.5" strokeWidth={1.5} />
              </div>
              <span className="font-heading font-semibold text-sm text-[var(--text)]">ClubVerse</span>
            </div>
            <p className="text-[var(--muted)] text-xs max-w-sm leading-relaxed">
              {isBn 
                ? 'আন্তর্জাতিক ইসলামী বিশ্ববিদ্যালয় চট্টগ্রাম (আইআইইউসি) ক্লাব কার্যক্রম, কর্মশালা, রেজিস্ট্রেশন ও সার্টিফিকেশনের প্রাতিষ্ঠানিক প্ল্যাটফর্ম।'
                : 'International Islamic University Chittagong (IIUC) centralized institutional platform for club activities, workshops, registrations, and verified certificates.'}
            </p>
          </div>

          <div>
            <h4 className="text-[var(--text)] text-xs font-semibold uppercase tracking-wider mb-3">{t('Portal Navigation')}</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/events" className="hover:text-[var(--text)] transition-colors">{t('Browse Events & Workshops')}</Link></li>
              <li><Link to="/clubs" className="hover:text-[var(--text)] transition-colors">{t('Clubs & Annual Leaderboard')}</Link></li>
              <li><Link to="/verify" className="hover:text-[var(--text)] transition-colors">{t('Public Certificate Verification')}</Link></li>
              <li><Link to="/my-activity" className="hover:text-[var(--text)] transition-colors">{t('My Passes & Feedback')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[var(--text)] text-xs font-semibold uppercase tracking-wider mb-3">{t('System Specs')}</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/admin" className="text-[var(--primary)] hover:underline font-medium flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.5} /> {t('Admin Console')}</Link></li>
              <li className="font-mono text-[11px] text-[var(--muted)]">API Port: 5050</li>
              <li className="font-mono text-[11px] text-[var(--muted)]">PostgreSQL + Prisma</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--muted)] gap-2">
          <p>© {new Date().getFullYear()} International Islamic University Chittagong (IIUC).</p>
          <p className="font-mono text-[11px]">{isBn ? 'প্রাতিষ্ঠানিক সংস্করণ' : 'Institutional Release'}</p>
        </div>
      </div>
    </footer>
  );
};
