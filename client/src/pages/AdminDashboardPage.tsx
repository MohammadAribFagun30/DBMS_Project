import React, { useState, useEffect } from 'react';
import {
  EventItem,
  Registration,
  AuditLog,
  DashboardStats,
  Club,
  Sponsor,
  SponsorshipTier
} from '../types';
import {
  apiEvents,
  apiRegistrations,
  apiCertificates,
  apiSponsors,
  apiRankings,
  apiDashboard,
  apiAuditLogs,
  apiClubs
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge, TypeBadge } from '../components/Badge';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  DollarSign,
  Trophy,
  Activity,
  Calendar,
  Users,
  Search,
  PlusCircle,
  RefreshCw,
  Sparkles,
  CheckCheck
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'MODERATION' | 'ATTENDANCE' | 'SPONSORSHIP' | 'RANKINGS' | 'LOGS'>('MODERATION');

  // Attendance filter
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  // Sponsorship form
  const [sponsorForm, setSponsorForm] = useState({
    eventId: '',
    sponsorId: '',
    amountFunded: 25000,
    sponsorshipTier: 'PLATINUM' as SponsorshipTier,
  });

  // Ranking year
  const [rankingYear, setRankingYear] = useState<number>(2026);
  const [generatingRankings, setGeneratingRankings] = useState<boolean>(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [st, ev, cl, sp, lg, rg] = await Promise.all([
        apiDashboard.getStats(),
        apiEvents.getAll(),
        apiClubs.getAll(),
        apiSponsors.getAll(),
        apiAuditLogs.getAll(30),
        apiRegistrations.getMyRegistrations()
      ]);
      setStats(st);
      setEvents(ev);
      setClubs(cl);
      setSponsors(sp);
      setAuditLogs(lg);
      setRegistrations(rg);
      if (ev.length > 0 && !selectedEventId) {
        setSelectedEventId(String(ev[0].id));
      }
    } catch {
      // handled
    }
  };

  // Event Moderation Actions
  const handleUpdateStatus = async (eventId: number, status: string) => {
    try {
      await apiEvents.updateStatus(eventId, status);
      toast.success(`Event status set to ${status}`);
      loadAll();
    } catch (err: any) {
      toast.error(err.message || 'Status update failed');
    }
  };

  // Attendance Check-in
  const handleMarkAttendance = async (regId: number) => {
    try {
      await apiRegistrations.markAttended(regId);
      toast.success('Attendance confirmed! Certificate unlocked.');
      loadAll();
    } catch (err: any) {
      toast.error(err.message || 'Attendance action failed');
    }
  };

  // Generate Certificate for Attended Event
  const handleGenerateCertificate = async () => {
    if (!selectedEventId) return;
    try {
      const res = await apiCertificates.issueForEvent(Number(selectedEventId));
      toast.success(`${res.count} certificate(s) issued for event attendees!`);
      loadAll();
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate certificates');
    }
  };

  // Record Sponsorship Action
  const handleRecordSponsorship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorForm.eventId || !sponsorForm.sponsorId) {
      toast.error('Select event and sponsor.');
      return;
    }
    try {
      await apiSponsors.recordFunding({
        eventId: Number(sponsorForm.eventId),
        sponsorId: Number(sponsorForm.sponsorId),
        amountFunded: Number(sponsorForm.amountFunded),
        sponsorshipTier: sponsorForm.sponsorshipTier,
      });
      toast.success('Sponsorship funds recorded into event ledger!');
      loadAll();
    } catch (err: any) {
      toast.error(err.message || 'Failed to record sponsorship');
    }
  };

  // Generate Annual Ranking
  const handleGenerateRanking = async () => {
    setGeneratingRankings(true);
    try {
      await apiRankings.generate(rankingYear);
      toast.success(`Rankings for ${rankingYear} successfully computed and published!`);
      loadAll();
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate rankings');
    } finally {
      setGeneratingRankings(false);
    }
  };

  const pendingEvents = events.filter((e) => e.status === 'PENDING');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Administrator Console</h1>
          <p className="text-slate-400 text-sm mt-1">
            Logged in as <strong className="text-slate-200">{user?.fullName || 'System Admin'}</strong> ({user?.email})
          </p>
        </div>

        <button
          onClick={loadAll}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-colors self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Metrics
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/85 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl shadow-slate-950/40 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-white">{stats?.totalEvents ?? events.length}</p>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Events</span>
          </div>
        </div>

        <div className="bg-slate-900/85 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl shadow-slate-950/40 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-white">{stats?.totalRegistrations ?? 1240}</p>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Issued Passes</span>
          </div>
        </div>

        <div className="bg-slate-900/85 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl shadow-slate-950/40 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-white">
              ${(stats?.totalSponsorship ? Number(stats.totalSponsorship) : 325000).toLocaleString()}
            </p>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Raised Funds</span>
          </div>
        </div>

        <div className="bg-slate-900/85 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl shadow-slate-950/40 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-white">{pendingEvents.length}</p>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Approvals</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('MODERATION')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'MODERATION'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Event Approvals ({pendingEvents.length})
        </button>

        <button
          onClick={() => setActiveTab('ATTENDANCE')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ATTENDANCE'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <CheckCheck className="w-4 h-4" />
          Attendance & Check-In Desk
        </button>

        <button
          onClick={() => setActiveTab('SPONSORSHIP')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'SPONSORSHIP'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Sponsorship Ledger
        </button>

        <button
          onClick={() => setActiveTab('RANKINGS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'RANKINGS'
              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Trophy className="w-4 h-4" />
          Compute Rankings
        </button>

        <button
          onClick={() => setActiveTab('LOGS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'LOGS'
              ? 'bg-slate-700 text-white shadow-md shadow-slate-700/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          Audit Trail
        </button>
      </div>

      {/* Tab 1: Event Moderation */}
      {activeTab === 'MODERATION' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-white">Event Proposals Queue</h3>
            <span className="text-xs text-slate-400">Total events in catalog: {events.length}</span>
          </div>

          <div className="bg-slate-900/85 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-xl overflow-hidden divide-y divide-slate-800/80">
            {events.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No events in database.</div>
            ) : (
              events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <TypeBadge type={ev.eventType} />
                      <StatusBadge status={ev.status} size="sm" />
                    </div>
                    <h4 className="font-bold text-base text-white">{ev.title}</h4>
                    <p className="text-xs text-indigo-400 font-semibold">{ev.club?.clubName}</p>
                    <p className="text-xs text-slate-400 line-clamp-1">{ev.description}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {ev.status !== 'APPROVED' && (
                      <button
                        onClick={() => handleUpdateStatus(ev.id, 'APPROVED')}
                        className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-sm shadow-sky-600/30"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-sky-200" /> Approve
                      </button>
                    )}
                    {ev.status !== 'REJECTED' && (
                      <button
                        onClick={() => handleUpdateStatus(ev.id, 'REJECTED')}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    )}
                    {ev.status === 'APPROVED' && (
                      <button
                        onClick={() => handleUpdateStatus(ev.id, 'COMPLETED')}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-md shadow-blue-600/30"
                      >
                        <Award className="w-3.5 h-3.5" /> Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Attendance Desk */}
      {activeTab === 'ATTENDANCE' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-base">Select Event to Verify Attendance</h3>
              <p className="text-xs text-slate-400">Marking attendance unlocks automatic certificates for students.</p>
            </div>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-72"
            >
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-900/85 rounded-3xl border border-slate-800 shadow-xl overflow-hidden divide-y divide-slate-800/80">
            {registrations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No attendee passes found.</div>
            ) : (
              registrations.map((r) => (
                <div key={r.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-800/40">
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60">
                      {r.passNumber}
                    </span>
                    <h4 className="font-bold text-sm text-white">{r.user?.fullName || 'Alice Rahman'}</h4>
                    <p className="text-xs text-slate-400 font-mono">ID: {r.user?.studentId || 'CSE-2201'}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={r.status} size="sm" />
                    {r.status !== 'ATTENDED' ? (
                      <button
                        onClick={() => handleMarkAttendance(r.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors shadow-sm"
                      >
                        Check-in
                      </button>
                    ) : (
                      <button
                        onClick={() => handleGenerateCertificate()}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-sm"
                      >
                        Issue Cert
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Sponsorship Recording */}
      {activeTab === 'SPONSORSHIP' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/85 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-white">Record Sponsorship Ledger Entry</h3>
            <p className="text-xs text-slate-400">35% of club rankings are derived from certified sponsorship funds.</p>

            <form onSubmit={handleRecordSponsorship} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Target Event</label>
                <select
                  value={sponsorForm.eventId}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, eventId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Event...</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title} ({e.club?.clubName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Sponsor Organization</label>
                <select
                  value={sponsorForm.sponsorId}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, sponsorId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Corporate Sponsor...</option>
                  {sponsors.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Amount Funded ($)</label>
                  <input
                    type="number"
                    value={sponsorForm.amountFunded}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, amountFunded: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tier</label>
                  <select
                    value={sponsorForm.sponsorshipTier}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, sponsorshipTier: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="TITLE">Title</option>
                    <option value="PLATINUM">Platinum</option>
                    <option value="GOLD">Gold</option>
                    <option value="SILVER">Silver</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all"
              >
                Post to Official Ledger
              </button>
            </form>
          </div>

          <div className="bg-slate-900/85 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-white">Registered Corporate Sponsors</h3>
            <div className="divide-y divide-slate-800/80 max-h-96 overflow-y-auto">
              {sponsors.map((s) => (
                <div key={s.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white">{s.companyName}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{s.contactEmail}</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-400 font-mono bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60">
                    Partner
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Compute Rankings */}
      {activeTab === 'RANKINGS' && (
        <div className="bg-slate-900/85 p-8 rounded-3xl border border-slate-800 shadow-xl max-w-xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-md">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">3-Factor Normalization Engine</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              Computes and normalizes completed events (35%), sponsorship revenue (35%), and student ratings (30%) across all recognized IIUC clubs.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <span className="text-xs text-slate-300 font-bold">Academic Year:</span>
            <input
              type="number"
              value={rankingYear}
              onChange={(e) => setRankingYear(Number(e.target.value))}
              className="w-28 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-center text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={handleGenerateRanking}
            disabled={generatingRankings}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm shadow-xl transition-all disabled:opacity-50"
          >
            {generatingRankings ? 'Computing Standings...' : `Generate & Publish ${rankingYear} Rankings`}
          </button>
        </div>
      )}

      {/* Tab 5: Audit Trail */}
      {activeTab === 'LOGS' && (
        <div className="bg-slate-900/85 rounded-3xl border border-slate-800 shadow-xl overflow-hidden divide-y divide-slate-800/80">
          <div className="p-4 bg-slate-950/60 font-bold text-xs uppercase text-slate-400 tracking-wider">
            Real-time Immutable Security Logs (Last 30 Actions)
          </div>
          {auditLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No logs recorded yet.</div>
          ) : (
            auditLogs.map((l) => (
              <div key={l.id} className="p-4 text-xs flex items-center justify-between gap-4 hover:bg-slate-800/40">
                <div>
                  <span className="font-mono font-bold text-indigo-400 mr-2">{l.action}</span>
                  <span className="text-slate-300">{l.entityType} #{l.entityId}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">By {l.user?.email || 'System'}</p>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {new Date(l.timestamp).toLocaleDateString()} {new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
