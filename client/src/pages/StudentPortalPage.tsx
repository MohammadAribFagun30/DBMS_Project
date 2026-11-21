import React, { useState, useEffect } from 'react';
import { Registration, Certificate } from '../types';
import { apiRegistrations, apiCertificates } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { StatusBadge } from '../components/Badge';
import { TicketPassModal } from '../components/TicketPassModal';
import { FeedbackModal } from '../components/FeedbackModal';
import { CertificateModal } from '../components/CertificateModal';
import {
  Ticket,
  Award,
  Star,
  Calendar,
  MapPin,
  QrCode,
  ShieldCheck,
  FileCheck
} from 'lucide-react';

export const StudentPortalPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Tabs
  const [activeTab, setActiveTab] = useState<'PASSES' | 'FEEDBACK' | 'CERTIFICATES'>('PASSES');

  // Modals state
  const [selectedPass, setSelectedPass] = useState<Registration | null>(null);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [feedbackEvent, setFeedbackEvent] = useState<{ id: number; title: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [regs, certs] = await Promise.all([
        apiRegistrations.getMyRegistrations(),
        apiCertificates.getMyCertificates(),
      ]);
      setRegistrations(regs);
      setCertificates(certs);
    } catch {
      toast.error('Failed to load activity portal');
    } finally {
      setLoading(false);
    }
  };

  const attendedRegistrations = registrations.filter(
    (r) => r.status === 'ATTENDED'
  );

  return (
    <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Student Profile Header */}
      <div className="bg-[var(--surface)] p-5 rounded-[6px] border border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[6px] bg-[var(--primary)] text-[var(--primary-contrast)] font-mono font-semibold text-base flex items-center justify-center">
            {user?.fullName?.charAt(0) || 'S'}
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[var(--muted)] text-[10px] font-mono uppercase tracking-wider mb-0.5">
              <ShieldCheck className="w-3 h-3 text-[var(--primary)]" strokeWidth={1.5} />
              {t('Enrolled Student Account', 'Enrolled Student Account')}
            </div>
            <h1 className="font-heading font-semibold text-xl text-[var(--text)]">
              {user?.fullName || t('Student Activity Hub')}
            </h1>
            <p className="text-xs font-mono text-[var(--muted)] mt-0.5">
              Matric ID: <span className="text-[var(--text)] font-semibold">{user?.studentId || 'CSE-2201'}</span> •{' '}
              {user?.email}
            </p>
          </div>
        </div>

        {/* Quick summary counters */}
        <div className="flex items-center gap-3 bg-[var(--surface-alt)] p-2 rounded-[4px] border border-[var(--border)] self-start md:self-auto text-xs font-mono">
          <div className="px-2.5 py-0.5 text-center">
            <span className="font-semibold text-sm block text-[var(--text)]">{registrations.length}</span>
            <span className="text-[var(--muted)] text-[10px] uppercase">{t('Passes', 'Passes')}</span>
          </div>
          <div className="w-px h-6 bg-[var(--border)]" />
          <div className="px-2.5 py-0.5 text-center">
            <span className="font-semibold text-sm block text-[var(--text)]">{attendedRegistrations.length}</span>
            <span className="text-[var(--muted)] text-[10px] uppercase">{t('Attended', 'Attended')}</span>
          </div>
          <div className="w-px h-6 bg-[var(--border)]" />
          <div className="px-2.5 py-0.5 text-center">
            <span className="font-semibold text-sm block text-[var(--text)]">{certificates.length}</span>
            <span className="text-[var(--muted)] text-[10px] uppercase">{t('Certs', 'Certs')}</span>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-1 border-b border-[var(--border)] pb-2 text-xs font-mono">
        <button
          type="button"
          onClick={() => setActiveTab('PASSES')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] transition-colors cursor-pointer ${
            activeTab === 'PASSES'
              ? 'bg-[var(--primary)] text-[var(--primary-contrast)] font-medium'
              : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-alt)]'
          }`}
        >
          <Ticket className="w-3.5 h-3.5" strokeWidth={1.5} />
          {t('Registered Passes')} ({registrations.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('FEEDBACK')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] transition-colors cursor-pointer ${
            activeTab === 'FEEDBACK'
              ? 'bg-[var(--primary)] text-[var(--primary-contrast)] font-medium'
              : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-alt)]'
          }`}
        >
          <Star className="w-3.5 h-3.5" strokeWidth={1.5} />
          {t('Pending Feedback')} ({attendedRegistrations.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CERTIFICATES')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] transition-colors cursor-pointer ${
            activeTab === 'CERTIFICATES'
              ? 'bg-[var(--primary)] text-[var(--primary-contrast)] font-medium'
              : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-alt)]'
          }`}
        >
          <Award className="w-3.5 h-3.5" strokeWidth={1.5} />
          {t('Verified Certificates')} ({certificates.length})
        </button>
      </div>

      {/* Tab 1: Passes */}
      {activeTab === 'PASSES' && (
        <div className="space-y-4">
          {registrations.length === 0 ? (
            <div className="bg-[var(--surface)] rounded-[6px] border border-[var(--border)] p-10 text-center max-w-sm mx-auto space-y-2">
              <Ticket className="w-8 h-8 text-[var(--muted)] mx-auto" strokeWidth={1.5} />
              <h3 className="font-heading font-semibold text-base text-[var(--text)]">No active passes</h3>
              <p className="text-xs text-[var(--muted)]">
                You haven't registered for any events yet. Check out the Events catalog to sign up!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {registrations.map((reg) => (
                <div
                  key={reg.id}
                  className="card-hover-lift bg-[var(--surface)] rounded-[6px] p-4 border border-[var(--border)] flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-[var(--primary)] bg-[var(--surface-alt)] px-2 py-0.5 rounded-[4px] border border-[var(--border)]">
                        {reg.passNumber}
                      </span>
                      <StatusBadge status={reg.status} size="sm" />
                    </div>

                    <h3 className="font-heading font-semibold text-sm text-[var(--text)] leading-snug">
                      {reg.event?.title || 'Campus Event'}
                    </h3>

                    <p className="text-xs text-[var(--primary)] font-medium">
                      {reg.event?.club?.clubName || 'Organizing Club'}
                    </p>

                    <div className="pt-2 text-xs font-mono text-[var(--muted)] space-y-1 border-t border-[var(--border)]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[var(--muted)]" strokeWidth={1.5} />
                        <span>
                          {reg.event?.startTime
                            ? new Date(reg.event.startTime).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Upcoming'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[var(--muted)]" strokeWidth={1.5} />
                        <span className="truncate">{reg.event?.venue?.venueName || 'Kumira Campus'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedPass(reg)}
                      className="btn-secondary text-xs py-1 px-2.5 rounded-[4px]"
                    >
                      <QrCode className="w-3.5 h-3.5" strokeWidth={1.5} />
                      View Pass
                    </button>

                    {reg.status === 'ATTENDED' && (
                      <button
                        type="button"
                        onClick={() =>
                          setFeedbackEvent({
                            id: reg.eventId,
                            title: reg.event?.title || 'Event',
                          })
                        }
                        className="btn-primary text-xs py-1 px-2.5 rounded-[4px]"
                      >
                        <Star className="w-3.5 h-3.5" strokeWidth={1.5} />
                        Feedback
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Feedback */}
      {activeTab === 'FEEDBACK' && (
        <div className="space-y-4">
          <div className="bg-[var(--surface-alt)] p-4 rounded-[6px] border border-[var(--border)] text-xs text-[var(--muted)] max-w-xl">
            <span className="font-semibold text-[var(--text)] block mb-1">
              Anonymous Student Feedback Protocol
            </span>
            Student ratings contribute 30% to the organizing club's official ranking.
            No identity is linked to your submitted reviews.
          </div>

          {attendedRegistrations.length === 0 ? (
            <div className="bg-[var(--surface)] rounded-[6px] border border-[var(--border)] p-10 text-center max-w-sm mx-auto space-y-2">
              <Star className="w-8 h-8 text-[var(--muted)] mx-auto" strokeWidth={1.5} />
              <h3 className="font-heading font-semibold text-base text-[var(--text)]">No attended events yet</h3>
              <p className="text-xs text-[var(--muted)]">
                Feedback unlocks once your digital pass has been verified at the venue check-in desk.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {attendedRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="bg-[var(--surface)] p-4 rounded-[6px] border border-[var(--border)] flex flex-col justify-between space-y-3"
                >
                  <div>
                    <h3 className="font-heading font-semibold text-sm text-[var(--text)]">
                      {reg.event?.title}
                    </h3>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      {reg.event?.club?.clubName}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setFeedbackEvent({
                        id: reg.eventId,
                        title: reg.event?.title || 'Event',
                      })
                    }
                    className="btn-primary text-xs py-1.5 px-3 w-full"
                  >
                    Submit Anonymous Rating
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Certificates */}
      {activeTab === 'CERTIFICATES' && (
        <div className="space-y-4">
          {certificates.length === 0 ? (
            <div className="bg-[var(--surface)] rounded-[6px] border border-[var(--border)] p-10 text-center max-w-sm mx-auto space-y-2">
              <Award className="w-8 h-8 text-[var(--muted)] mx-auto" strokeWidth={1.5} />
              <h3 className="font-heading font-semibold text-base text-[var(--text)]">No certificates issued</h3>
              <p className="text-xs text-[var(--muted)]">
                Certificates are issued by the university upon attending qualifying workshops and seminars.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-[var(--surface)] p-4 rounded-[6px] border border-[var(--border)] flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--primary)] uppercase">
                      <FileCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Verified Academic Certificate
                    </div>
                    <h3 className="font-heading font-semibold text-sm text-[var(--text)]">
                      {cert.registration?.event?.title || 'Event Certificate'}
                    </h3>
                    <p className="text-xs font-mono text-[var(--muted)]">
                      Issued: {new Date(cert.issueDate).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedCert(cert)}
                    className="btn-secondary text-xs py-1.5 px-3 w-full"
                  >
                    View & Print Certificate
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {selectedPass && (
        <TicketPassModal
          registration={selectedPass}
          onClose={() => setSelectedPass(null)}
        />
      )}

      {feedbackEvent && (
        <FeedbackModal
          eventId={feedbackEvent.id}
          eventTitle={feedbackEvent.title}
          onClose={() => setFeedbackEvent(null)}
          onSuccess={() => {
            setFeedbackEvent(null);
            loadData();
          }}
        />
      )}

      {selectedCert && (
        <CertificateModal
          certificate={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}
    </div>
  );
};
