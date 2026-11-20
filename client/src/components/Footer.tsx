import React from 'react';
import { Sparkles, Heart, Github, BookOpen, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t, isBn } = useLanguage();
  return (
    <footer className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-sm border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="w-full max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white">ClubVerse</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-sm leading-relaxed mb-4">
              {isBn 
                ? 'আন্তর্জাতিক ইসলামী বিশ্ববিদ্যালয় চট্টগ্রাম (আইআইইউসি) ক্লাব কার্যক্রম, কর্মশালা, রেজিস্ট্রেশন, ডিজিটাল পাস ও সার্টিফিকেটের কেন্দ্রীয় পোর্টাল।'
                : 'International Islamic University Chittagong (IIUC) centralized platform for club activities, workshops, registrations, digital event passes, verified certificates, and annual 3-factor club rankings.'}
            </p>
          </div>

          <div>
            <h4 className="text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider mb-4">{t('Portal Navigation')}</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><Link to="/events" className="hover:text-slate-950 dark:hover:text-white transition-colors">{t('Browse Events & Workshops')}</Link></li>
              <li><Link to="/clubs" className="hover:text-slate-950 dark:hover:text-white transition-colors">{t('Clubs & Annual Leaderboard')}</Link></li>
              <li><Link to="/verify" className="hover:text-slate-950 dark:hover:text-white transition-colors">{t('Public Certificate Verification')}</Link></li>
              <li><Link to="/my-activity" className="hover:text-slate-950 dark:hover:text-white transition-colors">{t('My Passes & Feedback')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider mb-4">{t('System Specs')}</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><Link to="/admin" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> {t('Admin Console')}</Link></li>
              <li className="text-slate-500">Default Admin: admin@club.edu</li>
              <li className="text-slate-500">Port 5050 REST API</li>
              <li className="text-slate-500">70 Documented Endpoints</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} International Islamic University Chittagong (IIUC). {isBn ? 'একাডেমিক শ্রেষ্ঠত্বের জন্য তৈরি।' : 'Built for academic excellence.'}</p>
          <p className="flex items-center gap-1">
            {isBn ? 'আইআইইউসি শিক্ষার্থীদের জন্য নিবেদিত' : 'Engineered with'} <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" /> {!isBn && 'for IIUC student life'}
          </p>
        </div>
      </div>
    </footer>
  );
};

