import {
	type AuditLogActor,
	buildAuditUpdateChangeData,
	createAuditLog,
} from "@/features/audit-logs";
import type {
	AssignmentType,
	ContractStatus,
	LegalArea,
	Prisma,
	PrismaClient,
	RevenueType,
} from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/prisma";
import {
	type ContractAccessResource,
	isContractReadOnly,
} from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { CONTRACT_ERRORS } from "../constants/errors";
import {
	CONTRACT_STATUS_ACTIVE_VALUE,
	CONTRACT_STATUS_CANCELLED_VALUE,
	CONTRACT_STATUS_COMPLETED_VALUE,
} from "../constants/values";
import { assertResolvedContractAssignmentRules } from "../rules/assignments";
import { assertContractSectionChanges } from "../rules/permissions";
import type {
	ContractAssignmentInput,
	ContractCreateInput,
	ContractRevenueInput,
	ContractUpdateInput,
} from "../schemas/form";
import { defaultContractUpdateValues } from "../utils/default";
import { normalizeOptionalText } from "../utils/normalization";
import {
	getAssignmentTypesByValues,
	getContractAccessResourceById,
	getContractById,
	getContractStatusByValue,
	getLegalAreaByValue,
	getRevenueTypesByValues,
} from "./queries";

interface ContractWriteScope {
	firmId: number;
}

interface CreateContractParams {
	actor?: AuditLogActor;
	scope: ContractWriteScope;
	input: ContractCreateInput;
	canManageStatusLock: boolean;
}

interface UpdateContractParams {
	actor?: AuditLogActor;
	scope: ContractWriteScope;
	input: ContractUpdateInput;
	canManageStatusLock: boolean;
	canChangeStatus: boolean;
	canManageAssignments: boolean;
	canManageRevenues: boolean;
}

interface ContractLookupSelectionInput {
	legalArea: string;
	status: string;
}

interface ContractLookupSelection {
	legalArea: LegalArea;
	status: ContractStatus;
}

export type ResolvedContractAssignment = Omit<
	ContractAssignmentInput,
	"assignmentType"
> & {
	assignmentType: AssignmentType;
	employee: {
		id: number;
		fullName?: string;
		remunerationPercentage: Prisma.Decimal | number | string;
		referralPercentage: Prisma.Decimal | number | string;
		type: { id?: number; label?: string; value: string; isActive?: boolean };
		isActive?: boolean;
		deletedAt?: Date | null;
		[key: string]: unknown;
	};
};

export type ResolvedContractRevenue = Omit<ContractRevenueInput, "type"> & {
	type: RevenueType;
};

export function assertContractLookupSelections(
	selection: ContractLookupSelection,
	options: {
		currentLegalAreaId?: number;
		currentStatusId?: number;
	} = {},
) {
	if (
		!selection.legalArea.isActive &&
		selection.legalArea.id !== options.currentLegalAreaId
	) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_LEGAL_AREA_INACTIVE);
	}

	if (
		!selection.status.isActive &&
		selection.status.id !== options.currentStatusId
	) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_STATUS_INACTIVE);
	}
}

export async function resolveContractLookupSelections(
	input: ContractLookupSelectionInput,
) {
	const [legalArea, status] = await Promise.all([
		getLegalAreaByValue(input.legalArea),
		getContractStatusByValue(input.status),
	]);

	if (!legalArea) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_NOT_FOUND);
	}

	if (!status) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_NOT_FOUND);
	}

	return { legalArea, status };
}

export async function resolveContractAssignments(
	db: PrismaClient,
	_firmId: number,
	assignments: ContractAssignmentInput[],
): Promise<ResolvedContractAssignment[]> {
	const [employees, types] = await Promise.all([
		db.employeeProfile.findMany({
			where: { id: { in: assignments.map((a) => Number(a.employeeId)) } },
			include: {
				person: { include: { supplierProfile: true } },
				employeeType: true,
			},
		}),
		getAssignmentTypesByValues(assignments.map((a) => a.assignmentType)),
	]);
	return assignments.map((a) => {
		const employee = employees.find((e) => e.id === Number(a.employeeId)),
			assignmentType = types.find((t) => t.value === a.assignmentType);
		if (!employee) {
			throw new Error(CONTRACT_ERRORS.CONTRACT_EMPLOYEE_NOT_FOUND);
		}
		if (
			!employee.isActive ||
			employee.deletedAt ||
			!employee.person.isActive ||
			employee.person.deletedAt ||
			!employee.person.supplierProfile?.isActive
		) {
			throw new Error(CONTRACT_ERRORS.CONTRACT_EMPLOYEE_INACTIVE);
		}
		if (!assignmentType) {
			throw new Error(CONTRACT_ERRORS.CONTRACT_ASSIGNMENT_TYPE_NOT_FOUND);
		}
		if (!assignmentType.isActive) {
			throw new Error(CONTRACT_ERRORS.CONTRACT_ASSIGNMENT_TYPE_INACTIVE);
		}
		return {
			...a,
			assignmentType,
			employee: {
				id: employee.id,
				fullName: employee.person.fullName,
				remunerationPercentage: employee.remunerationPercentage,
				referralPercentage: employee.referralPercentage,
				type: employee.employeeType,
				isActive: employee.isActive,
				deletedAt: employee.deletedAt,
			},
		};
	});
}

export async function resolveRevenueTypes(
	revenues: ContractRevenueInput[],
): Promise<ResolvedContractRevenue[]> {
	const revenueTypeValues = revenues.map((revenue) => revenue.type);
	const revenueTypes = await getRevenueTypesByValues(revenueTypeValues);

	return revenues.map((revenue) => {
		const type = revenueTypes.find((item) => item.value === revenue.type);

		if (!type) {
			throw new Error(CONTRACT_ERRORS.CONTRACT_REVENUE_TYPE_NOT_FOUND);
		}

		if (!type.isActive) {
			throw new Error(CONTRACT_ERRORS.CONTRACT_REVENUE_TYPE_INACTIVE);
		}

		return { ...revenue, type };
	});
}

async function syncAssignments(
	tx: Prisma.TransactionClient,
	params: {
		contractId: number;
		firmId: number;
		assignments: ResolvedContractAssignment[];
	},
) {
	const existing = await tx.contractAssignment.findMany({
		where: { contractId: params.contractId, firmId: params.firmId },
		select: { id: true },
	});
	const ids = new Set(existing.map((a) => a.id)),
		incoming = new Set(params.assignments.map((a) => a.id));
	for (const assignment of params.assignments) {
		const data = {
			firmId: params.firmId,
			employeeProfileId: assignment.employee.id,
			assignmentTypeId: assignment.assignmentType.id,
			isActive: assignment.isActive,
			deletedAt: null,
		};
		if (assignment.id !== undefined) {
			if (!ids.has(assignment.id)) {
				throw new Error(CONTRACT_ERRORS.CONTRACT_NOT_FOUND);
			}
			await tx.contractAssignment.update({
				where: { id: assignment.id, firmId: params.firmId },
				data,
			});
		} else {
			await tx.contractAssignment.create({
				data: { ...data, contractId: params.contractId },
			});
		}
	}
	for (const assignment of existing) {
		if (!incoming.has(assignment.id)) {
			await tx.contractAssignment.update({
				where: { id: assignment.id, firmId: params.firmId },
				data: { deletedAt: new Date() },
			});
		}
	}
}
async function syncRevenues(
	tx: Prisma.TransactionClient,
	params: {
		contractId: number;
		firmId: number;
		revenues: ResolvedContractRevenue[];
	},
) {
	const existing = await tx.revenue.findMany({
		where: { contractId: params.contractId, firmId: params.firmId },
		select: { id: true },
	});
	const ids = new Set(existing.map((r) => r.id)),
		incoming = new Set(params.revenues.map((r) => r.id));
	for (const revenue of params.revenues) {
		const data = {
			firmId: params.firmId,
			revenueTypeId: revenue.type.id,
			negotiatedAmount: revenue.totalValue,
			notes: normalizeOptionalText(revenue.notes),
			isActive: revenue.isActive,
			deletedAt: null,
		};
		if (revenue.id !== undefined) {
			if (!ids.has(revenue.id)) {
				throw new Error(CONTRACT_ERRORS.CONTRACT_NOT_FOUND);
			}
			await tx.revenue.update({
				where: { id: revenue.id, firmId: params.firmId },
				data,
			});
		} else {
			await tx.revenue.create({
				data: { ...data, contractId: params.contractId },
			});
		}
	}
	for (const revenue of existing) {
		if (!incoming.has(revenue.id)) {
			await tx.revenue.update({
				where: { id: revenue.id, firmId: params.firmId },
				data: { deletedAt: new Date() },
			});
		}
	}
}

export async function createContract({
	actor,
	scope,
	input,
	canManageStatusLock,
}: CreateContractParams): Promise<MutationReturnType> {
	if (!canManageStatusLock && !input.allowStatusChange) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_STATUS_LOCK_FORBIDDEN);
	}

	const clientId = Number(input.clientId);
	const client = await prisma.clientProfile.findFirst({
		where: {
			id: clientId,
			isActive: true,
			person: { deletedAt: null, isActive: true },
		},
		select: { id: true },
	});

	if (!client) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_CLIENT_INACTIVE);
	}

	const { legalArea, status } = await resolveContractLookupSelections(input);
	assertContractLookupSelections({ legalArea, status });

	if (status.value !== CONTRACT_STATUS_ACTIVE_VALUE) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_NEW_STATUS_REQUIRED);
	}

	const resolvedAssignments = await resolveContractAssignments(
		prisma,
		scope.firmId,
		input.assignments,
	);
	const resolvedRevenues = await resolveRevenueTypes(input.revenues);
	assertResolvedContractAssignmentRules(resolvedAssignments);

	await prisma.$transaction(async (tx) => {
		const contract = await tx.contract.create({
			data: {
				firmId: scope.firmId,
				customerId: clientId,
				legalAreaId: legalArea.id,
				statusId: status.id,
				processNumber: input.processNumber.trim(),
				feePercentage: input.feePercentage,
				notes: normalizeOptionalText(input.notes),
				allowStatusChange: canManageStatusLock ? input.allowStatusChange : true,
				isActive: input.isActive,
			},
		});

		if (resolvedAssignments.length) {
			await tx.contractAssignment.createMany({
				data: resolvedAssignments.map((a) => ({
					firmId: scope.firmId,
					contractId: contract.id,
					employeeProfileId: a.employee.id,
					assignmentTypeId: a.assignmentType.id,
					isActive: a.isActive,
				})),
			});
		}
		if (resolvedRevenues.length) {
			await tx.revenue.createMany({
				data: resolvedRevenues.map((r) => ({
					firmId: scope.firmId,
					contractId: contract.id,
					revenueTypeId: r.type.id,
					negotiatedAmount: r.totalValue,
					notes: normalizeOptionalText(r.notes),
					isActive: r.isActive,
				})),
			});
		}

		await createAuditLog(tx, {
			firmId: scope.firmId,
			actor,
			action: "CREATE",
			entityType: "Contract",
			entityId: contract.id,
			entityName: contract.processNumber,
			changeData: input,
			description: `Criou contrato ${contract.processNumber}.`,
		});
	});

	return { success: true };
}

export async function updateContract({
	actor,
	scope,
	input,
	canManageStatusLock,
	canChangeStatus,
	canManageAssignments,
	canManageRevenues,
}: UpdateContractParams): Promise<MutationReturnType> {
	const access = await getContractAccessResourceById(input.id);

	if (!access?.resource || access.resource.firmId !== scope.firmId) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_NOT_FOUND);
	}

	if (isContractReadOnly(access.resource as ContractAccessResource)) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_READ_ONLY);
	}

	const existing = await prisma.contract.findFirst({
		where: { id: input.id, firmId: scope.firmId },
		include: {
			status: true,
		},
	});

	if (!existing) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_NOT_FOUND);
	}

	if (
		!canManageStatusLock &&
		input.allowStatusChange !== existing.allowStatusChange
	) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_STATUS_LOCK_FORBIDDEN);
	}

	const { legalArea, status } = await resolveContractLookupSelections(input);
	assertContractLookupSelections(
		{ legalArea, status },
		{
			currentLegalAreaId: existing.legalAreaId,
			currentStatusId: existing.statusId,
		},
	);

	if (!canChangeStatus && status.id !== existing.statusId) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_STATUS_CHANGE_FORBIDDEN);
	}

	if (status.id !== existing.statusId && !existing.allowStatusChange) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_STATUS_CHANGE_LOCKED);
	}

	if (
		existing.status.value === CONTRACT_STATUS_COMPLETED_VALUE ||
		existing.status.value === CONTRACT_STATUS_CANCELLED_VALUE
	) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_READ_ONLY);
	}

	const before = await getContractById({
		scope: {
			firmId: scope.firmId,
			isAdmin: true,
		},
		id: input.id,
	});

	if (!canManageAssignments || !canManageRevenues) {
		assertContractSectionChanges({
			input,
			existing: defaultContractUpdateValues(before),
			canManageAssignments,
			canManageRevenues,
		});
	}

	const clientId = Number(input.clientId);
	const client = await prisma.clientProfile.findFirst({
		where: {
			id: clientId,
			isActive: true,
			person: { deletedAt: null, isActive: true },
		},
		select: { id: true },
	});

	if (!client) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_CLIENT_INACTIVE);
	}

	const resolvedAssignments = await resolveContractAssignments(
		prisma,
		scope.firmId,
		input.assignments,
	);
	const resolvedRevenues = await resolveRevenueTypes(input.revenues);
	assertResolvedContractAssignmentRules(resolvedAssignments);

	await prisma.$transaction(async (tx) => {
		await tx.contract.update({
			where: { id: input.id },
			data: {
				customerId: clientId,
				legalAreaId: legalArea.id,
				statusId: status.id,
				processNumber: input.processNumber.trim(),
				feePercentage: input.feePercentage,
				notes: normalizeOptionalText(input.notes),
				allowStatusChange: canManageStatusLock
					? input.allowStatusChange
					: existing.allowStatusChange,
				isActive: input.isActive,
			},
		});

		if (canManageAssignments) {
			await syncAssignments(tx, {
				contractId: input.id,
				firmId: scope.firmId,
				assignments: resolvedAssignments,
			});
		}

		if (canManageRevenues) {
			await syncRevenues(tx, {
				contractId: input.id,
				firmId: scope.firmId,
				revenues: resolvedRevenues,
			});
		}

		await createAuditLog(tx, {
			firmId: scope.firmId,
			actor,
			action: "UPDATE",
			entityType: "Contract",
			entityId: input.id,
			entityName: input.processNumber,
			changeData: buildAuditUpdateChangeData({
				before,
				after: input,
			}),
			description: `Atualizou contrato ${input.processNumber}.`,
		});
	});

	return { success: true };
}

export async function deleteContract({
	actor,
	firmId,
	id,
}: ContractWriteScope & {
	actor?: AuditLogActor;
	id: number;
}): Promise<MutationReturnType> {
	const access = await getContractAccessResourceById(id);

	if (!access?.resource || access.resource.firmId !== firmId) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_NOT_FOUND);
	}

	if (access.hasActiveRevenues) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_HAS_ACTIVE_REVENUES);
	}

	const contract = await getContractById({
		scope: { firmId, isAdmin: true },
		id,
	});

	if (contract.isSoftDeleted) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_NOT_FOUND);
	}

	await prisma.$transaction(async (tx) => {
		await tx.contract.update({
			where: { id },
			data: { deletedAt: new Date() },
		});

		await createAuditLog(tx, {
			firmId,
			actor,
			action: "DELETE",
			entityType: "Contract",
			entityId: id,
			entityName: contract.processNumber,
			changeData: { before: contract },
			description: `Excluiu contrato ${contract.processNumber}.`,
		});
	});

	return { success: true };
}

export async function restoreContract({
	actor,
	firmId,
	id,
}: ContractWriteScope & {
	actor?: AuditLogActor;
	id: number;
}): Promise<MutationReturnType> {
	const access = await getContractAccessResourceById(id);

	if (!access?.resource || access.resource.firmId !== firmId) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_NOT_FOUND);
	}

	const contract = await getContractById({
		scope: { firmId, isAdmin: true },
		id,
	});

	if (!contract.isSoftDeleted) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_NOT_FOUND);
	}

	await prisma.$transaction(async (tx) => {
		await tx.contract.update({
			where: { id },
			data: { deletedAt: null },
		});

		await createAuditLog(tx, {
			firmId,
			actor,
			action: "RESTORE",
			entityType: "Contract",
			entityId: id,
			entityName: contract.processNumber,
			changeData: { before: contract },
			description: `Restaurou contrato ${contract.processNumber}.`,
		});
	});

	return { success: true };
}
