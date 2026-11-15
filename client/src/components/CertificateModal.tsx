import React from 'react';
import { Certificate } from '../types';
import { X, Award, Printer, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Certificate Canvas */}
        <div id="printable-certificate" className="p-8 sm:p-12 relative bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 border-8 border-double border-indigo-500/40 m-4 rounded-2xl shadow-2xl text-center text-white">
          {/* Ornamental corner icons */}
          <Sparkles className="w-6 h-6 text-indigo-400 absolute top-3 left-3 opacity-60" />
          <Sparkles className="w-6 h-6 text-indigo-400 absolute top-3 right-3 opacity-60" />
          <Sparkles className="w-6 h-6 text-indigo-400 absolute bottom-3 left-3 opacity-60" />
          <Sparkles className="w-6 h-6 text-indigo-400 absolute bottom-3 right-3 opacity-60" />

          {/* Header */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 ring-4 ring-slate-800">
              <Award className="w-8 h-8" />
            </div>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-white tracking-wide uppercase">
            Certificate of Participation
          </h2>
          <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mt-1">
            International Islamic University Chittagong (IIUC)
          </p>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
            Directorate of Students' Affairs (DSA) • Official Credential Registry
          </p>

          <p className="text-xs text-slate-400 mt-6 italic">This is proudly presented to</p>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-indigo-200 mt-2 font-serif border-b border-indigo-500/30 pb-2 inline-block px-8">
            {studentName}
          </h3>
          <p className="text-xs font-mono font-semibold text-slate-400 mt-1">
            Student ID: {studentId}
          </p>

          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-4 leading-relaxed">
            For successfully attending and participating in the event{' '}
            <strong className="text-white font-bold">"{eventTitle}"</strong> organized by{' '}
            <span className="text-indigo-400 font-semibold">{clubName}</span>.
          </p>

          {/* Signatures & Seal Footer */}
          <div className="mt-10 pt-6 border-t border-slate-800 grid grid-cols-2 gap-8 items-end text-xs">
            <div>
              <div className="w-32 h-0.5 bg-slate-700 mx-auto mb-1" />
              <p className="font-bold text-slate-300">Club Executive Lead</p>
              <p className="text-[10px] text-slate-500">{clubName}</p>
            </div>

            <div>
              <div className="w-32 h-0.5 bg-slate-700 mx-auto mb-1" />
              <p className="font-bold text-slate-300">Director of Student Affairs</p>
              <p className="text-[10px] text-slate-500">IIUC Directorate</p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>ISSUED: {issueDate}</span>
            <span>ID: {certificate.certificateNumber}</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> SECURE LEDGER
            </span>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:text-white"
          >
            Close
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md shadow-amber-400/25 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Official Copy
          </button>
        </div>
      </div>
    </div>
  );
};
