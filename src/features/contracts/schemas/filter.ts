import * as z from "zod";

const activeFilterSchema = z
	.enum(["all", "false", "true"])
	.catch("all")
	.default("all");

const deletedVisibilitySchema = z
	.enum(["active", "all", "deleted"])
	.catch("active")
	.default("active");

export const contractFilterSchema = z.object({
	clientId: z.string().catch("").default(""),
	legalArea: z.array(z.string()).catch([]),
	contractStatus: z.array(z.string()).catch([]),
	active: activeFilterSchema,
	status: deletedVisibilitySchema,
});

export type ContractFilter = z.infer<typeof contractFilterSchema>;
