import React, { useState, useEffect } from 'react';
import { Club, Venue } from '../types';
import { apiClubs, apiVenues, apiEvents } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { X, Mic, Send, Sparkles } from 'lucide-react';

interface ProposeEventModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const ProposeEventModal: React.FC<ProposeEventModalProps> = ({ onClose, onSuccess }) => {
  const { isAdmin } = useAuth();
  const toast = useToast();

  const [clubs, setClubs] = useState<Club[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
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

  useEffect(() => {
    apiClubs.getAll().then(setClubs);
    apiVenues.getAll().then(setVenues);
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

      await apiEvents.create(payload);
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-900 dark:text-white transition-colors">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-950 p-6 sm:p-8 text-white relative border-b border-indigo-900/50">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            Official Event Publishing Desk
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold">
            {isAdmin ? 'Publish Official Campus Event' : 'Propose New Club Event'}
          </h2>
          <p className="text-xs text-indigo-200 mt-1">
            Fill in the event details, venue allocation, and speaker syllabus.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 max-h-[72vh] overflow-y-auto">
          {/* Organizing Club */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Host Club *
            </label>
            <select
              required
              value={form.clubId}
              onChange={(e) => setForm({ ...form, clubId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm text-slate-800 dark:text-slate-200 transition-colors"
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
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Modern Cloud Native Architecture with Kubernetes"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
            />
          </div>

          {/* Type & Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Event Category *
              </label>
              <select
                value={form.eventType}
                onChange={(e) => {
                  setForm({ ...form, eventType: e.target.value });
                  setIsWorkshop(e.target.value === 'WORKSHOP');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm text-slate-800 dark:text-slate-200 transition-colors"
              >
                <option value="WORKSHOP">Technical Workshop</option>
                <option value="HACKATHON">Hackathon / Sprint</option>
                <option value="SEMINAR">Guest Seminar</option>
                <option value="COMPETITION">Campus Competition</option>
                <option value="SOCIAL">Social / Networking</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Campus Venue
              </label>
              <select
                value={form.venueId}
                onChange={(e) => setForm({ ...form, venueId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm text-slate-800 dark:text-slate-200 transition-colors"
              >
                <option value="">Select Venue...</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.venueName} (Capacity: {v.capacity})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block uppercase tracking-wider">
                Start Schedule *
              </span>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-3">
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block uppercase tracking-wider">
                End Schedule *
              </span>
              <input
                type="date"
                required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Description & Objectives
            </label>
            <textarea
              rows={3}
              placeholder="Outline what participants will learn, required software, tools, etc."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none transition-colors"
            />
          </div>

          {/* Workshop Details toggle */}
          {isWorkshop && (
            <div className="p-4 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-800/40 space-y-4">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Guest Speaker / Instructor Profile
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Speaker Name"
                  value={form.speakerName}
                  onChange={(e) => setForm({ ...form, speakerName: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                />
                <input
                  type="text"
                  placeholder="Speaker Title / Bio (e.g. Senior SRE @ Google)"
                  value={form.speakerBio}
                  onChange={(e) => setForm({ ...form, speakerBio: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>

              <input
                type="text"
                placeholder="Prerequisites (e.g. Basic Docker knowledge, Laptop required)"
                value={form.prerequisites}
                onChange={(e) => setForm({ ...form, prerequisites: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-sky-600/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Publishing...' : isAdmin ? 'Publish to Catalog' : 'Submit Event Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
