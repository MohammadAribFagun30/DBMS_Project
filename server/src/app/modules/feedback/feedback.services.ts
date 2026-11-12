import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { RegistrationStatus } from "../../../generated/prisma/enums";
import { AppError } from "../../utils/appError";
import { createAuditLog } from "../../utils/logger";

type FeedbackPayload = { eventId: number; rating: number; comments?: string };

// Only students who ATTENDED can submit. The feedback row itself stores no user id (anonymous).
const create = async (userId: number, payload: FeedbackPayload) => {
  const registration = await prisma.registration.findUnique({
    where: { eventId_userId: { eventId: payload.eventId, userId } },
  });
  if (!registration || registration.status !== RegistrationStatus.ATTENDED) {
    throw new AppError("Only students who attended this event can submit feedback", httpStatus.FORBIDDEN);
  }

  const feedback = await prisma.feedback.create({ data: payload });
  // Audit log records that feedback was submitted for an event, not who wrote which feedback row.
  await createAuditLog(undefined, "FEEDBACK_SUBMITTED", "events", payload.eventId);
  return feedback;
};

const getByEvent = async (eventId: number) => {
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true, title: true } });
  if (!event) throw new AppError("Event not found", httpStatus.NOT_FOUND);

  const [stats, feedbacks] = await Promise.all([
    prisma.feedback.aggregate({ where: { eventId }, _avg: { rating: true }, _count: true }),
    prisma.feedback.findMany({ where: { eventId }, orderBy: { submittedAt: "desc" } }),
  ]);

  return {
    event,
    averageRating: stats._avg.rating ? Number(stats._avg.rating.toFixed(2)) : null,
    totalFeedbacks: stats._count,
    feedbacks,
  };
};

const getAll = (query: { eventId?: string; rating?: string }) =>
  prisma.feedback.findMany({
    where: {
      ...(query.eventId && { eventId: Number(query.eventId) }),
      ...(query.rating && { rating: Number(query.rating) }),
    },
    include: { event: { select: { id: true, title: true, clubId: true } } },
    orderBy: { submittedAt: "desc" },
  });

const remove = async (adminId: number, id: number) => {
  const feedback = await prisma.feedback.findUnique({ where: { id } });
  if (!feedback) throw new AppError("Feedback not found", httpStatus.NOT_FOUND);
  await prisma.feedback.delete({ where: { id } });
  await createAuditLog(adminId, "FEEDBACK_DELETED", "feedbacks", id);
};

export const feedbackServices = { create, getByEvent, getAll, remove };
