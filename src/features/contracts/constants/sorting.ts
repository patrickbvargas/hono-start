import type { NonEmptyKeys } from "@/shared/types/utils";
import type { Contract } from "../schemas/model";

export const CONTRACT_ALLOWED_SORT_COLUMNS: NonEmptyKeys<Contract> = [
	"client",
	"createdAt",
	"feePercentage",
	"legalArea",
	"processNumber",
	"status",
] as const;
