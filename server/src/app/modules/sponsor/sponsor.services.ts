import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import { createAuditLog } from "../../utils/logger";

type SponsorPayload = { companyName: string; contactEmail?: string };

// Each sponsor is returned with the total amount it has funded across all events.
const getAll = async (_query?: Record<string, string>) => {
  const sponsors = await prisma.sponsor.findMany({
    include: { eventSponsors: { select: { amountFunded: true } } },
    orderBy: { id: "asc" },
  });
  return sponsors.map(({ eventSponsors, ...sponsor }) => ({
    ...sponsor,
    eventsSponsored: eventSponsors.length,
    totalFunded: eventSponsors.reduce((sum, es) => sum + Number(es.amountFunded), 0),
  }));
};

const getById = async (id: number) => {
  const sponsor = await prisma.sponsor.findUnique({
    where: { id },
    include: { eventSponsors: { include: { event: { include: { club: true } } } } },
  });
  if (!sponsor) throw new AppError("Sponsor not found", httpStatus.NOT_FOUND);
  const totalFunded = sponsor.eventSponsors.reduce((sum, es) => sum + Number(es.amountFunded), 0);
  return { ...sponsor, totalFunded };
};

const create = async (adminId: number, data: SponsorPayload) => {
  const sponsor = await prisma.sponsor.create({ data });
  await createAuditLog(adminId, "SPONSOR_CREATED", "sponsors", sponsor.id);
  return sponsor;
};

const update = async (adminId: number, id: number, data: Partial<SponsorPayload>) => {
  await getById(id);
  const sponsor = await prisma.sponsor.update({ where: { id }, data });
  await createAuditLog(adminId, "SPONSOR_UPDATED", "sponsors", id);
  return sponsor;
};

const remove = async (adminId: number, id: number) => {
  await getById(id);
  await prisma.sponsor.delete({ where: { id } });
  await createAuditLog(adminId, "SPONSOR_DELETED", "sponsors", id);
};

export const sponsorServices = { getAll, getById, create, update, remove };
