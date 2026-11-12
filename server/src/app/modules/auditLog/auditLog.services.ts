import { prisma } from "../../lib/prisma";

const getAll = (query: { userId?: string; action?: string; entityType?: string; limit?: string }) =>
  prisma.auditLog.findMany({
    where: {
      ...(query.userId && { userId: Number(query.userId) }),
      ...(query.action && { action: { contains: query.action, mode: "insensitive" as const } }),
      ...(query.entityType && { entityType: query.entityType }),
    },
    include: { user: { select: { id: true, fullName: true, email: true, role: true } } },
    orderBy: { timestamp: "desc" },
    take: query.limit ? Number(query.limit) : 100,
  });

export const auditLogServices = { getAll };
