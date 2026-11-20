import React from 'react';
import { EventItem } from '../types';
import { StatusBadge, TypeBadge } from './Badge';
import { Calendar, MapPin, Users, Mic, Star, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
    <div className="group bg-white dark:bg-slate-900/85 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 shadow-md hover:shadow-xl dark:shadow-slate-950/60 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Header with Type and Status */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <TypeBadge type={event.eventType} />
          <StatusBadge status={event.status} />
        </div>

        <h3
          onClick={() => onSelect(event)}
          className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer line-clamp-2"
        >
          {event.title}
        </h3>

        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1">
          {event.club?.clubName || 'Campus Club'}
        </p>

        <p className="text-slate-600 dark:text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">
          {event.description || 'No description provided.'}
        </p>
      </div>

      {/* Workshop Speaker Box if applicable */}
      {event.workshop && (
        <div className="mx-5 mb-3 px-3 py-2 bg-indigo-50/80 dark:bg-indigo-950/50 rounded-xl border border-indigo-100 dark:border-indigo-800/40 flex items-center gap-2.5 text-xs text-indigo-900 dark:text-indigo-200">
          <Mic className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <div className="truncate">
            <span className="font-semibold block truncate">Speaker: {event.workshop.speakerName}</span>
            {event.workshop.prerequisites && (
              <span className="text-[11px] text-indigo-700/80 dark:text-indigo-300 block truncate">Req: {event.workshop.prerequisites}</span>
            )}
          </div>
        </div>
      )}

      {/* Meta info: Date & Venue */}
      <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs text-slate-600 dark:text-slate-400 mt-auto">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
          <span>{formattedDate} • {formattedTime}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
          <span className="truncate">{event.venue?.venueName || 'Campus Venue'}</span>
        </div>
      </div>

      {/* Footer bar with spots and actions */}
      <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 bg-slate-50/80 dark:bg-slate-900/50">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Users className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">{event._count?.registrations ?? 0}</span>
          <span>registered</span>
        </div>

        {event.averageRating && (
          <div className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800/60">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{event.averageRating}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {!isAdmin && onRegister && !isCompleted && event.status === 'APPROVED' && (
            <button
              onClick={() => onRegister(event)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all hover:scale-105"
            >
              Get Pass
            </button>
          )}

          <button
            onClick={() => onSelect(event)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-xl transition-all"
            title="View Details"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
