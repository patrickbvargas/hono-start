import * as z from "zod";
import { paginationSchema } from "@/shared/schemas/pagination";
import { personFilterSchema } from "./filter";
import { personSortSchema } from "./sort";

export const personSearchSchema = z.object({
	...paginationSchema.shape,
	...personSortSchema.shape,
	...personFilterSchema.shape,
});

export type PersonSearch = z.infer<typeof personSearchSchema>;
