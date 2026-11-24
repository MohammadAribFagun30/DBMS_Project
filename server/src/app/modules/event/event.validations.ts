import { z } from "zod";

const workshopDetails = z.object({
  speakerName: z.string().trim().min(2, "Speaker name is required"),
  speakerBio: z.string().trim().optional(),
  prerequisites: z.string().trim().optional(),
});

const sponsorshipDetails = z.object({
  sponsorId: z.number().int().positive(),
  amountFunded: z.number().positive("Amount must be greater than 0"),
  sponsorshipTier: z.string().trim().optional(),
});

export const createEventSchema = z
  .object({
    clubId: z.number().int().positive(),
    venueId: z.number().int().positive().optional(),
    title: z.string().trim().min(3, "Title must be at least 3 characters"),
    description: z.string().trim().optional(),
    eventType: z.string().trim().optional(), // e.g. WORKSHOP, HACKATHON, SEMINAR, SOCIAL
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    workshop: workshopDetails.optional(), // optional 1:1 workshop details
    sponsorship: sponsorshipDetails.optional(), // optional sponsorship details
  })
  .refine((d) => d.endTime > d.startTime, { message: "endTime must be after startTime", path: ["endTime"] });

export const updateEventSchema = z.object({
  clubId: z.number().int().positive().optional(),
  venueId: z.number().int().positive().nullable().optional(),
  title: z.string().trim().min(3).optional(),
  description: z.string().trim().optional(),
  eventType: z.string().trim().optional(),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
});

export const updateEventStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "COMPLETED", "CANCELLED"]),
});
