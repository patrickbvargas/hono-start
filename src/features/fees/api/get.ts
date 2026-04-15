import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";
import type { Prisma } from "@/generated/prisma/client";
import {
	getEntityActiveWhere,
	getEntityDeletedWhere,
	withDeterministicTieBreaker,
} from "@/shared/lib/entity-management";
import { prisma } from "@/shared/lib/prisma";
import type { Option } from "@/shared/schemas/option";
import {
	CONTRACT_STATUS_ACTIVE_VALUE,
	getServerLoggedUserSession,
	getServerScope,
	isAdminSession,
} from "@/shared/session";
import type {
	QueryManyReturnType,
	QueryOneReturnType,
	QueryPaginatedReturnType,
} from "@/shared/types/api";
import { FEE_DATA_CACHE_KEY } from "../constants";
import { FEE_ERRORS } from "../constants/errors";
import type { FeeFilter } from "../schemas/filter";
import { feeIdInputSchema } from "../schemas/form";
import { type Fee, feeSchema } from "../schemas/model";
import { type FeeSearch, feeSearchSchema } from "../schemas/search";

interface BuildFeeWhereParams {
	firmId: number;
	employeeId?: number;
	filter: FeeFilter;
	isAdmin: boolean;
}

function buildFeeWhere({
	firmId,
	employeeId,
	filter,
	isAdmin,
}: BuildFeeWhereParams): Prisma.FeeWhereInput {
	const dateFilter: Prisma.DateTimeFilter = {};

	if (filter.dateFrom) {
		dateFilter.gte = new Date(`${filter.dateFrom}T00:00:00.000Z`);
	}

	if (filter.dateTo) {
		dateFilter.lte = new Date(`${filter.dateTo}T23:59:59.999Z`);
	}

	return {
		firmId,
		...getEntityDeletedWhere(filter.status),
		...getEntityActiveWhere(filter.active),
		...(filter.contractId
			? {
					revenue: {
						contractId: Number(filter.contractId),
					},
				}
			: {}),
		...(filter.revenueId ? { revenueId: Number(filter.revenueId) } : {}),
		...(filter.dateFrom || filter.dateTo ? { paymentDate: dateFilter } : {}),
		...(!isAdmin && employeeId
			? {
					revenue: {
						...(filter.contractId
							? {
									contractId: Number(filter.contractId),
								}
							: {}),
						contract: {
							assignments: {
								some: {
									employeeId,
									deletedAt: null,
									isActive: true,
								},
							},
						},
					},
				}
			: {}),
	};
}

async function mapFees(
	fees: Array<{
		id: number;
		paymentDate: Date;
		amount: Prisma.Decimal;
		installmentNumber: number;
		generatesRemuneration: boolean;
		isActive: boolean;
		deletedAt: Date | null;
		createdAt: Date;
		updatedAt: Date;
		remunerations: Array<{ id: number; deletedAt: Date | null }>;
		revenue: {
			id: number;
			type: { label: string; value: string };
			contract: {
				id: number;
				processNumber: string;
				status: { value: string };
				client: { fullName: string };
			};
		};
	}>,
) {
	return feeSchema.array().parse(
		fees.map((fee) => ({
			id: fee.id,
			contractId: fee.revenue.contract.id,
			contractProcessNumber: fee.revenue.contract.processNumber,
			client: fee.revenue.contract.client.fullName,
			contractStatusValue: fee.revenue.contract.status.value,
			revenueId: fee.revenue.id,
			revenueType: fee.revenue.type.label,
			revenueTypeValue: fee.revenue.type.value,
			paymentDate: fee.paymentDate.toISOString(),
			amount: Number(fee.amount),
			installmentNumber: fee.installmentNumber,
			generatesRemuneration: fee.generatesRemuneration,
			remunerationCount: fee.remunerations.filter(
				(remuneration) => remuneration.deletedAt === null,
			).length,
			isActive: fee.isActive,
			isSoftDeleted: !!fee.deletedAt,
			createdAt: fee.createdAt.toISOString(),
			updatedAt: fee.updatedAt.toISOString(),
		})),
	);
}

const feeInclude = {
	remunerations: {
		select: {
			id: true,
			deletedAt: true,
		},
	},
	revenue: {
		select: {
			id: true,
			type: {
				select: {
					label: true,
					value: true,
				},
			},
			contract: {
				select: {
					id: true,
					processNumber: true,
					status: {
						select: {
							value: true,
						},
					},
					client: {
						select: {
							fullName: true,
						},
					},
				},
			},
		},
	},
} as const;

const getFees = createServerFn({ method: "GET" })
	.inputValidator(feeSearchSchema)
	.handler(async ({ data }): Promise<QueryPaginatedReturnType<Fee>> => {
		try {
			const session = getServerLoggedUserSession();
			const scope = getServerScope("fee");
			const where = buildFeeWhere({
				firmId: scope.firmId,
				employeeId: scope.employeeId,
				filter: data,
				isAdmin: isAdminSession(session),
			});

			const sortMap: Record<string, Prisma.FeeOrderByWithRelationInput> = {
				amount: { amount: data.direction },
				createdAt: { createdAt: data.direction },
				installmentNumber: { installmentNumber: data.direction },
				paymentDate: { paymentDate: data.direction },
			};
			const orderBy = withDeterministicTieBreaker(
				sortMap[data.column] ?? { paymentDate: "desc" },
				{ id: "asc" },
			);

			const [fees, total] = await Promise.all([
				prisma.fee.findMany({
					where,
					include: feeInclude,
					orderBy,
					skip: (data.page - 1) * data.limit,
					take: data.limit,
				}),
				prisma.fee.count({ where }),
			]);

			return {
				data: await mapFees(fees),
				total,
				page: data.page,
				pageSize: data.limit,
			};
		} catch (error) {
			console.error("[getFees]", error);
			throw new Error(FEE_ERRORS.FEE_GET_FAILED);
		}
	});

const getFeeById = createServerFn({ method: "GET" })
	.inputValidator(feeIdInputSchema)
	.handler(async ({ data }): Promise<QueryOneReturnType<Fee>> => {
		try {
			const session = getServerLoggedUserSession();
			const scope = getServerScope("fee");
			const fee = await prisma.fee.findFirst({
				where: {
					...buildFeeWhere({
						firmId: scope.firmId,
						employeeId: scope.employeeId,
						filter: {
							contractId: "",
							revenueId: "",
							dateFrom: "",
							dateTo: "",
							active: "all",
							status: "all",
						},
						isAdmin: isAdminSession(session),
					}),
					id: data.id,
				},
				include: feeInclude,
			});

			if (!fee) {
				throw new Error(FEE_ERRORS.FEE_DETAIL_NOT_FOUND);
			}

			const [mapped] = await mapFees([fee]);

			if (!mapped) {
				throw new Error(FEE_ERRORS.FEE_DETAIL_NOT_FOUND);
			}

			return mapped;
		} catch (error) {
			console.error("[getFeeById]", error);
			if (
				error instanceof Error &&
				error.message === FEE_ERRORS.FEE_DETAIL_NOT_FOUND
			) {
				throw error;
			}

			throw new Error(FEE_ERRORS.FEE_DETAIL_FAILED);
		}
	});

const getSelectableFeeContracts = createServerFn({ method: "GET" }).handler(
	async (): Promise<QueryManyReturnType<Option>> => {
		try {
			const session = getServerLoggedUserSession();
			const scope = getServerScope("fee");
			const contracts = await prisma.contract.findMany({
				where: {
					firmId: scope.firmId,
					deletedAt: null,
					isActive: true,
					status: {
						value: CONTRACT_STATUS_ACTIVE_VALUE,
					},
					...(!isAdminSession(session) && scope.employeeId
						? {
								assignments: {
									some: {
										employeeId: scope.employeeId,
										deletedAt: null,
										isActive: true,
									},
								},
							}
						: {}),
				},
				orderBy: { processNumber: "asc" },
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
			console.error("[getSelectableFeeContracts]", error);
			throw new Error(FEE_ERRORS.FEE_SELECTABLE_CONTRACTS_FAILED);
		}
	},
);

const getSelectableFeeRevenues = createServerFn({ method: "GET" })
	.inputValidator(
		z.object({
			contractId: z.string().catch("").default(""),
		}),
	)
	.handler(async ({ data }): Promise<QueryManyReturnType<Option>> => {
		try {
			const session = getServerLoggedUserSession();
			const scope = getServerScope("fee");
			const revenues = await prisma.revenue.findMany({
				where: {
					firmId: scope.firmId,
					deletedAt: null,
					isActive: true,
					...(data.contractId
						? {
								contractId: Number(data.contractId),
							}
						: {}),
					contract: {
						deletedAt: null,
						isActive: true,
						status: {
							value: CONTRACT_STATUS_ACTIVE_VALUE,
						},
						...(!isAdminSession(session) && scope.employeeId
							? {
									assignments: {
										some: {
											employeeId: scope.employeeId,
											deletedAt: null,
											isActive: true,
										},
									},
								}
							: {}),
					},
				},
				orderBy: [{ contract: { processNumber: "asc" } }, { id: "asc" }],
				select: {
					id: true,
					type: {
						select: {
							label: true,
						},
					},
					contract: {
						select: {
							processNumber: true,
						},
					},
				},
			});

			return revenues.map((revenue) => ({
				id: revenue.id,
				value: String(revenue.id),
				label: `${revenue.contract.processNumber} • ${revenue.type.label}`,
				isDisabled: false,
			}));
		} catch (error) {
			console.error("[getSelectableFeeRevenues]", error);
			throw new Error(FEE_ERRORS.FEE_SELECTABLE_REVENUES_FAILED);
		}
	});

export const getFeesOptions = (search: FeeSearch) =>
	queryOptions({
		queryKey: [FEE_DATA_CACHE_KEY, search],
		queryFn: () => getFees({ data: search }),
		staleTime: 5 * 60 * 1000,
	});

export const getFeeByIdOptions = (id: number) =>
	queryOptions({
		queryKey: [FEE_DATA_CACHE_KEY, "detail", id],
		queryFn: () => getFeeById({ data: { id } }),
		staleTime: 5 * 60 * 1000,
	});

export const getSelectableFeeContractsOptions = () =>
	queryOptions({
		queryKey: [FEE_DATA_CACHE_KEY, "contract-options"],
		queryFn: getSelectableFeeContracts,
		staleTime: 5 * 60 * 1000,
	});

export const getSelectableFeeRevenuesOptions = (contractId = "") =>
	queryOptions({
		queryKey: [FEE_DATA_CACHE_KEY, "revenue-options", contractId],
		queryFn: () => getSelectableFeeRevenues({ data: { contractId } }),
		staleTime: 5 * 60 * 1000,
	});
