import httpStatus from "http-status";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { RegistrationStatus, Role } from "../../../generated/prisma/enums";
import { AppError } from "../../utils/appError";
import { createAuditLog, notifyUser } from "../../utils/logger";

type CurrentUser = { id: number; role: Role };

const fullInclude = {
  registration: {
    include: {
      user: { select: { id: true, studentId: true, fullName: true, email: true } },
      event: { include: { club: { select: { id: true, clubName: true } } } },
    },
  },
};

const buildUrl = (registrationId: number) =>
  `${config.app_url ?? "http://localhost:5050"}/certificates/CERT-${registrationId}.pdf`;

// Issues a certificate for one ATTENDED registration.
const issue = async (adminId: number, registrationId: number) => {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { certificate: true, event: true },
  });
  if (!registration) throw new AppError("Registration not found", httpStatus.NOT_FOUND);
  if (registration.status !== RegistrationStatus.ATTENDED) {
    throw new AppError("Certificates can only be issued to attended registrations", httpStatus.BAD_REQUEST);
  }
  if (registration.certificate) throw new AppError("Certificate already issued", httpStatus.CONFLICT);

  const certificate = await prisma.certificate.create({
    data: { registrationId, certificateUrl: buildUrl(registrationId) },
    include: fullInclude,
  });

  await notifyUser(registration.userId, `Your certificate for "${registration.event.title}" is ready.`);
  await createAuditLog(adminId, "CERTIFICATE_ISSUED", "certificates", certificate.id);
  return certificate;
};

// Issues certificates to every attended student of an event who doesn't have one yet.
const issueForEvent = async (adminId: number, eventId: number) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError("Event not found", httpStatus.NOT_FOUND);

  const pending = await prisma.registration.findMany({
    where: { eventId, status: RegistrationStatus.ATTENDED, certificate: null },
  });

  for (const reg of pending) {
    await prisma.certificate.create({ data: { registrationId: reg.id, certificateUrl: buildUrl(reg.id) } });
    await notifyUser(reg.userId, `Your certificate for "${event.title}" is ready.`);
  }

  await createAuditLog(adminId, "CERTIFICATES_BULK_ISSUED", "events", eventId);
  return { eventId, issuedCount: pending.length };
};

const getMy = (userId: number) =>
  prisma.certificate.findMany({
    where: { registration: { userId } },
    include: fullInclude,
    orderBy: { issuedAt: "desc" },
  });

const getAll = () => prisma.certificate.findMany({ include: fullInclude, orderBy: { issuedAt: "desc" } });

// Students can view/download only their own certificate.
const getById = async (user: CurrentUser, id: number) => {
  const certificate = await prisma.certificate.findUnique({ where: { id }, include: fullInclude });
  if (!certificate) throw new AppError("Certificate not found", httpStatus.NOT_FOUND);
  if (user.role !== Role.ADMIN && certificate.registration.userId !== user.id) {
    throw new AppError("You can only view your own certificates", httpStatus.FORBIDDEN);
  }
  return certificate;
};

export const certificateServices = { issue, issueForEvent, getMy, getAll, getById };
