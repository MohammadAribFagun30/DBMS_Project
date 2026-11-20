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
  Calendar,
  DollarSign,
  PlusCircle,
  ChevronRight
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { isAdmin } = useAuth();
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
    <div className="space-y-16 pb-16 transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-900 text-white py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        {/* Glow gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-[400px] h-[250px] bg-purple-500/15 blur-[100px] rounded-full pointer-events-none" />

        <div className="w-full max-w-7xl 2xl:max-w-screen-2xl mx-auto relative z-10 text-center space-y-6">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Empowering IIUC Campus Life, <br />
            <span className="bg-gradient-to-r from-indigo-300 via-purple-200 to-pink-300 bg-clip-text text-transparent">
              One Club Event at a Time
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Discover technical workshops, hackathons, and seminars organized by IIUC clubs. Register for instant digital passes,
            earn verified credentials, and track your club's annual 3-factor ranking.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              to="/events"
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all hover:scale-105"
            >
              <Compass className="w-4 h-4" />
              Explore All Events
            </Link>

            {isAdmin ? (
              <button
                onClick={() => setProposeModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-xl shadow-sky-600/30 transition-all hover:scale-105"
              >
                <PlusCircle className="w-4 h-4 text-sky-200" />
                Create New Event
              </button>
            ) : (
              <Link
                to="/clubs"
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold text-sm border border-amber-400/30 backdrop-blur-md transition-all hover:scale-105"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                View Club Standings
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* KPI Stats Counter Banner */}
      <section className="w-full max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 flex items-center gap-4 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats?.totalEvents ?? 42}</p>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Campus Events</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 flex items-center gap-4 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats?.totalRegistrations ?? 1240}</p>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Event Passes</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 flex items-center gap-4 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                ${(stats?.totalSponsorship ? Number(stats.totalSponsorship) : 325000).toLocaleString()}
              </p>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sponsorship Ledger</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 flex items-center gap-4 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats?.totalCertificates ?? 890}</p>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Verified Certs</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured / Upcoming Events */}
      <section className="w-full max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4" />
              Live & Upcoming
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Featured Campus Events</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Register today and receive your digital QR entry pass.</p>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            View all events <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Annual Ranking Podium Spotlight */}
      <section className="w-full max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-indigo-50/90 via-purple-50/60 to-white dark:from-indigo-950 dark:via-slate-900 dark:to-indigo-900 rounded-3xl p-8 sm:p-12 text-slate-900 dark:text-white border border-indigo-200 dark:border-indigo-800/50 shadow-2xl shadow-indigo-100/50 dark:shadow-slate-950/50 relative overflow-hidden transition-colors">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-800 dark:text-amber-300 text-xs font-bold mb-2">
                <Trophy className="w-3.5 h-3.5" />
                IIUC Annual 3-Factor Club Leaderboard (2026)
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold">Top Performing IIUC Clubs</h2>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-xl mt-2 leading-relaxed">
                Rankings calculated automatically using the official IIUC algorithm:
                <span className="font-semibold text-indigo-700 dark:text-indigo-200"> 35% Events + 35% Sponsorship + 30% Student Feedback</span>.
              </p>
            </div>

            <Link
              to="/clubs"
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm shrink-0 transition-all shadow-lg shadow-amber-400/25 hover:scale-105"
            >
              View Full Standings
            </Link>
          </div>

          {/* Podium Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topRankings.map((rank) => (
              <div
                key={rank.id}
                className={`p-6 rounded-2xl border transition-all ${
                  rank.rankPosition === 1
                    ? 'bg-amber-50/80 dark:bg-gradient-to-b dark:from-amber-500/20 dark:to-amber-600/10 border-amber-300 dark:border-amber-400/40 shadow-xl'
                    : 'bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm ${
                      rank.rankPosition === 1
                        ? 'bg-amber-400 text-slate-900 shadow-md shadow-amber-400/30'
                        : rank.rankPosition === 2
                        ? 'bg-slate-300 text-slate-900'
                        : 'bg-amber-700 text-white'
                    }`}
                  >
                    #{rank.rankPosition}
                  </span>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-300">
                    Score: {rank.finalScore} / 100
                  </span>
                </div>

                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-1">
                  {rank.clubName || rank.club?.clubName}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">
                  {rank.club?.department?.departmentName || 'Academic Department'}
                </p>

                {/* Score breakdown metrics */}
                <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-white/10 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Events Score (35%)</span>
                    <span className="font-bold">{rank.totalEventsScore}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Sponsorship (35%)</span>
                    <span className="font-bold">{rank.sponsorshipScore}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Feedback (30%)</span>
                    <span className="font-bold">{rank.feedbackScore}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works / 4-Step Process */}
      <section className="w-full max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Platform Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            How The Club Management System Operates
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-extrabold text-lg flex items-center justify-center mx-auto">
              1
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Publish & Organize</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Official university clubs and campus authorities publish and schedule verified events.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 font-extrabold text-lg flex items-center justify-center mx-auto">
              2
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Register & Pass</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Students register with one click to receive their personalized digital pass (<code className="text-indigo-600 dark:text-indigo-400 font-bold">REG-ID</code>).
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-lg flex items-center justify-center mx-auto">
              3
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Attend & Certify</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Attendance is marked at the venue desk, unlocking verifiable digital certificates.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-lg flex items-center justify-center mx-auto">
              4
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Anonymous Feedback</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Attendees submit 100% anonymous ratings, which feed directly into the annual club rankings.
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
