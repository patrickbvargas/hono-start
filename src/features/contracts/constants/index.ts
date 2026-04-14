import type { NonEmptyKeys } from "@/shared/types/utils";
import type { Contract } from "../schemas/model";

export const CONTRACT_DATA_CACHE_KEY = "contract" as const;

export const CONTRACT_ALLOWED_SORT_COLUMNS: NonEmptyKeys<Contract> = [
	"client",
	"createdAt",
	"feePercentage",
	"legalArea",
	"processNumber",
	"status",
] as const;

export const CONTRACT_STATUS_ACTIVE_VALUE = "ACTIVE" as const;
export const CONTRACT_STATUS_COMPLETED_VALUE = "COMPLETED" as const;
export const CONTRACT_STATUS_CANCELLED_VALUE = "CANCELLED" as const;

export const ASSIGNMENT_TYPE_RESPONSIBLE_VALUE = "RESPONSIBLE" as const;
export const ASSIGNMENT_TYPE_RECOMMENDING_VALUE = "RECOMMENDING" as const;
export const ASSIGNMENT_TYPE_RECOMMENDED_VALUE = "RECOMMENDED" as const;
export const ASSIGNMENT_TYPE_ADMIN_ASSISTANT_VALUE = "ADMIN_ASSISTANT" as const;

export const EMPLOYEE_TYPE_LAWYER_VALUE = "LAWYER" as const;
export const EMPLOYEE_TYPE_ADMIN_ASSISTANT_VALUE = "ADMIN_ASSISTANT" as const;

export const CONTRACT_MAX_REVENUES = 3 as const;
export const CONTRACT_MAX_EMPLOYEES = 3 as const;
