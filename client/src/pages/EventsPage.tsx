import React, { useState, useEffect } from 'react';
import { EventItem, Club, Venue } from '../types';
import { apiEvents, apiClubs, apiVenues, apiRegistrations } from '../services/api';
import { EventCard } from '../components/EventCard';
import { EventDetailModal } from '../components/EventDetailModal';
import { ProposeEventModal } from '../components/ProposeEventModal';
import { TicketPassModal } from '../components/TicketPassModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Search,
  Filter,
  PlusCircle,
  Calendar,
  Compass,
  MapPin,
  Sparkles,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';

export const EventsPage: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const toast = useToast();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedClub, setSelectedClub] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [proposeModalOpen, setProposeModalOpen] = useState(false);
  const [ticketModalData, setTicketModalData] = useState<any | null>(null);

  useEffect(() => {
    loadData();
    apiClubs.getAll().then(setClubs);
    apiVenues.getAll().then(setVenues);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await apiEvents.getAll();
      setEvents(data);
    } catch {
      // handled in service
    } finally {
      setLoading(false);
    }
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

  const filteredEvents = events.filter((e) => {
    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchDesc = e.description?.toLowerCase().includes(q) || false;
      const matchSpeaker = e.workshop?.speakerName.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchDesc && !matchSpeaker) return false;
    }

    // Type filter
    if (selectedType !== 'ALL' && e.eventType?.toUpperCase() !== selectedType) {
      return false;
    }

    // Club filter
    if (selectedClub && String(e.clubId) !== selectedClub) {
      return false;
    }

    // Venue filter
    if (selectedVenue && String(e.venueId) !== selectedVenue) {
      return false;
    }

    // Status filter
    if (selectedStatus !== 'ALL' && e.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  const eventTypes = ['ALL', 'WORKSHOP', 'HACKATHON', 'SEMINAR', 'COMPETITION', 'SOCIAL'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            University Events Catalog
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Events & Workshops</h1>
          <p className="text-slate-500 text-sm mt-1">
            Browse upcoming workshops, hackathons, and guest lectures across all university clubs.
          </p>
        </div>

        <button
          onClick={() => setProposeModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-100 transition-all self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          {isAdmin ? 'Publish Event' : 'Propose Event'}
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search events by title, description, speaker..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
            />
          </div>

          {/* Club Dropdown */}
          <div className="w-full md:w-56">
            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm bg-white"
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
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm bg-white"
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
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm bg-white"
            >
              <option value="ALL">All Status</option>
              <option value="APPROVED">Approved</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>

        {/* Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Type:
          </span>
          {eventTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedType === type
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 font-medium">Loading events...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-base text-slate-800">No events found</h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search criteria or filter tags.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedType('ALL');
              setSelectedClub('');
              setSelectedVenue('');
              setSelectedStatus('ALL');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 text-indigo-600 text-xs font-bold hover:bg-slate-200"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onSelect={setSelectedEvent}
              onRegister={handleRegister}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRegister={handleRegister}
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

