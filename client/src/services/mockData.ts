import { Club, Department, EventItem, Venue, ClubRanking, DashboardStats, Registration, Sponsor } from '../types';

export const mockDepartments: Department[] = [
  { id: 1, departmentName: "Computer Science & Engineering" },
  { id: 2, departmentName: "Electrical & Electronic Engineering" },
  { id: 3, departmentName: "Business Administration" },
  { id: 4, departmentName: "Mechanical Engineering" },
];

export const mockVenues: Venue[] = [
  { id: 1, venueName: "Main Auditorium", location: "Academic Building A, Ground Floor", capacity: 500 },
  { id: 2, venueName: "CSE Lab 3", location: "Academic Building B, 4th Floor", capacity: 60 },
  { id: 3, venueName: "Seminar Hall 2", location: "Central Library, 2nd Floor", capacity: 120 },
  { id: 4, venueName: "Open Air Amphitheatre", location: "Campus Green", capacity: 1000 },
];

export const mockClubs: Club[] = [
  {
    id: 1,
    clubName: "CSE Programming Club",
    description: "Hub for competitive programming, algorithm workshops, hackathons, and software engineering talks.",
    establishedYear: 2015,
    departmentId: 1,
    department: { id: 1, departmentName: "Computer Science & Engineering" },
    _count: { events: 14 }
  },
  {
    id: 2,
    clubName: "Robotics & Automation Club",
    description: "Designing autonomous rovers, IoT devices, drone prototyping, and national robotics competitions.",
    establishedYear: 2018,
    departmentId: 2,
    department: { id: 2, departmentName: "Electrical & Electronic Engineering" },
    _count: { events: 9 }
  },
  {
    id: 3,
    clubName: "AI & Data Science Society",
    description: "Deep learning masterclasses, generative AI hackathons, research reading groups, and industry collaborations.",
    establishedYear: 2021,
    departmentId: 1,
    department: { id: 1, departmentName: "Computer Science & Engineering" },
    _count: { events: 11 }
  },
  {
    id: 4,
    clubName: "Entrepreneurship & Leadership Club",
    description: "Fostering startup founders, angel pitch nights, leadership symposiums, and venture building workshops.",
    establishedYear: 2016,
    departmentId: 3,
    department: { id: 3, departmentName: "Business Administration" },
    _count: { events: 8 }
  }
];

export const mockSponsors: Sponsor[] = [
  { id: 1, companyName: "TechCorp Ltd.", contactEmail: "partners@techcorp.example", websiteUrl: "https://techcorp.example" },
  { id: 2, companyName: "CloudNine Solutions", contactEmail: "hello@cloudnine.example", websiteUrl: "https://cloudnine.example" },
  { id: 3, companyName: "Vertex Global Ventures", contactEmail: "contact@vertex.example", websiteUrl: "https://vertex.example" },
];

export const mockEvents: EventItem[] = [
  {
    id: 1,
    clubId: 1,
    venueId: 1,
    title: "National Collegiate Hackathon 2026",
    description: "36-hour sprint building real-world solutions in AI, FinTech, and Smart Campus with prizes up to $10,000.",
    eventType: "HACKATHON",
    startTime: "2026-11-20T09:00:00.000Z",
    endTime: "2026-11-21T21:00:00.000Z",
    status: "APPROVED",
    createdById: 1,
    createdAt: "2026-11-01T10:00:00.000Z",
    club: mockClubs[0],
    venue: mockVenues[0],
    _count: { registrations: 148, feedbacks: 0 },
    averageRating: null,
    sponsors: [
      { id: 1, eventId: 1, sponsorId: 1, amountFunded: "60000", sponsorshipTier: "TITLE", sponsor: mockSponsors[0] },
      { id: 2, eventId: 1, sponsorId: 2, amountFunded: "25000", sponsorshipTier: "PLATINUM", sponsor: mockSponsors[1] }
    ]
  },
  {
    id: 2,
    clubId: 1,
    venueId: 2,
    title: "Mastering Distributed Systems & Microservices",
    description: "Deep dive into gRPC, event sourcing, Kafka streams, and high-throughput backend design with industry veterans.",
    eventType: "WORKSHOP",
    startTime: "2026-11-25T14:00:00.000Z",
    endTime: "2026-11-25T18:00:00.000Z",
    status: "APPROVED",
    createdById: 1,
    createdAt: "2026-11-05T12:00:00.000Z",
    club: mockClubs[0],
    venue: mockVenues[1],
    workshop: {
      id: 1,
      eventId: 2,
      speakerName: "Dr. Tariqul Islam",
      speakerBio: "Principal Architect at ScaledCloud, ex-Google SRE with 15+ years of distributed backend experience.",
      prerequisites: "Familiarity with Docker, basic REST APIs, and an active GitHub account."
    },
    _count: { registrations: 54, feedbacks: 0 },
    averageRating: null
  },
  {
    id: 3,
    clubId: 2,
    venueId: 3,
    title: "Autonomous Robotics & ROS2 Hands-on Lab",
    description: "Learn Robot Operating System 2 (ROS2), LiDAR-based SLAM mapping, and sensor fusion on real ground robots.",
    eventType: "WORKSHOP",
    startTime: "2026-11-28T10:00:00.000Z",
    endTime: "2026-11-28T16:00:00.000Z",
    status: "APPROVED",
    createdById: 1,
    createdAt: "2026-11-08T09:00:00.000Z",
    club: mockClubs[1],
    venue: mockVenues[2],
    workshop: {
      id: 2,
      eventId: 3,
      speakerName: "Engr. Samira Khan",
      speakerBio: "Lead Roboticist at RoboSense Innovations, published IEEE robotics researcher.",
      prerequisites: "Bring your laptop with Ubuntu/WSL2 and Python 3.10+ installed."
    },
    _count: { registrations: 42, feedbacks: 0 },
    averageRating: null,
    sponsors: [
      { id: 3, eventId: 3, sponsorId: 3, amountFunded: "20000", sponsorshipTier: "GOLD", sponsor: mockSponsors[2] }
    ]
  },
  {
    id: 4,
    clubId: 3,
    venueId: 1,
    title: "AI Agents & Multimodal LLMs Symposium",
    description: "Keynotes and live coding on autonomous agent architectures, function calling, tool use, and multimodal RAG.",
    eventType: "SEMINAR",
    startTime: "2026-12-05T13:00:00.000Z",
    endTime: "2026-12-05T18:00:00.000Z",
    status: "APPROVED",
    createdById: 1,
    createdAt: "2026-11-10T11:00:00.000Z",
    club: mockClubs[2],
    venue: mockVenues[0],
    _count: { registrations: 195, feedbacks: 0 },
    averageRating: null
  },
  {
    id: 5,
    clubId: 4,
    venueId: 4,
    title: "Campus Venture Pitch & Founder Match",
    description: "Students pitch their tech startups to venture capitalists, angel syndicates, and student co-founders.",
    eventType: "COMPETITION",
    startTime: "2026-12-10T15:00:00.000Z",
    endTime: "2026-12-10T20:00:00.000Z",
    status: "APPROVED",
    createdById: 1,
    createdAt: "2026-11-12T14:00:00.000Z",
    club: mockClubs[3],
    venue: mockVenues[3],
    _count: { registrations: 88, feedbacks: 0 },
    averageRating: null
  },
  {
    id: 6,
    clubId: 1,
    venueId: 1,
    title: "Intro to Modern Web & Cloud Deployment",
    description: "Comprehensive introductory workshop for freshmen covering modern TypeScript, Tailwind CSS, and cloud hosting.",
    eventType: "WORKSHOP",
    startTime: "2026-10-15T10:00:00.000Z",
    endTime: "2026-10-15T14:00:00.000Z",
    status: "COMPLETED",
    createdById: 1,
    createdAt: "2026-10-01T09:00:00.000Z",
    club: mockClubs[0],
    venue: mockVenues[0],
    workshop: {
      id: 3,
      eventId: 6,
      speakerName: "Alex Vance",
      speakerBio: "Senior Frontend Engineer and community educator.",
      prerequisites: "Web browser and text editor (VS Code recommended)."
    },
    _count: { registrations: 96, feedbacks: 42 },
    averageRating: 4.8,
    sponsors: [
      { id: 4, eventId: 6, sponsorId: 1, amountFunded: "35000", sponsorshipTier: "TITLE", sponsor: mockSponsors[0] }
    ]
  }
];

export const mockRankings: ClubRanking[] = [
  {
    id: 1,
    clubId: 1,
    year: 2026,
    totalEventsScore: "100.00",
    sponsorshipScore: "95.50",
    feedbackScore: "96.00",
    finalScore: "97.22",
    rankPosition: 1,
    clubName: "CSE Programming Club",
    club: mockClubs[0],
    metrics: { completedEvents: 14, totalSponsorship: 120000, averageRating: 4.8 }
  },
  {
    id: 2,
    clubId: 3,
    year: 2026,
    totalEventsScore: "85.00",
    sponsorshipScore: "90.00",
    feedbackScore: "92.00",
    finalScore: "88.85",
    rankPosition: 2,
    clubName: "AI & Data Science Society",
    club: mockClubs[2],
    metrics: { completedEvents: 11, totalSponsorship: 85000, averageRating: 4.6 }
  },
  {
    id: 3,
    clubId: 2,
    year: 2026,
    totalEventsScore: "75.00",
    sponsorshipScore: "70.00",
    feedbackScore: "88.00",
    finalScore: "77.15",
    rankPosition: 3,
    clubName: "Robotics & Automation Club",
    club: mockClubs[1],
    metrics: { completedEvents: 9, totalSponsorship: 55000, averageRating: 4.4 }
  },
  {
    id: 4,
    clubId: 4,
    year: 2026,
    totalEventsScore: "65.00",
    sponsorshipScore: "80.00",
    feedbackScore: "82.00",
    finalScore: "75.35",
    rankPosition: 4,
    clubName: "Entrepreneurship & Leadership Club",
    club: mockClubs[3],
    metrics: { completedEvents: 8, totalSponsorship: 65000, averageRating: 4.1 }
  }
];

export const mockDashboardStats: DashboardStats = {
  totalUsers: 486,
  totalStudents: 472,
  totalClubs: 12,
  totalEvents: 42,
  eventsByStatus: {
    APPROVED: 18,
    COMPLETED: 19,
    PENDING: 3,
    REJECTED: 1,
    CANCELLED: 1
  },
  totalRegistrations: 1240,
  totalCertificates: 890,
  totalSponsorship: 325000,
  totalFeedbacks: 530,
  averageRating: 4.7
};

export const mockUserRegistrations: Registration[] = [
  {
    id: 101,
    eventId: 1,
    userId: 2,
    passNumber: "REG-101",
    status: "CONFIRMED",
    createdAt: "2026-11-13T10:00:00.000Z",
    event: mockEvents[0],
    certificate: null
  },
  {
    id: 84,
    eventId: 6,
    userId: 2,
    passNumber: "REG-084",
    status: "ATTENDED",
    createdAt: "2026-10-10T14:30:00.000Z",
    event: mockEvents[5],
    certificate: {
      id: 42,
      registrationId: 84,
      certificateNumber: "CERT-2026-084",
      issueDate: "2026-10-16T12:00:00.000Z"
    }
  }
];

