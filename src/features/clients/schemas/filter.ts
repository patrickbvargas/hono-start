import * as z from "zod";
import {
	activeFilterSchema,
	deletedFilterSchema,
} from "@/shared/schemas/filter";

export const clientFilterSchema = z.object({
	name: z.string().catch(""),
	type: z.array(z.string()).catch([]),
	active: activeFilterSchema,
	status: deletedFilterSchema,
});

export type ClientFilter = z.infer<typeof clientFilterSchema>;
