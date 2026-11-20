import React from 'react';
import { EventItem } from '../types';
import { StatusBadge, TypeBadge } from './Badge';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Calendar,
  MapPin,
  Users,
  Mic,
  Ticket,
  Star
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
  if (!event) return null;

  const startDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);

  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const isCompleted = event.status === 'COMPLETED';
  const isApproved = event.status === 'APPROVED';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-900 dark:text-white transition-colors">
        {/* Header gradient banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-950 p-6 sm:p-8 text-white relative border-b border-indigo-900/50">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <TypeBadge type={event.eventType} />
            <StatusBadge status={event.status} />
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold leading-snug">{event.title}</h2>
          <p className="text-indigo-300 text-sm font-medium mt-1">
            Organized by <span className="font-bold text-white">{event.club?.clubName}</span>
          </p>
        </div>

        {/* Content body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Key details bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 dark:bg-slate-950/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div>
                <span className="block font-bold text-slate-900 dark:text-white">{formattedDate}</span>
                <span className="text-slate-500 dark:text-slate-400 text-xs">{formattedTime}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div>
                <span className="block font-bold text-slate-900 dark:text-white">{event.venue?.venueName || 'Campus Venue'}</span>
                <span className="text-slate-500 dark:text-slate-400 text-xs">{event.venue?.location || 'Main Campus'}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">About This Event</h4>
            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {event.description || 'Join this exciting club event to connect with peers, enhance your skills, and participate in campus activities.'}
            </p>
          </div>

          {/* Workshop Details if available */}
          {event.workshop && (
            <div className="p-4 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-800/40 space-y-3">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                <Mic className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Featured Speaker & Workshop Syllabus
              </div>

              <div className="text-xs space-y-1.5">
                <p className="text-slate-800 dark:text-slate-200">
                  <span className="font-bold text-indigo-600 dark:text-indigo-300">Speaker: </span>
                  {event.workshop.speakerName}
                </p>
                {event.workshop.speakerBio && (
                  <p className="text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Bio: </span>
                    {event.workshop.speakerBio}
                  </p>
                )}
                {event.workshop.prerequisites && (
                  <p className="text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/60 mt-2">
                    <span className="font-bold">Prerequisites: </span>
                    {event.workshop.prerequisites}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Venue & Capacity specs */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500 dark:text-slate-400">Registered:</span>
              <strong className="text-slate-900 dark:text-white">{event._count?.registrations ?? 0} attendees</strong>
            </div>

            {event.venue?.capacity && (
              <div className="text-slate-500 dark:text-slate-400">
                Venue Seating: <strong className="text-slate-900 dark:text-white">{event.venue.capacity} seats</strong>
              </div>
            )}

            {event.averageRating && (
              <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/60">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{event.averageRating} average student rating</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal footer actions */}
        <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-950/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
          >
            Close
          </button>

          {!isAdmin && isApproved && !isCompleted && onRegister && (
            <button
              onClick={() => {
                onRegister(event);
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 hover:scale-105"
            >
              <Ticket className="w-4 h-4" />
              Get Digital Entry Pass
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
