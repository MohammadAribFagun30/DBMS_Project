import { z } from "zod";

export const createFeedbackSchema = z.object({
  eventId: z.number().int().positive(),
  rating: z.number().int().min(1, "Rating must be 1-5").max(5, "Rating must be 1-5"),
  comments: z.string().trim().max(1000).optional(),
});
