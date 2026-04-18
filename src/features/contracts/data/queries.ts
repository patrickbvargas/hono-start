import { Prisma } from "@/generated/prisma/client";
import {
	getEntityActiveWhere,
	getEntityDeletedWhere,
	withDeterministicTieBreaker,
} from "@/shared/lib/entity-management";
import { prisma } from "@/shared/lib/prisma";
import { type Option, optionSchema } from "@/shared/schemas/option";
import type {
	QueryManyReturnType,
	QueryOneReturnType,
	QueryPaginatedReturnType,
} from "@/shared/types/api";
import { CONTRACT_ERRORS } from "../constants/errors";
import type { ContractFilter } from "../schemas/filter";
import {
	type ContractDetail,
	type ContractSummary,
	contractDetailSchema,
	contractSummarySchema,
} from "../schemas/model";
import type { ContractSearch } from "../schemas/search";

interface ContractAccessParams {
	firmId: number;
	employeeId?: number;
	isAdmin: boolean;
}

interface BuildContractWhereParams extends ContractAccessParams {
	filter: ContractFilter;
	clientId?: number;
	legalAreaIds: number[];
	statusIds: number[];
}

interface GetContractsParams {
	scope: ContractAccessParams;
	search: ContractSearch;
}

interface GetContractByIdParams {
	scope: ContractAccessParams;
	id: number;
}

function buildContractWhere({
	firmId,
	employeeId,
	filter,
	clientId,
	legalAreaIds,
	statusIds,
	isAdmin,
}: BuildContractWhereParams) {
	return {
		firmId,
		...getEntityDeletedWhere(filter.status),
		...getEntityActiveWhere(filter.active),
		...(clientId ? { clientId } : {}),
		...(legalAreaIds.length > 0 ? { legalAreaId: { in: legalAreaIds } } : {}),
		...(statusIds.length > 0 ? { statusId: { in: statusIds } } : {}),
		...(!isAdmin && employeeId
			? {
					assignments: {
						some: {
							employeeId,
							deletedAt: null,
							isActive: true,
						},
					},
				}
			: {}),
	};
}

function getRevenuePaymentState(revenue: {
	totalValue: { toString(): string };
	downPaymentValue: { toString(): string } | null;
	fees: Array<{ amount: { toString(): string } }>;
}) {
	const paidValue = revenue.fees.reduce(
		(total, fee) => total.add(fee.amount.toString()),
		new Prisma.Decimal(revenue.downPaymentValue?.toString() ?? 0),
	);
	const remainingValue = Prisma.Decimal.max(
		new Prisma.Decimal(revenue.totalValue.toString()).minus(paidValue),
		new Prisma.Decimal(0),
	);

	return {
		paidValue: Number(paidValue),
		installmentsPaid: revenue.fees.length,
		remainingValue: Number(remainingValue),
		isFullyPaid: remainingValue.equals(0),
	};
}

function mapContractSummary(
	scope: ContractAccessParams,
	contracts: Array<{
		id: number;
		processNumber: string;
		clientId: number;
		legalAreaId: number;
		statusId: number;
		feePercentage: { toString(): string };
		isActive: boolean;
		deletedAt: Date | null;
		createdAt: Date;
		updatedAt: Date | null;
		client: { fullName: string };
		legalArea: { label: string; value: string };
		status: { label: string; value: string };
		assignments: Array<{ employeeId: number }>;
		revenues: Array<{ id: number }>;
	}>,
) {
	return contractSummarySchema.array().parse(
		contracts.map((contract) => {
			const assignedEmployeeIds = contract.assignments.map(
				(assignment) => assignment.employeeId,
			);

			return {
				id: contract.id,
				processNumber: contract.processNumber,
				clientId: contract.clientId,
				client: contract.client.fullName,
				legalAreaId: contract.legalAreaId,
				legalArea: contract.legalArea.label,
				legalAreaValue: contract.legalArea.value,
				statusId: contract.statusId,
				status: contract.status.label,
				statusValue: contract.status.value,
				feePercentage: Number(contract.feePercentage),
				assignmentCount: assignedEmployeeIds.length,
				revenueCount: contract.revenues.length,
				assignedEmployeeIds,
				isAssignedToActor: scope.isAdmin
					? true
					: assignedEmployeeIds.includes(scope.employeeId ?? 0),
				isActive: contract.isActive,
				isSoftDeleted: Boolean(contract.deletedAt),
				createdAt: contract.createdAt.toISOString(),
				updatedAt: contract.updatedAt?.toISOString() ?? null,
			};
		}),
	);
}

function mapContractDetail(
	scope: ContractAccessParams,
	contract: {
		id: number;
		processNumber: string;
		clientId: number;
		legalAreaId: number;
		statusId: number;
		feePercentage: { toString(): string };
		notes: string | null;
		allowStatusChange: boolean;
		isActive: boolean;
		deletedAt: Date | null;
		createdAt: Date;
		updatedAt: Date | null;
		client: { fullName: string };
		legalArea: { label: string; value: string };
		status: { label: string; value: string };
		assignments: Array<{
			id: number;
			employeeId: number;
			isActive: boolean;
			deletedAt: Date | null;
			employee: {
				fullName: string;
				type: { label: string; value: string };
			};
			assignmentType: { label: string; value: string };
		}>;
		revenues: Array<{
			id: number;
			typeId: number;
			totalValue: { toString(): string };
			downPaymentValue: { toString(): string } | null;
			paymentStartDate: Date;
			totalInstallments: number;
			isActive: boolean;
			deletedAt: Date | null;
			type: { label: string; value: string };
			fees: Array<{ amount: { toString(): string } }>;
		}>;
	},
): ContractDetail {
	const assignedEmployeeIds = contract.assignments
		.filter((assignment) => assignment.isActive && !assignment.deletedAt)
		.map((assignment) => assignment.employeeId);

	return contractDetailSchema.parse({
		id: contract.id,
		processNumber: contract.processNumber,
		clientId: contract.clientId,
		client: contract.client.fullName,
		legalAreaId: contract.legalAreaId,
		legalArea: contract.legalArea.label,
		legalAreaValue: contract.legalArea.value,
		statusId: contract.statusId,
		status: contract.status.label,
		statusValue: contract.status.value,
		feePercentage: Number(contract.feePercentage),
		notes: contract.notes,
		allowStatusChange: contract.allowStatusChange,
		assignments: contract.assignments.map((assignment) => ({
			id: assignment.id,
			employeeId: assignment.employeeId,
			employeeName: assignment.employee.fullName,
			employeeType: assignment.employee.type.label,
			employeeTypeValue: assignment.employee.type.value,
			assignmentType: assignment.assignmentType.label,
			assignmentTypeValue: assignment.assignmentType.value,
			isActive: assignment.isActive,
			isSoftDeleted: Boolean(assignment.deletedAt),
		})),
		revenues: contract.revenues.map((revenue) => ({
			...getRevenuePaymentState(revenue),
			id: revenue.id,
			typeId: revenue.typeId,
			type: revenue.type.label,
			typeValue: revenue.type.value,
			totalValue: Number(revenue.totalValue),
			downPaymentValue:
				revenue.downPaymentValue === null
					? null
					: Number(revenue.downPaymentValue),
			paymentStartDate: revenue.paymentStartDate.toISOString(),
			totalInstallments: revenue.totalInstallments,
			isActive: revenue.isActive,
			isSoftDeleted: Boolean(revenue.deletedAt),
		})),
		assignmentCount: contract.assignments.length,
		revenueCount: contract.revenues.length,
		assignedEmployeeIds,
		isAssignedToActor: scope.isAdmin
			? true
			: assignedEmployeeIds.includes(scope.employeeId ?? 0),
		isActive: contract.isActive,
		isSoftDeleted: Boolean(contract.deletedAt),
		createdAt: contract.createdAt.toISOString(),
		updatedAt: contract.updatedAt?.toISOString() ?? null,
	});
}

const contractSummaryInclude = {
	client: { select: { fullName: true } },
	legalArea: { select: { label: true, value: true } },
	status: { select: { label: true, value: true } },
	assignments: {
		where: {
			deletedAt: null,
			isActive: true,
		},
		select: {
			employeeId: true,
		},
	},
	revenues: {
		where: {
			deletedAt: null,
			isActive: true,
		},
		select: {
			id: true,
		},
	},
} as const;

const contractDetailInclude = {
	client: { select: { fullName: true } },
	legalArea: { select: { label: true, value: true } },
	status: { select: { label: true, value: true } },
	assignments: {
		include: {
			employee: {
				select: {
					fullName: true,
					type: { select: { label: true, value: true } },
				},
			},
			assignmentType: {
				select: { label: true, value: true },
			},
		},
	},
	revenues: {
		where: {
			deletedAt: null,
			isActive: true,
		},
		include: {
			fees: {
				where: {
					deletedAt: null,
					isActive: true,
				},
				select: {
					amount: true,
				},
			},
			type: { select: { label: true, value: true } },
		},
	},
} as const;

export async function getContracts({
	scope,
	search,
}: GetContractsParams): Promise<QueryPaginatedReturnType<ContractSummary>> {
	const [resolvedLegalAreas, resolvedStatuses] = await Promise.all([
		search.legalArea.length > 0
			? prisma.legalArea.findMany({
					where: { value: { in: search.legalArea } },
					select: { id: true },
				})
			: Promise.resolve([]),
		search.contractStatus.length > 0
			? prisma.contractStatus.findMany({
					where: { value: { in: search.contractStatus } },
					select: { id: true },
				})
			: Promise.resolve([]),
	]);

	const clientId = search.clientId ? Number(search.clientId) : undefined;
	const where = buildContractWhere({
		firmId: scope.firmId,
		employeeId: scope.employeeId,
		filter: search,
		clientId,
		legalAreaIds: resolvedLegalAreas.map((item) => item.id),
		statusIds: resolvedStatuses.map((item) => item.id),
		isAdmin: scope.isAdmin,
	});

	const sortMap: Record<string, object> = {
		processNumber: { processNumber: search.direction },
		client: { client: { fullName: search.direction } },
		legalArea: { legalArea: { label: search.direction } },
		status: { status: { label: search.direction } },
		feePercentage: { feePercentage: search.direction },
		isActive: { isActive: search.direction },
		createdAt: { createdAt: search.direction },
	};
	const orderBy = withDeterministicTieBreaker(
		sortMap[search.column] ?? { createdAt: "desc" },
		{ id: "asc" },
	);

	const [contracts, total] = await Promise.all([
		prisma.contract.findMany({
			where,
			include: contractSummaryInclude,
			orderBy,
			skip: (search.page - 1) * search.limit,
			take: search.limit,
		}),
		prisma.contract.count({ where }),
	]);

	return {
		data: mapContractSummary(scope, contracts),
		total,
		page: search.page,
		pageSize: search.limit,
	};
}

export async function getContractById({
	scope,
	id,
}: GetContractByIdParams): Promise<QueryOneReturnType<ContractDetail>> {
	const contract = await prisma.contract.findFirst({
		where: {
			...buildContractWhere({
				firmId: scope.firmId,
				employeeId: scope.employeeId,
				filter: {
					clientId: "",
					legalArea: [],
					contractStatus: [],
					active: "all",
					status: "all",
				},
				legalAreaIds: [],
				statusIds: [],
				isAdmin: scope.isAdmin,
			}),
			id,
		},
		include: contractDetailInclude,
	});

	if (!contract) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_DETAIL_NOT_FOUND);
	}

	return mapContractDetail(scope, contract);
}

export async function getContractAccessResourceById(id: number) {
	const contract = await prisma.contract.findFirst({
		where: { id },
		include: {
			status: { select: { value: true } },
			assignments: {
				where: { deletedAt: null, isActive: true },
				select: { employeeId: true },
			},
			revenues: {
				where: { deletedAt: null, isActive: true },
				select: { id: true },
			},
		},
	});

	if (!contract) {
		return null;
	}

	return {
		id: contract.id,
		resource: {
			firmId: contract.firmId,
			statusValue: contract.status.value,
			allowStatusChange: contract.allowStatusChange,
			assignedEmployeeIds: contract.assignments.map(
				(assignment) => assignment.employeeId,
			),
		},
		hasActiveRevenues: contract.revenues.length > 0,
	};
}

export async function getContractLegalAreas(): Promise<
	QueryManyReturnType<Option>
> {
	const legalAreas = await prisma.legalArea.findMany({
		orderBy: { label: "asc" },
	});

	return optionSchema.array().parse(legalAreas);
}

export async function getContractStatuses(): Promise<
	QueryManyReturnType<Option>
> {
	const statuses = await prisma.contractStatus.findMany({
		orderBy: { label: "asc" },
	});

	return optionSchema.array().parse(statuses);
}

export async function getContractAssignmentTypes(): Promise<
	QueryManyReturnType<Option>
> {
	const assignmentTypes = await prisma.assignmentType.findMany({
		orderBy: { label: "asc" },
	});

	return optionSchema.array().parse(assignmentTypes);
}

export async function getContractRevenueTypes(): Promise<
	QueryManyReturnType<Option>
> {
	const revenueTypes = await prisma.revenueType.findMany({
		orderBy: { label: "asc" },
	});

	return optionSchema.array().parse(revenueTypes);
}

export async function getSelectableContractClients(
	firmId: number,
): Promise<QueryManyReturnType<Option>> {
	const clients = await prisma.client.findMany({
		where: { firmId, deletedAt: null, isActive: true },
		orderBy: { fullName: "asc" },
		select: {
			id: true,
			fullName: true,
		},
	});

	return clients.map((client) => ({
		id: client.id,
		value: String(client.id),
		label: client.fullName,
		isDisabled: false,
	}));
}

export async function getSelectableContractEmployees(
	firmId: number,
): Promise<QueryManyReturnType<Option>> {
	const employees = await prisma.employee.findMany({
		where: { firmId, deletedAt: null, isActive: true },
		orderBy: { fullName: "asc" },
		select: {
			id: true,
			fullName: true,
			type: { select: { label: true } },
		},
	});

	return employees.map((employee) => ({
		id: employee.id,
		value: String(employee.id),
		label: `${employee.fullName} • ${employee.type.label}`,
		isDisabled: false,
	}));
}

export async function getLegalAreaByValue(value: string) {
	return prisma.legalArea.findUnique({
		where: { value },
	});
}

export async function getContractStatusByValue(value: string) {
	return prisma.contractStatus.findUnique({
		where: { value },
	});
}

export async function getAssignmentTypesByValues(values: string[]) {
	return prisma.assignmentType.findMany({
		where: { value: { in: values } },
	});
}

export async function getRevenueTypesByValues(values: string[]) {
	return prisma.revenueType.findMany({
		where: { value: { in: values } },
	});
}
