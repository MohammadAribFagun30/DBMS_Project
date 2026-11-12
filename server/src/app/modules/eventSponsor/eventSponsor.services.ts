import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import { createAuditLog } from "../../utils/logger";

type LedgerPayload = { eventId: number; sponsorId: number; amountFunded: number; sponsorshipTier?: string };

// Ledger list with grand total. Filter by eventId, sponsorId or clubId.
const getAll = async (query: { eventId?: string; sponsorId?: string; clubId?: string }) => {
  const entries = await prisma.eventSponsor.findMany({
    where: {
      ...(query.eventId && { eventId: Number(query.eventId) }),
      ...(query.sponsorId && { sponsorId: Number(query.sponsorId) }),
      ...(query.clubId && { event: { clubId: Number(query.clubId) } }),
    },
    include: {
      sponsor: true,
      event: { select: { id: true, title: true, startTime: true, club: { select: { id: true, clubName: true } } } },
    },
    orderBy: { id: "asc" },
  });
  const totalFunded = entries.reduce((sum, e) => sum + Number(e.amountFunded), 0);
  return { totalFunded, count: entries.length, entries };
};

const getById = async (id: number) => {
  const entry = await prisma.eventSponsor.findUnique({ where: { id }, include: { sponsor: true, event: true } });
  if (!entry) throw new AppError("Sponsorship entry not found", httpStatus.NOT_FOUND);
  return entry;
};

const create = async (adminId: number, data: LedgerPayload) => {
  const [event, sponsor] = await Promise.all([
    prisma.event.findUnique({ where: { id: data.eventId } }),
    prisma.sponsor.findUnique({ where: { id: data.sponsorId } }),
  ]);
  if (!event) throw new AppError("Event not found", httpStatus.NOT_FOUND);
  if (!sponsor) throw new AppError("Sponsor not found", httpStatus.NOT_FOUND);

  const entry = await prisma.eventSponsor.create({ data, include: { sponsor: true, event: true } });
  await createAuditLog(adminId, "SPONSORSHIP_ADDED", "event_sponsors", entry.id);
  return entry;
};

const update = async (adminId: number, id: number, data: Partial<LedgerPayload>) => {
  await getById(id);
  const entry = await prisma.eventSponsor.update({ where: { id }, data });
  await createAuditLog(adminId, "SPONSORSHIP_UPDATED", "event_sponsors", id);
  return entry;
};

const remove = async (adminId: number, id: number) => {
  await getById(id);
  await prisma.eventSponsor.delete({ where: { id } });
  await createAuditLog(adminId, "SPONSORSHIP_DELETED", "event_sponsors", id);
};

export const eventSponsorServices = { getAll, getById, create, update, remove };
