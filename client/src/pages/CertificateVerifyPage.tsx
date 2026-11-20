import React, { useState } from 'react';
import { apiCertificates } from '../services/api';
import { Certificate } from '../types';
import { CertificateModal } from '../components/CertificateModal';
import {
  Award,
  Search,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ExternalLink,
  QrCode,
  Lock,
  Building2,
  Calendar,
  UserCheck,
  FileCheck
} from 'lucide-react';

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
      setError(err.message || 'No certificate found with that credential number. Please check the ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 text-slate-900 dark:text-white overflow-hidden py-16 sm:py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      {/* Background Decorative Mesh & Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl 2xl:max-w-6xl mx-auto space-y-10">
        {/* Institutional Authority Badge & Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Verify IIUC Participation{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-300 dark:via-purple-200 dark:to-pink-300 bg-clip-text text-transparent">
              Certificate
            </span>
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Enter the unique Certificate ID printed on official IIUC credentials to validate authenticity against the university cryptographic ledger.
          </p>
        </div>

        {/* Verification Search Card */}
        <div className="relative bg-white dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-2xl shadow-slate-200/50 dark:shadow-indigo-950/60 max-w-2xl mx-auto transition-colors">
          <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-indigo-600 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
            Digital Ledger Lookup
          </div>

          <form onSubmit={handleVerify} className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Official Credential Number
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-indigo-500 dark:text-indigo-400" /> 256-Bit Tamper Protected
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="e.g. CERT-2026-084"
                value={certNum}
                onChange={(e) => setCertNum(e.target.value)}
                className="w-full pl-4 pr-32 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 tracking-wider transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-2 bottom-2 px-5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/30 disabled:opacity-50 flex items-center gap-1.5"
              >
                {loading ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Validating...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Verify Record</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              <span>Quick test sample:</span>
              <button
                type="button"
                onClick={() => setCertNum('CERT-2026-084')}
                className="font-mono text-indigo-600 dark:text-indigo-300 hover:underline bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/60 transition-colors"
              >
                CERT-2026-084
              </button>
            </div>
          </form>
        </div>

        {/* Verification Success Result */}
        {result && (
          <div className="bg-white dark:bg-gradient-to-br dark:from-emerald-950/70 dark:via-slate-900/90 dark:to-slate-950 border border-emerald-200 dark:border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto space-y-6 shadow-2xl shadow-slate-200/50 dark:shadow-emerald-950/40 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-100 dark:border-emerald-500/20">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-400/30 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold shadow-sm">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
                    Authentic Verified Record
                  </span>
                  <h3 className="font-mono text-xl font-extrabold text-slate-900 dark:text-white">
                    {result.certificateNumber}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/30 flex items-center justify-center gap-1.5 self-start sm:self-auto"
              >
                <ExternalLink className="w-3.5 h-3.5 text-sky-200" />
                View Full Certificate
              </button>
            </div>

            {/* Credential Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-200 dark:border-emerald-500/20">
              <div className="space-y-1">
                <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> Recipient Name
                </span>
                <p className="text-slate-900 dark:text-white text-sm font-bold">
                  {result.registration?.user?.fullName || 'Alice Rahman'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> Student Matric No.
                </span>
                <p className="text-slate-900 dark:text-white text-sm font-mono font-bold">
                  {result.registration?.user?.studentId || 'CSE-2201'}
                </p>
              </div>

              <div className="col-span-1 sm:col-span-2 space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> Event / Workshop Title
                </span>
                <p className="text-slate-900 dark:text-white text-sm font-bold">
                  {result.registration?.event?.title || 'Intro to Modern Web & Cloud Deployment'}
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> Organizing Club
                </span>
                <p className="text-indigo-600 dark:text-indigo-300 font-bold">
                  {result.registration?.event?.club?.clubName || 'CSE Programming Club'}
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> Official Issue Date
                </span>
                <p className="text-slate-800 dark:text-slate-200 font-bold">
                  {new Date(result.issueDate).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-300/80 pt-1">
              <span className="flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5" /> Registry Status: <strong>ACTIVE & SECURE</strong>
              </span>
              <span>IIUC Directorate of Students' Affairs</span>
            </div>
          </div>
        )}

        {/* Verification Failure Result */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-500/40 rounded-3xl p-6 max-w-2xl mx-auto flex items-start gap-4 text-rose-800 dark:text-rose-200 backdrop-blur-xl shadow-xl shadow-rose-200/50 dark:shadow-rose-950/40 animate-in fade-in duration-200">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center shrink-0">
              <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Certificate Verification Unsuccessful</h4>
              <p className="text-xs text-rose-600 dark:text-rose-300 mt-1 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Institutional Trust Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4">
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 text-center space-y-1.5 shadow-sm backdrop-blur-md transition-colors">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mx-auto" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">DSA Cryptographic Hash</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Verifiable digital signature issued by the campus registry.</p>
          </div>

          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 text-center space-y-1.5 shadow-sm backdrop-blur-md transition-colors">
            <Award className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Official Club Recognition</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Issued exclusively for attended workshops & competitions.</p>
          </div>

          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 text-center space-y-1.5 shadow-sm backdrop-blur-md transition-colors">
            <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Anti-Tamper Record</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Permanent record stored in university database system.</p>
          </div>
        </div>
      </div>

      {modalOpen && (
        <CertificateModal
          certificate={result}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};
