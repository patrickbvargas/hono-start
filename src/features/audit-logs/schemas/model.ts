import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";

export const auditLogSchema = entityIdSchema.safeExtend({
	occurredAt: z.iso.datetime(),
	actorName: z.string(),
	actorEmail: z.email().nullable(),
	action: z.string(),
	entityType: z.string(),
	entityName: z.string(),
	entityId: z.string().nullable(),
	ipAddress: z.string().nullable(),
	userAgent: z.string().nullable(),
	description: z.string(),
});

export type AuditLog = z.infer<typeof auditLogSchema>;
