import React from 'react';
import { Registration } from '../types';
import { StatusBadge } from './Badge';
import { X, Calendar, MapPin, Printer, QrCode, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

interface TicketPassModalProps {
  registration: Registration | null;
  onClose: () => void;
}

export const TicketPassModal: React.FC<TicketPassModalProps> = ({ registration, onClose }) => {
  if (!registration) return null;

  const event = registration.event;
  const startDate = event ? new Date(event.startTime) : new Date();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Printable Ticket Area */}
        <div id="printable-ticket" className="p-6 sm:p-8">
          {/* Ticket Header */}
          <div className="text-center pb-6 border-b border-dashed border-slate-800 relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-0.5">
              International Islamic University Chittagong
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Official Digital Event Pass
            </span>
            <h3 className="text-xl font-extrabold text-white mt-1">
              {event?.title || 'Campus Event'}
            </h3>
            <p className="text-xs text-indigo-300 font-medium mt-0.5">
              {event?.club?.clubName || 'Organized by IIUC Club'}
            </p>

            {/* Left and right notch cutouts */}
            <div className="absolute -bottom-3 -left-10 w-6 h-6 bg-slate-950 rounded-full border border-slate-800" />
            <div className="absolute -bottom-3 -right-10 w-6 h-6 bg-slate-950 rounded-full border border-slate-800" />
          </div>

          {/* Ticket Details */}
          <div className="py-6 space-y-4">
            <div className="flex items-center justify-between bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Pass Number
                </span>
                <span className="font-mono text-base font-extrabold text-indigo-300">
                  {registration.passNumber}
                </span>
              </div>
              <StatusBadge status={registration.status} size="sm" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Attendee Name</span>
                <strong className="text-white text-sm">{registration.user?.fullName || 'Alice Rahman'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Matric Number</span>
                <strong className="text-white text-sm font-mono">{registration.user?.studentId || 'CSE-2201'}</strong>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Date & Venue</span>
                <div className="flex items-center gap-1.5 mt-0.5 text-slate-200">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{startDate.toLocaleDateString()}</span>
                  <span>•</span>
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">{event?.venue?.venueName || 'Main Campus Venue'}</span>
                </div>
              </div>
            </div>

            {/* QR Code Graphic Mockup */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 text-center space-y-2">
              <div className="w-36 h-36 mx-auto bg-white p-3 rounded-xl flex items-center justify-center shadow-md">
                <QrCode className="w-32 h-32 text-slate-900" />
              </div>
              <p className="text-[10px] font-mono font-bold text-slate-400">
                REG-PASS-HASH: {registration.passNumber}-VALID
              </p>
              <p className="text-[11px] text-slate-400">
                Present this digital pass at the entrance desk for check-in verification.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:text-white"
          >
            Done
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-600 shadow-md transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
};
