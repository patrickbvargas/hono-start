import type { NonEmptyKeys } from "@/shared/types/utils";
import type { Employee } from "../schemas/model";

export const EMPLOYEE_DATA_CACHE_KEY = "employee" as const;

export const ADMIN_TYPE_VALUE = "ADMIN" as const;
export const LAWYER_TYPE_VALUE = "LAWYER" as const;
export const ADMIN_ASSISTANT_TYPE_VALUE = "ADMIN_ASSISTANT" as const;

export const EMPLOYEE_ALLOWED_SORT_COLUMNS: NonEmptyKeys<Employee> = [
	"fullName",
	"isActive",
	"oabNumber",
	"remunerationPercent",
	"role",
	"type",
] as const;
