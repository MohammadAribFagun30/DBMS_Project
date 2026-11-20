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
  X
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
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = ev.title.toLowerCase().includes(q);
      const matchDesc = ev.description?.toLowerCase().includes(q);
      const matchSpeaker = ev.workshop?.speakerName?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchSpeaker) return false;
    }

    if (selectedType !== 'ALL' && ev.eventType !== selectedType) {
      return false;
    }

    if (selectedClub && String(ev.clubId) !== selectedClub) {
      return false;
    }

    if (selectedVenue && String(ev.venueId) !== selectedVenue) {
      return false;
    }

    if (selectedStatus !== 'ALL' && ev.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  const eventTypes = ['ALL', 'WORKSHOP', 'HACKATHON', 'SEMINAR', 'COMPETITION', 'SOCIAL'];

  return (
    <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--primary)] font-semibold">
            Campus Catalog
          </span>
          <h1 className="font-heading font-semibold text-2xl text-[var(--text)] tracking-tight">
            Events & Workshops
          </h1>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Official technical workshops, seminars, and hackathons across IIUC clubs.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setProposeModalOpen(true)}
            className="btn-primary text-xs py-2 px-3.5 self-start md:self-auto"
          >
            <PlusCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
            Publish Event
          </button>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-[var(--surface)] p-4 rounded-[6px] border border-[var(--border)] space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <label className="block text-[11px] font-medium text-[var(--text)] mb-1">Search Keywords</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[var(--muted)] absolute left-2.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search by title, speaker, keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs font-sans text-[var(--text)] placeholder:text-[var(--muted)]"
              />
            </div>
          </div>

          {/* Club Dropdown */}
          <div>
            <label className="block text-[11px] font-medium text-[var(--text)] mb-1">Organizing Club</label>
            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs text-[var(--text)]"
            >
              <option value="">All Clubs</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.clubName}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-[11px] font-medium text-[var(--text)] mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs text-[var(--text)]"
            >
              <option value="ALL">All Status</option>
              <option value="APPROVED">Approved</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>

        {/* Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[var(--border)]">
          <span className="text-[11px] font-mono text-[var(--muted)] mr-1">
            Type:
          </span>

          {eventTypes.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSelectedType(t)}
              className={`px-2.5 py-1 rounded-[4px] text-xs font-mono transition-colors cursor-pointer ${
                selectedType === t
                  ? 'bg-[var(--primary)] text-[var(--primary-contrast)] font-medium'
                  : 'bg-[var(--surface-alt)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
              }`}
            >
              {t}
            </button>
          ))}

          {(search || selectedType !== 'ALL' || selectedClub || selectedVenue || selectedStatus !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedType('ALL');
                setSelectedClub('');
                setSelectedVenue('');
                setSelectedStatus('ALL');
              }}
              className="text-xs text-[#9B3A2D] hover:underline ml-auto flex items-center gap-1 font-mono cursor-pointer"
            >
              <X className="w-3 h-3" strokeWidth={1.5} /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Events Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-[var(--surface)] border border-[var(--border)] rounded-[6px] animate-pulse" />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[6px] p-10 text-center space-y-2">
          <Calendar className="w-8 h-8 text-[var(--muted)] mx-auto" strokeWidth={1.5} />
          <h3 className="font-heading font-semibold text-base text-[var(--text)]">No campus events match your criteria</h3>
          <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
            Try adjusting your search terms, club selections, or status filters.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] font-mono">
            <span>Showing <strong className="text-[var(--text)]">{filteredEvents.length}</strong> events</span>
            <span>IIUC Active Catalog</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
