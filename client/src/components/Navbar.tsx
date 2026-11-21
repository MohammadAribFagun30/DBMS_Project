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
  Bookmark
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
    <header className="sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--border)]">
      <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to={isWelcomePage ? "/" : "/home"} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-[var(--primary)] text-[var(--primary-contrast)] flex items-center justify-center">
              <Bookmark className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <span className="font-heading font-semibold text-base tracking-tight text-[var(--text)]">
                ClubVerse
              </span>
              <span className="block text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] -mt-0.5">
                {t('IIUC Campus Portal')}
              </span>
            </div>
          </Link>

          {/* Desktop Nav for Welcome Page */}
          {isWelcomePage && (
            <nav className="hidden md:flex items-center">
              <Link
                to="/"
                className="px-3 py-1.5 rounded-[6px] text-xs font-semibold bg-[var(--surface-alt)] text-[var(--primary)] border border-[var(--border)] transition-colors"
              >
                {t('Home')}
              </Link>
            </nav>
          )}

          {/* Desktop Nav for Other Pages */}
          {!isWelcomePage && !isAuthPage && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[var(--surface-alt)] text-[var(--primary)] font-semibold border border-[var(--border)]'
                        : item.highlight
                        ? 'text-[var(--primary)] hover:bg-[var(--surface-alt)] font-semibold'
                        : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-alt)]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {item.label}
                    {item.highlight && (
                      <span className="bg-[var(--primary)] text-[var(--primary-contrast)] text-[10px] font-mono px-1 py-0.2 rounded-[4px]">
                        Admin
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* User actions / Auth */}
          <div className="hidden md:flex items-center gap-2">
            {/* Notifications Bell */}
            {showUserSession && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="w-8 h-8 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-alt)] text-[var(--muted)] hover:text-[var(--text)] flex items-center justify-center relative transition-colors cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" strokeWidth={1.5} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--highlight)] rounded-full" />
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifOpen && (
                  <div className="absolute right-0 mt-1 w-80 bg-[var(--surface)] rounded-[6px] border border-[var(--border)] py-1 z-50">
                    <div className="px-3 py-2 border-b border-[var(--border)] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-[var(--text)]">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-[11px] font-mono font-medium text-[var(--highlight)]">
                            ({unreadCount})
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllRead}
                          className="text-[11px] text-[var(--primary)] hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-[var(--border)]">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-[var(--muted)] text-xs">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3 text-xs transition-colors ${
                              !n.isRead ? 'bg-[var(--surface-alt)] text-[var(--text)]' : 'text-[var(--muted)]'
                            }`}
                          >
                            <p className="leading-relaxed">{n.message}</p>
                            <span className="text-[10px] font-mono text-[var(--muted)] mt-1 block">
                              {new Date(n.createdAt).toLocaleDateString()} •{' '}
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

            {/* Theme & Language Switcher */}
            <ThemeLanguageToggle />

            {/* Profile or Login/Register */}
            {showUserSession ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[var(--border)]">
                <div className="w-8 h-8 rounded-[6px] bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text)] font-mono font-medium text-xs flex items-center justify-center">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-medium text-[var(--text)] leading-tight">{user?.fullName}</p>
                  <span className="text-[10px] font-mono uppercase text-[var(--muted)]">
                    {user?.role}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-8 h-8 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-alt)] text-[var(--muted)] hover:text-[#9B3A2D] flex items-center justify-center transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              !isAuthPage && (
                <div className="flex items-center gap-2">
                  {isWelcomePage && (
                    <Link
                      to="/register"
                      className="px-3 py-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                    >
                      {t('Register')}
                    </Link>
                  )}
                  <Link
                    to="/login"
                    className="btn-primary text-xs py-1.5 px-3.5"
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
              <ThemeLanguageToggle />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-8 h-8 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] flex items-center justify-center"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" strokeWidth={1.5} /> : <Menu className="w-4 h-4" strokeWidth={1.5} />}
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
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3 space-y-1">
          {isWelcomePage ? (
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-[6px] text-sm font-semibold bg-[var(--surface-alt)] text-[var(--primary)]"
            >
              {t('Home')}
            </Link>
          ) : (
            navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-sm text-[var(--text)] hover:bg-[var(--surface-alt)]"
                >
                  <Icon className="w-4 h-4 text-[var(--muted)]" strokeWidth={1.5} />
                  {item.label}
                </Link>
              );
            })
          )}

          <div className="pt-3 border-t border-[var(--border)] mt-2">
            {showUserSession ? (
              <div className="flex items-center justify-between p-2 rounded-[6px] bg-[var(--surface-alt)] border border-[var(--border)]">
                <div>
                  <p className="text-xs font-medium text-[var(--text)]">{user?.fullName}</p>
                  <p className="text-[10px] font-mono text-[var(--muted)] uppercase">{user?.role}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-[#9B3A2D] hover:underline"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary text-center text-xs py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary text-center text-xs py-2"
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
