import React from 'react';

interface BadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, size = 'sm' }) => {
  const s = status.toUpperCase();
  let color = 'bg-slate-100 text-slate-700 border-slate-200';

  if (s === 'APPROVED' || s === 'CONFIRMED') {
    color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (s === 'COMPLETED' || s === 'ATTENDED') {
    color = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  } else if (s === 'PENDING') {
    color = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (s === 'REJECTED' || s === 'CANCELLED') {
    color = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  const sizeClass = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${color} ${sizeClass}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {status}
    </span>
  );
};

export const TypeBadge: React.FC<{ type?: string | null }> = ({ type }) => {
  if (!type) return null;
  const t = type.toUpperCase();
  let color = 'bg-purple-50 text-purple-700 border-purple-200';

  if (t === 'WORKSHOP') color = 'bg-blue-50 text-blue-700 border-blue-200';
  if (t === 'HACKATHON') color = 'bg-amber-50 text-amber-800 border-amber-200';
  if (t === 'SEMINAR') color = 'bg-teal-50 text-teal-700 border-teal-200';
  if (t === 'COMPETITION') color = 'bg-rose-50 text-rose-700 border-rose-200';

  return (
    <span className={`inline-flex items-center font-semibold rounded-md border px-2 py-0.5 text-[11px] uppercase tracking-wider ${color}`}>
      {type}
    </span>
  );
};

