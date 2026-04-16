import * as z from "zod";
import { paginationSchema } from "@/shared/schemas/pagination";
import { clientFilterSchema } from "./filter";
import { clientSortSchema } from "./sort";

export const clientSearchSchema = z.object({
	...paginationSchema.shape,
	...clientSortSchema.shape,
	...clientFilterSchema.shape,
});

export type ClientSearch = z.infer<typeof clientSearchSchema>;
