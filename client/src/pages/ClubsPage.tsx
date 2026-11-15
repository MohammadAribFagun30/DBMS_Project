import React, { useState, useEffect } from 'react';
import { Club, ClubRanking } from '../types';
import { apiClubs, apiRankings } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Trophy,
  Users,
  Calendar,
  Sparkles,
  Building2,
  Mail,
  Award,
  DollarSign,
  Star,
  ChevronRight,
  TrendingUp,
  BarChart3
} from 'lucide-react';

export const ClubsPage: React.FC = () => {
  const toast = useToast();

  const [clubs, setClubs] = useState<Club[]>([]);
  const [rankings, setRankings] = useState<ClubRanking[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [activeTab, setActiveTab] = useState<'RANKINGS' | 'DIRECTORY'>('RANKINGS');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, [selectedYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cl, rk] = await Promise.all([
        apiClubs.getAll(),
        apiRankings.getByYear(selectedYear),
      ]);
      setClubs(cl);
      setRankings(rk);
    } catch {
      toast.error('Failed to load club data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4 text-amber-400" />
            University Club Ecosystem
          </div>
          <h1 className="text-3xl font-extrabold text-white">Clubs & Leaderboards</h1>
          <p className="text-slate-400 text-sm mt-1">
            Explore recognized student organizations, executive committees, and official 3-factor annual rankings.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('RANKINGS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'RANKINGS'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-slate-950" />
            Annual Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('DIRECTORY')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'DIRECTORY'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Clubs Directory
          </button>
        </div>
      </div>

      {activeTab === 'RANKINGS' ? (
        <div className="space-y-6">
          {/* Algorithm Info Card & Year Selector */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                IIUC 3-Factor Normalization Algorithm
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold">Official Annual Rankings</h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                <code className="text-amber-300 font-mono font-bold">
                  Final = 0.35 × Events + 0.35 × Sponsorship + 0.30 × Feedback
                </code>
                . Scores are normalized to 0–100 against campus-wide benchmarks.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/70 p-1.5 rounded-2xl border border-slate-800 shrink-0">
              <span className="text-xs text-slate-400 font-bold px-2">Year:</span>
              {[2026, 2025, 2024].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedYear === yr
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard Table / Cards */}
          <div className="bg-slate-900/85 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-xl shadow-slate-950/50 overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <h3 className="font-extrabold text-base text-white">
                Rankings for Academic Year {selectedYear}
              </h3>
              <span className="text-xs font-semibold text-slate-400">
                {rankings.length} Clubs Evaluated
              </span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {rankings.map((r) => (
                <div
                  key={r.id}
                  className="p-5 sm:p-6 hover:bg-slate-800/40 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  {/* Left: Rank & Club Name */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg shrink-0 ${
                        r.rankPosition === 1
                          ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/25'
                          : r.rankPosition === 2
                          ? 'bg-slate-300 text-slate-900'
                          : r.rankPosition === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      #{r.rankPosition}
                    </div>

                    <div>
                      <h4 className="font-extrabold text-base sm:text-lg text-white">
                        {r.clubName || r.club?.clubName}
                      </h4>
                      <p className="text-xs text-indigo-400 font-semibold mt-0.5">
                        {r.club?.department?.departmentName || 'Academic Department'}
                      </p>

                      {/* Raw Metrics pills */}
                      {r.metrics && (
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <strong className="text-slate-200">{r.metrics.completedEvents}</strong> Completed Events
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                            <strong className="text-slate-200">${r.metrics.totalSponsorship?.toLocaleString()}</strong> Raised
                          </span>
                          {r.metrics.averageRating && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-amber-400 font-bold">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                {r.metrics.averageRating}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Scores Progress Breakdown & Final Total */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:shrink-0">
                    <div className="space-y-1.5 w-full sm:w-64 text-xs">
                      {/* Events Score */}
                      <div>
                        <div className="flex justify-between text-slate-400 mb-0.5">
                          <span>Events (35%)</span>
                          <span className="font-bold text-slate-200">{r.totalEventsScore}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${Math.min(100, Number(r.totalEventsScore))}%` }}
                          />
                        </div>
                      </div>

                      {/* Sponsorship Score */}
                      <div>
                        <div className="flex justify-between text-slate-400 mb-0.5">
                          <span>Sponsorship (35%)</span>
                          <span className="font-bold text-slate-200">{r.sponsorshipScore}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${Math.min(100, Number(r.sponsorshipScore))}%` }}
                          />
                        </div>
                      </div>

                      {/* Feedback Score */}
                      <div>
                        <div className="flex justify-between text-slate-400 mb-0.5">
                          <span>Feedback (30%)</span>
                          <span className="font-bold text-slate-200">{r.feedbackScore}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${Math.min(100, Number(r.feedbackScore))}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Final Big Score Box */}
                    <div className="bg-slate-950/80 p-3.5 sm:p-4 rounded-2xl border border-slate-800 text-center w-full sm:w-28 shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                        Final Score
                      </span>
                      <span className="text-2xl font-extrabold text-white block mt-0.5">
                        {r.finalScore}
                      </span>
                      <span className="text-[10px] text-indigo-400 font-semibold block">
                        out of 100
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Tab 2: Clubs Directory */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((c) => (
            <div
              key={c.id}
              className="bg-slate-900/85 backdrop-blur-md rounded-3xl p-6 border border-slate-800 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-950/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-extrabold text-lg">
                    {c.clubName.charAt(0)}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
                    Est. {new Date(c.establishedYear || 2020).getFullYear()}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-lg text-white">{c.clubName}</h3>
                  <p className="text-xs text-indigo-400 font-semibold mt-0.5">
                    {c.department?.departmentName || 'Academic Department'}
                  </p>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">
                    {c.description || 'Dedicated to advancing student skills and campus engagement.'}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{c._count?.events ?? 0} campus events</span>
                </span>
                <span className="text-indigo-400 font-semibold">Active Club</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
