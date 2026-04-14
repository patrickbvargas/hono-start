import * as z from "zod";

const activeFilterSchema = z
	.enum(["all", "false", "true"])
	.catch("all")
	.default("all");

const deletedVisibilitySchema = z
	.enum(["active", "all", "deleted"])
	.catch("active")
	.default("active");

export const remunerationFilterSchema = z.object({
	employeeId: z.string().catch("").default(""),
	contractId: z.string().catch("").default(""),
	dateFrom: z.string().catch("").default(""),
	dateTo: z.string().catch("").default(""),
	active: activeFilterSchema,
	status: deletedVisibilitySchema,
});

export type RemunerationFilter = z.infer<typeof remunerationFilterSchema>;
