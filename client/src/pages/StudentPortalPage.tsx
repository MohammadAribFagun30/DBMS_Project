import React, { useState, useEffect } from 'react';
import { Registration, Certificate, EventItem } from '../types';
import { apiRegistrations, apiCertificates, apiFeedback } from '../services/api';
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
  FileCheck,
  Clock,
  CheckCircle,
  CalendarCheck
} from 'lucide-react';

export const StudentPortalPage: React.FC = () => {
  const { user } = useAuth();
  const { t, isBn } = useLanguage();
  const toast = useToast();

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Set of event IDs for which the student has already submitted feedback
  const [submittedFeedbackEventIds, setSubmittedFeedbackEventIds] = useState<Set<number>>(() => {
    if (typeof window !== 'undefined' && user?.id) {
      try {
        const cached = localStorage.getItem(`submitted_feedback_events_${user.id}`);
        if (cached) return new Set(JSON.parse(cached));
      } catch {}
    }
    return new Set<number>();
  });

  // Tabs
  const [activeTab, setActiveTab] = useState<'PASSES' | 'FEEDBACK' | 'PARTICIPATED'>('PASSES');

  // Modals state
  const [selectedPass, setSelectedPass] = useState<Registration | null>(null);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [feedbackEvent, setFeedbackEvent] = useState<{ id: number; title: string } | null>(null);

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [regs, certs, myFeedbackIds] = await Promise.all([
        apiRegistrations.getMyRegistrations(),
        apiCertificates.getMyCertificates(),
        apiFeedback.getMy(),
      ]);
      setRegistrations(regs);
      setCertificates(certs);

      if (Array.isArray(myFeedbackIds)) {
        setSubmittedFeedbackEventIds((prev) => {
          const merged = new Set([...prev, ...myFeedbackIds]);
          if (user?.id) {
            try {
              localStorage.setItem(`submitted_feedback_events_${user.id}`, JSON.stringify(Array.from(merged)));
            } catch {}
          }
          return merged;
        });
      }
    } catch {
      toast.error('Failed to load activity portal');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmitted = (submittedEventId: number) => {
    // Immediately exclude the reviewed event from feedback list
    setSubmittedFeedbackEventIds((prev) => {
      const next = new Set(prev);
      next.add(submittedEventId);
      if (user?.id) {
        try {
          localStorage.setItem(`submitted_feedback_events_${user.id}`, JSON.stringify(Array.from(next)));
        } catch {}
      }
      return next;
    });
    setFeedbackEvent(null);
    loadData();
  };

  // Check if an event has concluded/ended
  const isEventFinished = (event?: EventItem | null) => {
    if (!event) return false;
    return event.status === 'COMPLETED' || new Date(event.endTime) <= new Date();
  };

  // Events the student previously participated in:
  // Must be registered, not cancelled, and the event has concluded or student attended
  const participatedRegistrations = registrations.filter(
    (r) =>
      r.status !== 'CANCELLED' &&
      (r.status === 'ATTENDED' || isEventFinished(r.event) || !!r.certificate)
  );

  // Student can give feedback ONLY when they participated, event is finished, and NOT yet reviewed
  const eligibleForFeedback = registrations.filter(
    (r) =>
      (r.status === 'ATTENDED' || r.status === 'CONFIRMED') &&
      isEventFinished(r.event) &&
      !submittedFeedbackEventIds.has(r.eventId)
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
            <span className="font-semibold text-sm block text-[var(--text)]">{eligibleForFeedback.length}</span>
            <span className="text-[var(--muted)] text-[10px] uppercase">{isBn ? 'পেন্ডিং' : 'Pending'}</span>
          </div>
          <div className="w-px h-6 bg-[var(--border)]" />
          <div className="px-2.5 py-0.5 text-center">
            <span className="font-semibold text-sm block text-[var(--text)]">{participatedRegistrations.length}</span>
            <span className="text-[var(--muted)] text-[10px] uppercase">{isBn ? 'অংশগ্রহণ' : 'Attended'}</span>
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
          {t('Pending Feedback')} ({eligibleForFeedback.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PARTICIPATED')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] transition-colors cursor-pointer ${
            activeTab === 'PARTICIPATED'
              ? 'bg-[var(--primary)] text-[var(--primary-contrast)] font-medium'
              : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-alt)]'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
          {t('Participated Events')} ({participatedRegistrations.length})
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

                  <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPass(reg)}
                      className="btn-secondary text-xs py-1 px-2.5 rounded-[4px]"
                    >
                      <QrCode className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {t('View Pass') || 'View Pass'}
                    </button>

                    {submittedFeedbackEventIds.has(reg.eventId) ? (
                      <span className="text-[10px] font-mono text-[#2E6B4D] dark:text-[#7CC09E] flex items-center gap-1 bg-[#2E6B4D]/10 dark:bg-[#2E6B4D]/20 px-2 py-1 rounded-[4px] border border-[#2E6B4D]/20">
                        <CheckCircle className="w-3 h-3 text-[#2E6B4D] dark:text-[#7CC09E]" strokeWidth={1.5} />
                        {isBn ? 'ফিডব্যাক সম্পন্ন' : 'Feedback Submitted'}
                      </span>
                    ) : isEventFinished(reg.event) ? (
                      <button
                        type="button"
                        onClick={() =>
                          setFeedbackEvent({
                            id: reg.eventId,
                            title: reg.event?.title || 'Event',
                          })
                        }
                        className="btn-primary btn-feedback-star text-xs py-1 px-2.5 rounded-[4px] flex items-center gap-1 cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 fill-current" strokeWidth={1.5} />
                        {t('Feedback') || 'Feedback'}
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono text-[var(--muted)] flex items-center gap-1 bg-[var(--surface-alt)] px-2 py-1 rounded-[4px] border border-[var(--border)]">
                        <Clock className="w-3 h-3 text-[var(--muted)]" strokeWidth={1.5} />
                        {isBn ? 'ইভেন্ট সমাপ্ত হলে ফিডব্যাক দেওয়া যাবে' : 'Feedback unlocks after event'}
                      </span>
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
              {isBn ? 'বেনামী শিক্ষার্থী মূল্যায়ন প্রটোকল' : 'Anonymous Student Feedback Protocol'}
            </span>
            {isBn
              ? 'অংশগ্রহণকৃত ইভেন্টটি সমাপ্ত হওয়ার পর আপনি এখানে বেনামী রেটিং ও মতামত প্রদান করতে পারবেন। আপনার রেটিং আয়োজক ক্লাবের বার্ষিক র‍্যাঙ্কিংয়ে ৩০% অবদান রাখবে।'
              : "Feedback unlocks after you have participated and the event has concluded. Student ratings contribute 30% to the organizing club's official ranking."}
          </div>

          {eligibleForFeedback.length === 0 ? (
            <div className="bg-[var(--surface)] rounded-[6px] border border-[var(--border)] p-10 text-center max-w-sm mx-auto space-y-2">
              <CheckCircle className="w-8 h-8 text-[#2E6B4D] dark:text-[#7CC09E] mx-auto" strokeWidth={1.5} />
              <h3 className="font-heading font-semibold text-base text-[var(--text)]">
                {submittedFeedbackEventIds.size > 0
                  ? (isBn ? 'সবগুলো ফিডব্যাক প্রদান সম্পন্ন' : 'All Feedback Completed')
                  : (isBn ? 'কোনো সমাপ্ত ইভেন্ট নেই' : 'No concluded events yet')}
              </h3>
              <p className="text-xs text-[var(--muted)]">
                {submittedFeedbackEventIds.size > 0
                  ? (isBn
                      ? 'আপনার সমাপ্ত হওয়া সকল ইভেন্টের জন্য সফলভাবে ফিডব্যাক প্রদান করা হয়েছে। নতুন কোনো ইভেন্ট সমাপ্ত হলে এখানে যোগ হবে।'
                      : 'You have submitted feedback for all eligible concluded events. New completed events will appear here.')
                  : (isBn
                      ? 'আপনি যেসব ইভেন্টে অংশগ্রহণ করেছেন, সেগুলো শেষ হওয়ার পর এখানে ফিডব্যাক দেওয়ার অপশন আসবে।'
                      : 'Feedback unlocks after you have participated and the event has concluded.')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eligibleForFeedback.map((reg) => (
                <div
                  key={reg.id}
                  className="bg-[var(--surface)] p-4 rounded-[6px] border border-[var(--border)] flex flex-col justify-between space-y-3 card-blue-shadow-static"
                >
                  <div>
                    <span className="inline-block px-1.5 py-0.5 rounded-[4px] bg-[#2E6B4D]/10 text-[#2E6B4D] text-[10px] font-mono font-medium mb-1">
                      COMPLETED
                    </span>
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
                    className="btn-primary text-xs py-1.5 px-3 w-full flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {t('Submit Anonymous Rating') || 'Submit Anonymous Rating'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Participated Events */}
      {activeTab === 'PARTICIPATED' && (
        <div className="space-y-4">
          {participatedRegistrations.length === 0 ? (
            <div className="bg-[var(--surface)] rounded-[6px] border border-[var(--border)] p-10 text-center max-w-sm mx-auto space-y-2">
              <CalendarCheck className="w-8 h-8 text-[var(--muted)] mx-auto" strokeWidth={1.5} />
              <h3 className="font-heading font-semibold text-base text-[var(--text)]">
                {t('No participated events')}
              </h3>
              <p className="text-xs text-[var(--muted)]">
                {t('Events you have attended or participated in will appear here after they conclude.')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {participatedRegistrations.map((reg) => {
                const hasFeedback = submittedFeedbackEventIds.has(reg.eventId);
                const hasCertificate = !!reg.certificate;

                return (
                  <div
                    key={reg.id}
                    className="card-hover-lift bg-[var(--surface)] rounded-[6px] p-4 border border-[var(--border)] flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] font-semibold text-[var(--primary)] bg-[var(--surface-alt)] px-2 py-0.5 rounded-[4px] border border-[var(--border)]">
                          {reg.passNumber}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {reg.status === 'ATTENDED' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#2E6B4D]/15 text-[#2E6B4D] dark:text-[#5DA583] text-[10px] font-mono font-medium border border-[#2E6B4D]/30">
                              <CheckCircle className="w-3 h-3" />
                              {isBn ? 'উপস্থিত' : 'ATTENDED'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[var(--surface-alt)] text-[var(--muted)] text-[10px] font-mono font-medium border border-[var(--border)]">
                              {isBn ? 'সম্পন্ন' : 'COMPLETED'}
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="font-heading font-semibold text-sm text-[var(--text)] leading-snug">
                        {reg.event?.title || 'Campus Event'}
                      </h3>

                      <p className="text-xs text-[var(--primary)] font-medium">
                        {reg.event?.club?.clubName || 'Organizing Club'}
                      </p>

                      <div className="pt-2 text-xs font-mono text-[var(--muted)] space-y-1.5 border-t border-[var(--border)]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[var(--muted)]" strokeWidth={1.5} />
                          <span>
                            {reg.event?.startTime
                              ? new Date(reg.event.startTime).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : 'Concluded'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[var(--muted)]" strokeWidth={1.5} />
                          <span className="truncate">{reg.event?.venue?.venueName || 'Campus Venue'}</span>
                        </div>
                      </div>

                      {/* Badges row */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {hasCertificate && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-mono font-medium border border-amber-500/20">
                            <Award className="w-3 h-3" />
                            {isBn ? 'সার্টিফিকেট অ্যাভেইলেবল' : 'Certificate Issued'}
                          </span>
                        )}
                        {hasFeedback && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-teal-500/10 text-teal-700 dark:text-teal-400 text-[10px] font-mono font-medium border border-teal-500/20">
                            <CheckCircle className="w-3 h-3" />
                            {isBn ? 'ফিডব্যাক সম্পন্ন' : 'Feedback Given'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-1.5 pt-2 border-t border-[var(--border)]">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPass(reg)}
                          className="btn-secondary text-xs py-1.5 px-2 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" strokeWidth={1.5} />
                          {t('View Pass')}
                        </button>

                        {hasCertificate ? (
                          <button
                            type="button"
                            onClick={() => setSelectedCert(reg.certificate!)}
                            className="btn-primary text-xs py-1.5 px-2 flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Award className="w-3.5 h-3.5" strokeWidth={1.5} />
                            {isBn ? 'সার্টিফিকেট' : 'Certificate'}
                          </button>
                        ) : !hasFeedback ? (
                          <button
                            type="button"
                            onClick={() =>
                              setFeedbackEvent({
                                id: reg.eventId,
                                title: reg.event?.title || 'Event',
                              })
                            }
                            className="btn-primary text-xs py-1.5 px-2 flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5" strokeWidth={1.5} />
                            {isBn ? 'ফিডব্যাক' : 'Feedback'}
                          </button>
                        ) : (
                          <div className="flex items-center justify-center text-[10px] font-mono text-[var(--muted)] bg-[var(--surface-alt)] rounded-[4px] border border-[var(--border)] py-1.5 px-2">
                            {isBn ? 'সম্পন্ন' : 'Completed'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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
          onSuccess={handleFeedbackSubmitted}
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
