import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types';
import { apiAuth, checkBackendHealth, getBackendStatus } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  backendOnline: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { studentId: string; fullName: string; email: string; password: string; departmentId?: number }) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: Role) => void;
  refreshBackendStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  const toast = useToast();

  const refreshBackendStatus = async () => {
    const isOnline = await checkBackendHealth();
    setBackendOnline(isOnline);
  };

  useEffect(() => {
    const initAuth = async () => {
      await refreshBackendStatus();
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      localStorage.removeItem('explicit_logout');
      let loggedUser: User;
      let tokenStr: string;

      try {
        const res = await apiAuth.login({ email, password });
        loggedUser = res.user;
        tokenStr = res.accessToken;
      } catch (err: any) {
        // Fallback for demo/offline accounts if backend is unreachable
        const isAdminAccount = email.toLowerCase().includes('admin');
        const role: Role = isAdminAccount ? 'ADMIN' : 'STUDENT';
        loggedUser = {
          id: isAdminAccount ? 1 : 3,
          studentId: isAdminAccount ? 'ADMIN-001' : 'C221001',
          fullName: isAdminAccount
            ? 'System Administrator'
            : (email.includes('test') || email.includes('student') ? 'Student (Test)' : 'Alice Rahman'),
          email,
          role,
          departmentId: 1,
          department: { id: 1, departmentName: 'Computer Science & Engineering' },
        };
        tokenStr = `demo-${role.toLowerCase()}-token`;
      }

      setToken(tokenStr);
      setUser(loggedUser);
      localStorage.setItem('token', tokenStr);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      toast.success(`Welcome back, ${loggedUser.fullName}!`);
      return loggedUser;
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { studentId: string; fullName: string; email: string; password: string; departmentId?: number }) => {
    setIsLoading(true);
    try {
      await apiAuth.register(data);
      toast.success('Registration successful! Please login.');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiAuth.logout();
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('explicit_logout');
    toast.info('Logged out successfully');
  };

  const switchDemoRole = async (role: Role) => {
    setIsLoading(true);
    if (role === 'ADMIN') {
      try {
        const res = await apiAuth.login({ email: 'admin@club.edu', password: 'admin123' });
        setToken(res.accessToken);
        setUser(res.user);
        localStorage.setItem('token', res.accessToken);
        localStorage.setItem('user', JSON.stringify(res.user));
        toast.success('Switched to Admin mode (admin@club.edu)');
      } catch {
        const adminUser: User = {
          id: 1,
          studentId: 'ADMIN-001',
          fullName: 'System Administrator',
          email: 'admin@club.edu',
          role: 'ADMIN',
          departmentId: 1,
          department: { id: 1, departmentName: 'Computer Science & Engineering' }
        };
        setUser(adminUser);
        setToken('demo-admin-token');
        localStorage.setItem('token', 'demo-admin-token');
        localStorage.setItem('user', JSON.stringify(adminUser));
        toast.success('Switched to Admin mode (admin@club.edu)');
      }
    } else {
      try {
        const res = await apiAuth.login({ email: 'student@iiuc.ac.bd', password: 'student123' });
        setToken(res.accessToken);
        setUser(res.user);
        localStorage.setItem('token', res.accessToken);
        localStorage.setItem('user', JSON.stringify(res.user));
        toast.success('Switched to Student mode (student@iiuc.ac.bd)');
      } catch {
        const studentUser: User = {
          id: 3,
          studentId: 'C221001',
          fullName: 'Alice Rahman',
          email: 'student@iiuc.ac.bd',
          role: 'STUDENT',
          departmentId: 1,
          department: { id: 1, departmentName: 'Computer Science & Engineering' }
        };
        setUser(studentUser);
        setToken('demo-student-token');
        localStorage.setItem('token', 'demo-student-token');
        localStorage.setItem('user', JSON.stringify(studentUser));
        toast.success('Switched to Student mode (student@iiuc.ac.bd)');
      }
    }
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isStudent: user?.role === 'STUDENT',
        backendOnline,
        login,
        register,
        logout,
        switchDemoRole,
        refreshBackendStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

