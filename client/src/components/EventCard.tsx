import React from 'react';
import { EventItem } from '../types';
import { StatusBadge, TypeBadge } from './Badge';
import { Calendar, MapPin, Users, Mic, Star, ArrowRight, Award } from 'lucide-react';

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
    <div className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Header with Type and Status */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <TypeBadge type={event.eventType} />
          <StatusBadge status={event.status} />
        </div>

        <h3
          onClick={() => onSelect(event)}
          className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer line-clamp-2"
        >
          {event.title}
        </h3>

        <p className="text-xs font-semibold text-indigo-600 mt-1 flex items-center gap-1">
          {event.club?.clubName || 'Campus Club'}
        </p>

        <p className="text-slate-500 text-xs mt-2 line-clamp-2 leading-relaxed">
          {event.description || 'No description provided.'}
        </p>
      </div>

      {/* Workshop Speaker Box if applicable */}
      {event.workshop && (
        <div className="mx-5 mb-3 px-3 py-2 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center gap-2.5 text-xs text-indigo-950">
          <Mic className="w-4 h-4 text-indigo-600 shrink-0" />
          <div className="truncate">
            <span className="font-semibold block truncate">Speaker: {event.workshop.speakerName}</span>
            {event.workshop.prerequisites && (
              <span className="text-[11px] text-indigo-700 block truncate">Req: {event.workshop.prerequisites}</span>
            )}
          </div>
        </div>
      )}

      {/* Meta info: Date & Venue */}
      <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 space-y-2 text-xs text-slate-600 mt-auto">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <span>{formattedDate} • {formattedTime}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="truncate">{event.venue?.venueName || 'Campus Venue'}</span>
        </div>
      </div>

      {/* Footer bar with spots and actions */}
      <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-700">{event._count?.registrations ?? 0}</span>
          <span>registered</span>
        </div>

        {event.averageRating && (
          <div className="flex items-center gap-1 text-xs text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{event.averageRating}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {onRegister && !isCompleted && event.status === 'APPROVED' && (
            <button
              onClick={() => onRegister(event)}
              disabled={isRegistered}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                isRegistered
                  ? 'bg-emerald-100 text-emerald-800 cursor-default'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
              }`}
            >
              {isRegistered ? 'Pass Issued' : 'Get Pass'}
            </button>
          )}

          <button
            onClick={() => onSelect(event)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="View Details"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

