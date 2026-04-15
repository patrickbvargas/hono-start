import type { NonEmptyKeys } from "@/shared/types/utils";
import type { Fee } from "../schemas/model";

export const FEE_ALLOWED_SORT_COLUMNS: NonEmptyKeys<Fee> = [
	"amount",
	"createdAt",
	"installmentNumber",
	"paymentDate",
] as const;
