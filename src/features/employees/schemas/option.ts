import type * as z from "zod";
import { optionSchema } from "@/shared/schemas/option";

export const LAWYER_TYPE_VALUE = "LAWYER";
export const ADMIN_ASSISTANT_TYPE_VALUE = "ADMIN_ASSISTANT";
export const ADMIN_TYPE_VALUE = "ADMIN";

export const employeeTypeSchema = optionSchema.transform((data) => ({
	...data,
	isLawyer: data.value === LAWYER_TYPE_VALUE,
}));

export const employeeRoleSchema = optionSchema.transform((data) => ({
	...data,
	isAdmin: data.value === ADMIN_TYPE_VALUE,
}));

export type EmployeeType = z.infer<typeof employeeTypeSchema>;
export type EmployeeRole = z.infer<typeof employeeRoleSchema>;
