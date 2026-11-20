import React from 'react';

interface BadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<BadgeProps> = ({ status }) => {
  const s = status.toUpperCase();
  
  // Status colors (low saturation) per specification: 4px radius, 12px text
  let colorClass = 'text-[var(--muted)] bg-[var(--surface-alt)] border-[var(--border)]';

  if (s === 'APPROVED' || s === 'CONFIRMED') {
    colorClass = 'text-[#2F6B4F] bg-[#E4EFE8] dark:text-[#7CC09E] dark:bg-[#1C2E25] border-transparent';
  } else if (s === 'PENDING') {
    colorClass = 'text-[#8A6414] bg-[#F4EBD3] dark:text-[#D9AE5B] dark:bg-[#33291A] border-transparent';
  } else if (s === 'REJECTED' || s === 'CANCELLED') {
    colorClass = 'text-[#9B3A2D] bg-[#F4E1DD] dark:text-[#E08A7C] dark:bg-[#371E1A] border-transparent';
  } else if (s === 'COMPLETED' || s === 'ATTENDED') {
    colorClass = 'text-[#35567A] bg-[#E1E9F2] dark:text-[#86A9D1] dark:bg-[#1A2433] border-transparent';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[12px] font-medium rounded-[4px] border ${colorClass} tracking-wide`}>
      {status}
    </span>
  );
};

export const TypeBadge: React.FC<{ type?: string | null }> = ({ type }) => {
  if (!type) return null;
  const t = type.toUpperCase();
  
  // Subtle low-saturation border and surface for type badges
  let colorClass = 'text-[var(--text)] bg-[var(--surface-alt)] border-[var(--border)]';
  if (t === 'WORKSHOP') {
    colorClass = 'text-[#35567A] bg-[#E1E9F2] dark:text-[#86A9D1] dark:bg-[#1A2433] border-transparent';
  } else if (t === 'SEMINAR') {
    colorClass = 'text-[#2F6B4F] bg-[#E4EFE8] dark:text-[#7CC09E] dark:bg-[#1C2E25] border-transparent';
  } else if (t === 'HACKATHON' || t === 'COMPETITION') {
    colorClass = 'text-[#8A6414] bg-[#F4EBD3] dark:text-[#D9AE5B] dark:bg-[#33291A] border-transparent';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider rounded-[4px] border ${colorClass}`}>
      {type}
    </span>
  );
};
