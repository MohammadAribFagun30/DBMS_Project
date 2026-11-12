import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { EventStatus } from "../../../generated/prisma/enums";
import { AppError } from "../../utils/appError";
import { createAuditLog, notifyUser } from "../../utils/logger";

// Weights from the proposal: completed events 35%, sponsorship 35%, feedback 30%.
const WEIGHTS = { events: 0.35, sponsorship: 0.35, feedback: 0.3 };

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * 3-Factor Annual Club Ranking (normalized 0-100)
 *  eventsScore      = completedEvents / maxCompletedEvents * 100
 *  sponsorshipScore = totalSponsorship / maxTotalSponsorship * 100
 *  feedbackScore    = averageRating / 5 * 100
 *  finalScore       = 0.35*events + 0.35*sponsorship + 0.30*feedback
 */
const generate = async (adminId: number, year: number) => {
  const from = new Date(Date.UTC(year, 0, 1));
  const to = new Date(Date.UTC(year + 1, 0, 1));
  const inYear = { startTime: { gte: from, lt: to } };

  const clubs = await prisma.club.findMany({ select: { id: true, clubName: true } });
  if (!clubs.length) throw new AppError("No clubs found to rank", httpStatus.BAD_REQUEST);

  // 1. Raw numbers per club
  const raw = await Promise.all(
    clubs.map(async (club) => {
      const [completedEvents, sponsorship, feedback] = await Promise.all([
        prisma.event.count({ where: { clubId: club.id, status: EventStatus.COMPLETED, ...inYear } }),
        prisma.eventSponsor.aggregate({
          where: { event: { clubId: club.id, ...inYear } },
          _sum: { amountFunded: true },
        }),
        prisma.feedback.aggregate({
          where: { event: { clubId: club.id, ...inYear } },
          _avg: { rating: true },
        }),
      ]);
      return {
        club,
        completedEvents,
        totalSponsorship: Number(sponsorship._sum.amountFunded ?? 0),
        averageRating: feedback._avg.rating ?? 0,
      };
    })
  );

  // 2. Normalize against the best club of the year
  const maxEvents = Math.max(...raw.map((r) => r.completedEvents));
  const maxSponsorship = Math.max(...raw.map((r) => r.totalSponsorship));

  const scored = raw
    .map((r) => {
      const totalEventsScore = maxEvents ? (r.completedEvents / maxEvents) * 100 : 0;
      const sponsorshipScore = maxSponsorship ? (r.totalSponsorship / maxSponsorship) * 100 : 0;
      const feedbackScore = (r.averageRating / 5) * 100;
      const finalScore =
        totalEventsScore * WEIGHTS.events + sponsorshipScore * WEIGHTS.sponsorship + feedbackScore * WEIGHTS.feedback;
      return {
        ...r,
        totalEventsScore: round(totalEventsScore),
        sponsorshipScore: round(sponsorshipScore),
        feedbackScore: round(feedbackScore),
        finalScore: round(finalScore),
      };
    })
    .sort((a, b) => b.finalScore - a.finalScore);

  // 3. Save (re-running for the same year overwrites the old result)
  const saved = [];
  for (const [index, s] of scored.entries()) {
    const scores = {
      totalEventsScore: s.totalEventsScore,
      sponsorshipScore: s.sponsorshipScore,
      feedbackScore: s.feedbackScore,
      finalScore: s.finalScore,
      rankPosition: index + 1,
    };
    const ranking = await prisma.clubRanking.upsert({
      where: { clubId_year: { clubId: s.club.id, year } },
      create: { clubId: s.club.id, year, ...scores },
      update: scores,
    });
    saved.push({
      ...ranking,
      clubName: s.club.clubName,
      metrics: { completedEvents: s.completedEvents, totalSponsorship: s.totalSponsorship, averageRating: round(s.averageRating) },
    });
  }

  await createAuditLog(adminId, "RANKINGS_GENERATED", "club_rankings", year);

  // Notify all admins that the new ranking is available.
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  await Promise.all(admins.map((a) => notifyUser(a.id, `Annual club rankings for ${year} have been generated.`)));

  return saved;
};

const getByYear = (year: number) =>
  prisma.clubRanking.findMany({
    where: { year },
    include: { club: { select: { id: true, clubName: true, departmentId: true } } },
    orderBy: { rankPosition: "asc" },
  });

const getClubHistory = async (clubId: number) => {
  const club = await prisma.club.findUnique({ where: { id: clubId }, select: { id: true, clubName: true } });
  if (!club) throw new AppError("Club not found", httpStatus.NOT_FOUND);
  const rankings = await prisma.clubRanking.findMany({ where: { clubId }, orderBy: { year: "desc" } });
  return { club, rankings };
};

export const rankingServices = { generate, getByYear, getClubHistory };
