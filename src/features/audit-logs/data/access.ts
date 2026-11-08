import { getPersonReadWhere } from "@/features/people";
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

	const branches: Prisma.AuditLogWhereInput[] = [];
	branches.push({
		entityType: { in: ["Person", "Attachment"] },
		person: {
			is: {
				AND: [
					getPersonReadWhere(session),
					...(!hasPermission(session, "org:clients:read")
						? [{ clientProfile: { is: null } }]
						: []),
					...(!hasPermission(session, "org:suppliers:read")
						? [{ supplierProfile: { is: null } }]
						: []),
					...(!hasPermission(session, "org:employees:read")
						? [{ employeeProfile: { is: null } }]
						: []),
				],
			},
		},
	});
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
				employeeProfileId: session.employee.id ?? -1,
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
	if (
		hasPermission(session, "org:receivables:read_all") ||
		(hasPermission(session, "org:receivables:read_assigned") &&
			session.employee.id !== null)
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
	if (
		hasPermission(session, "org:payables:read_all") ||
		(hasPermission(session, "org:payables:read_own") &&
			session.person?.id !== undefined &&
			session.employee.id !== null)
	) {
		const titles = await prisma.payable.findMany({
			where: {
				firmId,
				...(hasPermission(session, "org:payables:read_all")
					? {}
					: {
							beneficiary: { personId: session.person?.id ?? -1 },
							remunerationPayable: {
								firmId,
								contractAssignment: { firmId, contract: assignedContract },
							},
						}),
			},
			select: { id: true },
		});
		branches.push({
			firmId,
			entityType: "Payable",
			entityId: { in: titles.map(({ id }) => String(id)) },
		});
	}
	if (hasPermission(session, "org:expenses:read")) {
		addOwner("Expense", "expense", "expenseId");
	}
	branches.push({
		firmId,
		personId: null,
		OR: operational,
	});
	return { OR: branches };
}
