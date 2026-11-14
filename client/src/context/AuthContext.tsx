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
  login: (email: string, password: string) => Promise<void>;
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
        }
      } else {
        // Default to a demo student session so the user immediately gets a rich interactive experience
        const defaultStudent: User = {
          id: 2,
          studentId: 'CSE-2201',
          fullName: 'Alice Rahman',
          email: 'alice@uni.edu',
          role: 'STUDENT',
          departmentId: 1,
          department: { id: 1, departmentName: 'Computer Science & Engineering' },
        };
        setUser(defaultStudent);
        setToken('demo-student-token');
        localStorage.setItem('token', 'demo-student-token');
        localStorage.setItem('user', JSON.stringify(defaultStudent));
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiAuth.login({ email, password });
      setToken(res.accessToken);
      setUser(res.user);
      localStorage.setItem('token', res.accessToken);
      localStorage.setItem('user', JSON.stringify(res.user));
      toast.success(`Welcome back, ${res.user.fullName}!`);
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
    toast.info('Logged out successfully');
  };

  const switchDemoRole = (role: Role) => {
    if (role === 'ADMIN') {
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
    } else {
      const studentUser: User = {
        id: 2,
        studentId: 'CSE-2201',
        fullName: 'Alice Rahman',
        email: 'alice@uni.edu',
        role: 'STUDENT',
        departmentId: 1,
        department: { id: 1, departmentName: 'Computer Science & Engineering' }
      };
      setUser(studentUser);
      setToken('demo-student-token');
      localStorage.setItem('token', 'demo-student-token');
      localStorage.setItem('user', JSON.stringify(studentUser));
      toast.success('Switched to Student mode (alice@uni.edu)');
    }
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

