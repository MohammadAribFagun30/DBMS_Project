import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Moon, Sun, Globe, ChevronDown, Check } from 'lucide-react';

interface ThemeLanguageToggleProps {
  className?: string;
}

export const ThemeLanguageToggle: React.FC<ThemeLanguageToggleProps> = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  return (
    <div className={`flex items-center gap-2.5 relative ${className}`}>
      {/* Theme Toggle Pill Switch */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="w-13 h-7 px-1 rounded-full bg-slate-200 dark:bg-[#13151b] border border-slate-300 dark:border-slate-800 flex items-center transition-all cursor-pointer relative shadow-inner"
        style={{ width: '3.25rem', height: '1.75rem' }}
      >
        <span
          className={`w-5 h-5 rounded-full flex items-center justify-center transition-transform duration-200 shadow-sm ${
            isDark
              ? 'translate-x-6 bg-[#1a1b24] text-indigo-400'
              : 'translate-x-0 bg-amber-400 text-slate-900'
          }`}
        >
          {isDark ? (
            <Moon className="w-3 h-3 text-indigo-300 fill-indigo-400/20" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
          )}
        </span>
      </button>

      {/* Language Selector Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setLangDropdownOpen(!langDropdownOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          <Globe className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span>{language}</span>
          <ChevronDown className="w-3 h-3 text-slate-500 dark:text-slate-400" />
        </button>

        {langDropdownOpen && (
          <div className="absolute right-0 mt-1.5 w-32 bg-white dark:bg-[#161822] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => {
                setLanguage('EN');
                setLangDropdownOpen(false);
              }}
              className="w-full px-3 py-1.5 text-xs text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center justify-between cursor-pointer"
            >
              <span>English (EN)</span>
              {language === 'EN' && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setLanguage('BN');
                setLangDropdownOpen(false);
              }}
              className="w-full px-3 py-1.5 text-xs text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center justify-between cursor-pointer"
            >
              <span>বাংলা (BN)</span>
              {language === 'BN' && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
