import React, { useState, useEffect } from 'react';
import { Registration, Certificate } from '../types';
import { apiRegistrations, apiCertificates } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { TicketPassModal } from '../components/TicketPassModal';
import { FeedbackModal } from '../components/FeedbackModal';
import { CertificateModal } from '../components/CertificateModal';
import { StatusBadge } from '../components/Badge';
import {
  Ticket,
  Award,
  Star,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  QrCode,
  Sparkles,
  MessageSquare
} from 'lucide-react';

export const StudentPortalPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [activeTab, setActiveTab] = useState<'PASSES' | 'FEEDBACK' | 'CERTIFICATES'>('PASSES');

  // Modals
  const [selectedPass, setSelectedPass] = useState<Registration | null>(null);
  const [feedbackEvent, setFeedbackEvent] = useState<{ id: number; title: string } | null>(null);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const regs = await apiRegistrations.getMyRegistrations();
      setRegistrations(regs);

      const certs = await apiCertificates.getMyCertificates();
      setCertificates(certs);
    } catch {
      // fallback in api
    }
  };

  const handleCancelRegistration = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this event registration?')) return;
    try {
      await apiRegistrations.cancel(id);
      toast.success('Registration cancelled.');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel registration');
    }
  };

  const attendedRegistrations = registrations.filter((r) => r.status === 'ATTENDED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Student Profile Header */}
      <div className="bg-gradient-to-r from-indigo-800 via-indigo-700 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg">
            {user?.fullName?.charAt(0) || 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold">{user?.fullName || 'Student Portal'}</h1>
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full uppercase">
                {user?.role || 'STUDENT'}
              </span>
            </div>
            <p className="text-indigo-200 text-xs sm:text-sm mt-0.5">
              ID: <span className="font-mono font-bold text-white">{user?.studentId || 'CSE-2201'}</span> •{' '}
              {user?.department?.departmentName || 'Computer Science & Engineering'}
            </p>
          </div>
        </div>

        {/* Quick summary counters */}
        <div className="flex items-center gap-3 bg-white/10 p-2 rounded-2xl border border-white/10 self-start md:self-auto text-xs">
          <div className="px-3 py-1 text-center">
            <span className="font-extrabold text-base block">{registrations.length}</span>
            <span className="text-indigo-200 text-[10px] uppercase font-bold">Total Passes</span>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="px-3 py-1 text-center">
            <span className="font-extrabold text-base block">{attendedRegistrations.length}</span>
            <span className="text-indigo-200 text-[10px] uppercase font-bold">Attended</span>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="px-3 py-1 text-center">
            <span className="font-extrabold text-base block">{certificates.length}</span>
            <span className="text-indigo-200 text-[10px] uppercase font-bold">Certificates</span>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-slate-200 flex items-center gap-2">
        <button
          onClick={() => setActiveTab('PASSES')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'PASSES'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Ticket className="w-4 h-4" />
          My Event Passes ({registrations.length})
        </button>

        <button
          onClick={() => setActiveTab('FEEDBACK')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'FEEDBACK'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Star className="w-4 h-4" />
          Submit Feedback ({attendedRegistrations.length})
        </button>

        <button
          onClick={() => setActiveTab('CERTIFICATES')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'CERTIFICATES'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
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
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
              <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-base text-slate-800">No active passes</h3>
              <p className="text-xs text-slate-500">
                You haven't registered for any events yet. Check out the Events catalog to sign up!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registrations.map((reg) => (
                <div
                  key={reg.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                        {reg.passNumber}
                      </span>
                      <StatusBadge status={reg.status} size="sm" />
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                      {reg.event?.title || 'Campus Event'}
                    </h3>

                    <p className="text-xs text-slate-500 font-semibold">
                      {reg.event?.club?.clubName || 'Organizing Club'}
                    </p>

                    <div className="pt-2 text-xs space-y-1.5 text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {reg.event?.startTime
                            ? new Date(reg.event.startTime).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Upcoming'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{reg.event?.venue?.venueName || 'Main Auditorium'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedPass(reg)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      View Pass & QR
                    </button>

                    {reg.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleCancelRegistration(reg.id)}
                        className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Feedback for Attended Events */}
      {activeTab === 'FEEDBACK' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
            <Star className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              <strong>100% Anonymous:</strong> Your rating directly influences the club’s annual standing.
              Student IDs are never saved in feedback rows.
            </span>
          </div>

          {attendedRegistrations.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-2">
              <Star className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-base text-slate-800">No attended events yet</h3>
              <p className="text-xs text-slate-500">
                Once an administrator marks your attendance at an event desk, feedback submission unlocks here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {attendedRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between gap-4"
                >
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Attended
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 mt-1">
                      {reg.event?.title || 'Workshop'}
                    </h3>
                    <p className="text-xs text-slate-500">{reg.event?.club?.clubName}</p>
                  </div>

                  <button
                    onClick={() =>
                      setFeedbackEvent({
                        id: reg.eventId,
                        title: reg.event?.title || 'Event',
                      })
                    }
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-200 transition-colors shrink-0"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Review Anonymously
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
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-2">
              <Award className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-base text-slate-800">No certificates issued yet</h3>
              <p className="text-xs text-slate-500">
                Certificates are issued by administrators after event completion.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase">
                        {cert.certificateNumber}
                      </span>
                      <h4 className="font-extrabold text-base text-slate-900 mt-0.5">
                        {cert.registration?.event?.title || 'Advanced Workshop'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Issued on {new Date(cert.issueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCert(cert)}
                    className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs shrink-0 transition-colors"
                  >
                    View & Print
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

      {feedbackEvent && (
        <FeedbackModal
          eventId={feedbackEvent.id}
          eventTitle={feedbackEvent.title}
          onClose={() => setFeedbackEvent(null)}
          onSuccess={loadData}
        />
      )}

      <CertificateModal
        certificate={selectedCert}
        onClose={() => setSelectedCert(null)}
      />
    </div>
  );
};

