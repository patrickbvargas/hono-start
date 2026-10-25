import type { NonEmptyKeys } from "@/shared/types/utils";
import type { PendingWork } from "../schemas/model";

export const PENDING_WORK_ALLOWED_SORT_COLUMNS: NonEmptyKeys<PendingWork> = [
	"severity",
	"title",
	"processNumber",
	"client",
	"dueDate",
	"remainingAmount",
] as const;
