import type { NonEmptyKeys } from "@/shared/types/utils";
import type { AuditLog } from "../schemas/model";

export const AUDIT_LOG_ALLOWED_SORT_COLUMNS: NonEmptyKeys<AuditLog> = [
	"occurredAt",
	"actorName",
	"action",
	"entityType",
	"entityName",
] as const;
