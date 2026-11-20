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
    <div className={`flex items-center gap-2 relative ${className}`}>
      {/* Theme Toggle Button - Lucide Sun/Moon with strokeWidth 1.5, 6px radius, 1px border */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
        title={isDark ? "Light Mode" : "Dark Mode"}
        className="w-8 h-8 rounded-[6px] bg-[var(--surface)] hover:bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] flex items-center justify-center transition-colors cursor-pointer"
      >
        {isDark ? (
          <Sun className="w-4 h-4" strokeWidth={1.5} />
        ) : (
          <Moon className="w-4 h-4" strokeWidth={1.5} />
        )}
      </button>

      {/* Language Selector Dropdown - 6px radius, 1px border, no box shadow */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setLangDropdownOpen(!langDropdownOpen)}
          className="flex items-center gap-1.5 h-8 px-2.5 text-xs font-medium text-[var(--text)] rounded-[6px] bg-[var(--surface)] hover:bg-[var(--surface-alt)] border border-[var(--border)] transition-colors cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-[var(--muted)]" strokeWidth={1.5} />
          <span className="font-mono">{language}</span>
          <ChevronDown className="w-3 h-3 text-[var(--muted)]" strokeWidth={1.5} />
        </button>

        {langDropdownOpen && (
          <div className="absolute right-0 mt-1 w-32 bg-[var(--surface)] border border-[var(--border)] rounded-[6px] py-1 z-50">
            <button
              type="button"
              onClick={() => {
                setLanguage('EN');
                setLangDropdownOpen(false);
              }}
              className="w-full px-3 py-1.5 text-xs text-left text-[var(--text)] hover:bg-[var(--surface-alt)] flex items-center justify-between cursor-pointer"
            >
              <span>English (EN)</span>
              {language === 'EN' && <Check className="w-3.5 h-3.5 text-[var(--primary)]" strokeWidth={1.5} />}
            </button>
            <button
              type="button"
              onClick={() => {
                setLanguage('BN');
                setLangDropdownOpen(false);
              }}
              className="w-full px-3 py-1.5 text-xs text-left text-[var(--text)] hover:bg-[var(--surface-alt)] flex items-center justify-between cursor-pointer"
            >
              <span>বাংলা (BN)</span>
              {language === 'BN' && <Check className="w-3.5 h-3.5 text-[var(--primary)]" strokeWidth={1.5} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
