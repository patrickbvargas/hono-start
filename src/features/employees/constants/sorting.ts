import type { NonEmptyKeys } from "@/shared/types/utils";
import type { EmployeeSummary } from "../schemas/model";

export const EMPLOYEE_ALLOWED_SORT_COLUMNS: NonEmptyKeys<EmployeeSummary> = [
	"fullName",
	"id",
	"isActive",
	"oabNumber",
	"remunerationPercent",
	"role",
	"type",
] as const;
