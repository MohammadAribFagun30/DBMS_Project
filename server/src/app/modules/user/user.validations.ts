import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).optional(),
  departmentId: z.number().int().positive().nullable().optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

export const updateRoleSchema = z.object({
  role: z.enum(["STUDENT", "ADMIN"]),
});
