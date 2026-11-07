import * as z from "zod";
import { paginationSchema } from "@/shared/schemas/pagination";
import { receivableFilterSchema } from "./filter";
import { receivableSortSchema } from "./sort";
export const receivableSearchSchema = z.object({
	...paginationSchema.shape,
	page: z.coerce.number().int().positive().catch(1),
	limit: z.coerce.number().int().min(1).max(100).catch(25),
	...receivableFilterSchema.shape,
	...receivableSortSchema.shape,
});
export type ReceivableSearch = z.infer<typeof receivableSearchSchema>;
export const receivableIdInputSchema = z.object({
	id: z.number().int().positive(),
});
