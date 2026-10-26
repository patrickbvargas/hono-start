import * as z from "zod";
import {
	activeFilterSchema,
	deletedFilterSchema,
} from "@/shared/schemas/filter";

export const feeFilterSchema = z.object({
	clientId: z.coerce.number().int().positive().optional().catch(undefined),
	query: z.string().trim().catch(""),
	contractId: z.string().catch("").default(""),
	revenueType: z.string().optional().catch(undefined),
	revenueId: z.string().catch("").default(""),
	dateFrom: z.string().catch("").default(""),
	dateTo: z.string().catch("").default(""),
	active: activeFilterSchema,
	status: deletedFilterSchema,
});

export type FeeFilter = z.infer<typeof feeFilterSchema>;
