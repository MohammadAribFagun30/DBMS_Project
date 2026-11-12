import { z } from "zod";

export const createClubSchema = z.object({
  clubName: z.string().trim().min(2, "Club name is required"),
  description: z.string().trim().optional(),
  departmentId: z.number().int().positive().optional(),
  establishedYear: z.number().int().min(1900).max(2100).optional(),
});

export const updateClubSchema = createClubSchema.partial();
