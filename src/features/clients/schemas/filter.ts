import * as z from "zod";

const activeFilterSchema = z
	.enum(["all", "false", "true"])
	.catch("all")
	.default("all");

const deletedVisibilitySchema = z
	.enum(["active", "all", "deleted"])
	.catch("active")
	.default("active");

export const clientFilterSchema = z.object({
	name: z.string().catch(""),
	type: z.array(z.string()).catch([]),
	active: activeFilterSchema,
	status: deletedVisibilitySchema,
});

export type ClientFilter = z.infer<typeof clientFilterSchema>;
