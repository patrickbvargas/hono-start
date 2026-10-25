import * as z from "zod";

export const auditLogFilterSchema = z.object({
	entityId: z.coerce.number().int().positive().optional().catch(undefined),
	query: z.string().trim().catch(""),
	action: z.array(z.string()).catch([]),
	entityType: z.array(z.string()).catch([]),
	actorName: z.array(z.string()).catch([]),
});

export type AuditLogFilter = z.infer<typeof auditLogFilterSchema>;
