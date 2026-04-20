import * as z from "zod";

export const activeFilterSchema = z
	.enum(["all", "false", "true"])
	.catch("all")
	.default("all");

export const deletedFilterSchema = z
	.enum(["active", "all", "deleted"])
	.catch("active")
	.default("active");

export type ActiveFilter = z.infer<typeof activeFilterSchema>;
export type DeletedFilter = z.infer<typeof deletedFilterSchema>;
