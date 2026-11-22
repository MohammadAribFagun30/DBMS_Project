import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  EventItem,
  Registration,
  AuditLog,
  DashboardStats,
  Club,
  ClubRanking,
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
  apiClubs,
  checkBackendHealth
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { ThemeLanguageToggle } from '../components/ThemeLanguageToggle';
import { StatusBadge, TypeBadge } from '../components/Badge';
import {
  LayoutGrid,
  Folder,
  User as UserIcon,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  CheckCircle,
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
  CheckCheck,
  ExternalLink,
  Building2,
  X,
  Menu,
  Compass,
  Bookmark,
  LogOut,
  SlidersHorizontal,
  FileCheck
} from 'lucide-react';

type AdminTab =
  | 'DASHBOARD'
  | 'EVENTS_WORKSHOPS'
  | 'CLUBS_RANKINGS'
  | 'ATTENDANCE'
  | 'SPONSORSHIP'
  | 'LOGS'
  | 'PROFILE';

export const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { t, isBn } = useLanguage();
  const toast = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  const [workspaceOpen, setWorkspaceOpen] = useState(true);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Events & Workshops Search/Filter
  const [eventSearch, setEventSearch] = useState<string>('');
  const [eventFilter, setEventFilter] = useState<'ALL' | 'WORKSHOP' | 'SEMINAR' | 'PENDING' | 'APPROVED'>('ALL');

  // Attendance filter
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  // Sponsorship form
  const [sponsorForm, setSponsorForm] = useState({
    eventId: '',
    sponsorId: '',
    amountFunded: 25000,
    sponsorshipTier: 'PLATINUM' as SponsorshipTier,
  });

  // Ranking year and data
  const [rankingYear, setRankingYear] = useState<number>(2026);
  const [rankings, setRankings] = useState<ClubRanking[]>([]);
  const [generatingRankings, setGeneratingRankings] = useState<boolean>(false);

  useEffect(() => {
    loadAll();
  }, [rankingYear]);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [st, ev, cl, sp, lg, rg, rk] = await Promise.all([
        apiDashboard.getStats(),
        apiEvents.getAll(),
        apiClubs.getAll(),
        apiSponsors.getAll(),
        apiAuditLogs.getAll(30),
        apiRegistrations.getMyRegistrations(),
        apiRankings.getByYear(rankingYear),
      ]);
      setStats(st);
      setEvents(ev);
      setClubs(cl);
      setSponsors(sp);
      setAuditLogs(lg);
      setRegistrations(rg);
      setRankings(rk);
      if (ev.length > 0 && !selectedEventId) {
        setSelectedEventId(String(ev[0].id));
      }
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    if (isRefreshing || loading) return;
    setIsRefreshing(true);
    try {
      await checkBackendHealth();
      await loadAll();
      await new Promise((resolve) => setTimeout(resolve, 600));
    } catch (err: any) {
      console.error('Failed to refresh dashboard data:', err);
      toast.error(isBn ? 'রিফ্রেশ ব্যর্থ হয়েছে' : (err?.message || 'Failed to refresh data'));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUpdateStatus = async (eventId: number, status: string) => {
    try {
      await apiEvents.updateStatus(eventId, status);
      toast.success(`Event status set to ${status}`);
      loadAll();
    } catch (err: any) {
      toast.error(err.message || 'Status update failed');
    }
  };

  const handleMarkAttendance = async (regId: number) => {
    try {
      await apiRegistrations.markAttended(regId);
      toast.success('Attendee marked present & eligible for certificate!');
      loadAll();
    } catch (err: any) {
      toast.error(err.message || 'Check-in failed');
    }
  };

  const handleRecordSponsorship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorForm.eventId || !sponsorForm.sponsorId) {
      toast.error('Please select both an event and a sponsor company.');
      return;
    }
    try {
      await apiSponsors.linkEventSponsor({
        eventId: Number(sponsorForm.eventId),
        sponsorId: Number(sponsorForm.sponsorId),
        amountFunded: Number(sponsorForm.amountFunded),
        sponsorshipTier: sponsorForm.sponsorshipTier,
      });
      toast.success('Sponsorship funds recorded to ledger!');
      loadAll();
    } catch (err: any) {
      toast.error(err.message || 'Failed to record sponsorship');
    }
  };

  const handleGenerateRanking = async () => {
    try {
      setGeneratingRankings(true);
      await apiRankings.generate(rankingYear);
      toast.success(`Annual ${rankingYear} Club Rankings computed via 3-Factor Normalization Algorithm!`);
      const rk = await apiRankings.getByYear(rankingYear);
      setRankings(rk);
    } catch (err: any) {
      toast.error(err.message || 'Failed to compute rankings');
    } finally {
      setGeneratingRankings(false);
    }
  };

  const handleGenerateCertificate = async () => {
    if (!selectedEventId) {
      toast.error('Please select an event first.');
      return;
    }
    try {
      const reg = registrations.find((r) => r.eventId === Number(selectedEventId));
      if (!reg) {
        toast.error('No attendees found for this event to issue certificate.');
        return;
      }
      await apiCertificates.generate(reg.id);
      toast.success('Digital certificate generated with verifiable hash!');
      loadAll();
    } catch (err: any) {
      toast.error(err.message || 'Certificate generation failed');
    }
  };

  const pendingEvents = events.filter((e) => e.status === 'PENDING');
  const workshopCount = events.filter((e) => e.eventType === 'WORKSHOP' || Boolean(e.workshop)).length;
  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
      (ev.club?.clubName || '').toLowerCase().includes(eventSearch.toLowerCase());
    if (!matchesSearch) return false;

    if (eventFilter === 'WORKSHOP') return ev.eventType === 'WORKSHOP' || Boolean(ev.workshop);
    if (eventFilter === 'SEMINAR') return ev.eventType === 'SEMINAR';
    if (eventFilter === 'PENDING') return ev.status === 'PENDING';
    if (eventFilter === 'APPROVED') return ev.status === 'APPROVED';
    return true;
  });
  const selectedEvent = events.find((e) => String(e.id) === selectedEventId);

  const isWorkspaceTab = [
    'EVENTS_WORKSHOPS',
    'CLUBS_RANKINGS',
    'ATTENDANCE',
    'SPONSORSHIP',
    'LOGS'
  ].includes(activeTab);

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'DASHBOARD':
        return t('Dashboard');
      case 'EVENTS_WORKSHOPS':
      case 'CLUBS_RANKINGS':
      case 'ATTENDANCE':
      case 'SPONSORSHIP':
      case 'LOGS':
        return t('Workspace');
      case 'PROFILE':
        return t('Profile');
      default:
        return t('Dashboard');
    }
  };

  const getActiveTabName = () => {
    switch (activeTab) {
      case 'EVENTS_WORKSHOPS':
        return t('Events & Workshops');
      case 'CLUBS_RANKINGS':
        return t('Clubs & Rankings');
      case 'ATTENDANCE':
        return t('Attendance');
      case 'SPONSORSHIP':
        return t('Sponsorship');
      case 'LOGS':
        return t('Audit Logs');
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg)] text-[var(--text)] font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpenMobile && (
        <div
          onClick={() => setSidebarOpenMobile(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* LEFT SIDEBAR - Expanded (w-64) or Collapsed Rail (w-[72px]) Glassmorphism */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 h-screen backdrop-blur-2xl bg-white/70 dark:bg-[#1D1C17]/80 border-r border-white/60 dark:border-white/10 shadow-[4px_0_30px_rgba(59,36,24,0.05)] dark:shadow-[4px_0_30px_rgba(0,0,0,0.4)] flex flex-col justify-between transition-all shrink-0 overflow-visible ${
          sidebarOpenMobile ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${sidebarOpen ? 'lg:w-64' : 'lg:w-[72px]'}`}
      >
        {sidebarOpen ? (
          /* EXPANDED FULL GLASS SIDEBAR VIEW */
          <div className="w-64 flex flex-col justify-between h-full">
            <div className="p-4 space-y-4">
              {/* Top Logo & Collapse Toggle (like in reference pic) */}
              <div className="flex items-center justify-between px-1 pt-1">
                <Link to="/home" className="flex items-center gap-2.5 group">
                  <div className="w-8 h-8 rounded-[8px] bg-[var(--primary)] text-[var(--primary-contrast)] flex items-center justify-center shadow-[0_2px_8px_rgba(59,36,24,0.15)]">
                    <Bookmark className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div>
                    <span className="font-heading font-semibold text-base tracking-tight text-[var(--text)] block leading-tight">
                      ClubVerse
                    </span>
                    <span className="block text-[9px] font-mono uppercase tracking-wider text-[var(--muted)]">
                      {isBn ? 'আইআইইউসি অ্যাডমিন' : 'IIUC Admin'}
                    </span>
                  </div>
                </Link>

                {/* Mobile close button */}
                <button
                  type="button"
                  onClick={() => setSidebarOpenMobile(false)}
                  className="lg:hidden text-[var(--muted)] hover:text-[var(--text)] p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>

                {/* Desktop Glass Collapse Toggle (< Button) */}
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="hidden lg:flex w-6 h-6 rounded-full bg-white/80 hover:bg-white dark:bg-white/10 dark:hover:bg-white/20 border border-white/80 dark:border-white/10 shadow-xs items-center justify-center text-[var(--muted)] hover:text-[var(--text)] transition-all cursor-pointer"
                  title="Collapse sidebar"
                >
                  <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1 pt-2">
                {/* Dashboard */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('DASHBOARD');
                    setSidebarOpenMobile(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-xs font-medium transition-all cursor-pointer ${
                    activeTab === 'DASHBOARD'
                      ? 'bg-white dark:bg-white/15 text-[var(--primary)] font-semibold shadow-[0_4px_14px_rgba(59,36,24,0.07)] dark:shadow-none border border-white/90 dark:border-white/10'
                      : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/50 dark:hover:bg-white/5'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" strokeWidth={1.5} />
                  <span>{t('Dashboard')}</span>
                </button>

                {/* Workspace with Submenu */}
                <div>
                  <button
                    type="button"
                    onClick={() => setWorkspaceOpen(!workspaceOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-[10px] text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/50 dark:hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Folder className="w-4 h-4" strokeWidth={1.5} />
                      <span>{t('Workspace')}</span>
                    </div>
                    {workspaceOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-[var(--muted)]" strokeWidth={1.5} />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-[var(--muted)]" strokeWidth={1.5} />
                    )}
                  </button>

                  {workspaceOpen && (
                    <div className="pl-5 pr-1 py-1 space-y-0.5 border-l border-white/60 dark:border-white/10 ml-4 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('EVENTS_WORKSHOPS');
                          setSidebarOpenMobile(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[8px] text-xs transition-all cursor-pointer ${
                          activeTab === 'EVENTS_WORKSHOPS'
                            ? 'bg-white dark:bg-white/15 text-[var(--primary)] font-semibold shadow-[0_2px_8px_rgba(59,36,24,0.06)] dark:shadow-none border border-white/90 dark:border-white/10'
                            : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/40 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Compass className="w-3.5 h-3.5" strokeWidth={1.5} />
                          <span>{t('Events & Workshops')}</span>
                        </div>
                        {pendingEvents.length > 0 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-[4px] bg-[var(--status-pending-bg)] text-[var(--status-pending-text)]">
                            {pendingEvents.length}
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('CLUBS_RANKINGS');
                          setSidebarOpenMobile(false);
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[8px] text-xs transition-all cursor-pointer ${
                          activeTab === 'CLUBS_RANKINGS'
                            ? 'bg-white dark:bg-white/15 text-[var(--primary)] font-semibold shadow-[0_2px_8px_rgba(59,36,24,0.06)] dark:shadow-none border border-white/90 dark:border-white/10'
                            : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/40 dark:hover:bg-white/5'
                        }`}
                      >
                        <Trophy className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>{t('Clubs & Rankings')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('ATTENDANCE');
                          setSidebarOpenMobile(false);
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[8px] text-xs transition-all cursor-pointer ${
                          activeTab === 'ATTENDANCE'
                            ? 'bg-white dark:bg-white/15 text-[var(--primary)] font-semibold shadow-[0_2px_8px_rgba(59,36,24,0.06)] dark:shadow-none border border-white/90 dark:border-white/10'
                            : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/40 dark:hover:bg-white/5'
                        }`}
                      >
                        <CheckCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>{t('Attendance')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('SPONSORSHIP');
                          setSidebarOpenMobile(false);
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[8px] text-xs transition-all cursor-pointer ${
                          activeTab === 'SPONSORSHIP'
                            ? 'bg-white dark:bg-white/15 text-[var(--primary)] font-semibold shadow-[0_2px_8px_rgba(59,36,24,0.06)] dark:shadow-none border border-white/90 dark:border-white/10'
                            : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/40 dark:hover:bg-white/5'
                        }`}
                      >
                        <DollarSign className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>{t('Sponsorship')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('LOGS');
                          setSidebarOpenMobile(false);
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[8px] text-xs transition-all cursor-pointer ${
                          activeTab === 'LOGS'
                            ? 'bg-white dark:bg-white/15 text-[var(--primary)] font-semibold shadow-[0_2px_8px_rgba(59,36,24,0.06)] dark:shadow-none border border-white/90 dark:border-white/10'
                            : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/40 dark:hover:bg-white/5'
                        }`}
                      >
                        <Activity className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>{t('Audit Logs')}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Profile */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('PROFILE');
                    setSidebarOpenMobile(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-xs font-medium transition-all cursor-pointer ${
                    activeTab === 'PROFILE'
                      ? 'bg-white dark:bg-white/15 text-[var(--primary)] font-semibold shadow-[0_4px_14px_rgba(59,36,24,0.07)] dark:shadow-none border border-white/90 dark:border-white/10'
                      : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/50 dark:hover:bg-white/5'
                  }`}
                >
                  <UserIcon className="w-4 h-4" strokeWidth={1.5} />
                  <span>{t('Profile')}</span>
                </button>
              </nav>
            </div>

            {/* Bottom Glass User Profile & Actions (matching bottom of reference pic) */}
            <div className="p-3 border-t border-white/60 dark:border-white/10 space-y-2">
              {/* User Profile Card */}
              <div className="p-2 rounded-[10px] bg-white/50 dark:bg-white/5 border border-white/70 dark:border-white/10 shadow-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-[var(--primary)] text-[var(--primary-contrast)] font-mono text-[11px] font-semibold flex items-center justify-center shrink-0 shadow-xs">
                    AD
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-[11px] font-semibold text-[var(--text)] truncate leading-tight">
                      {user?.fullName || 'Administrator'}
                    </p>
                    <p className="text-[9px] font-mono text-[var(--muted)] truncate">
                      {user?.email || 'admin@test.com'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="w-6 h-6 rounded-[6px] hover:bg-white/80 dark:hover:bg-white/10 text-[#9B3A2D] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>

              {/* Public Portal Link */}
              <Link
                to="/home"
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] rounded-[8px] hover:bg-white/50 dark:hover:bg-white/5 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{t('Campus Portal')}</span>
              </Link>
            </div>
          </div>
        ) : (
          /* COLLAPSED MINI-RAIL GLASS VIEW */
          <div className="w-[72px] flex flex-col justify-between h-full py-3 items-center">
            {/* Top Logo & Expand button */}
            <div className="pt-1 flex flex-col items-center gap-2">
              <Link
                to="/home"
                className="w-8 h-8 rounded-[8px] bg-[var(--primary)] text-[var(--primary-contrast)] flex items-center justify-center shadow-[0_2px_8px_rgba(59,36,24,0.15)]"
                title="ClubVerse IIUC Admin"
              >
                <Bookmark className="w-4 h-4" strokeWidth={1.5} />
              </Link>

              {/* Expand Toggle button */}
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="w-6 h-6 rounded-full bg-white/80 hover:bg-white dark:bg-white/10 dark:hover:bg-white/20 border border-white/80 dark:border-white/10 shadow-xs flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] transition-all cursor-pointer"
                title="Expand sidebar"
              >
                <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Nav Icons Rail with Glass Tooltips */}
            <nav className="space-y-2 pt-2 w-full flex flex-col items-center">
              {/* Dashboard Icon */}
              <div className="relative group flex justify-center w-full">
                <button
                  type="button"
                  onClick={() => setActiveTab('DASHBOARD')}
                  className={`w-9 h-9 rounded-[10px] flex items-center justify-center transition-all cursor-pointer ${
                    activeTab === 'DASHBOARD'
                      ? 'bg-white dark:bg-white/15 text-[var(--primary)] shadow-[0_4px_14px_rgba(59,36,24,0.08)] border border-white/90 dark:border-white/10'
                      : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/50 dark:hover:bg-white/5'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex items-center pointer-events-none">
                  <span className="backdrop-blur-md bg-white/95 dark:bg-[#1D1C17]/95 text-[var(--text)] text-xs font-mono px-2.5 py-1 rounded-[6px] border border-white/80 dark:border-white/10 shadow-md whitespace-nowrap">
                    {t('Dashboard')}
                  </span>
                </div>
              </div>

              {/* Workspace Folder Icon */}
              <div className="relative group flex justify-center w-full">
                <button
                  type="button"
                  onClick={() => {
                    if (!isWorkspaceTab) setActiveTab('EVENTS_WORKSHOPS');
                  }}
                  className={`w-9 h-9 rounded-[10px] flex items-center justify-center transition-all cursor-pointer relative ${
                    isWorkspaceTab
                      ? 'bg-white dark:bg-white/15 text-[var(--primary)] shadow-[0_4px_14px_rgba(59,36,24,0.08)] border border-white/90 dark:border-white/10'
                      : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/50 dark:hover:bg-white/5'
                  }`}
                >
                  <Folder className="w-4 h-4" strokeWidth={1.5} />
                  {pendingEvents.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--highlight)]" />
                  )}
                </button>
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex items-center pointer-events-none">
                  <span className="backdrop-blur-md bg-white/95 dark:bg-[#1D1C17]/95 text-[var(--text)] text-xs font-mono px-2.5 py-1 rounded-[6px] border border-white/80 dark:border-white/10 shadow-md whitespace-nowrap">
                    {t('Workspace')}
                  </span>
                </div>
              </div>

              {/* Profile Icon */}
              <div className="relative group flex justify-center w-full">
                <button
                  type="button"
                  onClick={() => setActiveTab('PROFILE')}
                  className={`w-9 h-9 rounded-[10px] flex items-center justify-center transition-all cursor-pointer ${
                    activeTab === 'PROFILE'
                      ? 'bg-white dark:bg-white/15 text-[var(--primary)] shadow-[0_4px_14px_rgba(59,36,24,0.08)] border border-white/90 dark:border-white/10'
                      : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/50 dark:hover:bg-white/5'
                  }`}
                >
                  <UserIcon className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex items-center pointer-events-none">
                  <span className="backdrop-blur-md bg-white/95 dark:bg-[#1D1C17]/95 text-[var(--text)] text-xs font-mono px-2.5 py-1 rounded-[6px] border border-white/80 dark:border-white/10 shadow-md whitespace-nowrap">
                    {t('Profile')}
                  </span>
                </div>
              </div>
            </nav>

            {/* Bottom Actions */}
            <div className="space-y-1 flex flex-col items-center border-t border-white/60 dark:border-white/10 pt-2 w-full">
              <Link
                to="/home"
                className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/50 dark:hover:bg-white/5 transition-all"
                title="Public Campus Portal"
              >
                <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#9B3A2D] hover:bg-white/50 dark:hover:bg-white/5 cursor-pointer transition-all"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* TOP BAR - Frosted Glass */}
        <header className="sticky top-0 z-30 h-14 backdrop-blur-2xl bg-white/65 dark:bg-[#1D1C17]/75 border-b border-white/60 dark:border-white/10 flex items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            {/* Toggle Sidebar Button */}
            <button
              type="button"
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setSidebarOpenMobile(!sidebarOpenMobile);
                } else {
                  setSidebarOpen(!sidebarOpen);
                }
              }}
              className="w-8 h-8 rounded-[8px] border border-white/70 dark:border-white/10 bg-white/70 dark:bg-white/10 hover:bg-white text-[var(--muted)] hover:text-[var(--text)] flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs"
              title="Toggle sidebar"
            >
              <Menu className="w-4 h-4" strokeWidth={1.5} />
            </button>

            {/* Breadcrumb Header */}
            <div className="flex items-center gap-1.5 text-xs truncate">
              <span className="text-[var(--muted)] font-mono">{t('Admin')}</span>
              <span className="text-[var(--muted)]">/</span>
              <span className="font-medium text-[var(--text)] font-mono">{getBreadcrumb()}</span>
              {isWorkspaceTab && (
                <>
                  <span className="text-[var(--muted)]">/</span>
                  <span className="font-semibold text-[var(--primary)] font-mono truncate">{getActiveTabName()}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Theme & Language Switcher */}
            <ThemeLanguageToggle />

            {/* Admin User Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-white/60 dark:bg-white/10 border border-white/70 dark:border-white/10 text-xs font-mono shrink-0 shadow-xs">
              <span className="text-[var(--primary)] font-semibold">AD</span>
              <span className="text-[var(--muted)]">•</span>
              <span className="text-[var(--text)] truncate max-w-[120px] sm:max-w-none">
                {user?.email || 'admin@test.com'}
              </span>
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT BODY - Left aligned, max width ~1100px */}
        <main className="flex-1 p-4 sm:p-6 space-y-6 max-w-[1100px] w-full">
          {/* Workspace Sub-Navigation Toolbar (Shown when inside a Workspace tab) */}
          {isWorkspaceTab && (
            <div className="flex items-center gap-1.5 p-1 backdrop-blur-md bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-[10px] shadow-[0_2px_12px_rgba(59,36,24,0.04)] overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('EVENTS_WORKSHOPS')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  activeTab === 'EVENTS_WORKSHOPS'
                    ? 'bg-white dark:bg-white/15 text-[var(--primary)] font-semibold shadow-[0_2px_8px_rgba(59,36,24,0.06)] border border-white/90 dark:border-white/10'
                    : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/50 dark:hover:bg-white/5'
                }`}
              >
                <Compass className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{t('Events & Workshops')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('CLUBS_RANKINGS')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  activeTab === 'CLUBS_RANKINGS'
                    ? 'bg-white dark:bg-white/15 text-[var(--primary)] font-semibold shadow-[0_2px_8px_rgba(59,36,24,0.06)] border border-white/90 dark:border-white/10'
                    : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/50 dark:hover:bg-white/5'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{t('Clubs & Rankings')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ATTENDANCE')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  activeTab === 'ATTENDANCE'
                    ? 'bg-white dark:bg-white/15 text-[var(--primary)] font-semibold shadow-[0_2px_8px_rgba(59,36,24,0.06)] border border-white/90 dark:border-white/10'
                    : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/50 dark:hover:bg-white/5'
                }`}
              >
                <CheckCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{t('Attendance')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('SPONSORSHIP')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  activeTab === 'SPONSORSHIP'
                    ? 'bg-white dark:bg-white/15 text-[var(--primary)] font-semibold shadow-[0_2px_8px_rgba(59,36,24,0.06)] border border-white/90 dark:border-white/10'
                    : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/50 dark:hover:bg-white/5'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{t('Sponsorship')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('LOGS')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  activeTab === 'LOGS'
                    ? 'bg-white dark:bg-white/15 text-[var(--primary)] font-semibold shadow-[0_2px_8px_rgba(59,36,24,0.06)] border border-white/90 dark:border-white/10'
                    : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/50 dark:hover:bg-white/5'
                }`}
              >
                <Activity className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{t('Audit Logs')}</span>
              </button>
            </div>
          )}
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="font-heading font-semibold text-xl sm:text-2xl text-[var(--text)] tracking-tight">
                {t('Admin Dashboard')}
              </h1>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                {t('Monitor platform activity and manage your workspace.')}
              </p>
            </div>

            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing || loading}
              className="btn-secondary text-xs py-1.5 px-3 self-start sm:self-auto cursor-pointer disabled:opacity-60"
              title={isBn ? "ড্যাশবোর্ড রিফ্রেশ করুন" : "Refresh dashboard"}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || loading ? 'animate-spin text-[var(--primary)]' : ''}`} strokeWidth={1.5} />
              <span>{isRefreshing ? (isBn ? 'রিফ্রেশ হচ্ছে...' : 'Refreshing...') : t('Refresh')}</span>
            </button>
          </div>

          {/* TAB VIEW 1: DASHBOARD OVERVIEW */}
          {activeTab === 'DASHBOARD' && (
            <div className="space-y-6">
              {/* 4 Metric Cards - Dense, 6px radius, with suitable bluish shadow */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-[var(--surface)] p-3.5 rounded-[6px] border border-[var(--border)] card-blue-shadow flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text)] flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-mono text-xl font-semibold text-[var(--text)]">
                      {stats?.totalEvents ?? events.length}
                    </p>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">
                      {t('Campus Events')}
                    </span>
                  </div>
                </div>

                <div className="bg-[var(--surface)] p-3.5 rounded-[6px] border border-[var(--border)] card-blue-shadow flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text)] flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-mono text-xl font-semibold text-[var(--text)]">
                      {stats?.totalRegistrations ?? 1240}
                    </p>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">
                      {t('Issued Passes')}
                    </span>
                  </div>
                </div>

                <div className="bg-[var(--surface)] p-3.5 rounded-[6px] border border-[var(--border)] card-blue-shadow flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text)] flex items-center justify-center shrink-0">
                    <DollarSign className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-mono text-xl font-semibold text-[var(--text)]">
                      ${(stats?.totalSponsorship ? Number(stats.totalSponsorship) : 325000).toLocaleString()}
                    </p>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">
                      {t('Raised Funds')}
                    </span>
                  </div>
                </div>

                <div className="bg-[var(--surface)] p-3.5 rounded-[6px] border border-[var(--border)] card-blue-shadow flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text)] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-mono text-xl font-semibold text-[var(--text)]">
                      {pendingEvents.length}
                    </p>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">
                      {t('Pending Approvals')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Two Column Split: Pending Approvals Queue & Live Audit Logs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Pending Approvals Queue */}
                <div className="bg-[var(--surface)] rounded-[6px] border border-[var(--border)] card-blue-shadow-static p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[var(--highlight)]" strokeWidth={1.5} />
                      <h3 className="font-heading font-semibold text-xs text-[var(--text)] uppercase tracking-wider">
                        {t('Pending Event Approvals Queue')}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('EVENTS_WORKSHOPS')}
                      className="text-xs text-[var(--primary)] hover:underline font-mono"
                    >
                      {isBn ? `সবগুলো (${pendingEvents.length})` : `View all (${pendingEvents.length})`}
                    </button>
                  </div>

                  {pendingEvents.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[var(--muted)] space-y-1">
                      <CheckCircle className="w-6 h-6 text-[#2F6B4F] dark:text-[#7CC09E] mx-auto" strokeWidth={1.5} />
                      <p className="font-medium text-[var(--text)]">{t('All events moderated!')}</p>
                      <p>{t('No proposals currently awaiting review.')}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pendingEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className="p-2.5 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0">
                            <h4 className="font-medium text-[var(--text)] truncate">
                              {event.title}
                            </h4>
                            <p className="text-[var(--muted)] text-[11px] truncate">
                              {t(event.club?.clubName || '')} • {event.eventType}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(event.id, 'APPROVED')}
                              className="px-2.5 py-1 rounded-[4px] bg-[var(--primary)] text-[var(--primary-contrast)] font-medium text-[11px] btn-approve-hover cursor-pointer"
                            >
                              {t('Approve')}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(event.id, 'REJECTED')}
                              className="px-2.5 py-1 rounded-[4px] bg-[var(--surface)] border border-[var(--border)] text-[#9B3A2D] font-medium text-[11px] btn-reject-hover cursor-pointer"
                            >
                              {t('Reject')}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Audit Activity */}
                <div className="bg-[var(--surface)] rounded-[6px] border border-[var(--border)] card-blue-shadow-static p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[var(--muted)]" strokeWidth={1.5} />
                      <h3 className="font-heading font-semibold text-xs text-[var(--text)] uppercase tracking-wider">
                        {t('Platform Audit Activity')}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('LOGS')}
                      className="text-xs text-[var(--primary)] hover:underline font-mono"
                    >
                      {t('View full log')}
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {auditLogs.slice(0, 5).map((log) => (
                      <div
                        key={log.id}
                        className="p-2 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0" />
                          <span className="font-mono text-xs text-[var(--text)] truncate">
                            {log.action}
                          </span>
                        </div>
                        <span className="text-[10px] text-[var(--muted)] font-mono shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Annual Rankings Preview Table */}
              <div className="bg-[var(--surface)] rounded-[6px] border border-[var(--border)] card-blue-shadow-static p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[var(--highlight)]" strokeWidth={1.5} />
                    <h3 className="font-heading font-semibold text-sm text-[var(--text)]">
                      {t('IIUC 3-Factor Normalization Algorithm')}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[var(--muted)]">
                    35% Events + 35% Sponsorship + 30% Feedback
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="dense-table">
                    <thead>
                      <tr>
                        <th>{t('Rank')}</th>
                        <th>{t('Club Name')}</th>
                        <th>{t('Events Score')}</th>
                        <th>{t('Sponsorship')}</th>
                        <th>{t('Feedback')}</th>
                        <th>{t('Final Score')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rankings.slice(0, 4).map((r) => (
                        <tr key={r.id}>
                          <td className="font-mono font-medium text-[var(--text)]">
                            #{r.rankPosition}
                          </td>
                          <td className="font-medium text-[var(--text)]">
                            {t(r.club?.clubName || r.clubName || '')}
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
                            {Number(r.finalScore).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB VIEW 2: EVENTS & WORKSHOPS CONSOLE */}
          {activeTab === 'EVENTS_WORKSHOPS' && (
            <div className="space-y-4">
              <div className="bg-[var(--surface)] p-4 rounded-[6px] border border-[var(--border)] card-blue-shadow-static space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-heading font-semibold text-base text-[var(--text)]">
                      {t('Events & Workshops Console')}
                    </h3>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      {t('Manage, moderate, and monitor campus events and hands-on workshops.')}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-1 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] text-xs font-mono text-[var(--text)]">
                      {isBn ? `${events.length}টি মোট ইভেন্ট` : `${events.length} Total Events`}
                    </span>
                    <span className="px-2 py-1 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] text-xs font-mono text-[var(--text)]">
                      {isBn ? `${workshopCount}টি ওয়ার্কশপ` : `${workshopCount} Workshops`}
                    </span>
                  </div>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-3.5 h-3.5 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                    <input
                      type="text"
                      placeholder={t('Search by event title or club...')}
                      value={eventSearch}
                      onChange={(e) => setEventSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs text-[var(--text)] placeholder:text-[var(--muted)]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-1">
                    {[
                      { key: 'ALL', label: isBn ? `সকল (${events.length})` : `All (${events.length})` },
                      { key: 'WORKSHOP', label: isBn ? `ওয়ার্কশপ (${workshopCount})` : `Workshops (${workshopCount})` },
                      { key: 'PENDING', label: isBn ? `অপেক্ষমান (${pendingEvents.length})` : `Pending (${pendingEvents.length})` },
                      { key: 'APPROVED', label: t('Approved') },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setEventFilter(tab.key as any)}
                        className={`px-2.5 py-1 rounded-[4px] text-xs font-mono transition-colors cursor-pointer ${
                          eventFilter === tab.key
                            ? 'bg-[var(--primary)] text-[var(--primary-contrast)] font-medium'
                            : 'bg-[var(--surface-alt)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Events Dense Table */}
                <div className="overflow-x-auto">
                  <table className="dense-table">
                    <thead>
                      <tr>
                        <th>{t('Event Title')}</th>
                        <th>{t('Club')}</th>
                        <th>{t('Type')}</th>
                        <th>{t('Date')}</th>
                        <th>{t('Status')}</th>
                        <th className="text-right">{t('Actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEvents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-6 text-[var(--muted)]">
                            {t('No events matching criteria.')}
                          </td>
                        </tr>
                      ) : (
                        filteredEvents.map((ev) => (
                          <tr key={ev.id}>
                            <td className="font-medium text-[var(--text)] max-w-xs truncate">
                              {ev.title}
                            </td>
                            <td className="text-[var(--muted)]">{ev.club?.clubName}</td>
                            <td><TypeBadge type={ev.eventType} /></td>
                            <td className="font-mono text-[var(--muted)]">
                              {new Date(ev.startTime).toLocaleDateString()}
                            </td>
                            <td><StatusBadge status={ev.status} /></td>
                            <td className="text-right">
                              <div className="inline-flex items-center gap-1.5">
                                {ev.status !== 'APPROVED' && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateStatus(ev.id, 'APPROVED')}
                                    className="px-2.5 py-1 rounded-[4px] bg-[var(--primary)] text-[var(--primary-contrast)] text-xs font-medium btn-approve-hover cursor-pointer"
                                  >
                                    {t('Approve')}
                                  </button>
                                )}
                                {ev.status !== 'REJECTED' && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateStatus(ev.id, 'REJECTED')}
                                    className="px-2.5 py-1 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] text-[#9B3A2D] text-xs font-medium btn-reject-hover cursor-pointer"
                                  >
                                    {t('Reject')}
                                  </button>
                                )}
                                {ev.status === 'APPROVED' && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateStatus(ev.id, 'COMPLETED')}
                                    className="px-2 py-0.5 rounded-[4px] btn-secondary text-xs cursor-pointer"
                                  >
                                    {t('Complete')}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB VIEW 3: ATTENDANCE & PASS CHECK-IN */}
          {activeTab === 'ATTENDANCE' && (
            <div className="space-y-4">
              <div className="bg-[var(--surface)] p-4 rounded-[6px] border border-[var(--border)] card-blue-shadow-static space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-heading font-semibold text-base text-[var(--text)]">
                      {t('Venue Check-In & Certificate Issue')}
                    </h3>
                    <p className="text-xs text-[var(--muted)]">
                      {t('Select event to mark attendee passes and unlock certificates.')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                      className="px-2.5 py-1.5 text-xs font-mono"
                    >
                      {events.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.title}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleGenerateCertificate}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      <Award className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>{t('Issue Certs')}</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] text-xs text-[var(--muted)] flex items-center justify-between font-mono">
                  <span>
                    {t('Selected Event:')} <strong className="text-[var(--text)]">{selectedEvent?.title}</strong>
                  </span>
                  <span>
                    {t('Total Registered:')} <strong className="text-[var(--text)]">{selectedEvent?._count?.registrations ?? 0}</strong>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB VIEW 4: SPONSORSHIP LEDGER */}
          {activeTab === 'SPONSORSHIP' && (
            <div className="space-y-4">
              <div className="bg-[var(--surface)] p-4 rounded-[6px] border border-[var(--border)] card-blue-shadow-static space-y-4">
                <h3 className="font-heading font-semibold text-base text-[var(--text)]">
                  {t('Record Corporate Sponsorship')}
                </h3>

                <form onSubmit={handleRecordSponsorship} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text)] mb-1">
                      {t('Target Event')}
                    </label>
                    <select
                      value={sponsorForm.eventId}
                      onChange={(e) => setFormSafe(setSponsorForm, 'eventId', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs"
                    >
                      <option value="">{t('Select Event...')}</option>
                      {events.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text)] mb-1">
                      {t('Sponsor Organization')}
                    </label>
                    <select
                      value={sponsorForm.sponsorId}
                      onChange={(e) => setFormSafe(setSponsorForm, 'sponsorId', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs"
                    >
                      <option value="">{t('Select Sponsor...')}</option>
                      {sponsors.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.companyName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text)] mb-1">
                      {t('Amount Funded ($)')}
                    </label>
                    <input
                      type="number"
                      value={sponsorForm.amountFunded}
                      onChange={(e) => setFormSafe(setSponsorForm, 'amountFunded', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text)] mb-1">
                      {t('Tier')}
                    </label>
                    <select
                      value={sponsorForm.sponsorshipTier}
                      onChange={(e) => setFormSafe(setSponsorForm, 'sponsorshipTier', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono"
                    >
                      <option value="PLATINUM">{t('Platinum Tier')}</option>
                      <option value="GOLD">{t('Gold Tier')}</option>
                      <option value="SILVER">{t('Silver Tier')}</option>
                      <option value="BRONZE">{t('Bronze Tier')}</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 pt-1">
                    <button
                      type="submit"
                      className="btn-primary text-xs py-1.5 px-4"
                    >
                      {t('Record Funds to Ledger')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB VIEW 5: CLUBS & RANKINGS */}
          {activeTab === 'CLUBS_RANKINGS' && (
            <div className="space-y-4">
              <div className="bg-[var(--surface)] p-4 rounded-[6px] border border-[var(--border)] card-blue-shadow-static space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-heading font-semibold text-base text-[var(--text)]">
                      {t('IIUC 3-Factor Normalization Algorithm')}
                    </h3>
                    <p className="text-xs text-[var(--muted)] font-mono mt-0.5">
                      35% Events + 35% Sponsorship + 30% Student Feedback
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={rankingYear}
                      onChange={(e) => setRankingYear(Number(e.target.value))}
                      className="px-2.5 py-1.5 text-xs font-mono"
                    >
                      <option value={2026}>{isBn ? '২০২৬ সাল' : 'Year 2026'}</option>
                      <option value={2025}>{isBn ? '২০২৫ সাল' : 'Year 2025'}</option>
                    </select>

                    <button
                      type="button"
                      onClick={handleGenerateRanking}
                      disabled={generatingRankings}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>{generatingRankings ? t('Computing...') : t('Generate Rankings')}</span>
                    </button>
                  </div>
                </div>

                {/* Rankings Dense Table */}
                {rankings.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="dense-table">
                      <thead>
                        <tr>
                          <th>{t('Rank')}</th>
                          <th>{t('Club Name')}</th>
                          <th>{t('Events Score')}</th>
                          <th>{t('Sponsorship')}</th>
                          <th>{t('Feedback')}</th>
                          <th>{t('Final Score')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rankings.map((r) => (
                          <tr key={r.id}>
                            <td className="font-mono font-medium text-[var(--text)]">
                              #{r.rankPosition}
                            </td>
                            <td className="font-medium text-[var(--text)]">
                              {t(r.club?.clubName || r.clubName || '')}
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
                              {Number(r.finalScore).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Campus Clubs Directory */}
              <div className="bg-[var(--surface)] p-4 rounded-[6px] border border-[var(--border)] card-blue-shadow-static space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[var(--muted)]" strokeWidth={1.5} />
                    <h3 className="font-heading font-semibold text-sm text-[var(--text)]">
                      {t('Registered Campus Clubs Directory')}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[var(--muted)]">
                    {isBn ? `${clubs.length}টি ক্লাব নিবন্ধিত` : `${clubs.length} Clubs Registered`}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {clubs.map((club) => (
                    <div
                      key={club.id}
                      className="p-3 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-xs text-[var(--text)] truncate">
                          {t(club.clubName)}
                        </h4>
                        {club.establishedYear && (
                          <span className="text-[10px] font-mono text-[var(--muted)]">
                            {isBn ? `প্রতিষ্ঠিত ${club.establishedYear}` : `Est. ${club.establishedYear}`}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--muted)] line-clamp-2">
                        {club.description || t('No description provided.')}
                      </p>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[var(--border)] text-[var(--muted)] font-mono">
                        <span>{club.department?.departmentName || 'General'}</span>
                        <span className="text-[var(--primary)] font-medium">
                          {isBn ? `${club._count?.events || 0}টি ইভেন্ট` : `${club._count?.events || 0} events`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB VIEW 6: AUDIT LOGS */}
          {activeTab === 'LOGS' && (
            <div className="space-y-4">
              <div className="bg-[var(--surface)] p-4 rounded-[6px] border border-[var(--border)] card-blue-shadow-static space-y-3">
                <h3 className="font-heading font-semibold text-base text-[var(--text)]">
                  {t('Platform Security & Audit Trail')}
                </h3>

                <div className="overflow-x-auto">
                  <table className="dense-table">
                    <thead>
                      <tr>
                        <th>{t('Action')}</th>
                        <th>{t('User')}</th>
                        <th className="text-right">{t('Timestamp')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="font-mono text-xs text-[var(--primary)] font-medium">
                            {log.action}
                          </td>
                          <td className="font-mono text-xs text-[var(--muted)]">
                            {isBn ? 'ব্যবহারকারী #' : 'User #'}{log.userId ?? 'SYSTEM'}
                          </td>
                          <td className="font-mono text-xs text-[var(--muted)] text-right">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB VIEW 7: PROFILE */}
          {activeTab === 'PROFILE' && (
            <div className="max-w-xl bg-[var(--surface)] p-5 rounded-[6px] border border-[var(--border)] card-blue-shadow-static space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[6px] bg-[var(--primary)] text-[var(--primary-contrast)] font-mono font-semibold text-sm flex items-center justify-center">
                  AD
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-base text-[var(--text)]">
                    {user?.fullName || t('System Administrator')}
                  </h3>
                  <p className="text-xs font-mono uppercase text-[var(--muted)]">
                    {isBn ? 'রোল' : 'Role'}: {user?.role || 'ADMIN'}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-[var(--border)] text-xs">
                <div className="flex justify-between py-1 border-b border-[var(--border)]">
                  <span className="text-[var(--muted)]">{t('Email Address')}</span>
                  <span className="font-mono font-medium text-[var(--text)]">{user?.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--border)]">
                  <span className="text-[var(--muted)]">{t('Matric / Admin ID')}</span>
                  <span className="font-mono font-medium text-[var(--text)]">{user?.studentId || 'ADMIN-001'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[var(--muted)]">{t('Department')}</span>
                  <span className="font-medium text-[var(--text)]">
                    {user?.department?.departmentName || (isBn ? 'কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং' : 'Computer Science & Engineering')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Helper to update form safely
function setFormSafe<T>(setter: React.Dispatch<React.SetStateAction<T>>, key: keyof T, val: any) {
  setter((prev) => ({ ...prev, [key]: val }));
}
