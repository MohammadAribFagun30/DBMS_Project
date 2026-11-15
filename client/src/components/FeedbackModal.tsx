import React, { useState } from 'react';
import { apiFeedback } from '../services/api';
import { useToast } from '../context/ToastContext';
import { X, Star, MessageSquare, ShieldCheck, Send } from 'lucide-react';

interface FeedbackModalProps {
  eventId: number | null;
  eventTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  eventId,
  eventTitle,
  onClose,
  onSuccess,
}) => {
  if (!eventId) return null;

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comments, setComments] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiFeedback.submit({
        eventId,
        rating,
        comments: comments.trim() ? comments.trim() : undefined,
      });
      toast.success('Thank you! Your feedback has been recorded anonymously.');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-white">
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-indigo-900 p-6 text-white relative border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2 text-amber-200 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-white" />
            100% Anonymous Feedback
          </div>
          <h3 className="text-xl font-extrabold">{eventTitle}</h3>
          <p className="text-xs text-amber-200 mt-1">
            Your review helps calculate the annual club rankings and enhance future events.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Star Rating Selector */}
          <div className="text-center space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Rate your experience
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = (hoverRating || rating) >= star;
                return (
                  <button
                    type="button"
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        filled
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-600 hover:text-slate-500'
                      } transition-colors`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-bold text-amber-400 block">
              {rating === 5 && 'Outstanding ⭐⭐⭐⭐⭐'}
              {rating === 4 && 'Very Good ⭐⭐⭐⭐'}
              {rating === 3 && 'Average / Fair ⭐⭐⭐'}
              {rating === 2 && 'Needs Improvement ⭐⭐'}
              {rating === 1 && 'Poor Experience ⭐'}
            </span>
          </div>

          {/* Comments input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Anonymous Feedback & Suggestions (Optional)
            </label>
            <textarea
              rows={4}
              placeholder="What did you enjoy most about this workshop? What could be improved for next time?"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full p-3.5 rounded-2xl bg-slate-950/80 border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm text-white placeholder-slate-500 transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/25 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Submitting...' : 'Submit Anonymous Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
