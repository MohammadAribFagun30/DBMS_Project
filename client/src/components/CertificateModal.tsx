import React from 'react';
import { Certificate } from '../types';
import { X, Award, Printer, ShieldCheck } from 'lucide-react';

interface CertificateModalProps {
  certificate: Certificate | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose }) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!certificate) return null;

  const eventTitle = certificate.registration?.event?.title || 'Technical Workshop';
  const studentName = certificate.registration?.user?.fullName || 'Alice Rahman';
  const studentId = certificate.registration?.user?.studentId || 'CSE-2201';
  const clubName = certificate.registration?.event?.club?.clubName || 'University Club Alliance';
  const issueDate = new Date(certificate.issueDate || Date.now()).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[var(--surface)] rounded-[6px] max-w-xl w-full border border-[var(--border)] overflow-hidden text-[var(--text)] cursor-default"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3 right-3 z-30 w-7 h-7 rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] flex items-center justify-center cursor-pointer"
        >
          <X className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>

        {/* Certificate Canvas */}
        <div id="printable-certificate" className="p-8 m-3 border-2 border-[var(--border)] bg-[var(--surface-alt)] rounded-[4px] text-center space-y-4">
          <div className="flex justify-center mb-2">
            <div className="w-10 h-10 rounded-[4px] bg-[var(--primary)] text-[var(--primary-contrast)] flex items-center justify-center">
              <Award className="w-5 h-5" strokeWidth={1.5} />
            </div>
          </div>

          <div>
            <h2 className="font-heading font-semibold text-xl tracking-wide uppercase text-[var(--text)]">
              Certificate of Participation
            </h2>
            <p className="text-xs font-mono font-medium text-[var(--primary)] uppercase tracking-wider mt-0.5">
              International Islamic University Chittagong (IIUC)
            </p>
            <p className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-wider">
              Directorate of Students' Affairs (DSA) • Credential Registry
            </p>
          </div>

          <p className="text-xs text-[var(--muted)] italic pt-2">This is to certify that</p>

          <h3 className="font-heading text-xl font-semibold text-[var(--text)] border-b border-[var(--border)] pb-1 inline-block px-6">
            {studentName}
          </h3>
          <p className="text-xs font-mono text-[var(--muted)] block">
            Student ID: {studentId}
          </p>

          <p className="text-xs text-[var(--text)] max-w-md mx-auto leading-relaxed pt-1">
            has participated in the academic session <strong className="font-semibold">"{eventTitle}"</strong> organized by <span className="font-medium text-[var(--primary)]">{clubName}</span>.
          </p>

          {/* Signatures Footer */}
          <div className="pt-6 border-t border-[var(--border)] grid grid-cols-2 gap-6 items-end text-xs font-mono">
            <div>
              <div className="w-28 h-0.5 bg-[var(--border)] mx-auto mb-1" />
              <p className="font-medium text-[var(--text)] text-[11px]">Club Executive</p>
              <p className="text-[10px] text-[var(--muted)]">{clubName}</p>
            </div>

            <div>
              <div className="w-28 h-0.5 bg-[var(--border)] mx-auto mb-1" />
              <p className="font-medium text-[var(--text)] text-[11px]">Faculty Advisor</p>
              <p className="text-[10px] text-[var(--muted)]">Directorate of Students' Affairs</p>
            </div>
          </div>

          <div className="pt-2 text-[10px] font-mono text-[var(--muted)] flex items-center justify-between border-t border-[var(--border)]">
            <span>ID: {certificate.certificateNumber}</span>
            <span>Date: {issueDate}</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-3 border-t border-[var(--border)] bg-[var(--surface)] flex items-center justify-between">
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-primary text-xs py-1.5 px-3"
          >
            <Printer className="w-3.5 h-3.5" strokeWidth={1.5} />
            Print / Save Certificate
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
  );
};
