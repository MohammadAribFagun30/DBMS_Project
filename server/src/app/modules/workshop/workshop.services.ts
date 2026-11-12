import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import { createAuditLog } from "../../utils/logger";

type WorkshopPayload = { eventId: number; speakerName: string; speakerBio?: string; prerequisites?: string };

const getAll = (_query?: Record<string, string>) =>
  prisma.workshop.findMany({
    include: { event: { include: { club: { select: { id: true, clubName: true } }, venue: true } } },
    orderBy: { id: "asc" },
  });

const getById = async (id: number) => {
  const workshop = await prisma.workshop.findUnique({
    where: { id },
    include: { event: { include: { club: true, venue: true } } },
  });
  if (!workshop) throw new AppError("Workshop not found", httpStatus.NOT_FOUND);
  return workshop;
};

const create = async (adminId: number, data: WorkshopPayload) => {
  const event = await prisma.event.findUnique({ where: { id: data.eventId }, include: { workshop: true } });
  if (!event) throw new AppError("Event not found", httpStatus.NOT_FOUND);
  if (event.workshop) throw new AppError("This event already has workshop details", httpStatus.CONFLICT);

  const workshop = await prisma.workshop.create({ data });
  await createAuditLog(adminId, "WORKSHOP_CREATED", "workshops", workshop.id);
  return workshop;
};

const update = async (adminId: number, id: number, data: Partial<WorkshopPayload>) => {
  await getById(id);
  const workshop = await prisma.workshop.update({ where: { id }, data });
  await createAuditLog(adminId, "WORKSHOP_UPDATED", "workshops", id);
  return workshop;
};

const remove = async (adminId: number, id: number) => {
  await getById(id);
  await prisma.workshop.delete({ where: { id } });
  await createAuditLog(adminId, "WORKSHOP_DELETED", "workshops", id);
};

export const workshopServices = { getAll, getById, create, update, remove };
