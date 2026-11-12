import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import type { Role } from "../../../generated/prisma/enums";
import { AppError } from "../../utils/appError";
import { createAuditLog } from "../../utils/logger";
import { userPublicSelect } from "../../utils/userSelect";

const getAll = (query: { role?: string; departmentId?: string; search?: string }) =>
  prisma.user.findMany({
    where: {
      ...(query.role && { role: query.role as Role }),
      ...(query.departmentId && { departmentId: Number(query.departmentId) }),
      ...(query.search && {
        OR: [
          { fullName: { contains: query.search, mode: "insensitive" as const } },
          { email: { contains: query.search, mode: "insensitive" as const } },
          { studentId: { contains: query.search, mode: "insensitive" as const } },
        ],
      }),
    },
    select: { ...userPublicSelect, department: true },
    orderBy: { id: "asc" },
  });

const getById = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { ...userPublicSelect, department: true, _count: { select: { registrations: true } } },
  });
  if (!user) throw new AppError("User not found", httpStatus.NOT_FOUND);
  return user;
};

const updateProfile = async (
  userId: number,
  payload: { fullName?: string; departmentId?: number | null; password?: string }
) => {
  const { password, ...rest } = payload;
  const data: Record<string, unknown> = { ...rest };
  if (password) data.passwordHash = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds) || 10);

  return prisma.user.update({ where: { id: userId }, data, select: userPublicSelect });
};

const updateRole = async (adminId: number, id: number, role: Role) => {
  await getById(id);
  const user = await prisma.user.update({ where: { id }, data: { role }, select: userPublicSelect });
  await createAuditLog(adminId, `USER_ROLE_CHANGED_TO_${role}`, "users", id);
  return user;
};

const remove = async (adminId: number, id: number) => {
  await getById(id);
  await prisma.user.delete({ where: { id } });
  await createAuditLog(adminId, "USER_DELETED", "users", id);
};

export const userServices = { getAll, getById, updateProfile, updateRole, remove };
