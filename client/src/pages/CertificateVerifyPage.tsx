import React, { useState } from 'react';
import { apiCertificates } from '../services/api';
import { Certificate } from '../types';
import { CertificateModal } from '../components/CertificateModal';
import { Award, Search, CheckCircle2, XCircle, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';

export const CertificateVerifyPage: React.FC = () => {
  const [certNum, setCertNum] = useState<string>('CERT-2026-084');
  const [result, setResult] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certNum.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await apiCertificates.verify(certNum.trim());
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'No certificate found with that credential number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          University Credential Registry
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Verify Academic Participation Certificate
        </h1>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          Enter the official Certificate ID found at the bottom of any issued document to verify authenticity and student attendance.
        </p>
      </div>

      {/* Search Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100 max-w-2xl mx-auto">
        <form onSubmit={handleVerify} className="space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            Certificate Number
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. CERT-2026-084"
              value={certNum}
              onChange={(e) => setCertNum(e.target.value)}
              className="w-full pl-4 pr-32 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm text-slate-800"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Try test certificate: <code className="font-bold text-indigo-600">CERT-2026-084</code>
          </p>
        </form>
      </div>

      {/* Verification Result */}
      {result && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-widest block">
                  Official Record Verified
                </span>
                <h3 className="font-mono text-lg font-extrabold text-emerald-950">
                  {result.certificateNumber}
                </h3>
              </div>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors shadow-sm"
            >
              View Document
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs bg-white/80 p-4 rounded-2xl border border-emerald-100">
            <div>
              <span className="text-slate-400 font-semibold block">Recipient Student</span>
              <strong className="text-slate-900 text-sm">
                {result.registration?.user?.fullName || 'Alice Rahman'}
              </strong>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block">Student ID</span>
              <strong className="text-slate-900 text-sm font-mono">
                {result.registration?.user?.studentId || 'CSE-2201'}
              </strong>
            </div>

            <div className="col-span-2">
              <span className="text-slate-400 font-semibold block">Event / Workshop Title</span>
              <strong className="text-slate-900 text-sm">
                {result.registration?.event?.title || 'Intro to Modern Web & Cloud Deployment'}
              </strong>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block">Organizing Club</span>
              <strong className="text-indigo-700">
                {result.registration?.event?.club?.clubName || 'CSE Programming Club'}
              </strong>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block">Issue Date</span>
              <strong className="text-slate-900">
                {new Date(result.issueDate).toLocaleDateString()}
              </strong>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 max-w-2xl mx-auto flex items-center gap-4 text-rose-900">
          <XCircle className="w-8 h-8 text-rose-600 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Certificate Verification Failed</h4>
            <p className="text-xs text-rose-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <CertificateModal
        certificate={result}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

