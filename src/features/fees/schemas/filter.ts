import * as z from "zod";
import {
	activeFilterSchema,
	deletedFilterSchema,
} from "@/shared/schemas/filter";

export const feeFilterSchema = z.object({
	query: z.string().trim().catch(""),
	contractId: z.string().catch("").default(""),
	revenueId: z.string().catch("").default(""),
	dateFrom: z.string().catch("").default(""),
	dateTo: z.string().catch("").default(""),
	active: activeFilterSchema,
	status: deletedFilterSchema,
});

export type FeeFilter = z.infer<typeof feeFilterSchema>;
