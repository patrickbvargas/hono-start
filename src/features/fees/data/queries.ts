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
	type FeeAccessResource,
} from "@/shared/session";
import type {
	QueryManyReturnType,
	QueryOneReturnType,
	QueryPaginatedReturnType,
} from "@/shared/types/api";
import { FEE_ERRORS } from "../constants/errors";
import type { FeeFilter } from "../schemas/filter";
import {
	type FeeDetail,
	type FeeSummary,
	feeDetailSchema,
	feeSummarySchema,
} from "../schemas/model";
import type { FeeSearch } from "../schemas/search";

interface FeeAccessParams {
	firmId: number;
	employeeId?: number;
	isAdmin: boolean;
}

interface BuildFeeWhereParams extends FeeAccessParams {
	filter: FeeFilter;
}

interface GetFeesParams {
	scope: FeeAccessParams;
	search: FeeSearch;
}

interface GetFeeByIdParams {
	scope: FeeAccessParams;
	id: number;
}

interface GetSelectableFeeRevenuesParams {
	scope: FeeAccessParams;
	contractId?: string;
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
		...(filter.query
			? {
					OR: [
						{
							revenue: {
								contract: {
									processNumber: {
										contains: filter.query,
										mode: "insensitive" as const,
									},
								},
							},
						},
					],
				}
			: {}),
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

function mapFeeSummaries(
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
	return feeSummarySchema.array().parse(
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

function mapFeeDetail(
	fee: Parameters<typeof mapFeeSummaries>[0][number],
): FeeDetail {
	return feeDetailSchema.parse(mapFeeSummaries([fee])[0]);
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

export async function getFees({
	scope,
	search,
}: GetFeesParams): Promise<QueryPaginatedReturnType<FeeSummary>> {
	const where = buildFeeWhere({
		firmId: scope.firmId,
		employeeId: scope.employeeId,
		filter: search,
		isAdmin: scope.isAdmin,
	});

	const sortMap: Record<string, Prisma.FeeOrderByWithRelationInput> = {
		amount: { amount: search.direction },
		createdAt: { createdAt: search.direction },
		installmentNumber: { installmentNumber: search.direction },
		paymentDate: { paymentDate: search.direction },
	};
	const orderBy = withDeterministicTieBreaker(
		sortMap[search.column] ?? { paymentDate: "desc" },
		{ id: "asc" },
	);

	const [fees, total] = await Promise.all([
		prisma.fee.findMany({
			where,
			include: feeInclude,
			orderBy,
			skip: (search.page - 1) * search.limit,
			take: search.limit,
		}),
		prisma.fee.count({ where }),
	]);

	return {
		data: mapFeeSummaries(fees),
		total,
		page: search.page,
		pageSize: search.limit,
	};
}

export async function getFeeById({
	scope,
	id,
}: GetFeeByIdParams): Promise<QueryOneReturnType<FeeDetail>> {
	const fee = await prisma.fee.findFirst({
		where: {
			...buildFeeWhere({
				firmId: scope.firmId,
				employeeId: scope.employeeId,
				filter: {
					query: "",
					contractId: "",
					revenueId: "",
					dateFrom: "",
					dateTo: "",
					active: "all",
					status: "all",
				},
				isAdmin: scope.isAdmin,
			}),
			id,
		},
		include: feeInclude,
	});

	if (!fee) {
		throw new Error(FEE_ERRORS.FEE_DETAIL_NOT_FOUND);
	}

	return mapFeeDetail(fee);
}

export async function getSelectableFeeContracts({
	firmId,
	employeeId,
	isAdmin,
}: FeeAccessParams): Promise<QueryManyReturnType<Option>> {
	const contracts = await prisma.contract.findMany({
		where: {
			firmId,
			deletedAt: null,
			isActive: true,
			status: {
				value: CONTRACT_STATUS_ACTIVE_VALUE,
			},
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
}

export async function getSelectableFeeRevenues({
	scope,
	contractId,
}: GetSelectableFeeRevenuesParams): Promise<QueryManyReturnType<Option>> {
	const revenues = await prisma.revenue.findMany({
		where: {
			firmId: scope.firmId,
			deletedAt: null,
			isActive: true,
			...(contractId
				? {
						contractId: Number(contractId),
					}
				: {}),
			contract: {
				deletedAt: null,
				isActive: true,
				status: {
					value: CONTRACT_STATUS_ACTIVE_VALUE,
				},
				...(!scope.isAdmin && scope.employeeId
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
}

export async function getFeeRevenueAccessResourceById(
	firmId: number,
	revenueId: number,
) {
	const revenue = await prisma.revenue.findFirst({
		where: {
			id: revenueId,
			deletedAt: null,
			firmId,
		},
		select: {
			id: true,
			firmId: true,
			contractId: true,
			contract: {
				select: {
					allowStatusChange: true,
					status: {
						select: {
							value: true,
						},
					},
					assignments: {
						where: {
							deletedAt: null,
							isActive: true,
						},
						select: {
							employeeId: true,
						},
					},
				},
			},
		},
	});

	if (!revenue) {
		return null;
	}

	return {
		id: revenue.id,
		contractId: revenue.contractId,
		resource: {
			firmId: revenue.firmId,
			statusValue: revenue.contract.status.value,
			allowStatusChange: revenue.contract.allowStatusChange,
			assignedEmployeeIds: revenue.contract.assignments.map(
				(assignment) => assignment.employeeId,
			),
		} satisfies FeeAccessResource,
	};
}

export async function getFeeAccessResourceById(firmId: number, id: number) {
	const fee = await prisma.fee.findFirst({
		where: { id, firmId },
		select: {
			id: true,
			firmId: true,
			revenueId: true,
			deletedAt: true,
			generatesRemuneration: true,
			revenue: {
				select: {
					contractId: true,
					contract: {
						select: {
							allowStatusChange: true,
							status: {
								select: {
									value: true,
								},
							},
							assignments: {
								where: {
									deletedAt: null,
									isActive: true,
								},
								select: {
									id: true,
									employeeId: true,
								},
							},
						},
					},
				},
			},
			remunerations: {
				where: {
					deletedAt: null,
				},
				select: {
					id: true,
					contractEmployeeId: true,
					isSystemGenerated: true,
				},
			},
		},
	});

	if (!fee) {
		return null;
	}

	return {
		id: fee.id,
		contractId: fee.revenue.contractId,
		revenueId: fee.revenueId,
		deletedAt: fee.deletedAt,
		generatesRemuneration: fee.generatesRemuneration,
		manualRemunerationCount: fee.remunerations.filter(
			(remuneration) => !remuneration.isSystemGenerated,
		).length,
		remunerationCount: fee.remunerations.length,
		resource: {
			firmId: fee.firmId,
			statusValue: fee.revenue.contract.status.value,
			allowStatusChange: fee.revenue.contract.allowStatusChange,
			assignedEmployeeIds: fee.revenue.contract.assignments.map(
				(assignment) => assignment.employeeId,
			),
		} satisfies FeeAccessResource,
	};
}
