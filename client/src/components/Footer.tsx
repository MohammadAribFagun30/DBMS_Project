import React from 'react';
import { Sparkles, Heart, Github, BookOpen, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-white">ClubVerse</span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm max-w-sm leading-relaxed mb-4">
              International Islamic University Chittagong (IIUC) centralized platform for club activities, workshops, registrations, digital event passes, verified certificates, and annual 3-factor club rankings.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              PostgreSQL 3NF Schema • Express 5 • Prisma 7 • React 18
            </div>
          </div>

          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Portal Navigation</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><Link to="/events" className="hover:text-white transition-colors">Browse Events & Workshops</Link></li>
              <li><Link to="/clubs" className="hover:text-white transition-colors">Clubs & Annual Leaderboard</Link></li>
              <li><Link to="/verify" className="hover:text-white transition-colors">Public Certificate Verification</Link></li>
              <li><Link to="/my-activity" className="hover:text-white transition-colors">My Passes & Feedback</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">System Specs</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><Link to="/admin" className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Admin Console</Link></li>
              <li className="text-slate-500">Default Admin: admin@club.edu</li>
              <li className="text-slate-500">Port 5050 REST API</li>
              <li className="text-slate-500">70 Documented Endpoints</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} International Islamic University Chittagong (IIUC). Built for academic excellence.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" /> for IIUC student life
          </p>
        </div>
      </div>
    </footer>
  );
};

