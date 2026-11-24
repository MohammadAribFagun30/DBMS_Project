import React, { useState, useEffect } from 'react';
import { Club, Venue, Sponsor } from '../types';
import { apiClubs, apiVenues, apiEvents, apiSponsors } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { X, Mic, PlusCircle, Bookmark, DollarSign } from 'lucide-react';

interface ProposeEventModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const ProposeEventModal: React.FC<ProposeEventModalProps> = ({ onClose, onSuccess }) => {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();

  const [clubs, setClubs] = useState<Club[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isWorkshop, setIsWorkshop] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [form, setForm] = useState({
    clubId: '',
    venueId: '',
    title: '',
    description: '',
    eventType: 'WORKSHOP',
    startDate: '',
    startTime: '10:00',
    endDate: '',
    endTime: '14:00',
    speakerName: '',
    speakerBio: '',
    prerequisites: '',
  });

  const [sponsorForm, setSponsorForm] = useState({
    sponsorId: '',
    amountFunded: '',
    sponsorshipTier: 'PLATINUM',
  });

  useEffect(() => {
    apiClubs.getAll().then(setClubs);
    apiVenues.getAll().then(setVenues);
    apiSponsors.getAll().then(setSponsors);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clubId || !form.title || !form.startDate || !form.endDate) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const startISO = new Date(`${form.startDate}T${form.startTime}:00`).toISOString();
    const endISO = new Date(`${form.endDate}T${form.endTime}:00`).toISOString();

    if (new Date(endISO) <= new Date(startISO)) {
      toast.error('End time must be after start time.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        clubId: Number(form.clubId),
        venueId: form.venueId ? Number(form.venueId) : undefined,
        title: form.title,
        description: form.description || undefined,
        eventType: form.eventType,
        startTime: startISO,
        endTime: endISO,
      };

      if (isWorkshop && form.speakerName) {
        payload.workshop = {
          speakerName: form.speakerName,
          speakerBio: form.speakerBio || undefined,
          prerequisites: form.prerequisites || undefined,
        };
      }

      if (sponsorForm.sponsorId && Number(sponsorForm.amountFunded) > 0) {
        payload.sponsorship = {
          sponsorId: Number(sponsorForm.sponsorId),
          amountFunded: Number(sponsorForm.amountFunded),
          sponsorshipTier: sponsorForm.sponsorshipTier,
        };
      }

      const createdEvent: any = await apiEvents.create(payload);

      // In case backend didn't link atomically or using mock fallback, record explicitly as well
      if (sponsorForm.sponsorId && Number(sponsorForm.amountFunded) > 0 && createdEvent?.id) {
        try {
          await apiSponsors.linkEventSponsor({
            eventId: createdEvent.id,
            sponsorId: Number(sponsorForm.sponsorId),
            amountFunded: Number(sponsorForm.amountFunded),
            sponsorshipTier: sponsorForm.sponsorshipTier,
          });
        } catch {
          // Handled or already attached
        }
      }

      toast.success(
        isAdmin
          ? 'Event published successfully into catalog!'
          : 'Event proposal submitted for administrative review!'
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
      <div className="relative bg-[var(--surface)] rounded-[6px] max-w-xl w-full border border-[var(--border)] overflow-hidden text-[var(--text)]">
        {/* Header */}
        <div className="p-5 border-b border-[var(--border)] relative bg-[var(--surface-alt)]">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-[4px] bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] flex items-center justify-center cursor-pointer"
          >
            <X className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
          <div className="flex items-center gap-1.5 text-[var(--primary)] text-[10px] font-mono uppercase tracking-wider mb-0.5">
            <Bookmark className="w-3.5 h-3.5" strokeWidth={1.5} />
            Institutional Event Registry
          </div>
          <h2 className="font-heading font-semibold text-base text-[var(--text)]">
            {isAdmin ? 'Publish Official Campus Event' : 'Propose New Club Event'}
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Fill in the event details, venue allocation, and syllabus.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Organizing Club */}
          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1">
              Host Club *
            </label>
            <select
              required
              value={form.clubId}
              onChange={(e) => setForm({ ...form, clubId: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs text-[var(--text)]"
            >
              <option value="">Select Host Club...</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.clubName}
                </option>
              ))}
            </select>
          </div>

          {/* Event Title */}
          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Modern Cloud Native Architecture with Kubernetes"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs text-[var(--text)]"
            />
          </div>

          {/* Type & Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text)] mb-1">
                Event Category *
              </label>
              <select
                value={form.eventType}
                onChange={(e) => {
                  setForm({ ...form, eventType: e.target.value });
                  setIsWorkshop(e.target.value === 'WORKSHOP');
                }}
                className="w-full px-2.5 py-1.5 text-xs text-[var(--text)] font-mono"
              >
                <option value="WORKSHOP">Technical Workshop</option>
                <option value="HACKATHON">Hackathon / Sprint</option>
                <option value="SEMINAR">Guest Seminar</option>
                <option value="COMPETITION">Campus Competition</option>
                <option value="SOCIAL">Social / Networking</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text)] mb-1">
                Campus Venue
              </label>
              <select
                value={form.venueId}
                onChange={(e) => setForm({ ...form, venueId: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs text-[var(--text)]"
              >
                <option value="">Select Venue...</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.venueName} (Cap: {v.capacity})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[var(--surface-alt)] p-3 rounded-[4px] border border-[var(--border)]">
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--primary)] font-semibold block">
                Start Schedule *
              </span>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-2 py-1 text-xs font-mono"
              />
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full px-2 py-1 text-xs font-mono"
              />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--primary)] font-semibold block">
                End Schedule *
              </span>
              <input
                type="date"
                required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-2 py-1 text-xs font-mono"
              />
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full px-2 py-1 text-xs font-mono"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1">
              Description & Objectives
            </label>
            <textarea
              rows={3}
              placeholder="Outline event agenda and student learning outcomes..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs font-sans text-[var(--text)] placeholder:text-[var(--muted)]"
            />
          </div>

          {/* Workshop Details Section */}
          {isWorkshop && (
            <div className="space-y-3 bg-[var(--surface-alt)] p-3 rounded-[4px] border border-[var(--border)]">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text)]">
                <Mic className="w-3.5 h-3.5 text-[var(--primary)]" strokeWidth={1.5} />
                <span>Instructor & Workshop Syllabus</span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[var(--text)] mb-1">
                  Lead Speaker / Trainer Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Kazi Tanvir (AWS Architect)"
                  value={form.speakerName}
                  onChange={(e) => setForm({ ...form, speakerName: e.target.value })}
                  className="w-full px-2.5 py-1 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[var(--text)] mb-1">
                  Speaker Bio / Affiliation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior DevOps Lead at TigerIT Bangladesh"
                  value={form.speakerBio}
                  onChange={(e) => setForm({ ...form, speakerBio: e.target.value })}
                  className="w-full px-2.5 py-1 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[var(--text)] mb-1">
                  Participant Prerequisites
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bring laptop with Docker Desktop installed"
                  value={form.prerequisites}
                  onChange={(e) => setForm({ ...form, prerequisites: e.target.value })}
                  className="w-full px-2.5 py-1 text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* Record Corporate Sponsorship (Matching Reference Pic) */}
          <div className="space-y-3 bg-[var(--surface-alt)] p-3.5 rounded-[6px] border border-[var(--border)] card-blue-shadow-static">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[var(--primary)]" strokeWidth={1.5} />
              <div>
                <h3 className="font-heading font-semibold text-xs text-[var(--text)]">
                  {t('Record Corporate Sponsorship')}
                </h3>
                <span className="text-[10px] font-mono text-[var(--muted)]">
                  {t('Optional')} &bull; {t('Sponsorship funds boost club annual standings')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-[var(--text)] mb-1">
                  {t('Sponsor Organization')}
                </label>
                <select
                  value={sponsorForm.sponsorId}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, sponsorId: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs text-[var(--text)] bg-[var(--surface)] border border-[var(--border)] rounded-[4px]"
                >
                  <option value="">{t('Select Sponsor...')}</option>
                  {sponsors.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[var(--text)] mb-1">
                  {t('Amount Funded ($)')}
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="25000"
                  value={sponsorForm.amountFunded}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, amountFunded: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs font-mono text-[var(--text)] bg-[var(--surface)] border border-[var(--border)] rounded-[4px]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-[var(--text)] mb-1">
                  {t('Tier')}
                </label>
                <select
                  value={sponsorForm.sponsorshipTier}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, sponsorshipTier: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs font-mono text-[var(--text)] bg-[var(--surface)] border border-[var(--border)] rounded-[4px]"
                >
                  <option value="PLATINUM">{t('Platinum Tier')}</option>
                  <option value="GOLD">{t('Gold Tier')}</option>
                  <option value="SILVER">{t('Silver Tier')}</option>
                  <option value="BRONZE">{t('Bronze Tier')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary text-xs py-1.5 px-4 disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : isAdmin ? 'Publish Event' : 'Submit Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
