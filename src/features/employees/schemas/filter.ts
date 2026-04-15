import * as z from "zod";
import {
	activeFilterSchema,
	deletedFilterSchema,
} from "@/shared/schemas/filter";

export const employeeFilterSchema = z.object({
	name: z.string().catch(""),
	type: z.array(z.string()).catch([]),
	role: z.array(z.string()).catch([]),
	active: activeFilterSchema,
	status: deletedFilterSchema,
});

export type EmployeeFilter = z.infer<typeof employeeFilterSchema>;
