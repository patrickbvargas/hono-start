import type { NonEmptyKeys } from "@/shared/types/utils";
import type { Remuneration } from "../schemas/model";

export const REMUNERATION_ALLOWED_SORT_COLUMNS: NonEmptyKeys<Remuneration> = [
	"amount",
	"createdAt",
	"effectivePercentage",
	"employeeName",
	"paymentDate",
] as const;
