import * as z from "zod";
import {
	activeFilterSchema,
	deletedFilterSchema,
} from "@/shared/schemas/filter";

export const expenseFilterSchema = z.object({
	query: z.string().trim().catch(""),
	supplierId: z.coerce.number().optional().catch(undefined),
	dateFrom: z.string().catch("").default(""),
	dateTo: z.string().catch("").default(""),
	active: activeFilterSchema,
	status: deletedFilterSchema,
});

export type ExpenseFilter = z.infer<typeof expenseFilterSchema>;
