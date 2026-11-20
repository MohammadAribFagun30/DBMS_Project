import React, { useState } from 'react';
import { apiFeedback } from '../services/api';
import { useToast } from '../context/ToastContext';
import { X, Star, ShieldCheck } from 'lucide-react';

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

  const ratingLabel = (r: number) => {
    switch (r) {
      case 5: return 'Outstanding (5/5)';
      case 4: return 'Very Good (4/5)';
      case 3: return 'Average / Fair (3/5)';
      case 2: return 'Needs Improvement (2/5)';
      case 1: return 'Poor Experience (1/5)';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
      <div className="relative bg-[var(--surface)] rounded-[6px] max-w-md w-full border border-[var(--border)] overflow-hidden text-[var(--text)]">
        <div className="p-5 border-b border-[var(--border)] relative bg-[var(--surface-alt)]">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-[4px] bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] flex items-center justify-center cursor-pointer"
          >
            <X className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
          <div className="flex items-center gap-1.5 mb-1 text-[var(--primary)] text-[10px] font-mono uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
            100% Anonymous Feedback Protocol
          </div>
          <h3 className="font-heading font-semibold text-base text-[var(--text)]">{eventTitle}</h3>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Your review contributes 30% to the organizing club's annual score.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Star Rating Selector */}
          <div className="text-center space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-[var(--muted)] block">
              Rate Your Experience
            </label>
            <div className="flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = (hoverRating || rating) >= star;
                return (
                  <button
                    type="button"
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        filled
                          ? 'fill-[var(--highlight)] text-[var(--highlight)]'
                          : 'text-[var(--border)]'
                      } transition-colors`}
                      strokeWidth={1.5}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-mono font-medium text-[var(--highlight)] block">
              {ratingLabel(rating)}
            </span>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1">
              Constructive Comments / Key Takeaways
            </label>
            <textarea
              rows={3}
              placeholder="What went well? Any suggestions for future sessions?"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full px-3 py-2 text-xs text-[var(--text)] placeholder:text-[var(--muted)] font-sans"
            />
          </div>

          {/* Action buttons */}
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
              {submitting ? 'Submitting...' : 'Submit Anonymous Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
