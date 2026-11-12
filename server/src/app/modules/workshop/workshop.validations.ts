import { z } from "zod";

export const createWorkshopSchema = z.object({
  eventId: z.number().int().positive(),
  speakerName: z.string().trim().min(2, "Speaker name is required"),
  speakerBio: z.string().trim().optional(),
  prerequisites: z.string().trim().optional(),
});

export const updateWorkshopSchema = createWorkshopSchema.omit({ eventId: true }).partial();
