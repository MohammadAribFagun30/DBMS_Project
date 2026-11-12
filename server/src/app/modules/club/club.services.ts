import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import { createAuditLog } from "../../utils/logger";

type ClubPayload = {
  clubName: string;
  description?: string;
  departmentId?: number;
  establishedYear?: number;
};

const getAll = (query: { departmentId?: string; search?: string }) =>
  prisma.club.findMany({
    where: {
      ...(query.departmentId && { departmentId: Number(query.departmentId) }),
      ...(query.search && { clubName: { contains: query.search, mode: "insensitive" as const } }),
    },
    include: { department: true, _count: { select: { events: true } } },
    orderBy: { id: "asc" },
  });

const getById = async (id: number) => {
  const club = await prisma.club.findUnique({
    where: { id },
    include: {
      department: true,
      events: { orderBy: { startTime: "desc" } },
      rankings: { orderBy: { year: "desc" } },
    },
  });
  if (!club) throw new AppError("Club not found", httpStatus.NOT_FOUND);
  return club;
};

const create = async (adminId: number, data: ClubPayload) => {
  const club = await prisma.club.create({ data });
  await createAuditLog(adminId, "CLUB_CREATED", "clubs", club.id);
  return club;
};

const update = async (adminId: number, id: number, data: Partial<ClubPayload>) => {
  await getById(id);
  const club = await prisma.club.update({ where: { id }, data });
  await createAuditLog(adminId, "CLUB_UPDATED", "clubs", id);
  return club;
};

const remove = async (adminId: number, id: number) => {
  await getById(id);
  await prisma.club.delete({ where: { id } });
  await createAuditLog(adminId, "CLUB_DELETED", "clubs", id);
};

export const clubServices = { getAll, getById, create, update, remove };
