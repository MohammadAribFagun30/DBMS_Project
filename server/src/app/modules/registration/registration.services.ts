import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { EventStatus, RegistrationStatus, Role } from "../../../generated/prisma/enums";
import { AppError } from "../../utils/appError";
import { createAuditLog, notifyUser } from "../../utils/logger";
import { userPublicSelect } from "../../utils/userSelect";
import { sendRegistrationConfirmedEmail } from "../../utils/email";

type CurrentUser = { id: number; role: Role };

const eventInclude = {
  event: {
    include: {
      club: { select: { id: true, clubName: true } },
      venue: true,
    },
  },
  user: {
    select: {
      id: true,
      fullName: true,
      email: true,
      studentId: true,
    },
  },
};

// Student registers for an approved, not-yet-finished event. The registration id acts as the event pass.
const register = async (userId: number, eventId: number) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      club: { select: { id: true, clubName: true } },
      venue: true,
    },
  });
  if (!event) throw new AppError("Event not found", httpStatus.NOT_FOUND);
  if (event.status !== EventStatus.APPROVED) {
    throw new AppError("Registration is only open for approved events", httpStatus.BAD_REQUEST);
  }
  if (event.endTime < new Date()) throw new AppError("This event has already ended", httpStatus.BAD_REQUEST);

  const existing = await prisma.registration.findUnique({ where: { eventId_userId: { eventId, userId } } });
  if (existing && existing.status !== RegistrationStatus.CANCELLED) {
    throw new AppError("You are already registered for this event", httpStatus.CONFLICT);
  }

  // Re-activate a previously cancelled registration instead of creating a duplicate row.
  const registration = existing
    ? await prisma.registration.update({
        where: { id: existing.id },
        data: { status: RegistrationStatus.CONFIRMED, registeredAt: new Date() },
        include: eventInclude,
      })
    : await prisma.registration.create({ data: { eventId, userId }, include: eventInclude });

  // 1. In-app notification
  await notifyUser(userId, `Registration confirmed for "${event.title}". Your pass number is REG-${registration.id}.`);
  await createAuditLog(userId, "REGISTRATION_CONFIRMED", "registrations", registration.id);

  // 2. Email notification (Resend / Nodemailer)
  if (registration.user?.email) {
    sendRegistrationConfirmedEmail(registration.user.email, {
      studentName: registration.user.fullName || "Student",
      eventTitle: event.title,
      passNumber: `REG-${registration.id}`,
      startTime: event.startTime,
      venueName: event.venue?.name,
      clubName: event.club?.clubName,
    }).catch((err) => {
      console.error("[Email] Failed to send registration confirmation email:", err?.message || err);
    });
  }

  return { ...registration, passNumber: `REG-${registration.id}` };
};

const getMy = (userId: number) =>
  prisma.registration.findMany({
    where: { userId },
    include: { ...eventInclude, certificate: true },
    orderBy: { registeredAt: "desc" },
  });

const getAll = (query: { eventId?: string; status?: string }) =>
  prisma.registration.findMany({
    where: {
      ...(query.eventId && { eventId: Number(query.eventId) }),
      ...(query.status && { status: query.status as RegistrationStatus }),
    },
    include: { user: { select: userPublicSelect }, event: { select: { id: true, title: true } } },
    orderBy: { registeredAt: "desc" },
  });

const findOrFail = async (id: number) => {
  const registration = await prisma.registration.findUnique({ where: { id }, include: { event: true } });
  if (!registration) throw new AppError("Registration not found", httpStatus.NOT_FOUND);
  return registration;
};

const cancel = async (user: CurrentUser, id: number) => {
  const registration = await findOrFail(id);
  if (user.role !== Role.ADMIN && registration.userId !== user.id) {
    throw new AppError("You can only cancel your own registration", httpStatus.FORBIDDEN);
  }
  if (registration.status !== RegistrationStatus.CONFIRMED) {
    throw new AppError(`Cannot cancel a registration that is ${registration.status}`, httpStatus.BAD_REQUEST);
  }

  const updated = await prisma.registration.update({ where: { id }, data: { status: RegistrationStatus.CANCELLED } });
  await createAuditLog(user.id, "REGISTRATION_CANCELLED", "registrations", id);
  return updated;
};

// Admin marks a student as attended (unlocks feedback + certificate).
const markAttended = async (adminId: number, id: number) => {
  const registration = await findOrFail(id);
  if (registration.status !== RegistrationStatus.CONFIRMED) {
    throw new AppError(`Cannot mark a ${registration.status} registration as attended`, httpStatus.BAD_REQUEST);
  }

  const updated = await prisma.registration.update({ where: { id }, data: { status: RegistrationStatus.ATTENDED } });
  await notifyUser(
    registration.userId,
    `Thanks for attending "${registration.event.title}"! You can now submit anonymous feedback.`
  );
  await createAuditLog(adminId, "REGISTRATION_ATTENDED", "registrations", id);
  return updated;
};

export const registrationServices = { register, getMy, getAll, cancel, markAttended };
