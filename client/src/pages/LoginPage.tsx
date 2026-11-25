import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Eye,
  EyeOff,
  Lock,
  GraduationCap
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    try {
      const loggedUser = await login(email, password);
      if (loggedUser?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/my-activity');
      }
    } catch {
      // handled in context
    }
  };

  const fillCredentials = (fillEmail: string, fillPass: string) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    toast.info(`Filled credentials for ${fillEmail}`);
  };

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] flex flex-col justify-center items-center px-4 py-12 bg-[var(--bg)] text-[var(--text)] overflow-hidden">
      {/* Background Architectural Dot Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#3B2418_1.2px,transparent_1.2px)] dark:bg-[radial-gradient(#ECE8DC_1.2px,transparent_1.2px)] [background-size:28px_28px] opacity-[0.06] dark:opacity-[0.08] pointer-events-none" />

      {/* Ambient Animated Gradient Orbs */}
      <div className="absolute -top-20 -left-16 w-72 h-72 sm:w-[420px] sm:h-[420px] rounded-full bg-gradient-to-br from-[#B36836]/25 via-[#C87A3E]/15 to-transparent blur-3xl pointer-events-none animate-drift-1" />
      <div className="absolute -bottom-24 -right-16 w-72 h-72 sm:w-[420px] sm:h-[420px] rounded-full bg-gradient-to-tl from-[#2E6B4D]/25 via-[#428E67]/15 to-transparent blur-3xl pointer-events-none animate-drift-2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-r from-[#D4A24C]/15 to-[#B36836]/10 blur-2xl pointer-events-none animate-pulse-subtle" />

      {/* Main Login Wrapper */}
      <div className="relative w-full max-w-[390px]">
        {/* Glassmorphism Card */}
        <div className="relative w-full login-glass-card p-6 sm:p-7 rounded-[8px] space-y-4 z-10 transition-all">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--primary)] dark:text-[#60A5FA] font-semibold flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[var(--primary)] dark:text-[#60A5FA]" strokeWidth={2} />
                {t('Institutional Login', 'INSTITUTIONAL LOGIN')}
              </span>
              <h1 className="font-heading font-semibold text-xl text-[var(--text)] mt-1">
                {t('Sign In to ClubVerse', 'Sign In to ClubVerse')}
              </h1>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                {t('Access your university events, tickets, and administration.')}
              </p>
            </div>
            <div className="w-9 h-9 rounded-[6px] bg-[var(--primary)] text-[var(--primary-contrast)] dark:bg-[#1E40AF]/40 dark:text-[#93C5FD] dark:border dark:border-[#3B82F6]/30 flex items-center justify-center shrink-0 shadow-sm">
              <Lock className="w-4 h-4" strokeWidth={1.75} />
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-[var(--text)] mb-1">
                {t('Email')}
              </label>
              <input
                type="email"
                required
                placeholder="student@test.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs text-[var(--text)] bg-white/70 dark:bg-black/30 border border-[#DBCDBA]/80 dark:border-white/15 rounded-[4px] backdrop-blur-sm focus:bg-white dark:focus:bg-black/50 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-[var(--text)]">
                  {t('Password')}
                </label>
                <button
                  type="button"
                  onClick={() => toast.info('Password reset instructions sent to your email.')}
                  className="text-[11px] text-[var(--primary)] dark:text-[#60A5FA] hover:underline"
                >
                  {t('Forgot password?')}
                </button>
              </div>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder={t('Enter your password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 text-xs text-[var(--text)] font-mono bg-white/70 dark:bg-black/30 border border-[#DBCDBA]/80 dark:border-white/15 rounded-[4px] backdrop-blur-sm focus:bg-white dark:focus:bg-black/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 text-[var(--muted)] hover:text-[var(--text)]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary btn-login-submit w-full text-xs py-2 mt-1 disabled:opacity-60 font-medium"
            >
              {isLoading ? t('Logging in...', 'Logging in...') : t('Login')}
            </button>
          </form>

          {/* Don't have an account */}
          <p className="text-center text-xs text-[var(--muted)] pt-1">
            {t("Don't have an account?")}{' '}
            <Link to="/register" className="text-[var(--primary)] dark:text-[#60A5FA] font-medium hover:underline">
              {t('Sign up')}
            </Link>
          </p>

          {/* Credentials Box */}
          <div className="pt-3 border-t border-[var(--border)]/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-wider block">
                {t('Quick Test Accounts', 'Click to fill credentials')}
              </span>
              <span className="text-[10px] font-mono text-[var(--primary)] dark:text-[#60A5FA] font-medium">One-Click</span>
            </div>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => fillCredentials('admin@test.com', '12345678')}
                className="w-full flex items-center justify-between p-2 rounded-[4px] bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 border border-white/70 dark:border-white/10 hover:border-[var(--primary)]/40 text-left cursor-pointer transition-all backdrop-blur-sm group"
              >
                <span className="text-xs font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">Admin</span>
                <span className="text-xs font-mono text-[var(--muted)]">admin@test.com</span>
                <span className="text-xs font-mono text-[var(--muted)]">12345678</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('user@test.com', '12345678')}
                className="w-full flex items-center justify-between p-2 rounded-[4px] bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 border border-white/70 dark:border-white/10 hover:border-[var(--primary)]/40 text-left cursor-pointer transition-all backdrop-blur-sm group"
              >
                <span className="text-xs font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">Student</span>
                <span className="text-xs font-mono text-[var(--muted)]">user@test.com</span>
                <span className="text-xs font-mono text-[var(--muted)]">12345678</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
