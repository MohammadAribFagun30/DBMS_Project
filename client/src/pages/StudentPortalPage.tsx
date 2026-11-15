import React, { useState, useEffect } from 'react';
import { Registration, Certificate, EventItem } from '../types';
import { apiRegistrations, apiCertificates, apiEvents } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { TicketPassModal } from '../components/TicketPassModal';
import { FeedbackModal } from '../components/FeedbackModal';
import { CertificateModal } from '../components/CertificateModal';
import { StatusBadge, TypeBadge } from '../components/Badge';
import {
  Ticket,
  Award,
  Star,
  Calendar,
  MapPin,
  ExternalLink,
  CheckCircle2,
  XCircle,
  QrCode,
  Sparkles,
  MessageSquare,
  Clock,
  PlusCircle,
  ShieldCheck
} from 'lucide-react';

export const StudentPortalPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'PASSES' | 'FEEDBACK' | 'CERTIFICATES'>('PASSES');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [selectedPass, setSelectedPass] = useState<Registration | null>(null);
  const [feedbackEvent, setFeedbackEvent] = useState<{ id: number; title: string } | null>(null);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
            {user?.fullName?.charAt(0) || 'S'}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              IIUC Student Activity Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {user?.fullName || 'Student Portal'}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Matric ID: <span className="font-mono text-slate-200 font-bold">{user?.studentId || 'CSE-2201'}</span> •{' '}
              {user?.email}
            </p>
          </div>
        </div>

        {/* Quick summary counters */}
        <div className="flex items-center gap-3 bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800 self-start md:self-auto text-xs">
          <div className="px-3 py-1 text-center">
            <span className="font-extrabold text-base block text-white">{registrations.length}</span>
            <span className="text-indigo-400 text-[10px] uppercase font-bold">Total Passes</span>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="px-3 py-1 text-center">
            <span className="font-extrabold text-base block text-white">{attendedRegistrations.length}</span>
            <span className="text-indigo-400 text-[10px] uppercase font-bold">Attended</span>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="px-3 py-1 text-center">
            <span className="font-extrabold text-base block text-white">{certificates.length}</span>
            <span className="text-indigo-400 text-[10px] uppercase font-bold">Certificates</span>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-slate-800 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveTab('PASSES')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'PASSES'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Ticket className="w-4 h-4" />
          My Event Passes ({registrations.length})
        </button>

        <button
          onClick={() => setActiveTab('FEEDBACK')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'FEEDBACK'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Star className="w-4 h-4" />
          Submit Feedback ({attendedRegistrations.length})
        </button>

        <button
          onClick={() => setActiveTab('CERTIFICATES')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'CERTIFICATES'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          My Certificates ({certificates.length})
        </button>
      </div>

      {/* Tab 1: Passes */}
      {activeTab === 'PASSES' && (
        <div className="space-y-4">
          {registrations.length === 0 ? (
            <div className="bg-slate-900/70 rounded-3xl border border-slate-800 p-12 text-center max-w-md mx-auto space-y-3">
              <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="font-bold text-base text-white">No active passes</h3>
              <p className="text-xs text-slate-400">
                You haven't registered for any events yet. Check out the Events catalog to sign up!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registrations.map((reg) => (
                <div
                  key={reg.id}
                  className="bg-slate-900/85 backdrop-blur-md rounded-3xl p-6 border border-slate-800 shadow-xl shadow-slate-950/50 hover:border-indigo-500/50 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-extrabold text-indigo-300 bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-800/60">
                        {reg.passNumber}
                      </span>
                      <StatusBadge status={reg.status} size="sm" />
                    </div>

                    <h3 className="font-extrabold text-base text-white leading-snug">
                      {reg.event?.title || 'Campus Event'}
                    </h3>

                    <p className="text-xs text-indigo-400 font-semibold">
                      {reg.event?.club?.clubName || 'Organizing Club'}
                    </p>

                    <div className="pt-2 text-xs text-slate-400 space-y-1.5 border-t border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
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
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate">{reg.event?.venue?.venueName || 'Kumira Campus'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedPass(reg)}
                      className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <QrCode className="w-4 h-4" />
                      View Digital Pass
                    </button>

                    {reg.status === 'ATTENDED' && (
                      <button
                        onClick={() =>
                          setFeedbackEvent({
                            id: reg.eventId,
                            title: reg.event?.title || 'Event',
                          })
                        }
                        className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        Review
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
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 text-xs text-slate-300 max-w-2xl">
            <span className="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4" />
              100% Anonymous Student Feedback
            </span>
            Ratings and comments directly contribute 30% to the organizing club's official ranking.
            No identity is linked to your submitted reviews.
          </div>

          {attendedRegistrations.length === 0 ? (
            <div className="bg-slate-900/70 rounded-3xl border border-slate-800 p-12 text-center max-w-md mx-auto space-y-3">
              <Star className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="font-bold text-base text-white">No attended events yet</h3>
              <p className="text-xs text-slate-400">
                Feedback unlocks once your digital pass has been verified at the venue check-in desk.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attendedRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="bg-slate-900/85 backdrop-blur-md rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full inline-block">
                      Attendance Confirmed
                    </span>
                    <h3 className="font-extrabold text-base text-white">
                      {reg.event?.title}
                    </h3>
                    <p className="text-xs text-indigo-400">{reg.event?.club?.clubName}</p>
                  </div>

                  <button
                    onClick={() =>
                      setFeedbackEvent({
                        id: reg.eventId,
                        title: reg.event?.title || 'Event',
                      })
                    }
                    className="mt-6 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4" />
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
            <div className="bg-slate-900/70 rounded-3xl border border-slate-800 p-12 text-center max-w-md mx-auto space-y-3">
              <Award className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="font-bold text-base text-white">No certificates issued yet</h3>
              <p className="text-xs text-slate-400">
                Official certificates are generated automatically by administrators once workshops conclude.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-gradient-to-br from-slate-900 to-indigo-950/80 rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-800/60">
                        {cert.certificateNumber}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-white">
                      {cert.registration?.event?.title || 'Workshop Participation'}
                    </h3>

                    <p className="text-xs text-indigo-400">
                      Issued by {cert.registration?.event?.club?.clubName || 'IIUC Campus'}
                    </p>

                    <p className="text-[11px] text-slate-400">
                      Issue Date: {new Date(cert.issueDate).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedCert(cert)}
                    className="mt-6 w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Award className="w-4 h-4" />
                    Open Verifiable Document
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <TicketPassModal
        registration={selectedPass}
        onClose={() => setSelectedPass(null)}
      />

      <FeedbackModal
        eventId={feedbackEvent?.id ?? null}
        eventTitle={feedbackEvent?.title ?? ''}
        onClose={() => setFeedbackEvent(null)}
        onSuccess={loadData}
      />

      <CertificateModal
        certificate={selectedCert}
        onClose={() => setSelectedCert(null)}
      />
    </div>
  );
};
