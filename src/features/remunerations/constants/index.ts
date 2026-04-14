import type { NonEmptyKeys } from "@/shared/types/utils";
import type { Remuneration } from "../schemas/model";

export const REMUNERATION_DATA_CACHE_KEY = "remuneration" as const;

export const REMUNERATION_ALLOWED_SORT_COLUMNS: NonEmptyKeys<Remuneration> = [
	"amount",
	"createdAt",
	"effectivePercentage",
	"employeeName",
	"paymentDate",
] as const;

export const REMUNERATION_EXPORT_FORMATS = [
	{ value: "pdf", label: "PDF" },
	{ value: "spreadsheet", label: "Planilha (.csv)" },
] as const;
