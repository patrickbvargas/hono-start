import * as z from "zod";

export const employeeFilterSchema = z.object({
	name: z.string().catch(""),
	type: z.array(z.coerce.number<number>()).catch([]),
	role: z.array(z.coerce.number<number>()).catch([]),
	status: z.array(z.string()).catch([]),
	showDeleted: z.boolean().catch(false),
});

export const employeeFilterInputSchema = employeeFilterSchema.extend({
	type: z.array(z.coerce.string<string>()).catch([]),
	role: z.array(z.coerce.string<string>()).catch([]),
});

export type EmployeeFilter = z.infer<typeof employeeFilterSchema>;
export type EmployeeFilterInput = z.infer<typeof employeeFilterInputSchema>;
