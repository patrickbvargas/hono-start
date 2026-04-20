import * as z from "zod";
import { paginationSchema } from "@/shared/schemas/pagination";
import { feeFilterSchema } from "./filter";
import { feeSortSchema } from "./sort";

export const feeSearchSchema = z.object({
	...paginationSchema.shape,
	...feeSortSchema.shape,
	...feeFilterSchema.shape,
});

export type FeeSearch = z.infer<typeof feeSearchSchema>;
