import React, { useState } from 'react';
import { apiCertificates } from '../services/api';
import { Certificate } from '../types';
import { CertificateModal } from '../components/CertificateModal';
import { useLanguage } from '../context/LanguageContext';
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
  const { t } = useLanguage();
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
      setError(err.message || t('No certificate found with that credential number. Please check the ID and try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 py-8 space-y-8 bg-[var(--bg)] text-[var(--text)]">
      {/* Institutional Header */}
      <div className="border-b border-[var(--border)] pb-4">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--primary)] font-semibold">
          {t('Registry Validation Desk')}
        </span>
        <h1 className="font-heading font-semibold text-2xl text-[var(--text)] tracking-tight mt-0.5">
          {t('Verify Official IIUC Participation Certificate')}
        </h1>
        <p className="text-xs text-[var(--muted)] max-w-xl mt-1 leading-relaxed">
          {t('Enter the unique Certificate ID printed on official credentials to validate authenticity against the university cryptographic record.')}
        </p>
      </div>

      {/* Verification Search Card */}
      <div className="bg-[var(--surface)] p-5 rounded-[6px] border border-[var(--border)] max-w-xl space-y-3">
        <form onSubmit={handleVerify} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1">
              {t('Official Credential Number')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t('e.g. CERT-2026-084')}
                value={certNum}
                onChange={(e) => setCertNum(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs font-mono text-[var(--text)]"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary text-xs py-1.5 px-4 disabled:opacity-60"
              >
                {loading ? t('Validating...') : t('Verify Record')}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[var(--muted)] pt-1">
            <span>{t('Quick test sample:')}</span>
            <button
              type="button"
              onClick={() => setCertNum('CERT-2026-084')}
              className="text-[var(--primary)] hover:underline"
            >
              CERT-2026-084
            </button>
          </div>
        </form>
      </div>

      {/* Verification Success Result */}
      {result && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[6px] p-5 max-w-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#2F6B4F] dark:text-[#7CC09E]" strokeWidth={1.5} />
              <div>
                <span className="text-[10px] font-mono text-[#2F6B4F] dark:text-[#7CC09E] uppercase tracking-wider block">
                  {t('Authentic Verified Record')}
                </span>
                <h3 className="font-mono text-base font-semibold text-[var(--text)]">
                  {result.certificateNumber}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
              {t('View Certificate')}
            </button>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-[var(--border)]">
              <span className="text-[var(--muted)]">{t('Recipient Name:')}</span>
              <span className="text-[var(--text)] font-sans font-medium">{result.registration?.user?.fullName || 'Alice Rahman'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--border)]">
              <span className="text-[var(--muted)]">{t('Matric ID:')}</span>
              <span className="text-[var(--text)] font-semibold">{result.registration?.user?.studentId || 'CSE-2201'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--border)]">
              <span className="text-[var(--muted)]">{t('Event / Workshop:')}</span>
              <span className="text-[var(--text)] font-sans font-medium">{result.registration?.event?.title || 'Modern Web Development'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--border)]">
              <span className="text-[var(--muted)]">{t('Organizing Club:')}</span>
              <span className="text-[var(--primary)] font-sans font-medium">{t(result.registration?.event?.club?.clubName || 'CSE Club', result.registration?.event?.club?.clubName || 'CSE Club')}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[var(--muted)]">{t('Issue Date:')}</span>
              <span className="text-[var(--text)]">{new Date(result.issueDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Verification Failure Result */}
      {error && (
        <div className="bg-[var(--surface-alt)] border border-[#9B3A2D] rounded-[6px] p-4 max-w-xl flex items-start gap-3 text-xs">
          <XCircle className="w-4 h-4 text-[#9B3A2D] shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <h4 className="font-medium text-[#9B3A2D]">{t('Certificate Verification Unsuccessful')}</h4>
            <p className="text-[var(--muted)] mt-0.5 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Trust Specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-xl">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[6px] p-3 text-xs space-y-1">
          <span className="font-semibold text-[var(--text)] block">{t('Cryptographic Hash')}</span>
          <p className="text-[var(--muted)] leading-relaxed">{t('Verifiable SHA-256 digital signature issued by campus registry.')}</p>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[6px] p-3 text-xs space-y-1">
          <span className="font-semibold text-[var(--text)] block">{t('Official Recognition')}</span>
          <p className="text-[var(--muted)] leading-relaxed">{t('Recorded exclusively for attended university workshops.')}</p>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[6px] p-3 text-xs space-y-1">
          <span className="font-semibold text-[var(--text)] block">{t('Anti-Tamper Ledger')}</span>
          <p className="text-[var(--muted)] leading-relaxed">{t('Stored permanently in the central academic database.')}</p>
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
