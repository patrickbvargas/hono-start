import * as z from "zod";
import {
	activeFilterSchema,
	deletedFilterSchema,
} from "@/shared/schemas/filter";

export const remunerationFilterSchema = z.object({
	query: z.string().trim().catch(""),
	employeeId: z.string().catch("").default(""),
	contractId: z.string().catch("").default(""),
	dateFrom: z.string().catch("").default(""),
	dateTo: z.string().catch("").default(""),
	active: activeFilterSchema,
	status: deletedFilterSchema,
});

export type RemunerationFilter = z.infer<typeof remunerationFilterSchema>;
