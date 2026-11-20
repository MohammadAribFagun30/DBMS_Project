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
  CheckCheck,
  ExternalLink,
  LogOut,
  Building2,
  SlidersHorizontal,
  Layers,
  Menu,
  X,
  Compass,
  Settings,
  PanelLeftClose,
  PanelLeftOpen
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
      // Ensure visible feedback with smooth minimum duration
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
      toast.success('Attendance confirmed! Certificate unlocked.');
      loadAll();
    } catch (err: any) {
      toast.error(err.message || 'Attendance action failed');
    }
  };

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

  const handleSignOut = () => {
    logout();
    navigate('/login');
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

  // Tab Breadcrumb text
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

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#08090e] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpenMobile && (
        <div
          onClick={() => setSidebarOpenMobile(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* LEFT SIDEBAR - Supports both Expanded (w-64) and Collapsed Rail (w-[72px]) with Hover Tooltips */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 h-screen bg-white dark:bg-[#0a0b12] border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 overflow-visible ${
          sidebarOpenMobile ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${sidebarOpen ? 'lg:w-64' : 'lg:w-[72px]'}`}
      >
        {sidebarOpen ? (
          /* EXPANDED FULL SIDEBAR VIEW */
          <div className="w-64 flex flex-col justify-between h-full">
            <div className="p-4 space-y-6">
              {/* Top Logo - Project Branding */}
              <div className="flex items-center justify-between px-2 pt-2">
                <Link to="/home" className="flex items-center gap-2.5 group">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 dark:from-white dark:via-indigo-100 dark:to-indigo-300 bg-clip-text text-transparent">
                      ClubVerse
                    </span>
                    <span className="block text-[9px] uppercase font-bold tracking-widest text-indigo-600 dark:text-indigo-400 -mt-1">
                      {isBn ? 'আইআইইউসি অ্যাডমিন' : 'IIUC Admin'}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => setSidebarOpenMobile(false)}
                  className="lg:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1.5 pt-2">
                {/* Dashboard */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('DASHBOARD');
                    setSidebarOpenMobile(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${activeTab === 'DASHBOARD'
                    ? 'bg-indigo-50 dark:bg-[#1e1c36] text-indigo-600 dark:text-[#8576ff] border border-indigo-200/80 dark:border-transparent'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span>{t('Dashboard')}</span>
                </button>

                {/* Workspace with Submenu */}
                <div>
                  <button
                    type="button"
                    onClick={() => setWorkspaceOpen(!workspaceOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Folder className="w-4 h-4" />
                      <span>{t('Workspace')}</span>
                    </div>
                    {workspaceOpen ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Workspace Submenu Items */}
                  {workspaceOpen && (
                    <div className="pl-6 pt-1 space-y-1 border-l border-slate-200 dark:border-slate-800 ml-4 my-1">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('EVENTS_WORKSHOPS');
                          setSidebarOpenMobile(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === 'EVENTS_WORKSHOPS'
                          ? 'text-indigo-600 dark:text-[#8576ff] bg-indigo-50 dark:bg-[#1e1c36]/70 font-semibold border border-indigo-200/60 dark:border-transparent'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/30'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <Compass className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                          <span>{t('Events & Workshops')}</span>
                        </div>
                        {pendingEvents.length > 0 && (
                          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 text-[10px] font-bold flex items-center justify-center">
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
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === 'CLUBS_RANKINGS'
                          ? 'text-indigo-600 dark:text-[#8576ff] bg-indigo-50 dark:bg-[#1e1c36]/70 font-semibold border border-indigo-200/60 dark:border-transparent'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/30'
                          }`}
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                        <span>{t('Clubs & Rankings')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('ATTENDANCE');
                          setSidebarOpenMobile(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === 'ATTENDANCE'
                          ? 'text-indigo-600 dark:text-[#8576ff] bg-indigo-50 dark:bg-[#1e1c36]/70 font-semibold border border-indigo-200/60 dark:border-transparent'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/30'
                          }`}
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>{t('Attendance')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('SPONSORSHIP');
                          setSidebarOpenMobile(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === 'SPONSORSHIP'
                          ? 'text-indigo-600 dark:text-[#8576ff] bg-indigo-50 dark:bg-[#1e1c36]/70 font-semibold border border-indigo-200/60 dark:border-transparent'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/30'
                          }`}
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{t('Sponsorship')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('LOGS');
                          setSidebarOpenMobile(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === 'LOGS'
                          ? 'text-indigo-600 dark:text-[#8576ff] bg-indigo-50 dark:bg-[#1e1c36]/70 font-semibold border border-indigo-200/60 dark:border-transparent'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/30'
                          }`}
                      >
                        <Activity className="w-3.5 h-3.5" />
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
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${activeTab === 'PROFILE'
                    ? 'bg-indigo-50 dark:bg-[#1e1c36] text-indigo-600 dark:text-[#8576ff] font-semibold border border-indigo-200/80 dark:border-transparent'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span>{t('Profile')}</span>
                </button>
              </nav>
            </div>

            {/* Sidebar Footer actions */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <Link
                to="/home"
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{t('Public Campus Portal')}</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('Sign Out')}</span>
              </button>
            </div>
          </div>
        ) : (
          /* COLLAPSED MINI-RAIL VIEW (Matches User's Screenshots Exactly) */
          <div className="w-[72px] flex flex-col justify-between h-full py-4 items-center">
            {/* Top Centered Logo */}
            <div className="pt-2">
              <Link
                to="/home"
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 hover:scale-105 transition-transform"
                title="ClubVerse IIUC Admin"
              >
                <Sparkles className="w-5 h-5" />
              </Link>
            </div>

            {/* Nav Icons Rail with Speech-Bubble Tooltips */}
            <nav className="space-y-4 pt-6 w-full flex flex-col items-center">
              {/* Dashboard Icon */}
              <div className="relative group flex justify-center w-full">
                <button
                  type="button"
                  onClick={() => setActiveTab('DASHBOARD')}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    activeTab === 'DASHBOARD'
                      ? 'bg-indigo-50 dark:bg-[#1e1c36] text-indigo-600 dark:text-[#8576ff] shadow-xs ring-1 ring-indigo-200/80 dark:ring-indigo-500/40'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>

                {/* Speech Bubble Tooltip - Bluish in Light Mode, Black in Dark Mode */}
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex items-center pointer-events-none drop-shadow-xl">
                  <span className="w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] border-r-blue-600 dark:border-r-slate-900" />
                  <span className="bg-blue-600 dark:bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-blue-500 dark:border-slate-800 shadow-xl whitespace-nowrap tracking-wide">
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
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                    isWorkspaceTab
                      ? 'bg-indigo-50 dark:bg-[#1e1c36] text-indigo-600 dark:text-[#8576ff] shadow-xs ring-1 ring-indigo-200/80 dark:ring-indigo-500/40'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Folder className="w-5 h-5" />
                  {pendingEvents.length > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
                  )}
                </button>

                {/* Speech Bubble Tooltip - Bluish in Light Mode, Black in Dark Mode */}
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex items-center pointer-events-none drop-shadow-xl">
                  <span className="w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] border-r-blue-600 dark:border-r-slate-900" />
                  <span className="bg-blue-600 dark:bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-blue-500 dark:border-slate-800 shadow-xl whitespace-nowrap tracking-wide">
                    {t('Workspace')}
                  </span>
                </div>
              </div>

              {/* Profile Icon */}
              <div className="relative group flex justify-center w-full">
                <button
                  type="button"
                  onClick={() => setActiveTab('PROFILE')}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    activeTab === 'PROFILE'
                      ? 'bg-indigo-50 dark:bg-[#1e1c36] text-indigo-600 dark:text-[#8576ff] shadow-xs ring-1 ring-indigo-200/80 dark:ring-indigo-500/40'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <UserIcon className="w-5 h-5" />
                </button>

                {/* Speech Bubble Tooltip - Bluish in Light Mode, Black in Dark Mode */}
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex items-center pointer-events-none drop-shadow-xl">
                  <span className="w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] border-r-blue-600 dark:border-r-slate-900" />
                  <span className="bg-blue-600 dark:bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-blue-500 dark:border-slate-800 shadow-xl whitespace-nowrap tracking-wide">
                    {t('Profile')}
                  </span>
                </div>
              </div>
            </nav>

            {/* Bottom Actions Rail */}
            <div className="space-y-3 pb-2 w-full flex flex-col items-center">
              {/* Settings / Public Portal */}
              <div className="relative group flex justify-center w-full">
                <Link
                  to="/home"
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </Link>
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex items-center pointer-events-none drop-shadow-xl">
                  <span className="w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] border-r-blue-600 dark:border-r-slate-900" />
                  <span className="bg-blue-600 dark:bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-blue-500 dark:border-slate-800 shadow-xl whitespace-nowrap tracking-wide">
                    {t('Public Campus Portal')}
                  </span>
                </div>
              </div>

              {/* Sign Out */}
              <div className="relative group flex justify-center w-full">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                </button>
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex items-center pointer-events-none">
                  <span className="w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] border-r-rose-600" />
                  <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xl whitespace-nowrap">
                    {t('Sign Out')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP BAR - Exactly styled like User's screenshot */}
        <header className="h-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#090a0f]/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-30 transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpenMobile(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Sidebar Toggle Button (Modern Sleek Square Badge) - Dashboard, Workspace, Profile */}
            <button
              type="button"
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setSidebarOpenMobile((prev) => !prev);
                } else {
                  setSidebarOpen((prev) => !prev);
                }
              }}
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-slate-100/90 dark:bg-[#12131f] border border-slate-200/90 dark:border-slate-800/90 hover:bg-white dark:hover:bg-[#181928] hover:border-indigo-300 dark:hover:border-indigo-500/50 shadow-xs transition-all cursor-pointer group"
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                  sidebarOpen
                    ? 'bg-white dark:bg-slate-800/90 border border-slate-300/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 group-hover:border-indigo-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shadow-2xs'
                    : 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 border border-indigo-500'
                }`}
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                ) : (
                  <PanelLeftOpen className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                )}
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                {getBreadcrumb()}
              </span>
            </button>

            {/* Quick Top Navigation (Only shown when inside Workspace tabs: Events, Rankings, Attendance, Sponsorship, Logs) */}
            {activeTab !== 'DASHBOARD' && activeTab !== 'PROFILE' && (
              <div className="hidden md:flex items-center gap-1.5 ml-4 pl-4 border-l border-slate-200 dark:border-slate-800 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('EVENTS_WORKSHOPS')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${activeTab === 'EVENTS_WORKSHOPS'
                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-600/15 dark:text-indigo-400 dark:border-indigo-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
                    }`}
                >
                  <Compass className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span>{t('Events & Workshops')}</span>
                  {pendingEvents.length > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 text-[10px] font-bold">
                      {pendingEvents.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('CLUBS_RANKINGS')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${activeTab === 'CLUBS_RANKINGS'
                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-600/15 dark:text-indigo-400 dark:border-indigo-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
                    }`}
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  <span>{t('Clubs & Rankings')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('ATTENDANCE')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${activeTab === 'ATTENDANCE'
                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-600/15 dark:text-indigo-400 dark:border-indigo-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
                    }`}
                >
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                  <span>{t('Attendance')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('SPONSORSHIP')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${activeTab === 'SPONSORSHIP'
                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-600/15 dark:text-indigo-400 dark:border-indigo-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
                    }`}
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t('Sponsorship')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('LOGS')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${activeTab === 'LOGS'
                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-600/15 dark:text-indigo-400 dark:border-indigo-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
                    }`}
                >
                  <Activity className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                  <span>{t('Audit Logs')}</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Theme & Language Switcher */}
            <ThemeLanguageToggle />

            {/* Admin User Pill - Matches user image: [AD] admin@test.com */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#141522] border border-slate-200 dark:border-slate-800 text-xs">
              <span className="w-5 h-5 rounded-full bg-indigo-900/80 text-indigo-300 font-bold text-[10px] flex items-center justify-center">
                AD
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {user?.email || 'admin@test.com'}
              </span>
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT BODY */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full">
          {/* Header Title Section - Exactly matching screenshot */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t('Admin Dashboard')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t('Monitor platform activity and manage your workspace.')}
              </p>
            </div>

            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing || loading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#12131d] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xs self-start sm:self-auto cursor-pointer active:scale-95 disabled:opacity-60"
              title={isBn ? "ড্যাশবোর্ড রিফ্রেশ করুন" : "Refresh dashboard"}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || loading ? 'animate-spin text-indigo-600 dark:text-indigo-400' : ''}`} />
              <span>{isRefreshing ? (isBn ? 'রিফ্রেশ হচ্ছে...' : 'Refreshing...') : t('Refresh', 'রিফ্রেশ')}</span>
            </button>
          </div>

          {/* TAB VIEW 1: DASHBOARD OVERVIEW */}
          {activeTab === 'DASHBOARD' && (
            <div className="space-y-6">
              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#11121c] p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                      {stats?.totalEvents ?? events.length}
                    </p>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('Campus Events')}
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#11121c] p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                      {stats?.totalRegistrations ?? 1240}
                    </p>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('Issued Passes')}
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#11121c] p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                      ${(stats?.totalSponsorship ? Number(stats.totalSponsorship) : 325000).toLocaleString()}
                    </p>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('Raised Funds')}
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#11121c] p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                      {pendingEvents.length}
                    </p>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('Pending Approvals')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Two Column Split: Pending Approvals Queue & Live Audit Logs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Approvals Queue */}
                <div className="bg-white dark:bg-[#11121c] rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-500" />
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {t('Pending Event Approvals Queue')}
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('EVENTS_WORKSHOPS')}
                      className="text-xs text-[#8576ff] hover:underline font-semibold"
                    >
                      {isBn ? `সবগুলো দেখুন (${pendingEvents.length})` : `View all (${pendingEvents.length})`}
                    </button>
                  </div>

                  {pendingEvents.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
                      <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                      <p className="font-medium text-slate-700 dark:text-slate-300">{t('All events moderated!')}</p>
                      <p>{t('No proposals currently awaiting review.')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 dark:text-white truncate">
                              {event.title}
                            </h4>
                            <p className="text-slate-500 dark:text-slate-400 truncate">
                              {t(event.club?.clubName || '')} • {event.eventType}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleUpdateStatus(event.id, 'APPROVED')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                            >
                              {t('Approve')}
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(event.id, 'REJECTED')}
                              className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-rose-600 dark:text-rose-400 font-bold text-[11px]"
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
                <div className="bg-white dark:bg-[#11121c] rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-indigo-500" />
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {t('Platform Audit Activity')}
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('LOGS')}
                      className="text-xs text-[#8576ff] hover:underline font-semibold"
                    >
                      {t('View full log')}
                    </button>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {auditLogs.slice(0, 5).map((log) => (
                      <div
                        key={log.id}
                        className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                          <span className="font-mono text-slate-800 dark:text-slate-200 truncate">
                            {log.action}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
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
            </div>
          )}

          {/* TAB VIEW 2: EVENTS & WORKSHOPS CONSOLE */}
          {activeTab === 'EVENTS_WORKSHOPS' && (
            <div className="space-y-6">
              {/* Header card with Search and Filters */}
              <div className="bg-white dark:bg-[#11121c] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Compass className="w-5 h-5 text-indigo-500" />
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                        {t('Events & Workshops Console')}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t('Manage, moderate, and monitor campus events and hands-on workshops.')}
                    </p>
                  </div>

                  {/* Summary Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-bold">
                      {isBn ? `${events.length}টি মোট ইভেন্ট` : `${events.length} Total Events`}
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 text-xs font-bold">
                      {isBn ? `${workshopCount}টি ওয়ার্কশপ` : `${workshopCount} Workshops`}
                    </span>
                    {pendingEvents.length > 0 && (
                      <span className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-bold">
                        {isBn ? `${pendingEvents.length}টি অপেক্ষমান` : `${pendingEvents.length} Pending`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Search & Filter Pills */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={t('Search by event title or club...')}
                      value={eventSearch}
                      onChange={(e) => setEventSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
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
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${eventFilter === tab.key
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                          }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Events List */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredEvents.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs">
                      {t('No events matching criteria.')}
                    </div>
                  ) : (
                    filteredEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 max-w-2xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <TypeBadge type={ev.eventType} />
                            <StatusBadge status={ev.status} />
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                              {ev.club?.clubName}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              • {new Date(ev.startTime).toLocaleDateString()}
                            </span>
                          </div>

                          <h4 className="font-bold text-base text-slate-900 dark:text-white">
                            {ev.title}
                          </h4>

                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {ev.description || t('No description provided.')}
                          </p>

                          {/* Workshop Details if available */}
                          {ev.workshop && (
                            <div className="mt-2 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs space-y-1">
                              <div className="flex items-center gap-2 font-semibold text-purple-400">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>{isBn ? 'স্পিকার:' : 'Speaker:'} {ev.workshop.speakerName}</span>
                              </div>
                              {ev.workshop.speakerBio && (
                                <p className="text-[11px] text-slate-400">{ev.workshop.speakerBio}</p>
                              )}
                              {ev.workshop.prerequisites && (
                                <p className="text-[11px] text-amber-400/90 font-mono">
                                  {isBn ? 'পূর্বশর্ত:' : 'Prerequisites:'} {ev.workshop.prerequisites}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {ev.status !== 'APPROVED' && (
                            <button
                              onClick={() => handleUpdateStatus(ev.id, 'APPROVED')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
                            >
                              {t('Approve')}
                            </button>
                          )}
                          {ev.status !== 'REJECTED' && (
                            <button
                              onClick={() => handleUpdateStatus(ev.id, 'REJECTED')}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 font-bold text-xs"
                            >
                              {t('Reject')}
                            </button>
                          )}
                          {ev.status === 'APPROVED' && (
                            <button
                              onClick={() => handleUpdateStatus(ev.id, 'COMPLETED')}
                              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs"
                            >
                              {t('Complete')}
                            </button>
                          )}
                          <Link
                            to="/events"
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                            title="View Public Page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB VIEW 3: ATTENDANCE & PASS CHECK-IN DESK */}
          {activeTab === 'ATTENDANCE' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#11121c] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {t('Venue Check-In & Certificate Issue')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t('Select event to mark attendee passes and unlock certificates.')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                    >
                      {events.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.title}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={handleGenerateCertificate}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{t('Issue Certs')}</span>
                    </button>
                  </div>
                </div>

                {/* Attendees list */}
                <div className="pt-2">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                    <span>
                      {t('Selected Event:')} <strong className="text-slate-900 dark:text-white">{selectedEvent?.title}</strong>
                    </span>
                    <span>{t('Total Registered:')} <strong className="text-slate-900 dark:text-white">{selectedEvent?._count?.registrations ?? 0}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB VIEW 4: SPONSORSHIP RECORDING LEDGER */}
          {activeTab === 'SPONSORSHIP' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#11121c] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-5">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {t('Record Corporate Sponsorship')}
                </h3>

                <form onSubmit={handleRecordSponsorship} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Target Event')}
                    </label>
                    <select
                      value={sponsorForm.eventId}
                      onChange={(e) => setFormSafe(setSponsorForm, 'eventId', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
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
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Sponsor Organization')}
                    </label>
                    <select
                      value={sponsorForm.sponsorId}
                      onChange={(e) => setFormSafe(setSponsorForm, 'sponsorId', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
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
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Amount Funded ($)')}
                    </label>
                    <input
                      type="number"
                      value={sponsorForm.amountFunded}
                      onChange={(e) => setFormSafe(setSponsorForm, 'amountFunded', Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Tier')}
                    </label>
                    <select
                      value={sponsorForm.sponsorshipTier}
                      onChange={(e) => setFormSafe(setSponsorForm, 'sponsorshipTier', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <option value="PLATINUM">{t('Platinum Tier')}</option>
                      <option value="GOLD">{t('Gold Tier')}</option>
                      <option value="SILVER">{t('Silver Tier')}</option>
                      <option value="BRONZE">{t('Bronze Tier')}</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer"
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
            <div className="space-y-6">
              {/* Top Card: Annual Rankings Generator */}
              <div className="bg-white dark:bg-[#11121c] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                        {t('IIUC 3-Factor Normalization Algorithm')}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t('Ranking Formula')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={rankingYear}
                      onChange={(e) => setRankingYear(Number(e.target.value))}
                      className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <option value={2026}>{isBn ? '২০২৬ সাল' : 'Year 2026'}</option>
                      <option value={2025}>{isBn ? '২০২৫ সাল' : 'Year 2025'}</option>
                    </select>

                    <button
                      onClick={handleGenerateRanking}
                      disabled={generatingRankings}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{generatingRankings ? t('Computing...') : t('Generate Rankings')}</span>
                    </button>
                  </div>
                </div>

                {/* Rankings Table */}
                {rankings.length > 0 && (
                  <div className="overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                          <th className="py-2.5 px-3">{t('Rank')}</th>
                          <th className="py-2.5 px-3">{t('Club Name')}</th>
                          <th className="py-2.5 px-3">{t('Events Score')}</th>
                          <th className="py-2.5 px-3">{t('Sponsorship')}</th>
                          <th className="py-2.5 px-3">{t('Feedback')}</th>
                          <th className="py-2.5 px-3">{t('Final Score')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {rankings.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="py-3 px-3">
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${r.rankPosition === 1
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                  : r.rankPosition === 2
                                    ? 'bg-slate-300/20 text-slate-300 border border-slate-400/40'
                                    : r.rankPosition === 3
                                      ? 'bg-amber-700/20 text-amber-600 border border-amber-700/40'
                                      : 'text-slate-400'
                                  }`}
                              >
                                #{r.rankPosition}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                              {t(r.club?.clubName || r.clubName || '')}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                              {Number(r.totalEventsScore).toFixed(1)}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                              {Number(r.sponsorshipScore).toFixed(1)}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                              {Number(r.feedbackScore).toFixed(1)}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                              {Number(r.finalScore).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Bottom Card: Campus Clubs Directory */}
              <div className="bg-white dark:bg-[#11121c] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-500" />
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {t('Registered Campus Clubs Directory')}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {isBn ? `${clubs.length}টি ক্লাব নিবন্ধিত` : `${clubs.length} Clubs Registered`}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  {clubs.map((club) => (
                    <div
                      key={club.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-2 hover:border-indigo-500/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {t(club.clubName)}
                        </h4>
                        {club.establishedYear && (
                          <span className="text-[10px] font-mono text-slate-400">
                            {isBn ? `প্রতিষ্ঠিত ${club.establishedYear}` : `Est. ${club.establishedYear}`}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {club.description || t('No description provided.')}
                      </p>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800 text-slate-400">
                        <span>{club.department?.departmentName || 'General'}</span>
                        <span className="font-semibold text-indigo-400">
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
              <div className="bg-white dark:bg-[#11121c] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-4">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {t('Platform Security & Audit Trail')}
                </h3>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {log.action}
                        </span>
                        <span className="text-slate-500 ml-2">
                          {isBn ? 'ব্যবহারকারী #' : 'User #'}{log.userId ?? 'SYSTEM'}
                        </span>
                      </div>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB VIEW 7: PROFILE */}
          {activeTab === 'PROFILE' && (
            <div className="max-w-2xl bg-white dark:bg-[#11121c] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center">
                  AD
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    {user?.fullName || t('System Administrator')}
                  </h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase">
                    {isBn ? 'রোল' : 'Role'}: {user?.role || 'ADMIN'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">{t('Email Address')}</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{user?.email}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">{t('Matric / Admin ID')}</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{user?.studentId || 'ADMIN-001'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">{t('Department')}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
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
