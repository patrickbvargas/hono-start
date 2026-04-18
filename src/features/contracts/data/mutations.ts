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
import {
	CONTRACT_STATUS_ACTIVE_VALUE,
	CONTRACT_STATUS_CANCELLED_VALUE,
	CONTRACT_STATUS_COMPLETED_VALUE,
} from "../constants";
import { CONTRACT_ERRORS } from "../constants/errors";
import { assertResolvedContractAssignmentRules } from "../rules/assignments";
import type {
	ContractAssignmentInput,
	ContractCreateInput,
	ContractRevenueInput,
	ContractUpdateInput,
} from "../schemas/form";
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
	scope: ContractWriteScope;
	input: ContractCreateInput;
	isAdmin: boolean;
}

interface UpdateContractParams {
	scope: ContractWriteScope;
	input: ContractUpdateInput;
	isAdmin: boolean;
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
	employee: Prisma.EmployeeGetPayload<{
		include: { type: true };
	}>;
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
	firmId: number,
	assignments: ContractAssignmentInput[],
): Promise<ResolvedContractAssignment[]> {
	const employeeIds = assignments.map((assignment) =>
		Number(assignment.employeeId),
	);
	const assignmentTypeValues = assignments.map(
		(assignment) => assignment.assignmentType,
	);

	const [employees, assignmentTypes] = await Promise.all([
		db.employee.findMany({
			where: { firmId, id: { in: employeeIds } },
			include: { type: true },
		}),
		getAssignmentTypesByValues(assignmentTypeValues),
	]);

	return assignments.map((assignment) => {
		const employee = employees.find(
			(item) => item.id === Number(assignment.employeeId),
		);
		const assignmentType = assignmentTypes.find(
			(item) => item.value === assignment.assignmentType,
		);

		if (!employee) {
			throw new Error(CONTRACT_ERRORS.CONTRACT_EMPLOYEE_NOT_FOUND);
		}

		if (employee.deletedAt || !employee.isActive) {
			throw new Error(CONTRACT_ERRORS.CONTRACT_EMPLOYEE_INACTIVE);
		}

		if (!assignmentType) {
			throw new Error(CONTRACT_ERRORS.CONTRACT_ASSIGNMENT_TYPE_NOT_FOUND);
		}

		if (!assignmentType.isActive) {
			throw new Error(CONTRACT_ERRORS.CONTRACT_ASSIGNMENT_TYPE_INACTIVE);
		}

		return {
			...assignment,
			employee,
			assignmentType,
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
	const existingAssignments = await tx.contractEmployee.findMany({
		where: { contractId: params.contractId },
		select: { id: true },
	});
	const existingIds = new Set(
		existingAssignments.map((assignment) => assignment.id),
	);
	const incomingIds = new Set(
		params.assignments
			.map((assignment) => assignment.id)
			.filter((id): id is number => typeof id === "number"),
	);

	for (const assignment of params.assignments) {
		const data = {
			firmId: params.firmId,
			employeeId: assignment.employee.id,
			assignmentTypeId: assignment.assignmentType.id,
			isActive: assignment.isActive,
			deletedAt: null,
		};

		if (typeof assignment.id === "number" && existingIds.has(assignment.id)) {
			await tx.contractEmployee.update({
				where: { id: assignment.id },
				data,
			});
			continue;
		}

		await tx.contractEmployee.create({
			data: {
				...data,
				contractId: params.contractId,
			},
		});
	}

	for (const assignment of existingAssignments) {
		if (!incomingIds.has(assignment.id)) {
			await tx.contractEmployee.update({
				where: { id: assignment.id },
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
	const existingRevenues = await tx.revenue.findMany({
		where: { contractId: params.contractId },
		select: { id: true },
	});
	const existingIds = new Set(existingRevenues.map((revenue) => revenue.id));
	const incomingIds = new Set(
		params.revenues
			.map((revenue) => revenue.id)
			.filter((id): id is number => typeof id === "number"),
	);

	for (const revenue of params.revenues) {
		const data = {
			firmId: params.firmId,
			typeId: revenue.type.id,
			totalValue: revenue.totalValue,
			downPaymentValue: revenue.downPaymentValue,
			paymentStartDate: new Date(revenue.paymentStartDate),
			totalInstallments: revenue.totalInstallments,
			isActive: revenue.isActive,
			deletedAt: null,
		};

		if (typeof revenue.id === "number" && existingIds.has(revenue.id)) {
			await tx.revenue.update({
				where: { id: revenue.id },
				data,
			});
			continue;
		}

		await tx.revenue.create({
			data: {
				...data,
				contractId: params.contractId,
			},
		});
	}

	for (const revenue of existingRevenues) {
		if (!incomingIds.has(revenue.id)) {
			await tx.revenue.update({
				where: { id: revenue.id },
				data: { deletedAt: new Date() },
			});
		}
	}
}

export async function createContract({
	scope,
	input,
	isAdmin,
}: CreateContractParams): Promise<MutationReturnType> {
	if (!isAdmin && !input.allowStatusChange) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_STATUS_LOCK_FORBIDDEN);
	}

	const clientId = Number(input.clientId);
	const client = await prisma.client.findFirst({
		where: {
			id: clientId,
			firmId: scope.firmId,
			deletedAt: null,
			isActive: true,
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
				clientId,
				legalAreaId: legalArea.id,
				statusId: status.id,
				processNumber: input.processNumber.trim(),
				feePercentage: input.feePercentage,
				notes: normalizeOptionalText(input.notes),
				allowStatusChange: isAdmin ? input.allowStatusChange : true,
				isActive: input.isActive,
			},
		});

		if (resolvedAssignments.length > 0) {
			await tx.contractEmployee.createMany({
				data: resolvedAssignments.map((assignment) => ({
					firmId: scope.firmId,
					contractId: contract.id,
					employeeId: assignment.employee.id,
					assignmentTypeId: assignment.assignmentType.id,
					isActive: assignment.isActive,
				})),
			});
		}

		if (resolvedRevenues.length > 0) {
			await tx.revenue.createMany({
				data: resolvedRevenues.map((revenue) => ({
					firmId: scope.firmId,
					contractId: contract.id,
					typeId: revenue.type.id,
					totalValue: revenue.totalValue,
					downPaymentValue: revenue.downPaymentValue,
					paymentStartDate: new Date(revenue.paymentStartDate),
					totalInstallments: revenue.totalInstallments,
					isActive: revenue.isActive,
				})),
			});
		}
	});

	return { success: true };
}

export async function updateContract({
	scope,
	input,
	isAdmin,
}: UpdateContractParams): Promise<MutationReturnType> {
	const access = await getContractAccessResourceById(input.id);

	if (!access || !access.resource || access.resource.firmId !== scope.firmId) {
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

	if (!isAdmin && input.allowStatusChange !== existing.allowStatusChange) {
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

	if (!isAdmin && status.id !== existing.statusId) {
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

	const clientId = Number(input.clientId);
	const client = await prisma.client.findFirst({
		where: {
			id: clientId,
			firmId: scope.firmId,
			deletedAt: null,
			isActive: true,
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
				clientId,
				legalAreaId: legalArea.id,
				statusId: status.id,
				processNumber: input.processNumber.trim(),
				feePercentage: input.feePercentage,
				notes: normalizeOptionalText(input.notes),
				allowStatusChange: isAdmin
					? input.allowStatusChange
					: existing.allowStatusChange,
				isActive: input.isActive,
			},
		});

		await syncAssignments(tx, {
			contractId: input.id,
			firmId: scope.firmId,
			assignments: resolvedAssignments,
		});

		await syncRevenues(tx, {
			contractId: input.id,
			firmId: scope.firmId,
			revenues: resolvedRevenues,
		});
	});

	return { success: true };
}

export async function deleteContract({
	firmId,
	id,
}: ContractWriteScope & { id: number }): Promise<MutationReturnType> {
	const access = await getContractAccessResourceById(id);

	if (!access || !access.resource || access.resource.firmId !== firmId) {
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

	await prisma.contract.update({
		where: { id },
		data: { deletedAt: new Date() },
	});

	return { success: true };
}

export async function restoreContract({
	firmId,
	id,
}: ContractWriteScope & { id: number }): Promise<MutationReturnType> {
	const access = await getContractAccessResourceById(id);

	if (!access || !access.resource || access.resource.firmId !== firmId) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_NOT_FOUND);
	}

	const contract = await getContractById({
		scope: { firmId, isAdmin: true },
		id,
	});

	if (!contract.isSoftDeleted) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_NOT_FOUND);
	}

	await prisma.contract.update({
		where: { id },
		data: { deletedAt: null },
	});

	return { success: true };
}
