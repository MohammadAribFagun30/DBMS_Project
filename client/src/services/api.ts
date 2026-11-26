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

let isBackendAvailable = true;

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
  const isDemoToken = token ? token.startsWith('demo-') : false;
  const isPublicAuth = endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/register');

  // If using a demo token on a protected endpoint and backend is offline, don't send invalid bearer
  if (!isPublicAuth && !isBackendAvailable && isDemoToken) {
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

    const text = await res.text();
    let data: any = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (!res.ok) {
      throw new ApiError(data.message || `Server error (${res.status})`, res.status);
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
    return await request<{ accessToken: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData: { studentId: string; fullName: string; email: string; password: string; departmentId?: number }) => {
    return await request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getProfile: async () => {
    return await request<User>('/auth/me');
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
  getAll: async (params?: { upcoming?: boolean; status?: string; clubId?: number; venueId?: number; departmentId?: number; eventType?: string; search?: string }) => {
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
    return await request<EventItem>(`/events/${id}`);
  },

  create: async (eventData: Partial<EventItem> & { workshop?: any }) => {
    return await request<EventItem>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  updateStatus: async (id: number, status: string) => {
    return await request<EventItem>(`/events/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  delete: async (id: number) => {
    return await request<void>(`/events/${id}`, {
      method: 'DELETE',
    });
  }
};

// ----------------- Registrations Services -----------------
export const apiRegistrations = {
  register: async (eventId: number) => {
    return await request<Registration>('/registrations', {
      method: 'POST',
      body: JSON.stringify({ eventId }),
    });
  },

  getMyRegistrations: async () => {
    return await request<Registration[]>('/registrations/my');
  },

  getAll: async (params?: { eventId?: number; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.eventId) query.append('eventId', String(params.eventId));
    if (params?.status) query.append('status', params.status);
    const qStr = query.toString() ? `?${query.toString()}` : '';
    return await request<Registration[]>(`/registrations${qStr}`);
  },

  getByEvent: async (eventId: number) => {
    return await request<Registration[]>(`/registrations?eventId=${eventId}`);
  },

  markAttended: async (registrationId: number) => {
    return await request<Registration>(`/registrations/${registrationId}/attend`, {
      method: 'PATCH',
    });
  },

  cancel: async (registrationId: number) => {
    return await request<Registration>(`/registrations/${registrationId}/cancel`, {
      method: 'PATCH',
    });
  }
};

// ----------------- Certificates Services -----------------
export const apiCertificates = {
  getMyCertificates: async () => {
    return await request<Certificate[]>('/certificates/my');
  },

  verify: async (certificateNumber: string) => {
    return await request<Certificate>(`/certificates/verify/${certificateNumber}`);
  },

  issueForEvent: async (eventId: number) => {
    return await request<{ count: number }>(`/certificates/event/${eventId}`, {
      method: 'POST',
    });
  },

  generate: async (id: number) => {
    return await request<{ count: number }>(`/certificates/event/${id}`, {
      method: 'POST',
    });
  }
};

// ----------------- Feedback Services -----------------
export const apiFeedback = {
  submit: async (feedback: { eventId: number; rating: number; comments?: string }) => {
    return await request<Feedback>('/feedbacks', {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  },

  getEventSummary: async (eventId: number) => {
    return await request<{ averageRating: number; count: number; breakdown: Record<number, number> }>(`/feedbacks/event/${eventId}`);
  },

  getMy: async () => {
    try {
      return await request<number[]>('/feedbacks/my');
    } catch {
      return [];
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
    return await request<Club>(`/clubs/${id}`);
  },

  create: async (clubData: Partial<Club>) => {
    return await request<Club>('/clubs', {
      method: 'POST',
      body: JSON.stringify(clubData),
    });
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
    return await request<Venue>('/venues', { method: 'POST', body: JSON.stringify(data) });
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
    return await request<ClubRanking[]>('/rankings/generate', {
      method: 'POST',
      body: JSON.stringify({ year }),
    });
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

  create: async (data: Partial<Sponsor>) => {
    return await request<Sponsor>('/sponsors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  recordFunding: async (data: { eventId: number; sponsorId: number; amountFunded: number; sponsorshipTier: string }) => {
    return await request<any>('/event-sponsors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  linkEventSponsor: async (data: { eventId: number; sponsorId: number; amountFunded: number; sponsorshipTier: string }) => {
    return await request<any>('/event-sponsors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};

// ----------------- Notifications & System -----------------
export const apiNotifications = {
  getMy: async () => {
    return await request<{ unreadCount: number; notifications: NotificationItem[] }>('/notifications/my');
  },

  markRead: async (id: number) => {
    return await request(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  markAllRead: async () => {
    return await request('/notifications/read-all', { method: 'PATCH' });
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
    return await request<AuditLog[]>(`/audit-logs?limit=${limit}`);
  }
};
