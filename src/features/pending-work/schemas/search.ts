import * as z from "zod";
import { pendingWorkFilterSchema } from "./filter";
import { pendingWorkSortSchema } from "./sort";

export const pendingWorkSearchSchema = z.object({
	...pendingWorkFilterSchema.shape,
	...pendingWorkSortSchema.shape,
	page: z.coerce.number().int().min(1).max(1000000).catch(1),
	limit: z.coerce.number().int().min(1).max(100).catch(25),
});

export const pendingWorkSearchDefaults = pendingWorkSearchSchema.parse({});
export type PendingWorkSearch = z.infer<typeof pendingWorkSearchSchema>;
