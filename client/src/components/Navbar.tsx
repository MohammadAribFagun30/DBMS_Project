import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiNotifications } from '../services/api';
import { NotificationItem } from '../types';
import { ThemeLanguageToggle } from './ThemeLanguageToggle';
import {
  Compass,
  Trophy,
  Ticket,
  ShieldCheck,
  Award,
  Bell,
  LogOut,
  Menu,
  X,
  Sparkles,
  UserCheck
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifOpen, setNotifOpen] = useState(false);

  // Poll notifications when logged in
  useEffect(() => {
    if (isAuthenticated) {
      apiNotifications.getMy().then((res) => {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
      }).catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  const markAllRead = async () => {
    await apiNotifications.markAllRead();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isWelcomePage = location.pathname === '/';
  const showUserSession = isAuthenticated && !isWelcomePage && !isAuthPage;

  const landingNavLinks = [
    { href: '#overview', label: t('Overview') },
    { href: '#features', label: t('Features') },
    { href: '#how-it-works', label: t('How It Works') },
    { href: '#notice-board', label: t('Notice Board') },
    { href: '#about-iiuc', label: t('About IIUC') },
  ];

  const navLinks = isAuthPage || isWelcomePage
    ? []
    : [
        { to: '/events', label: t('Events & Workshops'), icon: Compass },
        { to: '/clubs', label: t('Clubs & Rankings'), icon: Trophy },
        ...(!isAdmin ? [{ to: '/verify', label: t('Verify Certificate'), icon: Award }] : []),
        ...(isAuthenticated && !isAdmin ? [{ to: '/my-activity', label: t('My Activity'), icon: Ticket }] : []),
        ...(isAdmin ? [{ to: '/admin', label: t('Admin Hub'), icon: ShieldCheck, highlight: true }] : []),
      ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
      <div className="w-full max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isWelcomePage ? "/" : "/home"} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 dark:from-white dark:via-indigo-100 dark:to-indigo-300 bg-clip-text text-transparent">
                ClubVerse
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-indigo-600 dark:text-indigo-400 -mt-1">
                {t('International Islamic University Chittagong · Campus Portal', 'IIUC Campus Portal')}
              </span>
            </div>
          </Link>

          {/* Desktop Nav for Welcome Page */}
          {isWelcomePage && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 dark:bg-slate-900/60 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-sm">
              {landingNavLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition-all"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}

          {/* Desktop Nav for Other Pages */}
          {!isWelcomePage && !isAuthPage && (
            <nav className="hidden md:flex items-center gap-1.5">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600/15 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-500/30 shadow-inner'
                        : item.highlight
                        ? 'text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-900 font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/80'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                    {item.highlight && (
                      <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-sm">
                        Admin
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* User actions / Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Notifications Bell */}
            {showUserSession && (
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl relative transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-white dark:ring-slate-950" />
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold px-2 py-0.5 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3.5 text-xs transition-colors ${
                              !n.isRead
                                ? 'bg-indigo-50/70 dark:bg-indigo-950/40 text-slate-900 dark:text-slate-200'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <p className="leading-relaxed font-medium">{n.message}</p>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                              {new Date(n.createdAt).toLocaleDateString()} at{' '}
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Theme & Language Switcher & Profile/Login */}
            <ThemeLanguageToggle />

            {/* Profile Pill */}
            {showUserSession ? (
              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-slate-800">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{user?.fullName}</p>
                  <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors ml-1"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              !isAuthPage && (
                <div className="flex items-center gap-2">
                  {isWelcomePage && (
                    <Link
                      to="/register"
                      className="hidden sm:inline-block px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors"
                    >
                      {t('Register')}
                    </Link>
                  )}
                  <div className="h-4 w-px bg-slate-300 dark:bg-slate-800 mx-0.5" />
                  <Link
                    to="/login"
                    className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/25 transition-all hover:scale-105"
                  >
                    {t('Login')}
                  </Link>
                </div>
              )
            )}
          </div>

          {/* Mobile menu button / Toggle */}
          {!isAuthPage ? (
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          ) : (
            <div className="flex md:hidden items-center gap-2">
              <ThemeLanguageToggle />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-3 pb-6 space-y-2 transition-colors">
          {isWelcomePage ? (
            landingNavLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {item.label}
              </a>
            ))
          ) : (
            navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  {item.label}
                </Link>
              );
            })
          )}

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            {showUserSession ? (
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.fullName}</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 uppercase font-semibold">{user?.role}</p>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 text-sm font-semibold border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 text-sm font-semibold bg-indigo-600 text-white rounded-xl shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
