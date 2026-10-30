import { getPersonReadScope } from "@/features/people/data/access";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { assertCan, type LoggedUserSession } from "@/shared/session";
export async function getPersonAuditAccessWhere(
	session: LoggedUserSession,
	id: number,
): Promise<Prisma.AuditLogWhereInput> {
	assertCan(session, "org:audit_logs:read");
	const person = await prisma.person.findFirst({
		where: { AND: [{ id }, getPersonReadScope(session)] },
		select: {
			id: true,
			clientProfile: { select: { id: true } },
			supplierProfile: { select: { id: true } },
			employeeProfile: { select: { id: true } },
		},
	});
	if (!person) {
		throw new Error("Pessoa não encontrada.");
	}
	// Historical changes can contain protected profile fields even after role removal.
	if (person.clientProfile) {
		assertCan(session, "org:clients:read");
	}
	if (person.supplierProfile) {
		assertCan(session, "org:suppliers:read");
	}
	if (person.employeeProfile) {
		assertCan(session, "org:employees:read");
	}
	return { personId: id, entityType: { in: ["Person", "Attachment"] } };
}
export async function getPersonAuditEventAccessWhere(
	session: LoggedUserSession,
	id: number,
) {
	const event = await prisma.auditLog.findFirst({
		where: {
			id,
			entityType: { in: ["Person", "Attachment"] },
			personId: { not: null },
		},
		select: { personId: true },
	});
	return event?.personId
		? getPersonAuditAccessWhere(session, event.personId)
		: null;
}
