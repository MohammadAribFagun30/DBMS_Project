import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiNotifications } from '../services/api';
import { NotificationItem } from '../types';
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
  const { user, isAuthenticated, isAdmin, logout, switchDemoRole } = useAuth();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean>(true);

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

  const navLinks = [
    { to: '/events', label: 'Events & Workshops', icon: Compass },
    { to: '/clubs', label: 'Clubs & Rankings', icon: Trophy },
    ...(!isAdmin ? [{ to: '/verify', label: 'Verify Certificate', icon: Award }] : []),
    ...(isAuthenticated && !isAdmin ? [{ to: '/my-activity', label: 'My Activity', icon: Ticket }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin Hub', icon: ShieldCheck, highlight: true }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80">
      {/* Top micro-banner for backend connection status & role switcher */}
      <div className="bg-slate-900/90 border-b border-slate-800/60 text-slate-300 px-4 py-1.5 text-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full animate-pulse ${backendOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="font-medium text-slate-200">
              {backendOnline ? 'Backend API: Connected (Port 5050)' : 'Backend API: Offline / Demo Mode Active'}
            </span>
          </span>
          <span className="hidden md:inline-block text-slate-600">•</span>
          <span className="hidden md:inline-block text-slate-400 font-medium">
            International Islamic University Chittagong (IIUC)
          </span>
        </div>

        {/* Quick Role Switcher for easy testing */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-slate-400">Role Preview:</span>
          <div className="inline-flex rounded-lg bg-slate-800/90 p-0.5 border border-slate-700">
            <button
              onClick={() => switchDemoRole('STUDENT')}
              className={`px-2.5 py-0.5 rounded-md text-xs font-semibold transition-all ${
                !isAdmin ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => switchDemoRole('ADMIN')}
              className={`px-2.5 py-0.5 rounded-md text-xs font-bold transition-all ${
                isAdmin ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                ClubVerse
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-indigo-400 -mt-1">
                IIUC Campus Portal
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
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
                      ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30 shadow-inner'
                      : item.highlight
                      ? 'text-indigo-400 hover:bg-slate-900 hover:text-indigo-300 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
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

          {/* User actions / Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Notifications Bell */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl relative transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-slate-950" />
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-bold px-2 py-0.5 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/80">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-sm">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3.5 text-xs transition-colors ${
                              !n.isRead ? 'bg-indigo-950/40 text-slate-200' : 'hover:bg-slate-800/50 text-slate-300'
                            }`}
                          >
                            <p className="leading-relaxed font-medium">{n.message}</p>
                            <span className="text-[10px] text-slate-500 mt-1 block">
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

            {/* Profile Pill */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold text-slate-200 leading-tight">{user?.fullName}</p>
                  <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors ml-1"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-600/30 transition-all hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-slate-300 hover:bg-slate-900 hover:text-indigo-400"
              >
                <Icon className="w-5 h-5 text-indigo-400" />
                {item.label}
              </Link>
            );
          })}

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div>
                  <p className="text-sm font-bold text-white">{user?.fullName}</p>
                  <p className="text-xs text-indigo-400 uppercase font-semibold">{user?.role}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300"
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
                  className="text-center py-2.5 text-sm font-semibold border border-slate-700 rounded-xl text-slate-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl shadow-md"
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
