import type { z } from "zod";
import { createSortSchema } from "@/shared/schemas/sort";
import type { NonEmptyKeys } from "@/shared/types/utils";
import type { Employee } from "./model";

export const EMPLOYEE_SORT_COLUMNS: NonEmptyKeys<Employee> = [
	"fullName",
	"oabNumber",
	"remunerationPercent",
	"role",
	"type",
	"status",
];

export const employeeSortSchema = createSortSchema<Employee>({
	columns: EMPLOYEE_SORT_COLUMNS,
	defaultColumn: "fullName",
});

export type EmployeeSort = z.infer<typeof employeeSortSchema>;
