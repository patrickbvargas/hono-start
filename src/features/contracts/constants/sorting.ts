import type { NonEmptyKeys } from "@/shared/types/utils";
import type { ContractSummary } from "../schemas/model";

export const CONTRACT_ALLOWED_SORT_COLUMNS: NonEmptyKeys<ContractSummary> = [
	"client",
	"createdAt",
	"feePercentage",
	"legalArea",
	"processNumber",
	"status",
] as const;
