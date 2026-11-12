import { z } from "zod";

export const createSponsorSchema = z.object({
  companyName: z.string().trim().min(2, "Company name is required"),
  contactEmail: z.email("Please provide a valid email").optional(),
});

export const updateSponsorSchema = createSponsorSchema.partial();
