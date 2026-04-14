import * as z from "zod";
import { paginationSchema } from "@/shared/schemas/pagination";
import { remunerationFilterSchema } from "./filter";
import { remunerationSortSchema } from "./sort";

export const remunerationSearchSchema = z.object({
	...paginationSchema.shape,
	...remunerationSortSchema.shape,
	...remunerationFilterSchema.shape,
});

export type RemunerationSearch = z.infer<typeof remunerationSearchSchema>;
