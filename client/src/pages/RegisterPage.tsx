import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Department } from '../types';
import { apiDepartments } from '../services/api';
import { UserPlus, Building2, Lock, Mail, User, Hash } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState({
    studentId: '',
    fullName: '',
    email: '',
    password: '',
    departmentId: '',
  });

  useEffect(() => {
    apiDepartments.getAll().then(setDepartments);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({
        studentId: form.studentId,
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        departmentId: form.departmentId ? Number(form.departmentId) : undefined,
      });
      navigate('/login');
    } catch {
      // handled
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-8 bg-[var(--bg)] text-[var(--text)]">
      <div className="w-full max-w-[400px] bg-[var(--surface)] rounded-[6px] p-6 border border-[var(--border)] space-y-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--primary)] font-semibold">
            Student Enrollment
          </span>
          <h2 className="font-heading font-semibold text-xl text-[var(--text)] mt-0.5">{t('Student Sign Up')}</h2>
          <p className="text-xs text-[var(--muted)]">
            {t('Register your International Islamic University Chittagong profile to get event passes and certificates.')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1">
              {t('IIUC Student ID *')}
            </label>
            <div className="relative">
              <Hash className="w-3.5 h-3.5 text-[var(--muted)] absolute left-2.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
              <input
                type="text"
                required
                placeholder="e.g. C221001 or CSE-2201"
                value={form.studentId}
                onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                className="w-full pl-8 pr-3 py-1.5 text-xs text-[var(--text)] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1">
              {t('Full Name *')}
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-[var(--muted)] absolute left-2.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
              <input
                type="text"
                required
                placeholder="e.g. Alice Rahman"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full pl-8 pr-3 py-1.5 text-xs text-[var(--text)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1">
              {t('IIUC Institutional Email *')}
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-[var(--muted)] absolute left-2.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
              <input
                type="email"
                required
                placeholder="student@iiuc.ac.bd"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-8 pr-3 py-1.5 text-xs text-[var(--text)] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1">
              {t('Academic Department')}
            </label>
            <div className="relative">
              <Building2 className="w-3.5 h-3.5 text-[var(--muted)] absolute left-2.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
              <select
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                className="w-full pl-8 pr-3 py-1.5 text-xs text-[var(--text)]"
              >
                <option value="">{t('Select Department (Optional)')}</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.departmentName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1">
              {t('Password *')}
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-[var(--muted)] absolute left-2.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
              <input
                type="password"
                required
                placeholder="Min 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-8 pr-3 py-1.5 text-xs text-[var(--text)] font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full text-xs py-2 mt-2 disabled:opacity-60"
          >
            {isLoading ? t('Creating Account...', 'Creating Account...') : t('Create Account')}
          </button>
        </form>

        <p className="text-center text-xs text-[var(--muted)] pt-2 border-t border-[var(--border)]">
          {t('Already registered?')}{' '}
          <Link to="/login" className="text-[var(--primary)] font-medium hover:underline">
            {t('Login here')}
          </Link>
        </p>
      </div>
    </div>
  );
};
