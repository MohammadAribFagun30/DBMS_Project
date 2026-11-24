import React from 'react';
import { EventItem } from '../types';
import { StatusBadge, TypeBadge } from './Badge';
import { Calendar, MapPin, Users, Mic, Star, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface EventCardProps {
  event: EventItem;
  onSelect: (event: EventItem) => void;
  onRegister?: (event: EventItem) => void;
  isRegistered?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onSelect,
  onRegister,
  isRegistered = false,
}) => {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();
  const startDate = new Date(event.startTime);
  const formattedDate = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const isCompleted = event.status === 'COMPLETED';

  return (
    <div className="card-hover-lift bg-[var(--surface)] rounded-[6px] border border-[var(--border)] flex flex-col overflow-hidden">
      {/* Header with Type and Status */}
      <div className="p-4 pb-2.5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <TypeBadge type={event.eventType} />
          <StatusBadge status={event.status} />
        </div>

        <h3
          onClick={() => onSelect(event)}
          className="font-heading font-semibold text-base text-[var(--text)] hover:text-[var(--primary)] transition-colors cursor-pointer line-clamp-2"
        >
          {event.title}
        </h3>

        <p className="text-xs font-medium text-[var(--primary)] mt-1">
          {event.club?.clubName || t('Campus Club')}
        </p>

        <p className="text-[var(--muted)] text-xs mt-2 line-clamp-2 leading-relaxed">
          {event.description || t('No description provided.')}
        </p>
      </div>

      {/* Workshop Speaker Box if applicable */}
      {event.workshop && (
        <div className="mx-4 mb-3 px-2.5 py-1.5 bg-[var(--surface-alt)] rounded-[4px] border border-[var(--border)] flex items-center gap-2 text-xs text-[var(--text)]">
          <Mic className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" strokeWidth={1.5} />
          <div className="truncate">
            <span className="font-medium block truncate">{t('Speaker:')} {event.workshop.speakerName}</span>
            {event.workshop.prerequisites && (
              <span className="text-[11px] font-mono text-[var(--muted)] block truncate">{t('Req:')} {event.workshop.prerequisites}</span>
            )}
          </div>
        </div>
      )}

      {/* Meta info: Date & Venue */}
      <div className="px-4 py-2.5 bg-[var(--surface-alt)] border-t border-[var(--border)] space-y-1.5 text-xs text-[var(--muted)] mt-auto font-mono">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" strokeWidth={1.5} />
          <span className="truncate">{formattedDate} • {formattedTime}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" strokeWidth={1.5} />
          <span className="truncate">{event.venue?.venueName || t('Campus Venue')}</span>
        </div>
      </div>

      {/* Footer bar with spots and actions */}
      <div className="px-4 py-2.5 border-t border-[var(--border)] flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-mono text-[var(--muted)]">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" strokeWidth={1.5} />
            <span className="font-medium text-[var(--text)]">{event._count?.registrations ?? 0}</span>
            <span>{t('registered')}</span>
          </div>

          {event.averageRating && (
            <div className="flex items-center gap-1 text-xs text-[var(--highlight)]">
              <Star className="w-3 h-3 fill-[var(--highlight)] text-[var(--highlight)] shrink-0" strokeWidth={1.5} />
              <span>{event.averageRating}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[var(--border)]/50">
          <button
            type="button"
            onClick={() => onSelect(event)}
            className="btn-secondary text-xs py-1.5 px-2 w-full text-center truncate rounded-[4px]"
          >
            {t('Details')}
          </button>

          {isRegistered ? (
            <div
              className="text-xs py-1.5 px-2 w-full text-center truncate rounded-[4px] font-medium font-mono bg-[#2E6B4D] text-white border border-[#2E6B4D] shadow-xs flex items-center justify-center gap-1 cursor-default select-none"
              title={t('Registered')}
            >
              <Check className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
              <span className="truncate">{t('Registered')}</span>
            </div>
          ) : !isAdmin && onRegister ? (
            <button
              type="button"
              disabled={isCompleted || event.status !== 'APPROVED'}
              onClick={() => onRegister(event)}
              className={`text-xs py-1.5 px-2 w-full text-center truncate rounded-[4px] font-medium transition-colors ${
                isCompleted
                  ? 'bg-[var(--surface-alt)] text-[var(--muted)] border border-[var(--border)] cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              {isCompleted ? t('Closed') : t('Register')}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSelect(event)}
              className="btn-primary text-xs py-1.5 px-2 w-full text-center truncate rounded-[4px]"
            >
              {t('View')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
