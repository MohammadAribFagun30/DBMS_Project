import React, { useState, useEffect } from 'react';
import { EventItem, Club, Venue } from '../types';
import { apiEvents, apiClubs, apiVenues, apiRegistrations } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { EventCard } from '../components/EventCard';
import { EventDetailModal } from '../components/EventDetailModal';
import { ProposeEventModal } from '../components/ProposeEventModal';
import { TicketPassModal } from '../components/TicketPassModal';
import {
  Compass,
  Search,
  PlusCircle,
  Calendar,
  SlidersHorizontal,
  X,
  Sparkles,
  MapPin,
  Building2
} from 'lucide-react';

export const EventsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const toast = useToast();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedClub, setSelectedClub] = useState<string>('');
  const [selectedVenue, setSelectedVenue] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [proposeModalOpen, setProposeModalOpen] = useState(false);
  const [ticketModalData, setTicketModalData] = useState<any | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ev, cl, vn] = await Promise.all([
        apiEvents.getAll(),
        apiClubs.getAll(),
        apiVenues.getAll(),
      ]);
      setEvents(ev);
      setClubs(cl);
      setVenues(vn);
    } catch {
      toast.error('Failed to load events data');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event: EventItem) => {
    try {
      const reg = await apiRegistrations.register(event.id);
      toast.success(`Registered successfully! Pass #${reg.passNumber} generated.`);
      setTicketModalData(reg);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    }
  };

  // Filter pipeline
  const filteredEvents = events.filter((ev) => {
    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = ev.title.toLowerCase().includes(q);
      const matchDesc = ev.description?.toLowerCase().includes(q);
      const matchSpeaker = ev.workshop?.speakerName?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchSpeaker) return false;
    }

    // Type
    if (selectedType !== 'ALL' && ev.eventType !== selectedType) {
      return false;
    }

    // Club
    if (selectedClub && String(ev.clubId) !== selectedClub) {
      return false;
    }

    // Venue
    if (selectedVenue && String(ev.venueId) !== selectedVenue) {
      return false;
    }

    // Status
    if (selectedStatus !== 'ALL' && ev.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  const eventTypes = ['ALL', 'WORKSHOP', 'HACKATHON', 'SEMINAR', 'COMPETITION', 'SOCIAL'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            IIUC Events Catalog
          </div>
          <h1 className="text-3xl font-extrabold text-white">Events & Workshops</h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse upcoming workshops, hackathons, and seminars across all IIUC clubs (Kumira Campus).
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setProposeModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-sky-600/30 transition-all hover:scale-105 self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4 text-sky-200" />
            Publish Event
          </button>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900/85 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl shadow-slate-950/50 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search events by title, description, speaker..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500"
            />
          </div>

          {/* Club Dropdown */}
          <div className="w-full md:w-56">
            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm bg-slate-950 text-slate-200"
            >
              <option value="">All Clubs</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.clubName}
                </option>
              ))}
            </select>
          </div>

          {/* Venue Dropdown */}
          <div className="w-full md:w-48">
            <select
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm bg-slate-950 text-slate-200"
            >
              <option value="">All Venues</option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.venueName}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="w-full md:w-40">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm bg-slate-950 text-slate-200"
            >
              <option value="ALL">All Status</option>
              <option value="APPROVED">Approved</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>

        {/* Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Type:
          </span>

          {eventTypes.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedType === t
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
              }`}
            >
              {t}
            </button>
          ))}

          {(search || selectedType !== 'ALL' || selectedClub || selectedVenue || selectedStatus !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedType('ALL');
                setSelectedClub('');
                setSelectedVenue('');
                setSelectedStatus('ALL');
              }}
              className="text-xs text-rose-400 hover:text-rose-300 ml-auto flex items-center gap-1 font-semibold"
            >
              <X className="w-3.5 h-3.5" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Events Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-80 bg-slate-900/60 rounded-2xl animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-16 text-center space-y-3">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No campus events match your criteria</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search terms, club selections, or status filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Showing <strong className="text-white">{filteredEvents.length}</strong> events</span>
            <span>IIUC Active Catalog</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onSelect={setSelectedEvent}
                onRegister={isAdmin ? undefined : handleRegister}
              />
            ))}
          </div>
        </div>
      )}

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
