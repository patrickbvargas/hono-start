import * as z from "zod";
import {
	activeFilterSchema,
	deletedFilterSchema,
} from "@/shared/schemas/filter";

export const personFilterSchema = z.object({
	query: z.string().trim().catch(""),
	type: z.array(z.string()).catch([]),
	roles: z.array(z.enum(["CLIENT", "SUPPLIER", "EMPLOYEE"])).catch([]),
	employeeType: z.array(z.string()).catch([]),
	active: activeFilterSchema,
	status: deletedFilterSchema,
});

export type PersonFilter = z.infer<typeof personFilterSchema>;
