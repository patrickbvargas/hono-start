import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";

export const employeeCreateSchema = z.object({});

export const employeeUpdateSchema = employeeCreateSchema.partial();

export const employeeDeleteSchema = entityIdSchema;

export type EmployeeCreate = z.infer<typeof employeeCreateSchema>;
export type EmployeeUpdate = z.infer<typeof employeeUpdateSchema>;
export type EmployeeDelete = z.infer<typeof employeeDeleteSchema>;
