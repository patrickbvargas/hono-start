import * as z from "zod";
import { paginationSchema } from "@/shared/schemas/pagination";
import { auditLogFilterSchema } from "./filter";
import { auditLogSortSchema } from "./sort";

export const auditLogSearchSchema = z.object({
	...paginationSchema.shape,
	...auditLogSortSchema.shape,
	...auditLogFilterSchema.shape,
});

export type AuditLogSearch = z.infer<typeof auditLogSearchSchema>;

export const auditHistorySchema = z.object({
	entityType: z.string().min(1),
	entityId: z.number().int().positive(),
});
export type AuditHistory = z.infer<typeof auditHistorySchema>;
