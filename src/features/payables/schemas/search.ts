import * as z from "zod";
import { paginationSchema } from "@/shared/schemas/pagination";
import { payableFilterSchema } from "./filter";
import { payableSortSchema } from "./sort";
export const payableSearchSchema = z.object({
	...paginationSchema.shape,
	page: z.coerce.number().int().positive().catch(1),
	limit: z.coerce.number().int().min(1).max(100).catch(25),
	...payableFilterSchema.shape,
	...payableSortSchema.shape,
});
export type PayableSearch = z.infer<typeof payableSearchSchema>;
export const payableIdInputSchema = z.object({
	id: z.number().int().positive(),
});
