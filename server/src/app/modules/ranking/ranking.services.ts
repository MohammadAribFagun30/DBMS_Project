import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { EventStatus } from "../../../generated/prisma/enums";
import { AppError } from "../../utils/appError";
import { createAuditLog } from "../../utils/logger";

// Weights from the proposal: Participants/Events 35%, Sponsorship 35%, Feedback 30%.
const WEIGHTS = { events: 0.35, sponsorship: 0.35, feedback: 0.3 };

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * Automatically computes 3-Factor Club Rankings based on:
 * 1. Participants & Events (35%)
 * 2. Sponsorship Funds (35%)
 * 3. Student Feedback (30%)
 */
const autoRecalculateRankings = async (year: number) => {
  try {
    const from = new Date(Date.UTC(year, 0, 1));
    const to = new Date(Date.UTC(year + 1, 0, 1));
    const inYear = { startTime: { gte: from, lt: to } };

    const clubs = await prisma.club.findMany({ select: { id: true, clubName: true } });
    if (!clubs.length) return [];

    // 1. Raw numbers per club: participants (registrations) + completed events, sponsorship funds, feedback ratings
    const raw = await Promise.all(
      clubs.map(async (club) => {
        const [eventsCount, participantsCount, sponsorship, feedback] = await Promise.all([
          prisma.event.count({ where: { clubId: club.id, status: EventStatus.COMPLETED, ...inYear } }),
          prisma.registration.count({ where: { event: { clubId: club.id, ...inYear } } }),
          prisma.eventSponsor.aggregate({
            where: { event: { clubId: club.id, ...inYear } },
            _sum: { amountFunded: true },
          }),
          prisma.feedback.aggregate({
            where: { event: { clubId: club.id, ...inYear } },
            _avg: { rating: true },
          }),
        ]);

        // Combined activity/participants factor
        const participantActivityFactor = (eventsCount * 5) + participantsCount;
        return {
          club,
          eventsCount,
          participantsCount,
          participantActivityFactor,
          totalSponsorship: Number(sponsorship._sum.amountFunded ?? 0),
          averageRating: feedback._avg.rating ?? 0,
        };
      })
    );

    const maxParticipant = Math.max(...raw.map((r) => r.participantActivityFactor));
    const maxSponsorship = Math.max(...raw.map((r) => r.totalSponsorship));
    const hasLiveActivity = maxParticipant > 0 || maxSponsorship > 0 || raw.some((r) => r.averageRating > 0);

    // Only update if live activity occurred, or if no rankings currently exist for this year
    const existingCount = await prisma.clubRanking.count({ where: { year } });
    if (hasLiveActivity || existingCount === 0) {
      const scored = raw
        .map((r) => {
          const totalEventsScore = maxParticipant ? (r.participantActivityFactor / maxParticipant) * 100 : 80;
          const sponsorshipScore = maxSponsorship ? (r.totalSponsorship / maxSponsorship) * 100 : 75;
          const feedbackScore = r.averageRating ? (r.averageRating / 5) * 100 : 85;
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

      for (const [index, s] of scored.entries()) {
        const scores = {
          totalEventsScore: s.totalEventsScore,
          sponsorshipScore: s.sponsorshipScore,
          feedbackScore: s.feedbackScore,
          finalScore: s.finalScore,
          rankPosition: index + 1,
        };
        await prisma.clubRanking.upsert({
          where: { clubId_year: { clubId: s.club.id, year } },
          create: { clubId: s.club.id, year, ...scores },
          update: scores,
        });
      }
    }
  } catch (err) {
    console.error("Auto ranking computation error:", err);
  }
};

const getByYear = async (year: number) => {
  // Automatically calculate live rankings based on participants, sponsorship, and feedback
  await autoRecalculateRankings(year);

  return prisma.clubRanking.findMany({
    where: { year },
    include: {
      club: {
        select: {
          id: true,
          clubName: true,
          departmentId: true,
          department: { select: { id: true, departmentName: true } },
        },
      },
    },
    orderBy: { rankPosition: "asc" },
  });
};

const generate = async (adminId: number, year: number) => {
  await autoRecalculateRankings(year);
  await createAuditLog(adminId, "RANKINGS_AUTOMATIC_REFRESH", "club_rankings", year);
  return getByYear(year);
};

const getClubHistory = async (clubId: number) => {
  const club = await prisma.club.findUnique({ where: { id: clubId }, select: { id: true, clubName: true } });
  if (!club) throw new AppError("Club not found", httpStatus.NOT_FOUND);
  const rankings = await prisma.clubRanking.findMany({ where: { clubId }, orderBy: { year: "desc" } });
  return { club, rankings };
};

export const rankingServices = { generate, getByYear, getClubHistory, autoRecalculateRankings };
