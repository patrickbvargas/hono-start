import * as z from "zod";

export const employeeFilterSchema = z.object({
	type: z.array(z.string()).catch([]),
	role: z.array(z.string()).catch([]),
	status: z.array(z.string()).catch([]),
});

export type EmployeeFilter = z.infer<typeof employeeFilterSchema>;
