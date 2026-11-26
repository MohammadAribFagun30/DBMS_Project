import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { RegistrationStatus } from "../../../generated/prisma/enums";
import { AppError } from "../../utils/appError";
import { createAuditLog } from "../../utils/logger";

type FeedbackPayload = { eventId: number; rating: number; comments?: string };

// Students who participated and where the event has concluded can submit feedback. The feedback row itself stores no user id (anonymous).
const create = async (userId: number, payload: FeedbackPayload) => {
  const event = await prisma.event.findUnique({
    where: { id: payload.eventId },
  });
  if (!event) throw new AppError("Event not found", httpStatus.NOT_FOUND);

  // Must have registered/participated in the event
  const registration = await prisma.registration.findUnique({
    where: { eventId_userId: { eventId: payload.eventId, userId } },
  });
  if (!registration || (registration.status !== RegistrationStatus.ATTENDED && registration.status !== RegistrationStatus.CONFIRMED)) {
    throw new AppError("You must have participated in this event to submit feedback", httpStatus.FORBIDDEN);
  }

  // Event must be finished/concluded
  const isFinished = event.status === "COMPLETED" || new Date(event.endTime) <= new Date();
  if (!isFinished) {
    throw new AppError("Feedback is only available after the event has concluded", httpStatus.BAD_REQUEST);
  }

  // Check if student already submitted feedback for this event
  const alreadySubmitted = await prisma.auditLog.findFirst({
    where: {
      userId,
      action: "FEEDBACK_SUBMITTED",
      entityType: "events",
      entityId: payload.eventId,
    },
  });
  if (alreadySubmitted) {
    throw new AppError("You have already submitted feedback for this event", httpStatus.CONFLICT);
  }

  const feedback = await prisma.feedback.create({ data: payload });
  // Audit log records that this user submitted feedback for this event, keeping rating & comments anonymous
  await createAuditLog(userId, "FEEDBACK_SUBMITTED", "events", payload.eventId);
  return feedback;
};

// Returns the list of event IDs for which the student has submitted feedback
const getMy = async (userId: number) => {
  const logs = await prisma.auditLog.findMany({
    where: {
      userId,
      action: "FEEDBACK_SUBMITTED",
      entityType: "events",
    },
    select: { entityId: true },
  });
  return logs.map((l) => l.entityId).filter((id): id is number => typeof id === "number");
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

export const feedbackServices = { create, getMy, getByEvent, getAll, remove };
