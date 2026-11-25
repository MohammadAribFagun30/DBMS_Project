import React from 'react';

export const AppBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. Architectural Dot Matrix Canvas (Deeper & more pronounced) */}
      <div className="absolute inset-0 bg-[radial-gradient(#3B2418_1.3px,transparent_1.3px)] dark:bg-[radial-gradient(#ECE8DC_1.3px,transparent_1.3px)] [background-size:28px_28px] opacity-[0.12] dark:opacity-[0.16]" />

      {/* 2. Fine Engineering Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#3B2418_1px,transparent_1px),linear-gradient(to_bottom,#3B2418_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ECE8DC_1px,transparent_1px),linear-gradient(to_bottom,#ECE8DC_1px,transparent_1px)] [background-size:112px_112px] opacity-[0.035] dark:opacity-[0.065]" />

      {/* 3. Deep Ambient Glowing Floating Mesh Orbs */}
      {/* Top Left: Warm Campus Terracotta / Copper */}
      <div className="absolute -top-28 -left-28 w-[580px] h-[580px] rounded-full bg-gradient-to-br from-[#B36836]/36 via-[#C87A3E]/22 to-transparent dark:from-[#C87A3E]/40 dark:via-[#B36836]/25 dark:to-transparent blur-[85px] animate-drift-1" />

      {/* Top Right / Center Right: Institutional Sapphire / Tech Blue */}
      <div className="absolute top-[12%] -right-32 w-[620px] h-[620px] rounded-full bg-gradient-to-bl from-[#2563EB]/28 via-[#3B82F6]/16 to-transparent dark:from-[#2563EB]/36 dark:via-[#1D4ED8]/24 dark:to-transparent blur-[90px] animate-drift-2" />

      {/* Bottom Left / Center: Campus Emerald / Forest */}
      <div className="absolute -bottom-36 left-[8%] w-[580px] h-[580px] rounded-full bg-gradient-to-tr from-[#2E6B4D]/32 via-[#3D8B63]/18 to-transparent dark:from-[#2E8B57]/35 dark:via-[#1E6B47]/22 dark:to-transparent blur-[85px] animate-drift-1" />

      {/* Bottom Right: Warm Amber / Honey Gold */}
      <div className="absolute -bottom-24 -right-24 w-[520px] h-[520px] rounded-full bg-gradient-to-tl from-[#D4A24C]/30 via-[#B36836]/18 to-transparent dark:from-[#F59E0B]/30 dark:via-[#D4A24C]/18 dark:to-transparent blur-[80px] animate-drift-2" />

      {/* Center Aura: Warm Ambient Halo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(179,104,54,0.12)_0%,rgba(212,162,76,0.06)_45%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(212,162,76,0.16)_0%,rgba(196,120,66,0.08)_45%,transparent_70%)] blur-2xl animate-pulse-subtle" />

      {/* 4. Ambient Perimeter Vignette (Framing the view) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(219,205,186,0.45)_100%)] dark:hidden" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(10,9,7,0.70)_100%)] hidden dark:block" />
    </div>
  );
};
