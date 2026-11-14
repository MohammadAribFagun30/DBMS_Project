import React, { useState, useEffect } from 'react';
import { Club, Venue } from '../types';
import { apiClubs, apiVenues, apiEvents } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { X, Calendar, Clock, MapPin, Mic, Send, Sparkles } from 'lucide-react';

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
          ? 'Event created and approved!'
          : 'Event proposal submitted successfully! Pending admin approval.'
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to propose event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-indigo-700 to-purple-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1 text-indigo-100 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            {isAdmin ? 'Create Campus Event' : 'Propose New Club Event'}
          </div>
          <h3 className="text-xl font-extrabold">
            {isAdmin ? 'Publish Official Event' : 'Submit Event Proposal'}
          </h3>
          <p className="text-xs text-indigo-100 mt-1">
            {isAdmin
              ? 'Event will be approved immediately and listed for student registration.'
              : 'Submitted proposals are reviewed by system administrators before going live.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
          {/* Organizing Club */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Organizing Club <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={form.clubId}
              onChange={(e) => setForm({ ...form, clubId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">Select Club...</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.clubName}
                </option>
              ))}
            </select>
          </div>

          {/* Event Title */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Event Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. NextGen Web Development Bootcamp"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Event Type & Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Event Type</label>
              <select
                value={form.eventType}
                onChange={(e) => {
                  setForm({ ...form, eventType: e.target.value });
                  setIsWorkshop(e.target.value === 'WORKSHOP');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="WORKSHOP">WORKSHOP</option>
                <option value="HACKATHON">HACKATHON</option>
                <option value="SEMINAR">SEMINAR</option>
                <option value="COMPETITION">COMPETITION</option>
                <option value="SOCIAL">SOCIAL</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Venue</label>
              <select
                value={form.venueId}
                onChange={(e) => setForm({ ...form, venueId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">Select Venue...</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.venueName} ({v.capacity} seats)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Schedule Date & Time */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Start Date & Time *</label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value, endDate: form.endDate || e.target.value })}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs mb-1 bg-white"
              />
              <input
                type="time"
                required
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">End Date & Time *</label>
              <input
                type="date"
                required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs mb-1 bg-white"
              />
              <input
                type="time"
                required
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="What will participants learn or do?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Workshop Details toggle */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={isWorkshop}
                onChange={(e) => setIsWorkshop(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-indigo-600" />
                Include Workshop Speaker Information
              </span>
            </label>

            {isWorkshop && (
              <div className="space-y-3 p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100 animate-in fade-in">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Speaker Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. John Doe"
                    value={form.speakerName}
                    onChange={(e) => setForm({ ...form, speakerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Speaker Bio</label>
                  <input
                    type="text"
                    placeholder="e.g. Lead Engineer at OpenAI"
                    value={form.speakerBio}
                    onChange={(e) => setForm({ ...form, speakerBio: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prerequisites</label>
                  <input
                    type="text"
                    placeholder="e.g. Laptop with VS Code, basic Python knowledge"
                    value={form.prerequisites}
                    onChange={(e) => setForm({ ...form, prerequisites: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Submitting...' : isAdmin ? 'Publish Event' : 'Submit Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

