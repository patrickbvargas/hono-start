import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/prisma";
import {
	assertCan,
	hasPermission,
	type LoggedUserSession,
	SESSION_ASSIGNMENT_TYPE_ADMIN_ASSISTANT_VALUE,
	SESSION_ASSIGNMENT_TYPE_RECOMMENDED_VALUE,
	SESSION_ASSIGNMENT_TYPE_RESPONSIBLE_VALUE,
	SESSION_EMPLOYEE_TYPE_ADMIN_ASSISTANT_VALUE,
	SESSION_EMPLOYEE_TYPE_LAWYER_VALUE,
} from "@/shared/session";

// Audit permission permits entry; each audited subject retains its own read scope.
export async function getAuditAccessWhere(
	session: LoggedUserSession,
): Promise<Prisma.AuditLogWhereInput> {
	assertCan(session, "org:audit_logs:read");
	const firmId = session.firm.id;
	const isProfile = Boolean(prisma.clientProfile || prisma.employeeProfile);

	const branches: Prisma.AuditLogWhereInput[] = [];
	if (hasPermission(session, "org:clients:read")) {
		branches.push(
			isProfile
				? { personId: { not: null } }
				: ({ clientId: { not: null } } as unknown as Prisma.AuditLogWhereInput),
		);
	}
	if (hasPermission(session, "org:employees:read")) {
		branches.push(
			isProfile
				? { personId: { not: null } }
				: ({
						employeeId: { not: null },
					} as unknown as Prisma.AuditLogWhereInput),
		);
	}
	const assignmentTypes =
		session.employeeType?.value === SESSION_EMPLOYEE_TYPE_ADMIN_ASSISTANT_VALUE
			? [SESSION_ASSIGNMENT_TYPE_ADMIN_ASSISTANT_VALUE]
			: session.employeeType?.value === SESSION_EMPLOYEE_TYPE_LAWYER_VALUE
				? [
						SESSION_ASSIGNMENT_TYPE_RESPONSIBLE_VALUE,
						SESSION_ASSIGNMENT_TYPE_RECOMMENDED_VALUE,
					]
				: [];
	const assignedContract: Prisma.ContractWhereInput = {
		firmId,
		assignments: {
			some: {
				firmId,
				...(isProfile
					? { employeeProfileId: session.employee.id ?? -1 }
					: { employeeId: session.employee.id ?? -1 }),
				isActive: true,
				deletedAt: null,
				assignmentType: { value: { in: assignmentTypes } },
			},
		},
	};
	const operational: Prisma.AuditLogWhereInput[] = [];
	function addOwner(
		entityType: string,
		ownerKind: string,
		ownerField: string,
		ids?: number[],
	) {
		operational.push({
			entityType,
			...(ids ? { entityId: { in: ids.map(String) } } : {}),
		});
		// Upload events store ownerKind/ownerId; deletion events retain the owner
		// in the before snapshot, so authorization survives physical file removal.
		const ownerValues = ids ?? [undefined];
		operational.push({
			entityType: "Attachment",
			OR: ownerValues.flatMap((id) => [
				{
					AND: [
						{ changeData: { path: ["ownerKind"], equals: ownerKind } },
						{
							changeData: {
								path: ["ownerId"],
								...(id === undefined ? { gt: 0 } : { equals: id }),
							},
						},
					],
				},
				{
					changeData: {
						path: ["before", ownerField],
						...(id === undefined ? { gt: 0 } : { equals: id }),
					},
				},
			]),
		});
	}
	if (hasPermission(session, "org:contracts:read_all")) {
		addOwner("Contract", "contract", "contractId");
	} else if (
		hasPermission(session, "org:contracts:read_assigned") &&
		session.employee.id !== null
	) {
		const contracts = await prisma.contract.findMany({
			where: assignedContract,
			select: { id: true },
		});
		addOwner(
			"Contract",
			"contract",
			"contractId",
			contracts.map(({ id }) => id),
		);
	}
	const feeModel = (prisma as unknown as Record<string, unknown>).fee as
		| { findMany: (args: unknown) => Promise<Array<{ id: number }>> }
		| undefined;
	if (feeModel && hasPermission(session, "org:fees:read_all")) {
		addOwner("Fee", "fee", "feeId");
	} else if (
		feeModel &&
		hasPermission(session, "org:fees:read_assigned") &&
		session.employee.id !== null
	) {
		const fees = await feeModel.findMany({
			where: { firmId, revenue: { firmId, contract: assignedContract } },
			select: { id: true },
		});
		addOwner(
			"Fee",
			"fee",
			"feeId",
			fees.map(({ id }) => id),
		);
	}
	const remunerationModel = (prisma as unknown as Record<string, unknown>)
		.remuneration as
		| { findMany: (args: unknown) => Promise<Array<{ id: number }>> }
		| undefined;
	if (
		remunerationModel &&
		hasPermission(session, "org:remunerations:read_all")
	) {
		addOwner("Remuneration", "remuneration", "remunerationId");
	} else if (
		remunerationModel &&
		hasPermission(session, "org:remunerations:read_own") &&
		session.employee.id !== null
	) {
		const remunerations = await remunerationModel.findMany({
			where: {
				firmId,
				contractEmployee: { firmId, employeeId: session.employee.id },
			},
			select: { id: true },
		});
		addOwner(
			"Remuneration",
			"remuneration",
			"remunerationId",
			remunerations.map(({ id }) => id),
		);
	}
	if (
		hasPermission(session, "org:receivables:read_all") ||
		hasPermission(session, "org:receivables:read_assigned")
	) {
		const titles = await prisma.receivable.findMany({
			where: {
				firmId,
				...(hasPermission(session, "org:receivables:read_all")
					? {}
					: { contractRevenueReceivable: { contract: assignedContract } }),
			},
			select: { id: true },
		});
		branches.push({
			firmId,
			entityType: "Receivable",
			entityId: { in: titles.map(({ id }) => String(id)) },
		});
	}
	if (hasPermission(session, "org:expenses:read")) {
		addOwner("Expense", "expense", "expenseId");
	}
	branches.push({
		firmId,
		...(isProfile
			? { personId: null }
			: ({
					clientId: null,
					employeeId: null,
				} as unknown as Prisma.AuditLogWhereInput)),
		OR: operational,
	});
	return { OR: branches };
}
