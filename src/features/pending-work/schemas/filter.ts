import * as z from "zod";

export const pendingWorkFilterSchema = z.object({
	query: z.string().trim().max(255).catch(""),
	severity: z.preprocess(
		(value) => (typeof value === "string" && value !== "all" ? [value] : value),
		z.array(z.enum(["high", "medium", "low"])).catch([]),
	),
	type: z.preprocess(
		(value) => (typeof value === "string" && value !== "all" ? [value] : value),
		z
			.array(
				z.enum(["overdue", "upcoming", "remaining-balance", "settled-active"]),
			)
			.catch([]),
	),
	clientId: z
		.string()
		.regex(/^[1-9]\d*$/)
		.or(z.literal(""))
		.catch(""),
	employeeId: z
		.string()
		.regex(/^[1-9]\d*$/)
		.or(z.literal(""))
		.catch(""),
});

export type PendingWorkFilter = z.infer<typeof pendingWorkFilterSchema>;
