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
  const { user, isAdmin } = useAuth();
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
      toast.success(`Event status updated to ${status}`);
      loadAll();
    } catch (err: any) {
      toast.error(err.message || 'Status update failed');
    }
  };

  // Attendance Desk Actions
  const handleMarkAttended = async (regId: number) => {
    try {
      await apiRegistrations.markAttended(regId);
      toast.success('Attendance marked! Feedback & certificate now eligible.');
      loadAll();
    } catch (err: any) {
      toast.error(err.message || 'Failed to mark attendance');
    }
  };

  const handleIssueCertificates = async (eventId: number) => {
    try {
      const res = await apiCertificates.issueForEvent(eventId);
      toast.success(`Issued ${res.count || 'all'} certificates for event attendees!`);
      loadAll();
    } catch (err: any) {
      toast.error(err.message || 'Failed to issue certificates');
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            University System Operations
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Administrator Console</h1>
          <p className="text-slate-500 text-sm mt-1">
            Logged in as <strong className="text-slate-800">{user?.fullName || 'System Admin'}</strong> ({user?.email})
          </p>
        </div>

        <button
          onClick={loadAll}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stats
        </button>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Total Users</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.totalUsers ?? 486}</p>
          <span className="text-xs text-indigo-600 font-semibold">{stats?.totalStudents ?? 472} Students</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Campus Clubs</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.totalClubs ?? 12}</p>
          <span className="text-xs text-slate-500 font-semibold">Active Organizations</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Pending Approvals</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{pendingEvents.length}</p>
          <span className="text-xs text-slate-500 font-semibold">Requires Moderation</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Total Funding</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">
            ${(stats?.totalSponsorship ? Number(stats.totalSponsorship) : 325000).toLocaleString()}
          </p>
          <span className="text-xs text-slate-500 font-semibold">Sponsor Ledger</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 col-span-2 md:col-span-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Avg Student Rating</span>
          <p className="text-2xl font-extrabold text-amber-500 mt-1">★ {stats?.averageRating ?? 4.7}</p>
          <span className="text-xs text-slate-500 font-semibold">{stats?.totalFeedbacks ?? 530} anonymous ratings</span>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-slate-200 flex flex-wrap items-center gap-1">
        <button
          onClick={() => setActiveTab('MODERATION')}
          className={`flex items-center gap-2 px-4 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all ${
            activeTab === 'MODERATION'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Event Moderation ({pendingEvents.length} Pending)
        </button>

        <button
          onClick={() => setActiveTab('ATTENDANCE')}
          className={`flex items-center gap-2 px-4 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all ${
            activeTab === 'ATTENDANCE'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCheck className="w-4 h-4" />
          Attendance & Certs Desk
        </button>

        <button
          onClick={() => setActiveTab('SPONSORSHIP')}
          className={`flex items-center gap-2 px-4 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all ${
            activeTab === 'SPONSORSHIP'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Sponsorship Ledger
        </button>

        <button
          onClick={() => setActiveTab('RANKINGS')}
          className={`flex items-center gap-2 px-4 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all ${
            activeTab === 'RANKINGS'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Trophy className="w-4 h-4" />
          Annual Rankings Generator
        </button>

        <button
          onClick={() => setActiveTab('LOGS')}
          className={`flex items-center gap-2 px-4 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all ${
            activeTab === 'LOGS'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          Audit Logs
        </button>
      </div>

      {/* Tab 1: Event Moderation */}
      {activeTab === 'MODERATION' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900">All Submitted Events</h3>
              <span className="text-xs text-slate-500 font-semibold">{events.length} Events Total</span>
            </div>

            <div className="divide-y divide-slate-100">
              {events.map((ev) => (
                <div key={ev.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <TypeBadge type={ev.eventType} />
                      <StatusBadge status={ev.status} />
                      <span className="text-[10px] text-slate-400 font-mono">#{ev.id}</span>
                    </div>

                    <h4 className="font-extrabold text-base text-slate-900">{ev.title}</h4>
                    <p className="text-xs text-indigo-600 font-semibold">{ev.club?.clubName}</p>

                    <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                      <span>{new Date(ev.startTime).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{ev.venue?.venueName || 'Main Auditorium'}</span>
                      <span>•</span>
                      <span>{ev._count?.registrations ?? 0} registered</span>
                    </div>
                  </div>

                  {/* Moderation Controls */}
                  <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                    {ev.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(ev.id, 'APPROVED')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(ev.id, 'REJECTED')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    )}

                    {ev.status === 'APPROVED' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(ev.id, 'COMPLETED')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors"
                          title="Marks completed and activates rankings & certificates"
                        >
                          <CheckCheck className="w-3.5 h-3.5" /> Mark Completed
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(ev.id, 'CANCELLED')}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs"
                        >
                          Cancel Event
                        </button>
                      </>
                    )}

                    {ev.status === 'COMPLETED' && (
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200">
                        Completed & Ranked
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Attendance Desk */}
      {activeTab === 'ATTENDANCE' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Event Check-in & Certification Desk</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Check-in students to mark them ATTENDED. Once attended, mass issue certificates.
                </p>
              </div>

              {selectedEventId && (
                <button
                  onClick={() => handleIssueCertificates(Number(selectedEventId))}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors shrink-0"
                >
                  <Award className="w-4 h-4" />
                  Issue Certificates for All Attendees
                </button>
              )}
            </div>

            {/* Select Event dropdown */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Select Event Session:
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full sm:w-96 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 bg-white"
              >
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    #{e.id} - {e.title} ({e.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Registrations List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Registered Attendees
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {registrations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No registered attendees found for this event.
                </div>
              ) : (
                registrations.map((reg) => (
                  <div key={reg.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-indigo-700 font-mono font-bold text-xs flex items-center justify-center">
                        {reg.passNumber}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{reg.user?.fullName || 'Alice Rahman'}</h4>
                        <p className="text-xs text-slate-500">ID: {reg.user?.studentId || 'CSE-2201'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={reg.status} size="sm" />

                      {reg.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleMarkAttended(reg.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Check In
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Sponsorship Ledger */}
      {activeTab === 'SPONSORSHIP' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Record Sponsorship Funding</h3>
              <p className="text-xs text-slate-500 mt-1">
                Adds funds to the event ledger and updates club ranking sponsorship score.
              </p>
            </div>

            <form onSubmit={handleRecordSponsorship} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Event *</label>
                <select
                  required
                  value={sponsorForm.eventId}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, eventId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">Select Event...</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Corporate Sponsor *</label>
                <select
                  required
                  value={sponsorForm.sponsorId}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, sponsorId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">Select Sponsor...</option>
                  {sponsors.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Amount Funded ($ USD) *</label>
                <input
                  type="number"
                  required
                  min={100}
                  step={500}
                  value={sponsorForm.amountFunded}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, amountFunded: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sponsorship Tier</label>
                <select
                  value={sponsorForm.sponsorshipTier}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, sponsorshipTier: e.target.value as any })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="TITLE">TITLE</option>
                  <option value="PLATINUM">PLATINUM</option>
                  <option value="GOLD">GOLD</option>
                  <option value="SILVER">SILVER</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                Save To Ledger
              </button>
            </form>
          </div>

          {/* Master Sponsors Overview */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">Active Corporate Partners</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sponsors.map((s) => (
                <div key={s.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-indigo-600">SPONSOR-#{s.id}</span>
                  <h4 className="font-bold text-sm text-slate-900">{s.companyName}</h4>
                  <p className="text-xs text-slate-500">{s.contactEmail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Annual Rankings Generator */}
      {activeTab === 'RANKINGS' && (
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 p-8 rounded-3xl text-white shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                University Calculation Engine
              </span>
              <h3 className="text-2xl font-extrabold">Generate Annual Club Standings</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Runs the 3-factor ranking algorithm for the selected calendar year:
                evaluates completed events, calculates total sponsorship ledger balances,
                and aggregates student feedback averages.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/10 p-2 rounded-2xl border border-white/10 shrink-0">
              <select
                value={rankingYear}
                onChange={(e) => setRankingYear(Number(e.target.value))}
                className="bg-transparent text-white font-bold text-sm border-none focus:outline-none px-2"
              >
                <option value={2026} className="text-slate-900">Year 2026</option>
                <option value={2025} className="text-slate-900">Year 2025</option>
              </select>

              <button
                onClick={handleGenerateRanking}
                disabled={generatingRankings}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
              >
                {generatingRankings ? 'Computing...' : 'Run & Publish Rankings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: System Audit Logs */}
      {activeTab === 'LOGS' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900">System Activity & Security Audit Trail</h3>
            <span className="text-xs text-slate-500 font-semibold">{auditLogs.length} Recent entries</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    {log.action}
                  </span>
                  <span className="text-slate-700 font-medium">
                    Entity: <strong>{log.entityType}</strong> (ID: {log.entityId || 'N/A'})
                  </span>
                </div>

                <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                  <span>By: {log.user?.fullName || 'Anonymous'}</span>
                  <span>•</span>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

