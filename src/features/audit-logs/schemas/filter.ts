import * as z from "zod";

export const auditLogFilterSchema = z.object({
	action: z.array(z.string()).catch([]),
	entityType: z.array(z.string()).catch([]),
	actorName: z.array(z.string()).catch([]),
});

export type AuditLogFilter = z.infer<typeof auditLogFilterSchema>;
