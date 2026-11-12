import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import { createAuditLog } from "../../utils/logger";

type VenuePayload = { venueName: string; location?: string };

const getAll = (_query?: Record<string, string>) =>
  prisma.venue.findMany({ include: { _count: { select: { events: true } } }, orderBy: { id: "asc" } });

const getById = async (id: number) => {
  const venue = await prisma.venue.findUnique({
    where: { id },
    include: { events: { orderBy: { startTime: "asc" } } },
  });
  if (!venue) throw new AppError("Venue not found", httpStatus.NOT_FOUND);
  return venue;
};

const create = async (adminId: number, data: VenuePayload) => {
  const venue = await prisma.venue.create({ data });
  await createAuditLog(adminId, "VENUE_CREATED", "venues", venue.id);
  return venue;
};

const update = async (adminId: number, id: number, data: Partial<VenuePayload>) => {
  await getById(id);
  const venue = await prisma.venue.update({ where: { id }, data });
  await createAuditLog(adminId, "VENUE_UPDATED", "venues", id);
  return venue;
};

const remove = async (adminId: number, id: number) => {
  await getById(id);
  await prisma.venue.delete({ where: { id } });
  await createAuditLog(adminId, "VENUE_DELETED", "venues", id);
};

export const venueServices = { getAll, getById, create, update, remove };
