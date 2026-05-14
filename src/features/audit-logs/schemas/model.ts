import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";

export type AuditJsonValue =
	| null
	| string
	| number
	| boolean
	| AuditJsonValue[]
	| { [key: string]: AuditJsonValue };

const auditJsonValueSchema: z.ZodType<AuditJsonValue> = z.lazy(() =>
	z.union([
		z.null(),
		z.string(),
		z.number(),
		z.boolean(),
		z.array(auditJsonValueSchema),
		z.record(z.string(), auditJsonValueSchema),
	]),
);

export const auditLogSchema = entityIdSchema.safeExtend({
	occurredAt: z.iso.datetime(),
	occurredAtLabel: z.string(),
	actorName: z.string(),
	actorEmail: z.email().nullable(),
	action: z.string(),
	entityType: z.string(),
	entityTypeLabel: z.string(),
	entityName: z.string(),
	entityId: z.string().nullable(),
	ipAddress: z.string().nullable(),
	userAgent: z.string().nullable(),
	description: z.string(),
});

export const auditLogDetailSchema = auditLogSchema.safeExtend({
	changeData: auditJsonValueSchema,
});

export type AuditLog = z.infer<typeof auditLogSchema>;
export type AuditLogDetail = z.infer<typeof auditLogDetailSchema>;
