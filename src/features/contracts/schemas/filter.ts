import * as z from "zod";
import {
	activeFilterSchema,
	deletedFilterSchema,
} from "@/shared/schemas/filter";

export const contractFilterSchema = z.object({
	clientId: z.string().catch("").default(""),
	legalArea: z.array(z.string()).catch([]),
	contractStatus: z.array(z.string()).catch([]),
	active: activeFilterSchema,
	status: deletedFilterSchema,
});

export type ContractFilter = z.infer<typeof contractFilterSchema>;
