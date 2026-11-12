import { z } from "zod";

export const createDepartmentSchema = z.object({
  departmentName: z.string().trim().min(2, "Department name is required"),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();
