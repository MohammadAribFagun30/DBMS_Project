import { z } from "zod";

export const sendNotificationSchema = z.object({
  userId: z.number().int().positive().optional(), // omit to broadcast to all users
  message: z.string().trim().min(1, "Message is required"),
});
