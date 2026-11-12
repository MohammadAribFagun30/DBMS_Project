import { z } from "zod";

export const createVenueSchema = z.object({
  venueName: z.string().trim().min(2, "Venue name is required"),
  location: z.string().trim().optional(),
});

export const updateVenueSchema = createVenueSchema.partial();
