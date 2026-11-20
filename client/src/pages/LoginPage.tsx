import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Eye, EyeOff } from 'lucide-react';

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
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-center items-center px-4 py-8 bg-[var(--bg)] text-[var(--text)]">
      <div className="w-full max-w-[380px] bg-[var(--surface)] p-6 rounded-[6px] border border-[var(--border)] space-y-4">
        {/* Title */}
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--primary)] font-semibold">
            Institutional Login
          </span>
          <h1 className="font-heading font-semibold text-xl text-[var(--text)] mt-0.5">
            Sign In to ClubVerse
          </h1>
          <p className="text-xs text-[var(--muted)]">
            Access your university events, tickets, and administration.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
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
              className="w-full px-3 py-1.5 text-xs text-[var(--text)]"
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
                className="text-[11px] text-[var(--primary)] hover:underline"
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
                className="w-full pl-3 pr-8 py-1.5 text-xs text-[var(--text)] font-mono"
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
            className="btn-primary w-full text-xs py-2 mt-1 disabled:opacity-60"
          >
            {isLoading ? t('Logging in...', 'Logging in...') : t('Login')}
          </button>
        </form>

        {/* Don't have an account */}
        <p className="text-center text-xs text-[var(--muted)] pt-1">
          {t("Don't have an account?")}{' '}
          <Link to="/register" className="text-[var(--primary)] font-medium hover:underline">
            {t('Sign up')}
          </Link>
        </p>

        {/* Credentials Box */}
        <div className="pt-3 border-t border-[var(--border)] space-y-1.5">
          <span className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-wider block">
            {t('Quick Test Accounts', 'Click to fill credentials')}
          </span>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => fillCredentials('admin@test.com', '12345678')}
              className="w-full flex items-center justify-between p-2 rounded-[4px] bg-[var(--surface-alt)] hover:border-[var(--muted)] border border-[var(--border)] text-left cursor-pointer transition-colors"
            >
              <span className="text-xs font-semibold text-[var(--text)]">Admin</span>
              <span className="text-xs font-mono text-[var(--muted)]">admin@test.com</span>
              <span className="text-xs font-mono text-[var(--muted)]">12345678</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('student@test.com', '12345678')}
              className="w-full flex items-center justify-between p-2 rounded-[4px] bg-[var(--surface-alt)] hover:border-[var(--muted)] border border-[var(--border)] text-left cursor-pointer transition-colors"
            >
              <span className="text-xs font-semibold text-[var(--text)]">Student</span>
              <span className="text-xs font-mono text-[var(--muted)]">student@test.com</span>
              <span className="text-xs font-mono text-[var(--muted)]">12345678</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
