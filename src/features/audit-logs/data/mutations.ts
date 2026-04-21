import type { Prisma, PrismaClient } from "@/generated/prisma/client";

export interface AuditLogActor {
	id: number;
	name: string;
	email: string | null;
}

export interface CreateAuditLogInput {
	firmId: number;
	actor?: AuditLogActor;
	action: string;
	entityType: string;
	entityId: number | string | null;
	entityName: string;
	changeData: unknown;
	description: string;
	ipAddress?: string | null;
	userAgent?: string | null;
}

type AuditLogDb = PrismaClient | Prisma.TransactionClient;

function toAuditJson(value: unknown): Prisma.InputJsonValue {
	return JSON.parse(JSON.stringify(value ?? null)) as Prisma.InputJsonValue;
}

export async function createAuditLog(
	db: AuditLogDb,
	{
		firmId,
		actor,
		action,
		entityType,
		entityId,
		entityName,
		changeData,
		description,
		ipAddress = null,
		userAgent = null,
	}: CreateAuditLogInput,
) {
	await db.auditLog.create({
		data: {
			firmId,
			actorId: actor?.id ?? null,
			actorName: actor?.name ?? "Sistema",
			actorEmail: actor?.email ?? null,
			action,
			entityType,
			entityId: entityId == null ? null : String(entityId),
			entityName,
			changeData: toAuditJson(changeData),
			description,
			ipAddress,
			userAgent,
		},
	});
}
