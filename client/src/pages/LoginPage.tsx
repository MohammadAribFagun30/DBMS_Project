import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isLoading, isAuthenticated, isAdmin } = useAuth();
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

  const handleGoogleLogin = async () => {
    try {
      const loggedUser = await login('student@test.com', '12345678');
      if (loggedUser?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/my-activity');
      }
    } catch {
      // handled in context
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.25rem)] flex flex-col justify-center items-center px-4 py-10 bg-slate-50 dark:bg-[#08090e] transition-colors duration-200">
      <div className="w-full max-w-[400px] flex flex-col items-center">
        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight text-center">
          {t('Login')}
        </h1>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('Email')}
            </label>
            <input
              type="email"
              required
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#141520] border border-slate-300 dark:border-[#6366f1]/70 focus:border-indigo-600 dark:focus:border-[#6366f1] focus:ring-1 focus:ring-indigo-600 dark:focus:ring-[#6366f1] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all shadow-sm"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('Password')}
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder={t('Enter your password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-3.5 pr-11 py-2.5 rounded-xl bg-white dark:bg-[#141520] border border-slate-300 dark:border-slate-800 focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all shadow-sm"
              />
              <div className="absolute right-0 h-full flex items-center pr-3 pl-2.5 border-l border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end mt-1.5">
              <button
                type="button"
                onClick={() => toast.info('Password reset instructions sent to your email.')}
                className="text-xs font-medium text-indigo-600 dark:text-[#6d6fe8] hover:underline"
              >
                {t('Forgot password?')}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#7c6ff0] hover:bg-[#6c5fe8] text-white font-medium text-sm transition-all shadow-md shadow-[#7c6ff0]/25 disabled:opacity-50"
          >
            {isLoading ? t('Logging in...', 'Logging in...') : t('Login')}
          </button>
        </form>

        {/* Divider */}
        <div className="w-full relative my-5 flex items-center justify-center">
          <div className="border-t border-slate-200 dark:border-slate-800/80 w-full" />
          <span className="bg-transparent px-3 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase whitespace-nowrap">
            {t('Or continue with')}
          </span>
          <div className="border-t border-slate-200 dark:border-slate-800/80 w-full" />
        </div>

        {/* Sign in with Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-[#141520] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#1a1c2c] text-slate-700 dark:text-slate-200 font-medium text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          {t('Sign in with Google', 'Google')}
        </button>

        {/* Don't have an account */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
          {t("Don't have an account?")}{' '}
          <Link to="/register" className="text-indigo-600 dark:text-[#6d6fe8] font-semibold hover:underline">
            {t('Sign up')}
          </Link>
        </p>

        {/* Credentials Box */}
        <div className="w-full mt-6 bg-white dark:bg-[#12131d] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 space-y-2 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
            {t('Quick Test Accounts', 'Click to fill in the credentials')}
          </span>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => fillCredentials('admin@test.com', '12345678')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-200/70 dark:hover:bg-slate-800/60 transition-colors text-left group"
            >
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Admin</span>
              <span className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-mono">admin@test.com</span>
              <span className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-mono">12345678</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('student@test.com', '12345678')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-200/70 dark:hover:bg-slate-800/60 transition-colors text-left group"
            >
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Student</span>
              <span className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-mono">student@test.com</span>
              <span className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-mono">12345678</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
