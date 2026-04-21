import type { z } from "zod";
import { createSortSchema } from "@/shared/schemas/sort";
import { AUDIT_LOG_ALLOWED_SORT_COLUMNS } from "../constants/sort";
import type { AuditLog } from "./model";

export const auditLogSortSchema = createSortSchema<AuditLog>({
	columns: AUDIT_LOG_ALLOWED_SORT_COLUMNS,
	defaultColumn: "occurredAt",
});

export type AuditLogSort = z.infer<typeof auditLogSortSchema>;
