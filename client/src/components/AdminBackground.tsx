import React from 'react';

export const AdminBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. Architectural CAD Dot Matrix Canvas */}
      <div className="absolute inset-0 bg-[radial-gradient(#3B2418_1.3px,transparent_1.3px)] dark:bg-[radial-gradient(#ECE8DC_1.3px,transparent_1.3px)] [background-size:26px_26px] opacity-[0.14] dark:opacity-[0.18]" />

      {/* 2. Fine Engineering & Command Coordinate Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#3B2418_1px,transparent_1px),linear-gradient(to_bottom,#3B2418_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ECE8DC_1px,transparent_1px),linear-gradient(to_bottom,#ECE8DC_1px,transparent_1px)] [background-size:104px_104px] opacity-[0.045] dark:opacity-[0.08]" />

      {/* 3. Deep Ambient Glowing Floating Mesh Orbs (Slow Professional Drift) */}
      {/* Top Left / Brand Crest: Warm Campus Terracotta & Copper */}
      <div className="absolute -top-32 -left-20 w-[620px] h-[620px] rounded-full bg-gradient-to-br from-[#B36836]/35 via-[#C87A3E]/20 to-transparent dark:from-[#C87A3E]/42 dark:via-[#B36836]/24 dark:to-transparent blur-[95px] animate-drift-1" />

      {/* Top Right / Executive Operations: High-Voltage Sapphire & Electric Blue */}
      <div className="absolute top-[5%] -right-24 w-[660px] h-[660px] rounded-full bg-gradient-to-bl from-[#2563EB]/32 via-[#3B82F6]/18 to-transparent dark:from-[#2563EB]/42 dark:via-[#1D4ED8]/26 dark:to-transparent blur-[105px] animate-drift-2" />

      {/* Bottom Right / Performance & Rankings: Warm Amber & Cyber Gold */}
      <div className="absolute -bottom-28 right-[10%] w-[580px] h-[580px] rounded-full bg-gradient-to-tl from-[#D4A24C]/32 via-[#B36836]/18 to-transparent dark:from-[#F59E0B]/34 dark:via-[#D4A24C]/20 dark:to-transparent blur-[90px] animate-drift-1" />

      {/* Bottom Left / Institutional Foundation: Deep Forest Emerald */}
      <div className="absolute -bottom-36 -left-16 w-[560px] h-[560px] rounded-full bg-gradient-to-tr from-[#2E6B4D]/30 via-[#3D8B63]/16 to-transparent dark:from-[#2E8B57]/36 dark:via-[#1E6B47]/22 dark:to-transparent blur-[95px] animate-drift-2" />

      {/* Center Console Command Halo: Breathing Ambient Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.12)_0%,rgba(200,122,62,0.10)_35%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.16)_0%,rgba(200,122,62,0.14)_35%,transparent_70%)] blur-2xl animate-pulse-subtle" />

      {/* 4. Elegant Cyber Beam / Ambient Sweep (Ultra-slow, smooth, professional) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-60">
        <div className="w-[200%] h-[200%] -top-[50%] -left-[50%] bg-[linear-gradient(135deg,transparent_40%,rgba(200,122,62,0.08)_48%,rgba(37,99,235,0.14)_50%,rgba(200,122,62,0.08)_52%,transparent_60%)] animate-beam-sweep" />
      </div>

      {/* 5. Ambient Perimeter Framing Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(219,205,186,0.50)_100%)] dark:hidden" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(10,9,7,0.72)_100%)] hidden dark:block" />
    </div>
  );
};
