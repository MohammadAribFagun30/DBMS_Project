import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import { createAuditLog } from "../../utils/logger";

const getMy = async (userId: number) => {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);
  return { unreadCount, notifications };
};

const findOwn = async (userId: number, id: number) => {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== userId) {
    throw new AppError("Notification not found", httpStatus.NOT_FOUND);
  }
  return notification;
};

const markRead = async (userId: number, id: number) => {
  await findOwn(userId, id);
  return prisma.notification.update({ where: { id }, data: { isRead: true } });
};

const markAllRead = (userId: number) =>
  prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });

const remove = async (userId: number, id: number) => {
  await findOwn(userId, id);
  await prisma.notification.delete({ where: { id } });
};

// Admin sends an announcement to one user, or to everyone when userId is omitted.
const send = async (adminId: number, payload: { userId?: number; message: string }) => {
  if (payload.userId) {
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw new AppError("User not found", httpStatus.NOT_FOUND);
    await prisma.notification.create({ data: { userId: payload.userId, message: payload.message } });
    await createAuditLog(adminId, "NOTIFICATION_SENT", "users", payload.userId);
    return { sentTo: 1 };
  }

  const users = await prisma.user.findMany({ select: { id: true } });
  const result = await prisma.notification.createMany({
    data: users.map((u) => ({ userId: u.id, message: payload.message })),
  });
  await createAuditLog(adminId, "NOTIFICATION_BROADCAST", "notifications");
  return { sentTo: result.count };
};

export const notificationServices = { getMy, markRead, markAllRead, remove, send };
