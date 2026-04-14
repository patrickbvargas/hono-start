import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
	getEntityActiveWhere,
	getEntityDeletedWhere,
	withDeterministicTieBreaker,
} from "@/shared/lib/entity-management";
import { prisma } from "@/shared/lib/prisma";
import { type Option, optionSchema } from "@/shared/schemas/option";
import {
	getServerLoggedUserSession,
	getServerScope,
	isAdminSession,
} from "@/shared/session";
import type {
	QueryManyReturnType,
	QueryOneReturnType,
	QueryPaginatedReturnType,
} from "@/shared/types/api";
import { CONTRACT_DATA_CACHE_KEY } from "../constants";
import type { ContractFilter } from "../schemas/filter";
import { contractIdInputSchema } from "../schemas/form";
import { type Contract, contractSchema } from "../schemas/model";
import { type ContractSearch, contractSearchSchema } from "../schemas/search";

interface BuildContractWhereParams {
	firmId: number;
	employeeId?: number;
	filter: ContractFilter;
	clientId?: number;
	legalAreaIds: number[];
	statusIds: number[];
	isAdmin: boolean;
}

export function buildContractWhere({
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

async function mapContracts(
	session: ReturnType<typeof getServerLoggedUserSession>,
	contracts: Array<{
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
		updatedAt: Date;
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
		}>;
	}>,
) {
	return contractSchema.array().parse(
		contracts.map((contract) => {
			const assignedEmployeeIds = contract.assignments
				.filter((assignment) => assignment.isActive && !assignment.deletedAt)
				.map((assignment) => assignment.employeeId);

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
					isSoftDeleted: !!assignment.deletedAt,
				})),
				revenues: contract.revenues.map((revenue) => ({
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
					isSoftDeleted: !!revenue.deletedAt,
				})),
				assignmentCount: contract.assignments.length,
				revenueCount: contract.revenues.length,
				assignedEmployeeIds,
				isAssignedToActor: isAdminSession(session)
					? true
					: assignedEmployeeIds.includes(session.employee.id),
				isActive: contract.isActive,
				isSoftDeleted: !!contract.deletedAt,
				createdAt: contract.createdAt.toISOString(),
				updatedAt: contract.updatedAt.toISOString(),
			};
		}),
	);
}

const contractInclude = {
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
		include: {
			type: { select: { label: true, value: true } },
		},
	},
} as const;

const getContracts = createServerFn({ method: "GET" })
	.inputValidator(contractSearchSchema)
	.handler(async ({ data }): Promise<QueryPaginatedReturnType<Contract>> => {
		try {
			const session = getServerLoggedUserSession();
			const scope = getServerScope("contract");
			const [resolvedLegalAreas, resolvedStatuses] = await Promise.all([
				data.legalArea.length > 0
					? prisma.legalArea.findMany({
							where: { value: { in: data.legalArea } },
							select: { id: true },
						})
					: Promise.resolve([]),
				data.contractStatus.length > 0
					? prisma.contractStatus.findMany({
							where: { value: { in: data.contractStatus } },
							select: { id: true },
						})
					: Promise.resolve([]),
			]);

			const clientId = data.clientId ? Number(data.clientId) : undefined;
			const where = buildContractWhere({
				firmId: scope.firmId,
				employeeId: scope.employeeId,
				filter: data,
				clientId,
				legalAreaIds: resolvedLegalAreas.map((item) => item.id),
				statusIds: resolvedStatuses.map((item) => item.id),
				isAdmin: isAdminSession(session),
			});

			const sortMap: Record<string, object> = {
				processNumber: { processNumber: data.direction },
				client: { client: { fullName: data.direction } },
				legalArea: { legalArea: { label: data.direction } },
				status: { status: { label: data.direction } },
				feePercentage: { feePercentage: data.direction },
				isActive: { isActive: data.direction },
				createdAt: { createdAt: data.direction },
			};
			const orderBy = withDeterministicTieBreaker(
				sortMap[data.column] ?? { createdAt: "desc" },
				{ id: "asc" },
			);

			const [contracts, total] = await Promise.all([
				prisma.contract.findMany({
					where,
					include: contractInclude,
					orderBy,
					skip: (data.page - 1) * data.limit,
					take: data.limit,
				}),
				prisma.contract.count({ where }),
			]);

			return {
				data: await mapContracts(session, contracts),
				total,
				page: data.page,
				pageSize: data.limit,
			};
		} catch (error) {
			console.error("[getContracts]", error);
			throw new Error("Erro ao buscar contratos");
		}
	});

const getContractById = createServerFn({ method: "GET" })
	.inputValidator(contractIdInputSchema)
	.handler(async ({ data }): Promise<QueryOneReturnType<Contract>> => {
		try {
			const session = getServerLoggedUserSession();
			const scope = getServerScope("contract");
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
						isAdmin: isAdminSession(session),
					}),
					id: data.id,
				},
				include: contractInclude,
			});

			if (!contract) {
				throw new Error("Contrato não encontrado");
			}

			const [mapped] = await mapContracts(session, [contract]);

			if (!mapped) {
				throw new Error("Contrato não encontrado");
			}

			return mapped;
		} catch (error) {
			console.error("[getContractById]", error);
			if (
				error instanceof Error &&
				error.message === "Contrato não encontrado"
			) {
				throw error;
			}
			throw new Error("Erro ao buscar contrato");
		}
	});

const getContractLegalAreas = createServerFn({ method: "GET" }).handler(
	async (): Promise<QueryManyReturnType<Option>> => {
		try {
			getServerLoggedUserSession();
			const legalAreas = await prisma.legalArea.findMany({
				orderBy: { label: "asc" },
			});

			return optionSchema.array().parse(legalAreas);
		} catch (error) {
			console.error("[getContractLegalAreas]", error);
			throw new Error("Erro ao buscar áreas jurídicas");
		}
	},
);

const getContractStatuses = createServerFn({ method: "GET" }).handler(
	async (): Promise<QueryManyReturnType<Option>> => {
		try {
			getServerLoggedUserSession();
			const statuses = await prisma.contractStatus.findMany({
				orderBy: { label: "asc" },
			});

			return optionSchema.array().parse(statuses);
		} catch (error) {
			console.error("[getContractStatuses]", error);
			throw new Error("Erro ao buscar status de contrato");
		}
	},
);

const getContractAssignmentTypes = createServerFn({ method: "GET" }).handler(
	async (): Promise<QueryManyReturnType<Option>> => {
		try {
			getServerLoggedUserSession();
			const assignmentTypes = await prisma.assignmentType.findMany({
				orderBy: { label: "asc" },
			});

			return optionSchema.array().parse(assignmentTypes);
		} catch (error) {
			console.error("[getContractAssignmentTypes]", error);
			throw new Error("Erro ao buscar tipos de atribuição");
		}
	},
);

const getContractRevenueTypes = createServerFn({ method: "GET" }).handler(
	async (): Promise<QueryManyReturnType<Option>> => {
		try {
			getServerLoggedUserSession();
			const revenueTypes = await prisma.revenueType.findMany({
				orderBy: { label: "asc" },
			});

			return optionSchema.array().parse(revenueTypes);
		} catch (error) {
			console.error("[getContractRevenueTypes]", error);
			throw new Error("Erro ao buscar tipos de receita");
		}
	},
);

const getSelectableContractClients = createServerFn({ method: "GET" }).handler(
	async (): Promise<QueryManyReturnType<Option>> => {
		try {
			getServerLoggedUserSession();
			const { firmId } = getServerScope("contract");
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
		} catch (error) {
			console.error("[getSelectableContractClients]", error);
			throw new Error("Erro ao buscar clientes disponíveis");
		}
	},
);

const getSelectableContractEmployees = createServerFn({
	method: "GET",
}).handler(async (): Promise<QueryManyReturnType<Option>> => {
	try {
		getServerLoggedUserSession();
		const { firmId } = getServerScope("contract");
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
	} catch (error) {
		console.error("[getSelectableContractEmployees]", error);
		throw new Error("Erro ao buscar colaboradores disponíveis");
	}
});

export const getContractsOptions = (search: ContractSearch) =>
	queryOptions({
		queryKey: [CONTRACT_DATA_CACHE_KEY, search],
		queryFn: () => getContracts({ data: search }),
		staleTime: 5 * 60 * 1000,
	});

export const getContractByIdOptions = (id: number) =>
	queryOptions({
		queryKey: [CONTRACT_DATA_CACHE_KEY, "detail", id],
		queryFn: () => getContractById({ data: { id } }),
		staleTime: 5 * 60 * 1000,
	});

export const getContractLegalAreasOptions = () =>
	queryOptions({
		queryKey: [CONTRACT_DATA_CACHE_KEY, "legal-areas"],
		queryFn: getContractLegalAreas,
		staleTime: "static",
	});

export const getContractStatusesOptions = () =>
	queryOptions({
		queryKey: [CONTRACT_DATA_CACHE_KEY, "statuses"],
		queryFn: getContractStatuses,
		staleTime: "static",
	});

export const getContractAssignmentTypesOptions = () =>
	queryOptions({
		queryKey: [CONTRACT_DATA_CACHE_KEY, "assignment-types"],
		queryFn: getContractAssignmentTypes,
		staleTime: "static",
	});

export const getContractRevenueTypesOptions = () =>
	queryOptions({
		queryKey: [CONTRACT_DATA_CACHE_KEY, "revenue-types"],
		queryFn: getContractRevenueTypes,
		staleTime: "static",
	});

export const getSelectableContractClientsOptions = () =>
	queryOptions({
		queryKey: [CONTRACT_DATA_CACHE_KEY, "client-options"],
		queryFn: getSelectableContractClients,
		staleTime: 5 * 60 * 1000,
	});

export const getSelectableContractEmployeesOptions = () =>
	queryOptions({
		queryKey: [CONTRACT_DATA_CACHE_KEY, "employee-options"],
		queryFn: getSelectableContractEmployees,
		staleTime: 5 * 60 * 1000,
	});
