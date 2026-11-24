import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  EventItem,
  Registration,
  DashboardStats,
  Club,
  ClubRanking,
  Sponsor,
  SponsorshipTier,
  Department
} from '../types';
import {
  apiEvents,
  apiRegistrations,
  apiSponsors,
  apiRankings,
  apiDashboard,
  apiClubs,
  apiDepartments,
  checkBackendHealth
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { ThemeLanguageToggle } from '../components/ThemeLanguageToggle';
import { StatusBadge, TypeBadge } from '../components/Badge';
import { EventCard } from '../components/EventCard';
import { EventDetailModal } from '../components/EventDetailModal';
import { ProposeEventModal } from '../components/ProposeEventModal';
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
  Calendar,
  Users,
  Search,
  PlusCircle,
  RefreshCw,
  ExternalLink,
  Building2,
  X,
  Menu,
  Compass,
  Bookmark,
  LogOut,
  SlidersHorizontal,
  ArrowUpDown,
  FileCheck
} from 'lucide-react';

type AdminTab =
  | 'DASHBOARD'
  | 'EVENTS_WORKSHOPS'
  | 'CLUBS_RANKINGS'
  | 'SPONSORSHIP'
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
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [proposeModalOpen, setProposeModalOpen] = useState<boolean>(false);

  // Events & Workshops Advanced Search/Filter Toolbar
  const [eventSearch, setEventSearch] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedClub, setSelectedClub] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [eventSortBy, setEventSortBy] = useState<'RECENT' | 'DATE'>('RECENT');

  // Sponsorship form
  const [sponsorForm, setSponsorForm] = useState({
    eventId: '',
    sponsorId: '',
    amountFunded: 25000,
    sponsorshipTier: 'PLATINUM' as SponsorshipTier,
  });

  // Ranking year and data (Automatically computed based on participants, sponsorship, feedback)
  const [rankingYear, setRankingYear] = useState<number>(2026);
  const [rankings, setRankings] = useState<ClubRanking[]>([]);
  const [clubTab, setClubTab] = useState<'RANKINGS' | 'DIRECTORY'>('RANKINGS');

  useEffect(() => {
    loadAll();
  }, [rankingYear]);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [st, ev, cl, dp, sp, rg, rk] = await Promise.all([
        apiDashboard.getStats(),
        apiEvents.getAll(),
        apiClubs.getAll(),
        apiDepartments.getAll(),
        apiSponsors.getAll(),
        apiRegistrations.getMyRegistrations(),
        apiRankings.getByYear(rankingYear),
      ]);
      setStats(st);
      setEvents(ev);
      setClubs(cl);
      setDepartments(dp);
      setSponsors(sp);
      setRegistrations(rg);
      setRankings(rk);
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

  const availableClubs = selectedDepartment
    ? clubs.filter((c) => c.departmentId === Number(selectedDepartment))
    : clubs;

  const eventTypes = ['ALL', 'WORKSHOP', 'HACKATHON', 'SEMINAR', 'COMPETITION', 'SOCIAL'];

  const filteredEvents = events.filter((ev) => {
    // Search query matches title, description, club name, or workshop speaker
    if (eventSearch.trim()) {
      const q = eventSearch.toLowerCase();
      const matchTitle = ev.title.toLowerCase().includes(q);
      const matchDesc = ev.description?.toLowerCase().includes(q);
      const matchClub = (ev.club?.clubName || '').toLowerCase().includes(q);
      const matchSpeaker = (ev.workshop?.speakerName || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchClub && !matchSpeaker) return false;
    }

    // Type filter
    if (selectedType !== 'ALL' && ev.eventType !== selectedType) {
      return false;
    }

    // Department filter
    if (selectedDepartment && ev.club?.departmentId !== Number(selectedDepartment)) {
      return false;
    }

    // Club filter
    if (selectedClub && ev.clubId !== Number(selectedClub)) {
      return false;
    }

    // Status filter
    if (selectedStatus !== 'ALL' && ev.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (eventSortBy === 'RECENT') {
      const timeB = new Date(b.createdAt || 0).getTime();
      const timeA = new Date(a.createdAt || 0).getTime();
      if (timeB !== timeA && !isNaN(timeB) && !isNaN(timeA)) {
        return timeB - timeA;
      }
      return b.id - a.id;
    }

    if (eventSortBy === 'DATE') {
      const timeA = new Date(a.startTime).getTime();
      const timeB = new Date(b.startTime).getTime();
      return timeA - timeB;
    }

    return 0;
  });

  const isWorkspaceTab = [
    'EVENTS_WORKSHOPS',
    'CLUBS_RANKINGS',
    'SPONSORSHIP'
  ].includes(activeTab);

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'DASHBOARD':
        return t('Dashboard');
      case 'EVENTS_WORKSHOPS':
      case 'CLUBS_RANKINGS':
      case 'SPONSORSHIP':
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
      case 'SPONSORSHIP':
        return t('Sponsorship');
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg)] text-[var(--text)] font-sans relative overflow-x-hidden">
      {/* Background ambient luminous blurs for realistic glassmorphism depth */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-24 -left-20 w-[420px] h-[420px] rounded-full bg-[#B36836]/10 dark:bg-[#5DA583]/10 blur-3xl" />
        <div className="absolute top-1/2 -left-32 w-[380px] h-[380px] rounded-full bg-[#8A6414]/8 dark:bg-[#74B898]/8 blur-3xl" />
        <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full bg-[#3B2418]/5 dark:bg-white/5 blur-3xl" />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpenMobile && (
        <div
          onClick={() => setSidebarOpenMobile(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* LEFT SIDEBAR - Expanded (w-64) or Collapsed Rail (w-[72px]) Glassmorphism */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 h-screen sidebar-glass flex flex-col justify-between transition-all shrink-0 overflow-visible ${
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
                  className="hidden lg:flex w-6 h-6 rounded-full bg-white/40 hover:bg-white/70 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-xs items-center justify-center text-[var(--muted)] hover:text-[var(--text)] transition-all cursor-pointer"
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
                      ? 'sidebar-glass-item-active font-semibold'
                      : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/25 dark:hover:bg-white/5 border border-transparent'
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
                    className="w-full flex items-center justify-between px-3 py-2 rounded-[10px] text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/25 dark:hover:bg-white/5 border border-transparent transition-all cursor-pointer"
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
                    <div className="pl-5 pr-1 py-1 space-y-0.5 border-l border-white/40 dark:border-white/10 ml-4 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('EVENTS_WORKSHOPS');
                          setSidebarOpenMobile(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[8px] text-xs transition-all cursor-pointer ${
                          activeTab === 'EVENTS_WORKSHOPS'
                            ? 'sidebar-glass-item-active font-semibold'
                            : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/20 dark:hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Compass className="w-3.5 h-3.5" strokeWidth={1.5} />
                          <span>{t('Events & Workshops')}</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('CLUBS_RANKINGS');
                          setSidebarOpenMobile(false);
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[8px] text-xs transition-all cursor-pointer ${
                          activeTab === 'CLUBS_RANKINGS'
                            ? 'sidebar-glass-item-active font-semibold'
                            : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/20 dark:hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <Trophy className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>{t('Clubs & Rankings')}</span>
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
                      ? 'sidebar-glass-item-active font-semibold'
                      : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/25 dark:hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <UserIcon className="w-4 h-4" strokeWidth={1.5} />
                  <span>{t('Profile')}</span>
                </button>
              </nav>
            </div>

            {/* Bottom Glass User Profile & Actions (matching bottom of reference pic) */}
            <div className="p-3 border-t border-white/40 dark:border-white/10 space-y-2">
              {/* User Profile Card */}
              <div className="p-2 rounded-[12px] sidebar-glass-card flex items-center justify-between gap-2">
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
                  className="w-6 h-6 rounded-[6px] hover:bg-white/50 dark:hover:bg-white/10 text-[#9B3A2D] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>

              {/* Public Portal Link */}
              <Link
                to="/home"
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] rounded-[8px] hover:bg-white/25 dark:hover:bg-white/5 transition-all"
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
                className="w-6 h-6 rounded-full bg-white/40 hover:bg-white/70 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md border border-white/50 dark:border-white/10 shadow-xs flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] transition-all cursor-pointer"
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
                      ? 'sidebar-glass-item-active'
                      : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/25 dark:hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex items-center pointer-events-none">
                  <span className="backdrop-blur-md bg-white/90 dark:bg-[#1D1C17]/90 text-[var(--text)] text-xs font-mono px-2.5 py-1 rounded-[6px] border border-white/60 dark:border-white/10 shadow-md whitespace-nowrap">
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
                      ? 'sidebar-glass-item-active'
                      : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/25 dark:hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Folder className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex items-center pointer-events-none">
                  <span className="backdrop-blur-md bg-white/90 dark:bg-[#1D1C17]/90 text-[var(--text)] text-xs font-mono px-2.5 py-1 rounded-[6px] border border-white/60 dark:border-white/10 shadow-md whitespace-nowrap">
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
                      ? 'sidebar-glass-item-active'
                      : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/25 dark:hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <UserIcon className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex items-center pointer-events-none">
                  <span className="backdrop-blur-md bg-white/90 dark:bg-[#1D1C17]/90 text-[var(--text)] text-xs font-mono px-2.5 py-1 rounded-[6px] border border-white/60 dark:border-white/10 shadow-md whitespace-nowrap">
                    {t('Profile')}
                  </span>
                </div>
              </div>
            </nav>

            {/* Bottom Actions */}
            <div className="space-y-1 flex flex-col items-center border-t border-white/40 dark:border-white/10 pt-2 w-full">
              <Link
                to="/home"
                className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/30 dark:hover:bg-white/5 transition-all"
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
                className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#9B3A2D] hover:bg-white/30 dark:hover:bg-white/5 cursor-pointer transition-all"
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
            {/* Manual Refresh Button */}
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing || loading}
              className="h-8 px-2.5 rounded-[8px] border border-white/70 dark:border-white/10 bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-[var(--muted)] hover:text-[var(--text)] flex items-center gap-1.5 text-xs font-mono transition-all cursor-pointer shadow-xs disabled:opacity-60"
              title={isBn ? "ড্যাশবোর্ড রিফ্রেশ করুন" : "Refresh dashboard"}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || loading ? 'animate-spin text-[var(--primary)]' : ''}`} strokeWidth={1.5} />
              <span className="hidden sm:inline">{isRefreshing ? (isBn ? 'রিফ্রেশ...' : 'Refreshing...') : t('Refresh')}</span>
            </button>

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
                      ${(stats?.totalSponsorship ? Number(stats.totalSponsorship) : 210000).toLocaleString()}
                    </p>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">
                      {t('Sponsorships')}
                    </span>
                  </div>
                </div>

                <div className="bg-[var(--surface)] p-3.5 rounded-[6px] border border-[var(--border)] card-blue-shadow flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text)] flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-mono text-xl font-semibold text-[var(--text)]">
                      {stats?.totalCertificates ?? 1}
                    </p>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">
                      {t('Verified Certs')}
                    </span>
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

          {/* TAB VIEW 2: EVENTS & WORKSHOPS (MATCHING PIC 2) */}
          {activeTab === 'EVENTS_WORKSHOPS' && (
            <div className="space-y-6">
              {/* Institutional Left-Aligned Header */}
              <section className="bg-[var(--surface)] p-6 sm:p-8 rounded-[6px] border border-[var(--border)] card-blue-shadow-static">
                <div className="max-w-2xl space-y-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-[var(--primary)] font-semibold">
                    {t('IIUC Central Campus Management')}
                  </span>
                  <h1 className="font-heading font-semibold text-2xl sm:text-3xl text-[var(--text)] tracking-tight">
                    {t('Club Activities, Technical Workshops & Verified Passes')}
                  </h1>
                  <p className="text-[var(--muted)] text-sm leading-relaxed">
                    {t('International Islamic University Chittagong centralized platform for official club events, workshops, digital event entry passes, verified certificates, and annual 3-factor club performance rankings.')}
                  </p>

                  <div className="flex flex-wrap items-center gap-2.5 pt-2">
                    <Link to="/events" className="btn-primary text-xs py-2 px-4">
                      <Compass className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {t('Explore All Events')}
                    </Link>

                    <button
                      type="button"
                      onClick={() => setProposeModalOpen(true)}
                      className="btn-secondary text-xs py-2 px-4 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {t('Create New Event')}
                    </button>
                  </div>
                </div>
              </section>

              {/* KPI Stats Counter Row */}
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-[var(--surface)] p-3.5 rounded-[6px] border border-[var(--border)] card-blue-shadow flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text)] flex items-center justify-center shrink-0">
                    <Compass className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-mono text-xl font-semibold text-[var(--text)]">{stats?.totalEvents ?? events.length}</p>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">{t('Campus Events')}</span>
                  </div>
                </div>

                <div className="bg-[var(--surface)] p-3.5 rounded-[6px] border border-[var(--border)] card-blue-shadow flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text)] flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-mono text-xl font-semibold text-[var(--text)]">{stats?.totalRegistrations ?? 9}</p>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">{t('Issued Passes')}</span>
                  </div>
                </div>

                <div className="bg-[var(--surface)] p-3.5 rounded-[6px] border border-[var(--border)] card-blue-shadow flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text)] flex items-center justify-center shrink-0">
                    <DollarSign className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-mono text-xl font-semibold text-[var(--text)]">
                      ${(stats?.totalSponsorship ? Number(stats.totalSponsorship) : 210000).toLocaleString()}
                    </p>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">{t('Sponsorships')}</span>
                  </div>
                </div>

                <div className="bg-[var(--surface)] p-3.5 rounded-[6px] border border-[var(--border)] card-blue-shadow flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text)] flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-mono text-xl font-semibold text-[var(--text)]">{stats?.totalCertificates ?? 1}</p>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">{t('Verified Certs')}</span>
                  </div>
                </div>
              </section>

              {/* Featured Campus Events */}
              <section className="space-y-4">
                <div className="pb-2 border-b border-[var(--border)]">
                  <h2 className="font-heading font-semibold text-lg text-[var(--text)]">{t('Featured Campus Events')}</h2>
                  <p className="text-xs text-[var(--muted)]">{t('Register online to generate your digital verification pass.')}</p>
                </div>

                {/* Search & Filter Toolbar (Matching Reference Image) */}
                <div className="bg-[var(--surface)] p-4 rounded-[6px] border border-[var(--border)] space-y-3 card-blue-shadow-static">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                    {/* Search Keywords */}
                    <div className="relative sm:col-span-2 lg:col-span-2">
                      <label className="block text-[11px] font-medium text-[var(--text)] mb-1">
                        {t('Search Keywords')}
                      </label>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-[var(--muted)] absolute left-2.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                        <input
                          type="text"
                          placeholder={t('Search by title, speaker, keyword...')}
                          value={eventSearch}
                          onChange={(e) => setEventSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs font-sans text-[var(--text)] placeholder:text-[var(--muted)]"
                        />
                      </div>
                    </div>

                    {/* Academic Department */}
                    <div>
                      <label className="block text-[11px] font-medium text-[var(--text)] mb-1">
                        {t('Academic Department')}
                      </label>
                      <select
                        value={selectedDepartment}
                        onChange={(e) => {
                          setSelectedDepartment(e.target.value);
                          setSelectedClub('');
                        }}
                        className="w-full px-2.5 py-1.5 text-xs text-[var(--text)]"
                      >
                        <option value="">{t('All Departments')}</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.departmentName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Organizing Club */}
                    <div>
                      <label className="block text-[11px] font-medium text-[var(--text)] mb-1">
                        {t('Organizing Club')}
                      </label>
                      <select
                        value={selectedClub}
                        onChange={(e) => setSelectedClub(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs text-[var(--text)]"
                      >
                        <option value="">{t('All Clubs')}</option>
                        {availableClubs.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.clubName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-[11px] font-medium text-[var(--text)] mb-1">
                        {t('Status')}
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs text-[var(--text)]"
                      >
                        <option value="ALL">{t('All Status')}</option>
                        <option value="APPROVED">{t('Approved')}</option>
                        <option value="COMPLETED">{t('Completed')}</option>
                        <option value="PENDING">{t('Pending')}</option>
                      </select>
                    </div>
                  </div>

                  {/* Type Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[var(--border)]">
                    <span className="text-[11px] font-mono text-[var(--muted)] mr-1">
                      Type:
                    </span>

                    {eventTypes.map((tName) => (
                      <button
                        key={tName}
                        type="button"
                        onClick={() => setSelectedType(tName)}
                        className={`px-2.5 py-1 rounded-[4px] text-xs font-mono transition-colors cursor-pointer ${
                          selectedType === tName
                            ? 'bg-[var(--primary)] text-[var(--primary-contrast)] font-medium'
                            : 'bg-[var(--surface-alt)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
                        }`}
                      >
                        {tName}
                      </button>
                    ))}

                    {(eventSearch || selectedType !== 'ALL' || selectedDepartment || selectedClub || selectedStatus !== 'ALL') && (
                      <button
                        type="button"
                        onClick={() => {
                          setEventSearch('');
                          setSelectedType('ALL');
                          setSelectedDepartment('');
                          setSelectedClub('');
                          setSelectedStatus('ALL');
                        }}
                        className="text-xs text-[#9B3A2D] hover:underline ml-auto flex items-center gap-1 font-mono cursor-pointer"
                      >
                        <X className="w-3 h-3" strokeWidth={1.5} /> {t('Reset Filters')}
                      </button>
                    )}
                  </div>
                </div>

                {/* Event Count & Sorting Control */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[var(--muted)] font-mono pt-1">
                  <span>
                    {t('Showing')} <strong className="text-[var(--text)]">{sortedEvents.length}</strong> {t('events')}
                  </span>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-[11px] font-medium text-[var(--muted)] flex items-center gap-1">
                      <ArrowUpDown className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {t('Sort By')}:
                    </span>
                    <select
                      value={eventSortBy}
                      onChange={(e) => setEventSortBy(e.target.value as 'RECENT' | 'DATE')}
                      className="px-2.5 py-1 text-xs text-[var(--text)] bg-[var(--surface)] border border-[var(--border)] rounded-[4px] cursor-pointer focus:outline-none"
                    >
                      <option value="RECENT">{t('Recently Added (Default)')}</option>
                      <option value="DATE">{t('Event Date')}</option>
                    </select>
                  </div>
                </div>

                {/* Event Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onSelect={setSelectedEvent}
                    />
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* TAB VIEW 3: SPONSORSHIP LEDGER */}
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

          {/* TAB VIEW 4: CLUBS & PERFORMANCE LEADERBOARDS (MATCHING PIC 2) */}
          {activeTab === 'CLUBS_RANKINGS' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--highlight)] font-semibold">
                    {t('Institutional Standing')}
                  </span>
                  <h1 className="font-heading font-semibold text-2xl text-[var(--text)] tracking-tight">
                    {t('Clubs & Performance Leaderboards')}
                  </h1>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    {t('Recognized student organizations, performance metrics, and annual 3-factor rankings.')}
                  </p>
                </div>

                {/* View Switcher Tabs */}
                <div className="flex items-center gap-1 bg-[var(--surface-alt)] p-1 rounded-[6px] border border-[var(--border)] self-start md:self-auto">
                  <button
                    type="button"
                    onClick={() => setClubTab('RANKINGS')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-mono transition-colors cursor-pointer ${
                      clubTab === 'RANKINGS'
                        ? 'bg-[var(--primary)] text-[var(--primary-contrast)] font-medium'
                        : 'text-[var(--muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {t('Annual Leaderboard')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setClubTab('DIRECTORY')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-mono transition-colors cursor-pointer ${
                      clubTab === 'DIRECTORY'
                        ? 'bg-[var(--primary)] text-[var(--primary-contrast)] font-medium'
                        : 'text-[var(--muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {t('Club Directory')}
                  </button>
                </div>
              </div>

              {clubTab === 'RANKINGS' ? (
                <div className="space-y-4">
                  {/* Algorithm Info Card & Year Selector */}
                  <div className="bg-[var(--surface)] p-4 rounded-[6px] border border-[var(--border)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 card-blue-shadow-static">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-[var(--highlight)] uppercase tracking-wider font-semibold">
                        {t('IIUC 3-Factor Normalization Algorithm')}
                      </span>
                      <h2 className="font-heading font-semibold text-base text-[var(--text)]">
                        {t('Official Annual Rankings')}
                      </h2>
                      <p className="text-xs font-mono text-[var(--muted)]">
                        {t('Ranking Formula: 35% Events/Participants + 35% Sponsorship + 30% Student Feedback')}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 bg-[var(--surface-alt)] p-1 rounded-[4px] border border-[var(--border)] shrink-0 font-mono text-xs">
                      <span className="text-[var(--muted)] px-2">{t('Academic Year')}:</span>
                      {[2026, 2025, 2024].map((yr) => (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => setRankingYear(yr)}
                          className={`px-2.5 py-1 rounded-[4px] transition-colors cursor-pointer ${
                            rankingYear === yr
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
                  <div className="bg-[var(--surface)] rounded-[6px] border border-[var(--border)] overflow-hidden card-blue-shadow-static">
                    <div className="p-3.5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-alt)]">
                      <h3 className="font-heading font-semibold text-xs text-[var(--text)] uppercase tracking-wider">
                        {t('Annual Standings Table')} ({rankingYear})
                      </h3>
                      <span className="text-xs font-mono text-[var(--muted)]">
                        {rankings.length} {t('Clubs Registered')}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="dense-table">
                        <thead>
                          <tr>
                            <th>{t('Rank')}</th>
                            <th>{t('Club Name')}</th>
                            <th>{t('Department')}</th>
                            <th>{t('Events (35%)')}</th>
                            <th>{t('Sponsorship (35%)')}</th>
                            <th>{t('Feedback (30%)')}</th>
                            <th>{t('Final Score')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rankings.map((r) => (
                            <tr key={r.id}>
                              <td className="font-mono font-semibold text-[var(--text)]">
                                #{r.rankPosition}
                              </td>
                              <td className="font-medium text-[var(--text)]">
                                {t(r.club?.clubName || r.clubName || '')}
                              </td>
                              <td className="text-xs text-[var(--muted)]">
                                {t(r.club?.department?.departmentName || 'General')}
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
                      className="card-hover-lift bg-[var(--surface)] rounded-[6px] p-4 border border-[var(--border)] flex flex-col justify-between"
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
                          <h3 className="font-heading font-semibold text-sm text-[var(--text)]">{t(c.clubName, c.clubName)}</h3>
                          <p className="text-xs text-[var(--primary)] font-medium mt-0.5">
                            {t(c.department?.departmentName || 'Academic Department')}
                          </p>
                          <p className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed line-clamp-2">
                            {c.description ? t(c.description, c.description) : t('Dedicated to advancing student skills and campus engagement.')}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted)] font-mono">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[var(--muted)]" strokeWidth={1.5} />
                          <span>{c._count?.events ?? 0} {t('Campus Events')}</span>
                        </span>
                        <span className="text-[var(--primary)] font-medium">{t('Active Campus Clubs')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB VIEW 5: PROFILE */}
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

      {/* Modals */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
      {proposeModalOpen && (
        <ProposeEventModal
          onClose={() => setProposeModalOpen(false)}
          onSuccess={() => {
            setProposeModalOpen(false);
            loadAll();
          }}
        />
      )}
    </div>
  );
};

// Helper to update form safely
function setFormSafe<T>(setter: React.Dispatch<React.SetStateAction<T>>, key: keyof T, val: any) {
  setter((prev) => ({ ...prev, [key]: val }));
}
