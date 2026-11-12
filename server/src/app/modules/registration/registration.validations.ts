import { z } from "zod";

export const createRegistrationSchema = z.object({
  eventId: z.number().int().positive(),
});
