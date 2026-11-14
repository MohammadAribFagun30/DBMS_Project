import React, { useState, useEffect } from 'react';
import { Club, ClubRanking } from '../types';
import { apiClubs, apiRankings } from '../services/api';
import {
  Trophy,
  Users,
  Calendar,
  Building2,
  DollarSign,
  Star,
  Award,
  Sparkles,
  BarChart3,
  ExternalLink
} from 'lucide-react';

export const ClubsPage: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [rankings, setRankings] = useState<ClubRanking[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [activeTab, setActiveTab] = useState<'RANKINGS' | 'DIRECTORY'>('RANKINGS');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, [selectedYear]);

  const loadData = async () => {
    setLoading(true);
    try {
      const c = await apiClubs.getAll();
      setClubs(c);

      const r = await apiRankings.getByYear(selectedYear);
      setRankings(r);
    } catch {
      // fallback in api service
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4" />
            University Organizations & Performance
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Clubs & Annual Leaderboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            Explore university clubs and their official performance standing computed via the 3-Factor Model.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('RANKINGS')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'RANKINGS'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Annual Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('DIRECTORY')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'DIRECTORY'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
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
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                University 3-Factor Normalization Algorithm
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold">Official Annual Rankings</h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                <code className="text-amber-300 font-mono font-bold">
                  Final = 0.35 × Events + 0.35 × Sponsorship + 0.30 × Feedback
                </code>
                . Scores are normalized to 0–100 against campus-wide benchmarks.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/10 shrink-0">
              <span className="text-xs text-slate-300 font-bold px-2">Year:</span>
              {[2026, 2025, 2024].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedYear === yr
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard Table / Cards */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900">
                Rankings for Academic Year {selectedYear}
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {rankings.length} Clubs Evaluated
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {rankings.map((r) => (
                <div
                  key={r.id}
                  className="p-5 sm:p-6 hover:bg-slate-50/60 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  {/* Left: Rank & Club Name */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg shrink-0 ${
                        r.rankPosition === 1
                          ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-sm'
                          : r.rankPosition === 2
                          ? 'bg-slate-100 text-slate-700 border border-slate-300'
                          : r.rankPosition === 3
                          ? 'bg-orange-100 text-orange-800 border border-orange-300'
                          : 'bg-slate-50 text-slate-500 border border-slate-200'
                      }`}
                    >
                      #{r.rankPosition}
                    </div>

                    <div>
                      <h4 className="font-extrabold text-base sm:text-lg text-slate-900">
                        {r.clubName || r.club?.clubName}
                      </h4>
                      <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                        {r.club?.department?.departmentName || 'Academic Department'}
                      </p>

                      {/* Raw Metrics pills */}
                      {r.metrics && (
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <strong>{r.metrics.completedEvents}</strong> Completed Events
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                            <strong>${r.metrics.totalSponsorship?.toLocaleString()}</strong> Raised
                          </span>
                          {r.metrics.averageRating && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-amber-600 font-bold">
                                <Star className="w-3.5 h-3.5 fill-amber-500" />
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
                        <div className="flex justify-between text-slate-600 mb-0.5">
                          <span>Events (35%)</span>
                          <span className="font-bold">{r.totalEventsScore}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${Math.min(100, Number(r.totalEventsScore))}%` }}
                          />
                        </div>
                      </div>

                      {/* Sponsorship Score */}
                      <div>
                        <div className="flex justify-between text-slate-600 mb-0.5">
                          <span>Sponsorship (35%)</span>
                          <span className="font-bold">{r.sponsorshipScore}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.min(100, Number(r.sponsorshipScore))}%` }}
                          />
                        </div>
                      </div>

                      {/* Feedback Score */}
                      <div>
                        <div className="flex justify-between text-slate-600 mb-0.5">
                          <span>Feedback (30%)</span>
                          <span className="font-bold">{r.feedbackScore}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${Math.min(100, Number(r.feedbackScore))}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Final Score Big Badge */}
                    <div className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-center min-w-[100px] shrink-0">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                        Final Score
                      </span>
                      <span className="text-xl font-extrabold text-indigo-700 font-mono">
                        {r.finalScore}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Clubs Directory Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold text-lg mb-4">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-900">{c.clubName}</h3>
                <span className="inline-block text-xs font-semibold text-indigo-600 mt-0.5">
                  {c.department?.departmentName || 'Academic Department'}
                </span>
                <p className="text-slate-600 text-xs sm:text-sm mt-3 leading-relaxed">
                  {c.description || 'Dedicated to advancing student passion and leadership through campus events.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Est. {c.establishedYear || 2026}</span>
                <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl">
                  {c._count?.events ?? 0} Events hosted
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

