import type { NonEmptyKeys } from "@/shared/types/utils";
import type { ExpenseSummary } from "../schemas/model";

export const EXPENSE_ALLOWED_SORT_COLUMNS: NonEmptyKeys<ExpenseSummary> = [
	"id",
	"supplierName",
	"negotiatedAmount",
	"createdAt",
] as const;
