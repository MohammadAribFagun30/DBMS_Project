import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { EventStatus, Role } from "../../../generated/prisma/enums";
import { AppError } from "../../utils/appError";
import { createAuditLog, notifyUser } from "../../utils/logger";
import { userPublicSelect } from "../../utils/userSelect";
import { sendEventApprovedEmail } from "../../utils/email";

type EventQuery = {
  status?: string;
  clubId?: string;
  venueId?: string;
  eventType?: string;
  upcoming?: string;
  search?: string;
};

type CreateEventPayload = {
  clubId: number;
  venueId?: number;
  title: string;
  description?: string;
  eventType?: string;
  startTime: Date;
  endTime: Date;
  workshop?: { speakerName: string; speakerBio?: string; prerequisites?: string };
};

type UpdateEventPayload = Partial<Omit<CreateEventPayload, "workshop" | "venueId">> & { venueId?: number | null };

type CurrentUser = { id: number; role: Role };

const getAll = (query: EventQuery) =>
  prisma.event.findMany({
    where: {
      ...(query.status && { status: query.status as EventStatus }),
      ...(query.clubId && { clubId: Number(query.clubId) }),
      ...(query.venueId && { venueId: Number(query.venueId) }),
      ...(query.eventType && { eventType: { equals: query.eventType, mode: "insensitive" as const } }),
      ...(query.search && { title: { contains: query.search, mode: "insensitive" as const } }),
      // "Browse upcoming events": approved events that haven't started yet
      ...(query.upcoming === "true" && { status: EventStatus.APPROVED, startTime: { gte: new Date() } }),
    },
    include: {
      club: { select: { id: true, clubName: true } },
      venue: true,
      workshop: true,
      _count: { select: { registrations: true } },
    },
    orderBy: { startTime: "asc" },
  });

const getById = async (id: number) => {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      club: true,
      venue: true,
      workshop: true,
      createdBy: { select: userPublicSelect },
      sponsors: { include: { sponsor: true } },
      _count: { select: { registrations: true, feedbacks: true } },
    },
  });
  if (!event) throw new AppError("Event not found", httpStatus.NOT_FOUND);

  const rating = await prisma.feedback.aggregate({ where: { eventId: id }, _avg: { rating: true } });
  return { ...event, averageRating: rating._avg.rating };
};

// Students propose events (PENDING, needs admin approval). Admin-created events are APPROVED directly.
const create = async (user: CurrentUser, payload: CreateEventPayload) => {
  const { workshop, ...eventData } = payload;

  const event = await prisma.event.create({
    data: {
      ...eventData,
      createdById: user.id,
      status: user.role === Role.ADMIN ? EventStatus.APPROVED : EventStatus.PENDING,
      ...(workshop && { workshop: { create: workshop } }),
    },
    include: { workshop: true },
  });

  await createAuditLog(user.id, "EVENT_CREATED", "events", event.id);
  return event;
};

const assertOwnerOrAdmin = async (user: CurrentUser, eventId: number) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError("Event not found", httpStatus.NOT_FOUND);
  if (user.role !== Role.ADMIN && event.createdById !== user.id) {
    throw new AppError("Only the event creator or an admin can modify this event", httpStatus.FORBIDDEN);
  }
  return event;
};

const update = async (user: CurrentUser, id: number, data: UpdateEventPayload) => {
  const existing = await assertOwnerOrAdmin(user, id);
  const start = data.startTime ?? existing.startTime;
  const end = data.endTime ?? existing.endTime;
  if (end <= start) throw new AppError("endTime must be after startTime", httpStatus.BAD_REQUEST);

  const event = await prisma.event.update({ where: { id }, data });
  await createAuditLog(user.id, "EVENT_UPDATED", "events", id);
  return event;
};

// Admin approves / rejects / completes / cancels an event.
const updateStatus = async (adminId: number, id: number, status: EventStatus) => {
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) throw new AppError("Event not found", httpStatus.NOT_FOUND);

  const event = await prisma.event.update({
    where: { id },
    data: { status },
    include: {
      club: { select: { id: true, clubName: true } },
      venue: true,
      createdBy: { select: { fullName: true, email: true } },
    },
  });
  await createAuditLog(adminId, `EVENT_${status}`, "events", id);

  if (event.createdById) {
    // 1. In-app notification
    await notifyUser(event.createdById, `Your event "${event.title}" is now ${status}.`);

    // 2. Email notification on approval (Resend / Nodemailer)
    if (status === EventStatus.APPROVED && event.createdBy?.email) {
      sendEventApprovedEmail(event.createdBy.email, {
        organizerName: event.createdBy.fullName || "Event Organizer",
        eventTitle: event.title,
        startTime: event.startTime,
        venueName: event.venue?.name,
        clubName: event.club?.clubName,
      }).catch((err) => {
        console.error("[Email] Failed to send event approval email:", err?.message || err);
      });
    }
  }

  // Let registered students know if the event was cancelled.
  if (status === EventStatus.CANCELLED) {
    const regs = await prisma.registration.findMany({ where: { eventId: id }, select: { userId: true } });
    await prisma.notification.createMany({
      data: regs.map((r) => ({ userId: r.userId, message: `Event "${event.title}" has been cancelled.` })),
    });
  }
  return event;
};

const remove = async (adminId: number, id: number) => {
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) throw new AppError("Event not found", httpStatus.NOT_FOUND);
  await prisma.event.delete({ where: { id } });
  await createAuditLog(adminId, "EVENT_DELETED", "events", id);
};

// Participant list for an event (admin).
const getRegistrations = async (id: number) => {
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) throw new AppError("Event not found", httpStatus.NOT_FOUND);
  return prisma.registration.findMany({
    where: { eventId: id },
    include: { user: { select: userPublicSelect }, certificate: true },
    orderBy: { registeredAt: "asc" },
  });
};

export const eventServices = { getAll, getById, create, update, updateStatus, remove, getRegistrations };
