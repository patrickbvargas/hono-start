import * as z from "zod";
import { paginationSchema } from "@/shared/schemas/pagination";
import { employeeFilterSchema } from "./filter";
import { employeeSortSchema } from "./sort";

export const employeeSearchSchema = z.object({
	...employeeSortSchema.shape,
	...employeeFilterSchema.shape,
	...paginationSchema.shape,
});

export type EmployeeSearch = z.infer<typeof employeeSearchSchema>;
