import React from 'react';
import { Registration } from '../types';
import { StatusBadge } from './Badge';
import { X, Calendar, MapPin, Printer, QrCode, Bookmark } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
      <div className="relative bg-[var(--surface)] rounded-[6px] max-w-sm w-full border border-[var(--border)] overflow-hidden text-[var(--text)]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-7 h-7 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] flex items-center justify-center cursor-pointer"
        >
          <X className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>

        {/* Printable Ticket Area */}
        <div id="printable-ticket" className="p-5">
          {/* Ticket Header */}
          <div className="text-center pb-4 border-b border-dashed border-[var(--border)]">
            <div className="w-8 h-8 rounded-[4px] bg-[var(--primary)] text-[var(--primary-contrast)] dark:bg-[#D4A24C]/20 dark:text-[#E5B55E] dark:border dark:border-[#D4A24C]/40 mx-auto flex items-center justify-center mb-2">
              <Bookmark className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] block">
              International Islamic University Chittagong
            </span>
            <span className="text-xs font-mono font-medium uppercase tracking-wider text-[var(--primary)] dark:text-[#D4A24C] block mt-0.5">
              Official Digital Event Pass
            </span>
            <h3 className="font-heading font-semibold text-base text-[var(--text)] mt-1">
              {event?.title || 'Campus Event'}
            </h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              {event?.club?.clubName || 'Organized by IIUC Club'}
            </p>
          </div>

          {/* Ticket Details */}
          <div className="py-4 space-y-3">
            <div className="flex items-center justify-between bg-[var(--surface-alt)] p-2.5 rounded-[4px] border border-[var(--border)]">
              <div>
                <span className="text-[10px] uppercase font-mono text-[var(--muted)] block">
                  Pass Number
                </span>
                <span className="font-mono text-sm font-semibold text-[var(--primary)] dark:text-[#D4A24C]">
                  {registration.passNumber}
                </span>
              </div>
              <StatusBadge status={registration.status} size="sm" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-[var(--surface-alt)] p-3 rounded-[4px] border border-[var(--border)] font-mono">
              <div>
                <span className="text-[var(--muted)] block text-[10px] uppercase">Attendee</span>
                <strong className="text-[var(--text)] text-xs font-sans">{registration.user?.fullName || 'Alice Rahman'}</strong>
              </div>
              <div>
                <span className="text-[var(--muted)] block text-[10px] uppercase">Matric No.</span>
                <strong className="text-[var(--text)] text-xs">{registration.user?.studentId || 'CSE-2201'}</strong>
              </div>
              <div className="col-span-2 pt-2 border-t border-[var(--border)]">
                <span className="text-[var(--muted)] block text-[10px] uppercase">Date & Venue</span>
                <div className="flex items-center gap-1.5 mt-0.5 text-[var(--text)] font-sans">
                  <Calendar className="w-3 h-3 text-[var(--muted)] shrink-0" strokeWidth={1.5} />
                  <span>{startDate.toLocaleDateString()}</span>
                  <span>•</span>
                  <MapPin className="w-3 h-3 text-[var(--muted)] shrink-0" strokeWidth={1.5} />
                  <span className="truncate">{event?.venue?.venueName || 'Main Campus Venue'}</span>
                </div>
              </div>
            </div>

            {/* QR Code Graphic Mockup */}
            <div className="bg-[var(--surface-alt)] p-4 rounded-[4px] border border-[var(--border)] text-center space-y-1.5">
              <div className="w-28 h-28 mx-auto bg-white p-2 rounded-[4px] flex items-center justify-center border border-[var(--border)]">
                <QrCode className="w-24 h-24 text-slate-900" strokeWidth={1.5} />
              </div>
              <p className="text-[10px] font-mono text-[var(--muted)]">
                HASH: {registration.passNumber}-VALID
              </p>
              <p className="text-[10px] text-[var(--muted)]">
                Present this pass at venue desk for verification.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={handlePrint}
              className="btn-primary btn-print-pass w-full text-xs py-1.5 font-medium"
            >
              <Printer className="w-3.5 h-3.5" strokeWidth={1.5} />
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
