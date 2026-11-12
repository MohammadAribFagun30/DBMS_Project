import { z } from "zod";

export const generateRankingSchema = z.object({
  year: z.number().int().min(2000).max(2100),
});
