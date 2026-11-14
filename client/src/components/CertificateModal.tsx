import React from 'react';
import { Certificate } from '../types';
import { X, Award, Printer, ShieldCheck, CheckCircle2, Sparkles, University } from 'lucide-react';

interface CertificateModalProps {
  certificate: Certificate | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose }) => {
  if (!certificate) return null;

  const eventTitle = certificate.registration?.event?.title || 'Advanced Technical Workshop';
  const studentName = certificate.registration?.user?.fullName || 'Alice Rahman';
  const studentId = certificate.registration?.user?.studentId || 'CSE-2201';
  const clubName = certificate.registration?.event?.club?.clubName || 'University Club Alliance';
  const issueDate = new Date(certificate.issueDate || Date.now()).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Certificate Canvas */}
        <div id="printable-certificate" className="p-8 sm:p-12 relative bg-gradient-to-b from-amber-50/40 via-white to-indigo-50/30 border-8 border-double border-indigo-200/80 m-4 rounded-2xl shadow-inner text-center">
          {/* Ornamental corner icons */}
          <Sparkles className="w-6 h-6 text-indigo-400 absolute top-3 left-3 opacity-60" />
          <Sparkles className="w-6 h-6 text-indigo-400 absolute top-3 right-3 opacity-60" />
          <Sparkles className="w-6 h-6 text-indigo-400 absolute bottom-3 left-3 opacity-60" />
          <Sparkles className="w-6 h-6 text-indigo-400 absolute bottom-3 right-3 opacity-60" />

          {/* Header */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100 ring-4 ring-white">
              <Award className="w-8 h-8" />
            </div>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-wide uppercase">
            Certificate of Participation
          </h2>
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">
            Club Event & Workshop Management System
          </p>

          <p className="text-xs text-slate-500 mt-6 italic">This is proudly presented to</p>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-indigo-950 mt-2 font-serif border-b border-indigo-100 pb-2 inline-block px-8">
            {studentName}
          </h3>
          <p className="text-xs font-mono font-semibold text-slate-500 mt-1">
            Student ID: {studentId}
          </p>

          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mt-4 leading-relaxed">
            For successfully attending and participating in the event{' '}
            <strong className="text-slate-900 font-bold">"{eventTitle}"</strong> organized by{' '}
            <span className="text-indigo-700 font-semibold">{clubName}</span>.
          </p>

          {/* Footer of the certificate */}
          <div className="mt-8 pt-6 border-t border-slate-200/80 grid grid-cols-2 gap-4 text-xs">
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Certificate ID
              </span>
              <span className="font-mono font-bold text-indigo-700">{certificate.certificateNumber}</span>
              <span className="text-[10px] text-slate-400 block mt-1">Issued: {issueDate}</span>
            </div>

            <div className="text-right flex flex-col items-end">
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Credential
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">University Academic Registrar</span>
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
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save Certificate
          </button>
        </div>
      </div>
    </div>
  );
};

