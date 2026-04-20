import type { NonEmptyKeys } from "@/shared/types/utils";
import type { FeeSummary } from "../schemas/model";

export const FEE_ALLOWED_SORT_COLUMNS: NonEmptyKeys<FeeSummary> = [
	"amount",
	"createdAt",
	"installmentNumber",
	"paymentDate",
] as const;
