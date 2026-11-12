import { prisma } from "../../lib/prisma";

// Summary numbers for the admin dashboard.
const getStats = async () => {
  const [
    totalUsers,
    totalStudents,
    totalClubs,
    totalEvents,
    eventsByStatus,
    totalRegistrations,
    totalCertificates,
    sponsorship,
    feedback,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.club.count(),
    prisma.event.count(),
    prisma.event.groupBy({ by: ["status"], _count: true }),
    prisma.registration.count(),
    prisma.certificate.count(),
    prisma.eventSponsor.aggregate({ _sum: { amountFunded: true } }),
    prisma.feedback.aggregate({ _avg: { rating: true }, _count: true }),
  ]);

  return {
    totalUsers,
    totalStudents,
    totalClubs,
    totalEvents,
    eventsByStatus: Object.fromEntries(eventsByStatus.map((e) => [e.status, e._count])),
    totalRegistrations,
    totalCertificates,
    totalSponsorship: Number(sponsorship._sum.amountFunded ?? 0),
    totalFeedbacks: feedback._count,
    averageRating: feedback._avg.rating ? Number(feedback._avg.rating.toFixed(2)) : null,
  };
};

export const dashboardServices = { getStats };
