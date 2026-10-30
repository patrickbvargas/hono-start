import type { Prisma } from "@/generated/prisma/client";
import { hasPermission, type LoggedUserSession } from "@/shared/session";
export function getPersonContractScope(
	session: LoggedUserSession,
): Prisma.ContractWhereInput {
	const base: Prisma.ContractWhereInput = { firmId: session.firm.id };
	if (
		!hasPermission(session, "org:contracts:read_all") &&
		!hasPermission(session, "org:contracts:read_assigned")
	) {
		return { ...base, id: -1 };
	}
	if (hasPermission(session, "org:contracts:read_all")) {
		return base;
	}
	const types =
		session.employeeType?.value === "ADMIN_ASSISTANT"
			? ["ADMIN_ASSISTANT"]
			: ["RESPONSIBLE", "RECOMMENDED"];
	return {
		...base,
		assignments: {
			some: {
				employeeProfileId:
					session.employeeProfile?.id ?? session.employee.id ?? -1,
				isActive: true,
				deletedAt: null,
				assignmentType: { value: { in: types } },
			},
		},
	};
}
export function getPersonReadScope(
	session: LoggedUserSession,
): Prisma.PersonWhereInput {
	if (hasPermission(session, "org:people:read")) {
		return {};
	}
	const OR: Prisma.PersonWhereInput[] = [];
	if (hasPermission(session, "org:clients:read")) {
		OR.push({
			clientProfile: {
				is: {
					isActive: true,
					contracts: { some: getPersonContractScope(session) },
				},
			},
		});
	}
	if (hasPermission(session, "org:suppliers:read")) {
		OR.push({ supplierProfile: { is: { isActive: true } } });
	}
	if (hasPermission(session, "org:employees:read")) {
		OR.push({ employeeProfile: { is: { isActive: true, deletedAt: null } } });
	}
	return OR.length ? { OR } : { id: -1 };
}
export function assertPersonDirectoryRead(session: LoggedUserSession) {
	if (
		![
			"org:people:read",
			"org:clients:read",
			"org:suppliers:read",
			"org:employees:read",
		].some((key) =>
			session.permissions.includes(key as (typeof session.permissions)[number]),
		)
	) {
		throw new Error("Você não tem permissão para esta operação.");
	}
}
