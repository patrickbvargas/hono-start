import * as z from "zod";
import { paginationSchema } from "@/shared/schemas/pagination";
import { contractFilterSchema } from "./filter";
import { contractSortSchema } from "./sort";

export const contractSearchSchema = z.object({
	...paginationSchema.shape,
	...contractSortSchema.shape,
	...contractFilterSchema.shape,
});

export type ContractSearch = z.infer<typeof contractSearchSchema>;
