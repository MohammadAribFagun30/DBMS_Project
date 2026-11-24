import React, { useState, useEffect } from 'react';
import { EventItem, Club, Venue, Department } from '../types';
import { apiEvents, apiClubs, apiVenues, apiDepartments, apiRegistrations } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
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
  ArrowUpDown,
  X
} from 'lucide-react';

export const EventsPage: React.FC = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Sorting
  const [search, setSearch] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedClub, setSelectedClub] = useState<string>('');
  const [selectedVenue, setSelectedVenue] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'RECENT' | 'DATE'>('RECENT');

  // Modals
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [proposeModalOpen, setProposeModalOpen] = useState(false);
  const [ticketModalData, setTicketModalData] = useState<any | null>(null);

  useEffect(() => {
    loadData();
  }, [isAuthenticated, isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ev, cl, vn, dp] = await Promise.all([
        apiEvents.getAll(),
        apiClubs.getAll(),
        apiVenues.getAll(),
        apiDepartments.getAll(),
      ]);
      setEvents(ev);
      setClubs(cl);
      setVenues(vn);
      setDepartments(dp);

      if (isAuthenticated && !isAdmin) {
        try {
          const myRegs = await apiRegistrations.getMyRegistrations();
          setRegisteredEventIds(new Set(myRegs.map((r) => r.eventId)));
        } catch {
          // ignore error
        }
      }
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
      setRegisteredEventIds((prev) => new Set([...prev, event.id]));
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

    if (selectedDepartment) {
      const club = clubs.find((c) => c.id === ev.clubId);
      const evDeptId = ev.club?.departmentId || club?.departmentId;
      if (String(evDeptId) !== selectedDepartment) {
        return false;
      }
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

  // Sorting pipeline: Default to recently added event first, or event schedule date
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'RECENT') {
      const timeB = new Date(b.createdAt || 0).getTime();
      const timeA = new Date(a.createdAt || 0).getTime();
      if (timeB !== timeA && !isNaN(timeB) && !isNaN(timeA)) {
        return timeB - timeA;
      }
      return b.id - a.id;
    }

    if (sortBy === 'DATE') {
      const timeA = new Date(a.startTime).getTime();
      const timeB = new Date(b.startTime).getTime();
      return timeA - timeB;
    }

    return 0;
  });

  const availableClubs = selectedDepartment
    ? clubs.filter((c) => String(c.departmentId) === selectedDepartment)
    : clubs;

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search Box */}
          <div className="relative sm:col-span-2 lg:col-span-2">
            <label className="block text-[11px] font-medium text-[var(--text)] mb-1">{t('Search Keywords')}</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[var(--muted)] absolute left-2.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
              <input
                type="text"
                placeholder={t('Search by title, speaker, keyword...')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs font-sans text-[var(--text)] placeholder:text-[var(--muted)]"
              />
            </div>
          </div>

          {/* Department Dropdown */}
          <div>
            <label className="block text-[11px] font-medium text-[var(--text)] mb-1">{t('Academic Department')}</label>
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

          {/* Club Dropdown */}
          <div>
            <label className="block text-[11px] font-medium text-[var(--text)] mb-1">{t('Organizing Club')}</label>
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

          {/* Status Dropdown */}
          <div>
            <label className="block text-[11px] font-medium text-[var(--text)] mb-1">{t('Status')}</label>
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

          {(search || selectedType !== 'ALL' || selectedDepartment || selectedClub || selectedVenue || selectedStatus !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedType('ALL');
                setSelectedDepartment('');
                setSelectedClub('');
                setSelectedVenue('');
                setSelectedStatus('ALL');
              }}
              className="text-xs text-[#9B3A2D] hover:underline ml-auto flex items-center gap-1 font-mono cursor-pointer"
            >
              <X className="w-3 h-3" strokeWidth={1.5} /> {t('Reset Filters')}
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
      ) : sortedEvents.length === 0 ? (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[6px] p-10 text-center space-y-2">
          <Calendar className="w-8 h-8 text-[var(--muted)] mx-auto" strokeWidth={1.5} />
          <h3 className="font-heading font-semibold text-base text-[var(--text)]">No campus events match your criteria</h3>
          <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
            Try adjusting your search terms, club selections, or status filters.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[var(--muted)] font-mono">
            <span>
              {t('Showing')} <strong className="text-[var(--text)]">{sortedEvents.length}</strong> {t('events')}
            </span>

            {/* Event Sorting Control */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-[11px] font-medium text-[var(--muted)] flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" strokeWidth={1.5} />
                {t('Sort By')}:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'RECENT' | 'DATE')}
                className="px-2.5 py-1 text-xs text-[var(--text)] bg-[var(--surface)] border border-[var(--border)] rounded-[4px] cursor-pointer focus:outline-none"
              >
                <option value="RECENT">{t('Recently Added (Default)')}</option>
                <option value="DATE">{t('Event Date')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isRegistered={registeredEventIds.has(event.id)}
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
        isRegistered={selectedEvent ? registeredEventIds.has(selectedEvent.id) : false}
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
