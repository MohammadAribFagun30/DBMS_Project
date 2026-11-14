import React from 'react';
import { Registration } from '../types';
import { StatusBadge } from './Badge';
import { X, Calendar, MapPin, Printer, QrCode, Sparkles, CheckCircle2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Printable Ticket Area */}
        <div id="printable-ticket" className="p-6 sm:p-8">
          {/* Ticket Header */}
          <div className="text-center pb-6 border-b border-dashed border-slate-200 relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 mx-auto flex items-center justify-center text-white shadow-md shadow-indigo-200 mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Official Digital Event Pass
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">
              {event?.title || 'Campus Event'}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {event?.club?.clubName || 'Organized by University Club'}
            </p>

            {/* Left and right notch cutouts */}
            <div className="absolute -bottom-3 -left-10 w-6 h-6 bg-slate-900/60 rounded-full" />
            <div className="absolute -bottom-3 -right-10 w-6 h-6 bg-slate-900/60 rounded-full" />
          </div>

          {/* Ticket Details */}
          <div className="py-6 space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Pass Number
                </span>
                <span className="font-mono text-base font-extrabold text-indigo-700">
                  {registration.passNumber}
                </span>
              </div>
              <StatusBadge status={registration.status} size="sm" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Date
                </span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Time
                </span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="col-span-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Venue & Location
                </span>
                <p className="font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  {event?.venue?.venueName || 'Campus Main Auditorium'}
                </p>
              </div>
            </div>

            {/* Simulated QR Code / Verification Barcode */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-2">
              <div className="w-28 h-28 bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
                <QrCode className="w-full h-full text-slate-900" />
              </div>
              <span className="text-[10px] font-mono font-medium text-slate-400">
                Scan at entry desk for attendance
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save Pass
          </button>
        </div>
      </div>
    </div>
  );
};

