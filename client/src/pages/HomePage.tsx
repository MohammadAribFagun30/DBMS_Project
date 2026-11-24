import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EventItem, ClubRanking, DashboardStats } from '../types';
import { apiEvents, apiRankings, apiDashboard, apiRegistrations } from '../services/api';
import { EventCard } from '../components/EventCard';
import { EventDetailModal } from '../components/EventDetailModal';
import { ProposeEventModal } from '../components/ProposeEventModal';
import { TicketPassModal } from '../components/TicketPassModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Compass,
  Trophy,
  Users,
  Award,
  DollarSign,
  PlusCircle,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const HomePage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();

  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);
  const [topRankings, setTopRankings] = useState<ClubRanking[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [proposeModalOpen, setProposeModalOpen] = useState(false);
  const [ticketModalData, setTicketModalData] = useState<any | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const events = await apiEvents.getAll({ upcoming: true });
    setUpcomingEvents(events.slice(0, 4));

    const rankings = await apiRankings.getByYear(2026);
    setTopRankings(rankings.slice(0, 3));

    const dashboardStats = await apiDashboard.getStats();
    setStats(dashboardStats);
  };

  const handleRegister = async (event: EventItem) => {
    try {
      const reg = await apiRegistrations.register(event.id);
      reg.event = event;
      setTicketModalData(reg);
      toast.success(`Registered successfully! Pass: ${reg.passNumber}`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    }
  };

  return (
    <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Institutional Left-Aligned Header */}
      <section className="bg-[var(--surface)] p-6 sm:p-8 rounded-[6px] border border-[var(--border)]">
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

            {isAdmin ? (
              <button
                type="button"
                onClick={() => setProposeModalOpen(true)}
                className="btn-secondary text-xs py-2 px-4"
              >
                <PlusCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                {t('Create New Event')}
              </button>
            ) : (
              <Link to="/clubs" className="btn-secondary text-xs py-2 px-4">
                <Trophy className="w-3.5 h-3.5" strokeWidth={1.5} />
                {t('View Club Standings')}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* KPI Stats Counter Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[var(--surface)] p-3.5 rounded-[6px] border border-[var(--border)] flex items-center gap-3">
          <div className="w-8 h-8 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text)] flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-mono text-xl font-semibold text-[var(--text)]">{stats?.totalEvents ?? 42}</p>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">{t('Campus Events')}</span>
          </div>
        </div>

        <div className="bg-[var(--surface)] p-3.5 rounded-[6px] border border-[var(--border)] flex items-center gap-3">
          <div className="w-8 h-8 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text)] flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-mono text-xl font-semibold text-[var(--text)]">{stats?.totalRegistrations ?? 1240}</p>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">{t('Issued Passes')}</span>
          </div>
        </div>

        <div className="bg-[var(--surface)] p-3.5 rounded-[6px] border border-[var(--border)] flex items-center gap-3">
          <div className="w-8 h-8 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text)] flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-mono text-xl font-semibold text-[var(--text)]">
              ${(stats?.totalSponsorship ? Number(stats.totalSponsorship) : 325000).toLocaleString()}
            </p>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">{t('Sponsorships')}</span>
          </div>
        </div>

        <div className="bg-[var(--surface)] p-3.5 rounded-[6px] border border-[var(--border)] flex items-center gap-3">
          <div className="w-8 h-8 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text)] flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-mono text-xl font-semibold text-[var(--text)]">{stats?.totalCertificates ?? 890}</p>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">{t('Verified Certs')}</span>
          </div>
        </div>
      </section>

      {/* Featured / Upcoming Events */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
          <div>
            <h2 className="font-heading font-semibold text-lg text-[var(--text)]">{t('Featured Campus Events')}</h2>
            <p className="text-xs text-[var(--muted)]">{t('Register online to generate your digital verification pass.')}</p>
          </div>
          <Link
            to="/events"
            className="text-xs font-mono text-[var(--primary)] hover:underline inline-flex items-center gap-1"
          >
            {t('View all events')} <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onSelect={setSelectedEvent}
              onRegister={isAdmin ? undefined : handleRegister}
            />
          ))}
        </div>
      </section>

      {/* Annual Ranking Leaderboard Spotlight */}
      <section className="bg-[var(--surface)] rounded-[6px] border border-[var(--border)] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--highlight)] font-semibold">
              {t('IIUC 3-Factor Normalization Algorithm')}
            </span>
            <h2 className="font-heading font-semibold text-base sm:text-lg text-[var(--text)]">
              {t('Top Ranked Clubs (2026 Academic Year)')}
            </h2>
            <p className="text-xs text-[var(--muted)] font-mono mt-0.5">
              {t('Formula: 35% Events Weight + 35% Sponsorship Weight + 30% Student Feedback')}
            </p>
          </div>

          <Link
            to="/clubs"
            className="btn-secondary text-xs py-1.5 px-3 self-start sm:self-auto"
          >
            {t('View Full Standings')}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {topRankings.map((rank) => (
            <div
              key={rank.id}
              className="p-4 rounded-[6px] bg-[var(--surface-alt)] border border-[var(--border)] space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-xs text-[var(--text)]">
                  {t('Rank #')}{rank.rankPosition}
                </span>
                <span className="text-xs font-mono text-[var(--primary)] font-semibold">
                  {t('Score:')} {rank.finalScore} / 100
                </span>
              </div>

              <div>
                <h3 className="font-heading font-semibold text-sm text-[var(--text)]">
                  {t(rank.clubName || rank.club?.clubName || '', rank.clubName || rank.club?.clubName)}
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  {t(rank.club?.department?.departmentName || 'Academic Department')}
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-[var(--border)] text-xs font-mono">
                <div className="flex justify-between text-[var(--muted)]">
                  <span>{t('Events (35%)')}</span>
                  <span className="text-[var(--text)]">{rank.totalEventsScore}</span>
                </div>
                <div className="flex justify-between text-[var(--muted)]">
                  <span>{t('Sponsorship (35%)')}</span>
                  <span className="text-[var(--text)]">{rank.sponsorshipScore}</span>
                </div>
                <div className="flex justify-between text-[var(--muted)]">
                  <span>{t('Feedback (30%)')}</span>
                  <span className="text-[var(--text)]">{rank.feedbackScore}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Operating Protocol / 3-Step Process */}
      <section className="space-y-4">
        <div className="pb-2 border-b border-[var(--border)]">
          <h2 className="font-heading font-semibold text-lg text-[var(--text)]">
            {t('Standard Campus Event Procedure')}
          </h2>
          <p className="text-xs text-[var(--muted)]">{t('Institutional event workflow from proposal to verification.')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-[var(--surface)] p-4 rounded-[6px] border border-[var(--border)] space-y-2">
            <span className="w-6 h-6 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] font-mono text-xs font-semibold text-[var(--text)] flex items-center justify-center">
              01
            </span>
            <h3 className="font-medium text-xs text-[var(--text)]">{t('Publish & Schedule')}</h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              {t('Official university clubs submit proposals for review by the campus administration.')}
            </p>
          </div>

          <div className="bg-[var(--surface)] p-4 rounded-[6px] border border-[var(--border)] space-y-2">
            <span className="w-6 h-6 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] font-mono text-xs font-semibold text-[var(--text)] flex items-center justify-center">
              02
            </span>
            <h3 className="font-medium text-xs text-[var(--text)]">{t('Pass Generation')}</h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              {t('Enrolled students register online to acquire a verified pass identifier (REG-ID).')}
            </p>
          </div>

          <div className="bg-[var(--surface)] p-4 rounded-[6px] border border-[var(--border)] space-y-2">
            <span className="w-6 h-6 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] font-mono text-xs font-semibold text-[var(--text)] flex items-center justify-center">
              03
            </span>
            <h3 className="font-medium text-xs text-[var(--text)]">{t('Feedback & Ranking')}</h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              {t('Attendees submit ratings, which compute directly into the official 3-factor annual club ranking.')}
            </p>
          </div>
        </div>
      </section>

      {/* Modals */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRegister={isAdmin ? undefined : handleRegister}
      />

      {proposeModalOpen && (
        <ProposeEventModal
          onClose={() => setProposeModalOpen(false)}
          onSuccess={loadData}
        />
      )}

      {ticketModalData && (
        <TicketPassModal
          registration={ticketModalData}
          onClose={() => setTicketModalData(null)}
        />
      )}
    </div>
  );
};
