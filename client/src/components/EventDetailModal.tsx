import React from 'react';
import { EventItem } from '../types';
import { StatusBadge, TypeBadge } from './Badge';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Mic,
  Award,
  Sparkles,
  Ticket,
  Star,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface EventDetailModalProps {
  event: EventItem | null;
  onClose: () => void;
  onRegister: (event: EventItem) => void;
  isRegistered?: boolean;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onRegister,
  isRegistered = false,
}) => {
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header gradient banner */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white relative">
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
          <p className="text-indigo-100 text-sm font-medium mt-1">
            Organized by <span className="font-bold text-white">{event.club?.clubName}</span>
          </p>
        </div>

        {/* Content body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Key details bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs sm:text-sm text-slate-700">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <span className="block font-bold text-slate-900">{formattedDate}</span>
                <span className="text-slate-500 text-xs">{formattedTime}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <MapPin className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <span className="block font-bold text-slate-900">{event.venue?.venueName || 'Campus Venue'}</span>
                <span className="text-slate-500 text-xs">{event.venue?.location || 'Main Campus'}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">About This Event</h4>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
              {event.description || 'Join this exciting club event to connect with peers, enhance your skills, and participate in campus activities.'}
            </p>
          </div>

          {/* Workshop Details if available */}
          {event.workshop && (
            <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 space-y-3">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                <Mic className="w-4 h-4 text-indigo-600" />
                Featured Speaker & Workshop Syllabus
              </div>

              <div className="text-xs space-y-1.5">
                <p className="text-slate-800">
                  <span className="font-bold text-indigo-950">Speaker: </span>
                  {event.workshop.speakerName}
                </p>
                {event.workshop.speakerBio && (
                  <p className="text-slate-600">
                    <span className="font-semibold text-slate-700">Bio: </span>
                    {event.workshop.speakerBio}
                  </p>
                )}
                {event.workshop.prerequisites && (
                  <p className="text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200 mt-2">
                    <span className="font-bold">Prerequisites: </span>
                    {event.workshop.prerequisites}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Sponsors Ledger preview if present */}
          {event.sponsors && event.sponsors.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Corporate Sponsors & Partners
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {event.sponsors.map((s) => (
                  <div key={s.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{s.sponsor?.companyName || 'Sponsor'}</p>
                      <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">
                        {s.sponsorshipTier} Sponsor
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                      ${Number(s.amountFunded).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Registration Stats & Feedback */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                <strong className="text-slate-800">{event._count?.registrations ?? 0}</strong> students registered
              </span>
              {event.averageRating && (
                <span className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  {event.averageRating} / 5.0 rating
                </span>
              )}
            </div>

            <span className="text-[11px] text-slate-400">ID: #{event.id}</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
          >
            Close
          </button>

          {isApproved && !isCompleted ? (
            <button
              onClick={() => {
                onRegister(event);
                onClose();
              }}
              disabled={isRegistered}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all ${
                isRegistered
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
              }`}
            >
              <Ticket className="w-4 h-4" />
              {isRegistered ? 'You have registered (Pass Available)' : 'Register & Get Digital Pass'}
            </button>
          ) : isCompleted ? (
            <div className="text-xs font-semibold text-slate-500 bg-slate-200 px-3 py-1.5 rounded-xl">
              This event has completed
            </div>
          ) : (
            <div className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
              Pending Admin Approval
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

