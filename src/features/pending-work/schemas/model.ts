import * as z from "zod";

export const pendingWorkSchema = z.object({
	id: z.string(),
	contractId: z.number().int().positive(),
	processNumber: z.string(),
	clientId: z.number().int().positive(),
	client: z.string(),
	title: z.string(),
	severity: z.enum(["high", "medium", "low"]),
	type: z.enum(["overdue", "upcoming", "remaining-balance", "settled-active"]),
	dueDate: z.iso.date().nullable(),
	overdueDays: z.number().int().positive().nullable(),
	overdueAmount: z.number().positive().nullable(),
	remainingAmount: z.number().nonnegative().nullable(),
	tab: z.enum(["finance", "team"]),
});

export const pendingWorkPageSchema = z.object({
	data: z.array(pendingWorkSchema),
	total: z.number().int().nonnegative(),
	high: z.number().int().nonnegative(),
	medium: z.number().int().nonnegative(),
	low: z.number().int().nonnegative(),
	contracts: z.number().int().nonnegative(),
	page: z.number().int().positive(),
	pageSize: z.number().int().positive(),
});

export type PendingWork = z.infer<typeof pendingWorkSchema>;
export type PendingWorkPage = z.infer<typeof pendingWorkPageSchema>;
