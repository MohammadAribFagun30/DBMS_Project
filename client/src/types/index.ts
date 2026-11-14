export type Role = 'STUDENT' | 'ADMIN';

export type EventStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';

export type RegistrationStatus = 'CONFIRMED' | 'ATTENDED' | 'CANCELLED';

export type SponsorshipTier = 'TITLE' | 'PLATINUM' | 'GOLD' | 'SILVER';

export interface User {
  id: number;
  studentId: string;
  fullName: string;
  email: string;
  role: Role;
  departmentId?: number | null;
  createdAt?: string;
  department?: Department | null;
}

export interface Department {
  id: number;
  departmentName: string;
  createdAt?: string;
}

export interface Venue {
  id: number;
  venueName: string;
  location?: string | null;
  capacity?: number | null;
}

export interface Club {
  id: number;
  clubName: string;
  description?: string | null;
  establishedYear?: number | null;
  departmentId?: number | null;
  department?: Department | null;
  _count?: {
    events?: number;
  };
}

export interface Workshop {
  id?: number;
  eventId?: number;
  speakerName: string;
  speakerBio?: string | null;
  prerequisites?: string | null;
}

export interface Sponsor {
  id: number;
  companyName: string;
  contactEmail?: string | null;
  websiteUrl?: string | null;
}

export interface EventSponsor {
  id: number;
  eventId: number;
  sponsorId: number;
  amountFunded: string | number;
  sponsorshipTier: SponsorshipTier;
  sponsor?: Sponsor;
}

export interface EventItem {
  id: number;
  clubId: number;
  venueId?: number | null;
  title: string;
  description?: string | null;
  eventType?: string | null;
  startTime: string;
  endTime: string;
  status: EventStatus;
  createdById: number;
  createdAt: string;
  club?: Club;
  venue?: Venue | null;
  workshop?: Workshop | null;
  sponsors?: EventSponsor[];
  _count?: {
    registrations?: number;
    feedbacks?: number;
  };
  averageRating?: number | null;
}

export interface Registration {
  id: number;
  eventId: number;
  userId: number;
  passNumber: string;
  status: RegistrationStatus;
  createdAt: string;
  event?: EventItem;
  user?: User;
  certificate?: Certificate | null;
}

export interface Certificate {
  id: number;
  registrationId: number;
  certificateNumber: string;
  issueDate: string;
  registration?: Registration;
}

export interface Feedback {
  id: number;
  eventId: number;
  rating: number;
  comments?: string | null;
  createdAt: string;
  event?: {
    id: number;
    title: string;
  };
}

export interface ClubRanking {
  id: number;
  clubId: number;
  year: number;
  totalEventsScore: string | number;
  sponsorshipScore: string | number;
  feedbackScore: string | number;
  finalScore: string | number;
  rankPosition: number;
  clubName?: string;
  club?: Club;
  metrics?: {
    completedEvents: number;
    totalSponsorship: number;
    averageRating: number | null;
  };
}

export interface NotificationItem {
  id: number;
  userId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  userId?: number | null;
  action: string;
  entityType?: string | null;
  entityId?: number | null;
  timestamp: string;
  user?: {
    id: number;
    fullName: string;
    email: string;
    role: Role;
  } | null;
}

export interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalClubs: number;
  totalEvents: number;
  eventsByStatus: Record<string, number>;
  totalRegistrations: number;
  totalCertificates: number;
  totalSponsorship: number;
  totalFeedbacks: number;
  averageRating: number;
}

