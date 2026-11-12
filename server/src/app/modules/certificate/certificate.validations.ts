import { z } from "zod";

export const issueCertificateSchema = z.object({
  registrationId: z.number().int().positive(),
});
