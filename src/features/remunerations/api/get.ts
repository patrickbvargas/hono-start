import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/shared/lib/prisma";
import type { Option } from "@/shared/schemas/option";
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
import { REMUNERATION_DATA_CACHE_KEY } from "../constants";
import { REMUNERATION_ERRORS } from "../constants/errors";
import { remunerationIdInputSchema } from "../schemas/form";
import type { Remuneration } from "../schemas/model";
import {
	type RemunerationSearch,
	remunerationSearchSchema,
} from "../schemas/search";
import {
	buildRemunerationWhere,
	getRemunerationOrderBy,
	mapRemunerations,
	remunerationListInclude,
} from "./query";

const getRemunerations = createServerFn({ method: "GET" })
	.inputValidator(remunerationSearchSchema)
	.handler(
		async ({ data }): Promise<QueryPaginatedReturnType<Remuneration>> => {
			try {
				const session = getServerLoggedUserSession();
				const scope = getServerScope("remuneration");
				const where = buildRemunerationWhere({
					firmId: scope.firmId,
					employeeId: scope.employeeId,
					filter: data,
					isAdmin: isAdminSession(session),
				});

				const [remunerations, total] = await Promise.all([
					prisma.remuneration.findMany({
						where,
						include: remunerationListInclude,
						orderBy: getRemunerationOrderBy(data),
						skip: (data.page - 1) * data.limit,
						take: data.limit,
					}),
					prisma.remuneration.count({ where }),
				]);

				return {
					data: await mapRemunerations(remunerations),
					total,
					page: data.page,
					pageSize: data.limit,
				};
			} catch (error) {
				console.error("[getRemunerations]", error);
				throw new Error(REMUNERATION_ERRORS.REMUNERATION_GET_FAILED);
			}
		},
	);

const getRemunerationById = createServerFn({ method: "GET" })
	.inputValidator(remunerationIdInputSchema)
	.handler(async ({ data }): Promise<QueryOneReturnType<Remuneration>> => {
		try {
			const session = getServerLoggedUserSession();
			const scope = getServerScope("remuneration");
			const remuneration = await prisma.remuneration.findFirst({
				where: {
					...buildRemunerationWhere({
						firmId: scope.firmId,
						employeeId: scope.employeeId,
						filter: {
							employeeId: "",
							contractId: "",
							dateFrom: "",
							dateTo: "",
							active: "all",
							status: "all",
						},
						isAdmin: isAdminSession(session),
					}),
					id: data.id,
				},
				include: remunerationListInclude,
			});

			if (!remuneration) {
				throw new Error(REMUNERATION_ERRORS.REMUNERATION_DETAIL_NOT_FOUND);
			}

			const [mapped] = await mapRemunerations([remuneration]);

			if (!mapped) {
				throw new Error(REMUNERATION_ERRORS.REMUNERATION_DETAIL_NOT_FOUND);
			}

			return mapped;
		} catch (error) {
			console.error("[getRemunerationById]", error);
			if (
				error instanceof Error &&
				error.message === REMUNERATION_ERRORS.REMUNERATION_DETAIL_NOT_FOUND
			) {
				throw error;
			}

			throw new Error(REMUNERATION_ERRORS.REMUNERATION_DETAIL_FAILED);
		}
	});

const getSelectableRemunerationContracts = createServerFn({
	method: "GET",
}).handler(async (): Promise<QueryManyReturnType<Option>> => {
	try {
		const session = getServerLoggedUserSession();
		const scope = getServerScope("remuneration");
		const contracts = await prisma.contract.findMany({
			where: {
				firmId: scope.firmId,
				assignments: {
					some: isAdminSession(session)
						? {
								remunerations: {
									some: {
										firmId: scope.firmId,
									},
								},
							}
						: {
								employeeId: scope.employeeId,
								remunerations: {
									some: {
										firmId: scope.firmId,
									},
								},
							},
				},
			},
			orderBy: [{ processNumber: "asc" }, { id: "asc" }],
			select: {
				id: true,
				processNumber: true,
				client: {
					select: {
						fullName: true,
					},
				},
			},
		});

		return contracts.map((contract) => ({
			id: contract.id,
			value: String(contract.id),
			label: `${contract.processNumber} • ${contract.client.fullName}`,
			isDisabled: false,
		}));
	} catch (error) {
		console.error("[getSelectableRemunerationContracts]", error);
		throw new Error(
			REMUNERATION_ERRORS.REMUNERATION_SELECTABLE_CONTRACTS_FAILED,
		);
	}
});

const getSelectableRemunerationEmployees = createServerFn({
	method: "GET",
}).handler(async (): Promise<QueryManyReturnType<Option>> => {
	try {
		const session = getServerLoggedUserSession();

		if (!isAdminSession(session)) {
			return [];
		}

		const scope = getServerScope("remuneration");
		const employees = await prisma.employee.findMany({
			where: {
				firmId: scope.firmId,
				contractAssignments: {
					some: {
						remunerations: {
							some: {
								firmId: scope.firmId,
							},
						},
					},
				},
			},
			orderBy: [{ fullName: "asc" }, { id: "asc" }],
			select: {
				id: true,
				fullName: true,
			},
		});

		return employees.map((employee) => ({
			id: employee.id,
			value: String(employee.id),
			label: employee.fullName,
			isDisabled: false,
		}));
	} catch (error) {
		console.error("[getSelectableRemunerationEmployees]", error);
		throw new Error(
			REMUNERATION_ERRORS.REMUNERATION_SELECTABLE_EMPLOYEES_FAILED,
		);
	}
});

export const getRemunerationsOptions = (search: RemunerationSearch) =>
	queryOptions({
		queryKey: [REMUNERATION_DATA_CACHE_KEY, search],
		queryFn: () => getRemunerations({ data: search }),
		staleTime: 5 * 60 * 1000,
	});

export const getRemunerationByIdOptions = (id: number) =>
	queryOptions({
		queryKey: [REMUNERATION_DATA_CACHE_KEY, "detail", id],
		queryFn: () => getRemunerationById({ data: { id } }),
		staleTime: 5 * 60 * 1000,
	});

export const getSelectableRemunerationContractsOptions = () =>
	queryOptions({
		queryKey: [REMUNERATION_DATA_CACHE_KEY, "contract-options"],
		queryFn: getSelectableRemunerationContracts,
		staleTime: 5 * 60 * 1000,
	});

export const getSelectableRemunerationEmployeesOptions = () =>
	queryOptions({
		queryKey: [REMUNERATION_DATA_CACHE_KEY, "employee-options"],
		queryFn: getSelectableRemunerationEmployees,
		staleTime: 5 * 60 * 1000,
	});
