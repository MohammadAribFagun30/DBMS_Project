import React, { useState, useEffect } from 'react';
import { Club, ClubRanking } from '../types';
import { apiClubs, apiRankings } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Trophy,
  Calendar,
  Building2,
  DollarSign,
  Star
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
    <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--highlight)] font-semibold">
            Institutional Standing
          </span>
          <h1 className="font-heading font-semibold text-2xl text-[var(--text)] tracking-tight">
            Clubs & Performance Leaderboards
          </h1>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Recognized student organizations, performance metrics, and annual 3-factor rankings.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-[var(--surface-alt)] p-1 rounded-[6px] border border-[var(--border)] self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('RANKINGS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-mono transition-colors cursor-pointer ${
              activeTab === 'RANKINGS'
                ? 'bg-[var(--primary)] text-[var(--primary-contrast)] font-medium'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" strokeWidth={1.5} />
            Annual Leaderboard
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('DIRECTORY')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-mono transition-colors cursor-pointer ${
              activeTab === 'DIRECTORY'
                ? 'bg-[var(--primary)] text-[var(--primary-contrast)] font-medium'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            Clubs Directory
          </button>
        </div>
      </div>

      {activeTab === 'RANKINGS' ? (
        <div className="space-y-4">
          {/* Algorithm Info Card & Year Selector */}
          <div className="bg-[var(--surface)] p-4 rounded-[6px] border border-[var(--border)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[var(--highlight)] uppercase tracking-wider font-semibold">
                IIUC 3-Factor Normalization Algorithm
              </span>
              <h2 className="font-heading font-semibold text-base text-[var(--text)]">Official Annual Rankings</h2>
              <p className="text-xs font-mono text-[var(--muted)]">
                Formula: 0.35 × Events + 0.35 × Sponsorship + 0.30 × Feedback.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-[var(--surface-alt)] p-1 rounded-[4px] border border-[var(--border)] shrink-0 font-mono text-xs">
              <span className="text-[var(--muted)] px-2">Year:</span>
              {[2026, 2025, 2024].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setSelectedYear(yr)}
                  className={`px-2.5 py-1 rounded-[4px] transition-colors cursor-pointer ${
                    selectedYear === yr
                      ? 'bg-[var(--primary)] text-[var(--primary-contrast)] font-medium'
                      : 'text-[var(--muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard Dense Table */}
          <div className="bg-[var(--surface)] rounded-[6px] border border-[var(--border)] overflow-hidden">
            <div className="p-3.5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-alt)]">
              <h3 className="font-heading font-semibold text-xs text-[var(--text)] uppercase tracking-wider">
                Rankings for Academic Year {selectedYear}
              </h3>
              <span className="text-xs font-mono text-[var(--muted)]">
                {rankings.length} Clubs Evaluated
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="dense-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Club Name</th>
                    <th>Department</th>
                    <th>Events (35%)</th>
                    <th>Sponsorship (35%)</th>
                    <th>Feedback (30%)</th>
                    <th>Final Score</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((r) => (
                    <tr key={r.id}>
                      <td className="font-mono font-semibold text-[var(--text)]">
                        #{r.rankPosition}
                      </td>
                      <td className="font-medium text-[var(--text)]">
                        {r.clubName || r.club?.clubName}
                      </td>
                      <td className="text-xs text-[var(--muted)]">
                        {r.club?.department?.departmentName || 'General'}
                      </td>
                      <td className="font-mono text-[var(--muted)]">
                        {Number(r.totalEventsScore).toFixed(1)}
                      </td>
                      <td className="font-mono text-[var(--muted)]">
                        {Number(r.sponsorshipScore).toFixed(1)}
                      </td>
                      <td className="font-mono text-[var(--muted)]">
                        {Number(r.feedbackScore).toFixed(1)}
                      </td>
                      <td className="font-mono font-semibold text-[var(--primary)]">
                        {Number(r.finalScore).toFixed(2)} / 100
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Tab 2: Clubs Directory */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map((c) => (
            <div
              key={c.id}
              className="bg-[var(--surface)] rounded-[6px] p-4 border border-[var(--border)] hover:border-[var(--muted)] transition-colors flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text)] flex items-center justify-center font-mono font-semibold text-xs">
                    {c.clubName.charAt(0)}
                  </div>
                  <span className="text-[10px] font-mono text-[var(--muted)] bg-[var(--surface-alt)] px-2 py-0.5 rounded-[4px] border border-[var(--border)]">
                    Est. {new Date(c.establishedYear || 2020).getFullYear()}
                  </span>
                </div>

                <div>
                  <h3 className="font-heading font-semibold text-sm text-[var(--text)]">{c.clubName}</h3>
                  <p className="text-xs text-[var(--primary)] font-medium mt-0.5">
                    {c.department?.departmentName || 'Academic Department'}
                  </p>
                  <p className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed line-clamp-2">
                    {c.description || 'Dedicated to advancing student skills and campus engagement.'}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted)] font-mono">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[var(--muted)]" strokeWidth={1.5} />
                  <span>{c._count?.events ?? 0} campus events</span>
                </span>
                <span className="text-[var(--primary)] font-medium">Active Club</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
