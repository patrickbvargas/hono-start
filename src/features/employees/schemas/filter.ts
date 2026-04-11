import * as z from "zod";

export const employeeFilterSchema = z.object({
	name: z.string().catch(""),
	type: z.array(z.coerce.number<number>()).catch([]),
	role: z.array(z.coerce.number<number>()).catch([]),
	status: z.array(z.string()).catch([]),
	showDeleted: z.boolean().catch(false),
});

export type EmployeeFilter = z.infer<typeof employeeFilterSchema>;
