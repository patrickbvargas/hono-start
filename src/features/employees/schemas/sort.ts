import type { z } from "zod";
import { createSortSchema } from "@/shared/schemas/sort";
import { EMPLOYEE_ALLOWED_SORT_COLUMNS } from "../constants";
import type { EmployeeSummary } from "./model";

export const employeeSortSchema = createSortSchema<EmployeeSummary>({
	columns: EMPLOYEE_ALLOWED_SORT_COLUMNS,
	defaultColumn: "fullName",
});

export type EmployeeSort = z.infer<typeof employeeSortSchema>;
