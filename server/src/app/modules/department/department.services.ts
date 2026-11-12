import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import { createAuditLog } from "../../utils/logger";

const getAll = (_query?: Record<string, string>) =>
  prisma.department.findMany({
    include: { _count: { select: { users: true, clubs: true } } },
    orderBy: { id: "asc" },
  });

const getById = async (id: number) => {
  const department = await prisma.department.findUnique({
    where: { id },
    include: { clubs: true, _count: { select: { users: true } } },
  });
  if (!department) throw new AppError("Department not found", httpStatus.NOT_FOUND);
  return department;
};

const create = async (adminId: number, data: { departmentName: string }) => {
  const department = await prisma.department.create({ data });
  await createAuditLog(adminId, "DEPARTMENT_CREATED", "departments", department.id);
  return department;
};

const update = async (adminId: number, id: number, data: { departmentName?: string }) => {
  await getById(id);
  const department = await prisma.department.update({ where: { id }, data });
  await createAuditLog(adminId, "DEPARTMENT_UPDATED", "departments", id);
  return department;
};

const remove = async (adminId: number, id: number) => {
  await getById(id);
  await prisma.department.delete({ where: { id } });
  await createAuditLog(adminId, "DEPARTMENT_DELETED", "departments", id);
};

export const departmentServices = { getAll, getById, create, update, remove };
