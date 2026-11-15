import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogIn, ArrowRight, ShieldCheck, User, Lock, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch {
      // handled in context
    }
  };

  const fillCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 bg-slate-900/85 backdrop-blur-xl rounded-3xl max-w-md w-full p-8 shadow-2xl shadow-slate-950/70 border border-slate-800 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Welcome Back</h2>
          <p className="text-xs text-slate-400">
            Sign in to access IIUC event passes, certificates, and club hubs.
          </p>
        </div>

        {/* 1-Click Demo Fill Buttons */}
        <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs">
          <span className="font-bold text-slate-400 block uppercase tracking-wider text-[10px]">
            Quick Demo 1-Click Login:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('student@iiuc.ac.bd', 'student123')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-700/80 font-semibold text-slate-200 hover:border-indigo-400 hover:text-indigo-300 shadow-sm transition-colors text-xs"
            >
              <User className="w-3.5 h-3.5 text-indigo-400" />
              Student (Alice)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin@club.edu', 'admin123')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-700/80 font-semibold text-slate-200 hover:border-indigo-400 hover:text-indigo-300 shadow-sm transition-colors text-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              Admin Account
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="e.g. student@iiuc.ac.bd"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              'Authenticating...'
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In to ClubVerse
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          New to IIUC Campus Portal?{' '}
          <Link to="/register" className="font-bold text-indigo-400 hover:text-indigo-300">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
