import * as z from "zod";
import { paginationSchema } from "@/shared/schemas/pagination";
import { employeeFilterSchema } from "./filter";
import { employeeSortSchema } from "./sort";

export const employeeSearchSchema = z.object({
	...paginationSchema.shape,
	...employeeSortSchema.shape,
	...employeeFilterSchema.shape,
});

export type EmployeeSearch = z.infer<typeof employeeSearchSchema>;
