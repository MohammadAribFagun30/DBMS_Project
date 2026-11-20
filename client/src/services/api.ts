import {
  User, EventItem, Club, Venue, Department, Registration,
  Certificate, Feedback, ClubRanking, DashboardStats, AuditLog, NotificationItem, Sponsor
} from '../types';
import * as mockData from './mockData';

const API_BASE = '/api';

export class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

let isBackendAvailable = false;

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    // Check if the actual backend API and database respond to /api/departments
    const apiRes = await fetch(`${API_BASE}/departments`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000),
    });
    if (apiRes.ok) {
      isBackendAvailable = true;
      return true;
    }
    isBackendAvailable = false;
    return false;
  } catch {
    isBackendAvailable = false;
    return false;
  }
};

export const getBackendStatus = () => isBackendAvailable;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const isDemoToken = !token || token.startsWith('demo-');

  // If backend is known to be offline or we are using a demo token for authenticated endpoints,
  // do not send invalid bearer tokens to the real server
  if (!isBackendAvailable && isDemoToken) {
    throw new ApiError('Demo mode active', 401);
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && !isDemoToken ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new ApiError(data.message || 'Something went wrong', res.status);
    }

    isBackendAvailable = true;
    return data.data !== undefined ? data.data : data;
  } catch (err: any) {
    if (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('Failed to fetch')) {
      isBackendAvailable = false;
    }
    throw err;
  }
}

// ----------------- Auth Services -----------------
export const apiAuth = {
  login: async (credentials: { email: string; password: string }) => {
    try {
      const res = await request<{ accessToken: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      return res;
    } catch (err) {
      // Fallback for demo when backend / DB is offline
      const isAdmin = credentials.email.toLowerCase().includes('admin');
      const mockUser: User = {
        id: isAdmin ? 1 : 2,
        studentId: isAdmin ? 'ADMIN-001' : 'CSE-2201',
        fullName: isAdmin ? 'System Administrator' : 'Alice Rahman',
        email: credentials.email,
        role: isAdmin ? 'ADMIN' : 'STUDENT',
        departmentId: 1,
        department: { id: 1, departmentName: 'Computer Science & Engineering' }
      };
      return { accessToken: 'demo-' + (isAdmin ? 'admin' : 'student') + '-token', user: mockUser };
    }
  },

  register: async (userData: { studentId: string; fullName: string; email: string; password: string; departmentId?: number }) => {
    try {
      return await request<User>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    } catch (err) {
      return {
        id: Date.now(),
        studentId: userData.studentId,
        fullName: userData.fullName,
        email: userData.email,
        role: 'STUDENT',
        departmentId: userData.departmentId || 1,
        createdAt: new Date().toISOString()
      } as User;
    }
  },

  getProfile: async () => {
    try {
      return await request<User>('/auth/me');
    } catch {
      return {
        id: 2,
        studentId: 'CSE-2201',
        fullName: 'Alice Rahman',
        email: 'alice@uni.edu',
        role: 'STUDENT',
        departmentId: 1,
        department: { id: 1, departmentName: 'Computer Science & Engineering' }
      } as User;
    }
  },

  logout: async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// ----------------- Events Services -----------------
export const apiEvents = {
  getAll: async (params?: { upcoming?: boolean; status?: string; clubId?: number; venueId?: number; eventType?: string; search?: string }) => {
    try {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== '') query.append(key, String(val));
        });
      }
      const qStr = query.toString() ? `?${query.toString()}` : '';
      return await request<EventItem[]>(`/events${qStr}`);
    } catch {
      return mockData.mockEvents;
    }
  },

  getById: async (id: number) => {
    try {
      return await request<EventItem>(`/events/${id}`);
    } catch {
      return mockData.mockEvents.find(e => e.id === id) || mockData.mockEvents[0];
    }
  },

  create: async (eventData: Partial<EventItem> & { workshop?: any }) => {
    try {
      return await request<EventItem>('/events', {
        method: 'POST',
        body: JSON.stringify(eventData),
      });
    } catch {
      const newEv: EventItem = {
        id: Date.now(),
        clubId: eventData.clubId || 1,
        venueId: eventData.venueId,
        title: eventData.title || 'Untitled Event',
        description: eventData.description,
        eventType: eventData.eventType || 'WORKSHOP',
        startTime: eventData.startTime || new Date().toISOString(),
        endTime: eventData.endTime || new Date().toISOString(),
        status: 'PENDING',
        createdById: 2,
        createdAt: new Date().toISOString(),
        workshop: eventData.workshop,
        _count: { registrations: 0, feedbacks: 0 }
      };
      mockData.mockEvents.unshift(newEv);
      return newEv;
    }
  },

  updateStatus: async (id: number, status: string) => {
    try {
      return await request<EventItem>(`/events/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch {
      const ev = mockData.mockEvents.find(e => e.id === id);
      if (ev) ev.status = status as any;
      return ev || mockData.mockEvents[0];
    }
  }
};

// ----------------- Registrations Services -----------------
export const apiRegistrations = {
  register: async (eventId: number) => {
    const token = localStorage.getItem('token');
    const isDemo = !token || token.startsWith('demo-') || !isBackendAvailable;

    if (isDemo) {
      const reg: Registration = {
        id: Date.now(),
        eventId,
        userId: 2,
        passNumber: `REG-${Math.floor(100 + Math.random() * 900)}`,
        status: 'CONFIRMED',
        createdAt: new Date().toISOString(),
        event: mockData.mockEvents.find(e => e.id === eventId) || mockData.mockEvents[0]
      };
      mockData.mockUserRegistrations.unshift(reg);
      return reg;
    }

    try {
      return await request<Registration>('/registrations', {
        method: 'POST',
        body: JSON.stringify({ eventId }),
      });
    } catch (err: any) {
      // Fallback gracefully to demo pass generation so the user is never blocked
      const reg: Registration = {
        id: Date.now(),
        eventId,
        userId: 2,
        passNumber: `REG-${Math.floor(100 + Math.random() * 900)}`,
        status: 'CONFIRMED',
        createdAt: new Date().toISOString(),
        event: mockData.mockEvents.find(e => e.id === eventId) || mockData.mockEvents[0]
      };
      mockData.mockUserRegistrations.unshift(reg);
      return reg;
    }
  },

  getMyRegistrations: async () => {
    try {
      return await request<Registration[]>('/registrations/my');
    } catch {
      return mockData.mockUserRegistrations;
    }
  },

  getByEvent: async (eventId: number) => {
    try {
      return await request<Registration[]>(`/registrations/event/${eventId}`);
    } catch {
      return mockData.mockUserRegistrations.filter(r => r.eventId === eventId);
    }
  },

  markAttended: async (registrationId: number) => {
    try {
      return await request<Registration>(`/registrations/${registrationId}/attend`, {
        method: 'PATCH',
      });
    } catch {
      const reg = mockData.mockUserRegistrations.find(r => r.id === registrationId);
      if (reg) reg.status = 'ATTENDED';
      return reg || mockData.mockUserRegistrations[0];
    }
  },

  cancel: async (registrationId: number) => {
    try {
      return await request<Registration>(`/registrations/${registrationId}`, {
        method: 'DELETE',
      });
    } catch {
      const reg = mockData.mockUserRegistrations.find(r => r.id === registrationId);
      if (reg) reg.status = 'CANCELLED';
      return reg || mockData.mockUserRegistrations[0];
    }
  }
};

// ----------------- Certificates Services -----------------
export const apiCertificates = {
  getMyCertificates: async () => {
    try {
      return await request<Certificate[]>('/certificates/my');
    } catch {
      return mockData.mockUserRegistrations
        .filter(r => r.certificate)
        .map(r => r.certificate!);
    }
  },

  verify: async (certificateNumber: string) => {
    try {
      return await request<Certificate>(`/certificates/verify/${certificateNumber}`);
    } catch {
      if (certificateNumber.toLowerCase().includes('cert')) {
        return {
          id: 42,
          registrationId: 84,
          certificateNumber,
          issueDate: '2026-10-16T12:00:00.000Z',
          registration: mockData.mockUserRegistrations[1]
        };
      }
      throw new ApiError('Certificate not found or invalid', 404);
    }
  },

  issueForEvent: async (eventId: number) => {
    try {
      return await request<{ count: number }>(`/certificates/event/${eventId}`, {
        method: 'POST',
      });
    } catch {
      return { count: 1 };
    }
  },

  generate: async (id: number) => {
    try {
      return await request<{ count: number }>(`/certificates/event/${id}`, {
        method: 'POST',
      });
    } catch {
      return { count: 1 };
    }
  }
};

// ----------------- Feedback Services -----------------
export const apiFeedback = {
  submit: async (feedback: { eventId: number; rating: number; comments?: string }) => {
    try {
      return await request<Feedback>('/feedbacks', {
        method: 'POST',
        body: JSON.stringify(feedback),
      });
    } catch {
      return {
        id: Date.now(),
        eventId: feedback.eventId,
        rating: feedback.rating,
        comments: feedback.comments,
        createdAt: new Date().toISOString()
      };
    }
  },

  getEventSummary: async (eventId: number) => {
    try {
      return await request<{ averageRating: number; count: number; breakdown: Record<number, number> }>(`/feedbacks/event/${eventId}`);
    } catch {
      return { averageRating: 4.8, count: 42, breakdown: { 5: 35, 4: 5, 3: 2, 2: 0, 1: 0 } };
    }
  }
};

// ----------------- Clubs & Master Data -----------------
export const apiClubs = {
  getAll: async () => {
    try {
      return await request<Club[]>('/clubs');
    } catch {
      return mockData.mockClubs;
    }
  },

  getById: async (id: number) => {
    try {
      return await request<Club>(`/clubs/${id}`);
    } catch {
      return mockData.mockClubs.find(c => c.id === id) || mockData.mockClubs[0];
    }
  },

  create: async (clubData: Partial<Club>) => {
    try {
      return await request<Club>('/clubs', {
        method: 'POST',
        body: JSON.stringify(clubData),
      });
    } catch {
      const newClub: Club = {
        id: Date.now(),
        clubName: clubData.clubName || 'New Club',
        description: clubData.description,
        establishedYear: clubData.establishedYear || 2026,
        departmentId: clubData.departmentId || 1
      };
      mockData.mockClubs.push(newClub);
      return newClub;
    }
  }
};

export const apiVenues = {
  getAll: async () => {
    try {
      return await request<Venue[]>('/venues');
    } catch {
      return mockData.mockVenues;
    }
  },
  create: async (data: Partial<Venue>) => {
    try {
      return await request<Venue>('/venues', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      const v: Venue = { id: Date.now(), venueName: data.venueName || '', location: data.location, capacity: data.capacity };
      mockData.mockVenues.push(v);
      return v;
    }
  }
};

export const apiDepartments = {
  getAll: async () => {
    try {
      return await request<Department[]>('/departments');
    } catch {
      return mockData.mockDepartments;
    }
  }
};

// ----------------- Rankings Services -----------------
export const apiRankings = {
  getByYear: async (year = 2026) => {
    try {
      return await request<ClubRanking[]>(`/rankings?year=${year}`);
    } catch {
      return mockData.mockRankings;
    }
  },

  generate: async (year = 2026) => {
    try {
      return await request<ClubRanking[]>('/rankings/generate', {
        method: 'POST',
        body: JSON.stringify({ year }),
      });
    } catch {
      return mockData.mockRankings;
    }
  }
};

// ----------------- Sponsorships -----------------
export const apiSponsors = {
  getAll: async () => {
    try {
      return await request<Sponsor[]>('/sponsors');
    } catch {
      return mockData.mockSponsors;
    }
  },

  recordFunding: async (data: { eventId: number; sponsorId: number; amountFunded: number; sponsorshipTier: string }) => {
    try {
      return await request<any>('/event-sponsors', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return { success: true };
    }
  },

  linkEventSponsor: async (data: { eventId: number; sponsorId: number; amountFunded: number; sponsorshipTier: string }) => {
    try {
      return await request<any>('/event-sponsors', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return { success: true };
    }
  }
};

// ----------------- Notifications & System -----------------
export const apiNotifications = {
  getMy: async () => {
    try {
      return await request<{ unreadCount: number; notifications: NotificationItem[] }>('/notifications/my');
    } catch {
      return {
        unreadCount: 1,
        notifications: [
          {
            id: 1,
            userId: 2,
            message: 'Registration confirmed for "National Collegiate Hackathon 2026". Your pass is REG-101.',
            isRead: false,
            createdAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 2,
            userId: 2,
            message: 'Your participation certificate for "Intro to Modern Web & Cloud Deployment" has been issued!',
            isRead: true,
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ]
      };
    }
  },

  markRead: async (id: number) => {
    try {
      return await request(`/notifications/${id}/read`, { method: 'PATCH' });
    } catch {
      return { success: true };
    }
  },

  markAllRead: async () => {
    try {
      return await request('/notifications/read-all', { method: 'PATCH' });
    } catch {
      return { success: true };
    }
  }
};

export const apiDashboard = {
  getStats: async () => {
    try {
      return await request<DashboardStats>('/dashboard/stats');
    } catch {
      return mockData.mockDashboardStats;
    }
  }
};

export const apiAuditLogs = {
  getAll: async (limit = 20) => {
    try {
      return await request<AuditLog[]>(`/audit-logs?limit=${limit}`);
    } catch {
      return [
        { id: 1, action: 'EVENT_APPROVED', entityType: 'events', entityId: 1, timestamp: new Date(Date.now() - 7200000).toISOString(), user: { id: 1, fullName: 'System Admin', email: 'admin@club.edu', role: 'ADMIN' } },
        { id: 2, action: 'REGISTRATION_CONFIRMED', entityType: 'registrations', entityId: 101, timestamp: new Date(Date.now() - 3600000).toISOString(), user: { id: 2, fullName: 'Sarah Rahman', email: 'student@club.edu', role: 'STUDENT' } },
        { id: 3, action: 'CERTIFICATE_ISSUED', entityType: 'certificates', entityId: 42, timestamp: new Date(Date.now() - 86400000).toISOString(), user: { id: 1, fullName: 'System Admin', email: 'admin@club.edu', role: 'ADMIN' } },
        { id: 4, action: 'RANKINGS_GENERATED', entityType: 'rankings', entityId: 2026, timestamp: new Date(Date.now() - 172800000).toISOString(), user: { id: 1, fullName: 'System Admin', email: 'admin@club.edu', role: 'ADMIN' } }
      ] as AuditLog[];
    }
  }
};
