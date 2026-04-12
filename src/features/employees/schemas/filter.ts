import * as z from "zod";
import type {
	EntityActiveFilterValue,
	EntityDeletedVisibilityValue,
} from "@/shared/lib/entity-management";

const activeFilterSchema = z
	.enum(["all", "false", "true"])
	.catch("all")
	.default("all");

const deletedVisibilitySchema = z
	.enum(["active", "all", "deleted"])
	.catch("active")
	.default("active");

export const employeeFilterSchema = z.object({
	name: z.string().catch(""),
	type: z.array(z.coerce.number<number>()).catch([]),
	role: z.array(z.coerce.number<number>()).catch([]),
	active: activeFilterSchema,
	status: deletedVisibilitySchema,
});

export const employeeFilterInputSchema = employeeFilterSchema.extend({
	type: z.array(z.coerce.string<string>()).catch([]),
	role: z.array(z.coerce.string<string>()).catch([]),
});

export type EmployeeFilter = z.infer<typeof employeeFilterSchema>;
export type EmployeeFilterInput = z.infer<typeof employeeFilterInputSchema>;
export type EmployeeActiveFilter = EntityActiveFilterValue;
export type EmployeeDeletedVisibilityFilter = EntityDeletedVisibilityValue;
