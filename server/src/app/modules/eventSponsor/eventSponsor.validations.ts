import { z } from "zod";

export const createEventSponsorSchema = z.object({
  eventId: z.number().int().positive(),
  sponsorId: z.number().int().positive(),
  amountFunded: z.number().positive("Amount must be greater than 0"),
  sponsorshipTier: z.string().trim().optional(), // e.g. PLATINUM, GOLD, SILVER, BRONZE
});

export const updateEventSponsorSchema = createEventSponsorSchema.pick({ amountFunded: true, sponsorshipTier: true }).partial();
