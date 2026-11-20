import React from 'react';

interface BadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, size = 'sm' }) => {
  const s = status.toUpperCase();
  let color = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';

  if (s === 'APPROVED' || s === 'CONFIRMED') {
    color = 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/70';
  } else if (s === 'COMPLETED' || s === 'ATTENDED') {
    color = 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/70';
  } else if (s === 'PENDING') {
    color = 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/70';
  } else if (s === 'REJECTED' || s === 'CANCELLED') {
    color = 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/70';
  }

  const sizeClass = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border shadow-xs transition-colors duration-200 ${color} ${sizeClass}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {status}
    </span>
  );
};

export const TypeBadge: React.FC<{ type?: string | null }> = ({ type }) => {
  if (!type) return null;
  const t = type.toUpperCase();
  let color = 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/70';

  if (t === 'WORKSHOP') color = 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/70';
  if (t === 'HACKATHON') color = 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/70';
  if (t === 'SEMINAR') color = 'bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800/70';
  if (t === 'COMPETITION') color = 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/70';

  return (
    <span className={`inline-flex items-center font-bold rounded-md border px-2 py-0.5 text-[11px] uppercase tracking-wider shadow-xs transition-colors duration-200 ${color}`}>
      {type}
    </span>
  );
};
