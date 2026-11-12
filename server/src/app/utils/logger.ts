import { prisma } from "../lib/prisma";

// Writes a row to audit_logs for critical actions.
export const createAuditLog = (
  userId: number | undefined,
  action: string,
  entityType?: string,
  entityId?: number
) =>
  prisma.auditLog.create({
    data: {
      userId: userId ?? null,
      action,
      entityType: entityType ?? null,
      entityId: entityId ?? null,
    },
  });

// Sends an in-app notification to a user.
export const notifyUser = (userId: number, message: string) =>
  prisma.notification.create({ data: { userId, message } });
