import type { NonEmptyKeys } from "@/shared/types/utils";
import type { Employee } from "../schemas/model";

export const EMPLOYEE_DATA_CACHE_KEY = "employee";

export const EMPLOYEE_ALLOWED_SORT_COLUMNS: NonEmptyKeys<Employee> = [
	"fullName",
	"oabNumber",
	"remunerationPercent",
	"role",
	"type",
	"status",
];
