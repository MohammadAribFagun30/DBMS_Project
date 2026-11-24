import React from 'react';
import { EventItem } from '../types';
import { StatusBadge, TypeBadge } from './Badge';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  X,
  Calendar,
  MapPin,
  Users,
  Mic,
  Ticket,
  Star,
  Check
} from 'lucide-react';

interface EventDetailModalProps {
  event: EventItem | null;
  onClose: () => void;
  onRegister?: (event: EventItem) => void;
  isRegistered?: boolean;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onRegister,
  isRegistered = false,
}) => {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();
  if (!event) return null;

  const startDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);

  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const isCompleted = event.status === 'COMPLETED';
  const isApproved = event.status === 'APPROVED';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
      <div className="relative bg-[var(--surface)] text-[var(--text)] rounded-[6px] max-w-2xl w-full border border-[var(--border)] overflow-hidden">
        {/* Header bar */}
        <div className="bg-[var(--surface-alt)] p-5 border-b border-[var(--border)] relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-[4px] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <TypeBadge type={event.eventType} />
            <StatusBadge status={event.status} />
          </div>

          <h2 className="text-xl font-heading font-semibold text-[var(--text)] leading-snug">{event.title}</h2>
          <p className="text-[var(--muted)] text-xs mt-1">
            Organized by <span className="font-medium text-[var(--text)]">{event.club?.clubName}</span>
          </p>
        </div>

        {/* Content body */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Key details bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[var(--surface-alt)] p-3 rounded-[6px] border border-[var(--border)] text-xs">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-[var(--primary)] shrink-0" strokeWidth={1.5} />
              <div>
                <span className="block font-medium text-[var(--text)] font-mono">{formattedDate}</span>
                <span className="text-[var(--muted)] text-[11px] font-mono">{formattedTime}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-[var(--primary)] shrink-0" strokeWidth={1.5} />
              <div>
                <span className="block font-medium text-[var(--text)]">{event.venue?.venueName || 'Campus Venue'}</span>
                <span className="text-[var(--muted)] text-[11px]">{event.venue?.location || 'Main Campus'}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)] mb-1.5">About This Event</h4>
            <p className="text-[var(--text)] text-sm leading-relaxed whitespace-pre-line">
              {event.description || 'Join this campus event to connect with peers, enhance your skills, and participate in campus activities.'}
            </p>
          </div>

          {/* Workshop Details if available */}
          {event.workshop && (
            <div className="p-3.5 bg-[var(--surface-alt)] rounded-[6px] border border-[var(--border)] space-y-2">
              <div className="flex items-center gap-2 text-[var(--text)] font-medium text-xs font-heading">
                <Mic className="w-3.5 h-3.5 text-[var(--primary)]" strokeWidth={1.5} />
                Featured Speaker & Syllabus
              </div>

              <div className="text-xs space-y-1">
                <p className="text-[var(--text)]">
                  <span className="text-[var(--muted)]">Speaker: </span>
                  <span className="font-medium">{event.workshop.speakerName}</span>
                </p>
                {event.workshop.speakerBio && (
                  <p className="text-[var(--muted)] text-[11px]">
                    <span>Bio: </span>
                    {event.workshop.speakerBio}
                  </p>
                )}
                {event.workshop.prerequisites && (
                  <p className="text-[var(--text)] bg-[var(--surface)] p-2 rounded-[4px] border border-[var(--border)] text-[11px] mt-1.5">
                    <span className="font-medium">Prerequisites: </span>
                    {event.workshop.prerequisites}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Venue & Capacity specs */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[var(--surface-alt)] rounded-[6px] border border-[var(--border)] text-xs">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-[var(--muted)]" strokeWidth={1.5} />
              <span className="text-[var(--muted)]">Registered:</span>
              <strong className="text-[var(--text)] font-mono">{event._count?.registrations ?? 0} attendees</strong>
            </div>

            {event.venue?.capacity && (
              <div className="text-[var(--muted)]">
                Venue Seating: <strong className="text-[var(--text)] font-mono">{event.venue.capacity} seats</strong>
              </div>
            )}

            {event.averageRating && (
              <div className="flex items-center gap-1 text-[var(--text)] font-mono text-[11px] bg-[var(--surface)] px-2 py-0.5 rounded-[4px] border border-[var(--border)]">
                <Star className="w-3 h-3 text-[var(--highlight)] fill-current" strokeWidth={1.5} />
                <span>{event.averageRating} average rating</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal footer actions */}
        <div className="p-4 bg-[var(--surface-alt)] border-t border-[var(--border)] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            {t('Close')}
          </button>

          {isRegistered ? (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] bg-[#2E6B4D] text-white text-xs font-mono font-medium shadow-xs select-none">
              <Check className="w-4 h-4 shrink-0" strokeWidth={2.5} />
              <span>{t('Registered')}</span>
            </div>
          ) : !isAdmin && isApproved && !isCompleted && onRegister ? (
            <button
              onClick={() => {
                onRegister(event);
                onClose();
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Ticket className="w-3.5 h-3.5" strokeWidth={1.5} />
              {t('Get Digital Entry Pass', 'Get Digital Entry Pass')}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
