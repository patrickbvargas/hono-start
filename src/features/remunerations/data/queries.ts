import type { Prisma } from "@/generated/prisma/client";
import {
	getEntityActiveWhere,
	getEntityDeletedWhere,
	withDeterministicTieBreaker,
} from "@/shared/lib/entity-management";
import { prisma } from "@/shared/lib/prisma";
import type { Option } from "@/shared/schemas/option";
import type { RemunerationAccessResource } from "@/shared/session";
import type {
	QueryManyReturnType,
	QueryOneReturnType,
	QueryPaginatedReturnType,
} from "@/shared/types/api";
import { REMUNERATION_ERRORS } from "../constants/errors";
import type { RemunerationFilter } from "../schemas/filter";
import { type Remuneration, remunerationSchema } from "../schemas/model";
import type { RemunerationSearch } from "../schemas/search";

interface RemunerationScope {
	firmId: number;
	employeeId?: number;
	isAdmin: boolean;
}

interface BuildRemunerationWhereParams extends RemunerationScope {
	filter: RemunerationFilter;
}

interface GetRemunerationsParams {
	scope: RemunerationScope;
	search: RemunerationSearch;
}

interface GetRemunerationByIdParams {
	id: number;
	scope: RemunerationScope;
}

export function buildRemunerationWhere({
	firmId,
	employeeId,
	filter,
	isAdmin,
}: BuildRemunerationWhereParams): Prisma.RemunerationWhereInput {
	if (!isAdmin && !employeeId) {
		throw new Error(
			"Não foi possível identificar o colaborador da sessão para consultar remunerações",
		);
	}

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
		...(filter.dateFrom || filter.dateTo ? { paymentDate: dateFilter } : {}),
		contractEmployee: {
			...(filter.contractId ? { contractId: Number(filter.contractId) } : {}),
			...(isAdmin
				? filter.employeeId
					? { employeeId: Number(filter.employeeId) }
					: {}
				: employeeId
					? { employeeId }
					: {}),
		},
	};
}

export function getRemunerationOrderBy(search: RemunerationSearch) {
	const sortMap: Record<string, Prisma.RemunerationOrderByWithRelationInput> = {
		amount: { amount: search.direction },
		createdAt: { createdAt: search.direction },
		effectivePercentage: { effectivePercentage: search.direction },
		employeeName: {
			contractEmployee: {
				employee: {
					fullName: search.direction,
				},
			},
		},
		paymentDate: { paymentDate: search.direction },
	};

	return withDeterministicTieBreaker(
		sortMap[search.column] ?? { paymentDate: "desc" },
		{ id: "asc" },
	);
}

export const remunerationListInclude = {
	contractEmployee: {
		select: {
			id: true,
			contractId: true,
			employeeId: true,
			employee: {
				select: {
					fullName: true,
				},
			},
			contract: {
				select: {
					processNumber: true,
					client: {
						select: {
							fullName: true,
						},
					},
				},
			},
		},
	},
	fee: {
		select: {
			id: true,
			amount: true,
			installmentNumber: true,
			deletedAt: true,
		},
	},
} as const;

export async function mapRemunerations(
	remunerations: Array<{
		id: number;
		contractEmployeeId: number;
		effectivePercentage: Prisma.Decimal;
		amount: Prisma.Decimal;
		paymentDate: Date;
		isSystemGenerated: boolean;
		isActive: boolean;
		deletedAt: Date | null;
		createdAt: Date;
		updatedAt: Date;
		contractEmployee: {
			id: number;
			contractId: number;
			employeeId: number;
			employee: {
				fullName: string;
			};
			contract: {
				processNumber: string;
				client: {
					fullName: string;
				};
			};
		};
		fee: {
			id: number;
			amount: Prisma.Decimal;
			installmentNumber: number;
			deletedAt: Date | null;
		};
	}>,
) {
	return remunerationSchema.array().parse(
		remunerations.map((remuneration) => ({
			id: remuneration.id,
			contractEmployeeId: remuneration.contractEmployeeId,
			employeeId: remuneration.contractEmployee.employeeId,
			employeeName: remuneration.contractEmployee.employee.fullName,
			client: remuneration.contractEmployee.contract.client.fullName,
			contractId: remuneration.contractEmployee.contractId,
			contractProcessNumber:
				remuneration.contractEmployee.contract.processNumber,
			feeId: remuneration.fee.id,
			feeAmount: Number(remuneration.fee.amount),
			feeInstallmentNumber: remuneration.fee.installmentNumber,
			paymentDate: remuneration.paymentDate.toISOString(),
			amount: Number(remuneration.amount),
			effectivePercentage: Number(remuneration.effectivePercentage),
			isManualOverride: !remuneration.isSystemGenerated,
			isSystemGenerated: remuneration.isSystemGenerated,
			isActive: remuneration.isActive,
			isSoftDeleted: remuneration.deletedAt !== null,
			parentFeeIsSoftDeleted: remuneration.fee.deletedAt !== null,
			createdAt: remuneration.createdAt.toISOString(),
			updatedAt: remuneration.updatedAt.toISOString(),
		})),
	);
}

export async function getRemunerations({
	scope,
	search,
}: GetRemunerationsParams): Promise<QueryPaginatedReturnType<Remuneration>> {
	const where = buildRemunerationWhere({
		...scope,
		filter: search,
	});

	const [remunerations, total] = await Promise.all([
		prisma.remuneration.findMany({
			where,
			include: remunerationListInclude,
			orderBy: getRemunerationOrderBy(search),
			skip: (search.page - 1) * search.limit,
			take: search.limit,
		}),
		prisma.remuneration.count({ where }),
	]);

	return {
		data: await mapRemunerations(remunerations),
		total,
		page: search.page,
		pageSize: search.limit,
	};
}

export async function getRemunerationById({
	id,
	scope,
}: GetRemunerationByIdParams): Promise<QueryOneReturnType<Remuneration>> {
	const remuneration = await prisma.remuneration.findFirst({
		where: {
			...buildRemunerationWhere({
				...scope,
				filter: {
					employeeId: "",
					contractId: "",
					dateFrom: "",
					dateTo: "",
					active: "all",
					status: "all",
				},
			}),
			id,
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
}

export async function getSelectableRemunerationContracts({
	firmId,
	employeeId,
	isAdmin,
}: RemunerationScope): Promise<QueryManyReturnType<Option>> {
	const contracts = await prisma.contract.findMany({
		where: {
			firmId,
			assignments: {
				some: isAdmin
					? {
							remunerations: {
								some: {
									firmId,
								},
							},
						}
					: {
							employeeId,
							remunerations: {
								some: {
									firmId,
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
}

export async function getSelectableRemunerationEmployees({
	firmId,
	isAdmin,
}: RemunerationScope): Promise<QueryManyReturnType<Option>> {
	if (!isAdmin) {
		return [];
	}

	const employees = await prisma.employee.findMany({
		where: {
			firmId,
			contractAssignments: {
				some: {
					remunerations: {
						some: {
							firmId,
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
}

export async function getRemunerationsForExport({
	scope,
	search,
}: GetRemunerationsParams): Promise<Remuneration[]> {
	const where = buildRemunerationWhere({
		...scope,
		filter: search,
	});

	const remunerations = await prisma.remuneration.findMany({
		where,
		include: remunerationListInclude,
		orderBy: getRemunerationOrderBy(search),
	});

	return mapRemunerations(remunerations);
}

export async function getRemunerationAccessResourceById(
	firmId: number,
	id: number,
) {
	const remuneration = await prisma.remuneration.findFirst({
		where: {
			id,
			firmId,
		},
		select: {
			id: true,
			firmId: true,
			deletedAt: true,
			contractEmployee: {
				select: {
					employeeId: true,
					contract: {
						select: {
							processNumber: true,
						},
					},
				},
			},
			fee: {
				select: {
					deletedAt: true,
				},
			},
		},
	});

	if (!remuneration) {
		return null;
	}

	return {
		id: remuneration.id,
		deletedAt: remuneration.deletedAt,
		parentFeeIsSoftDeleted: remuneration.fee.deletedAt !== null,
		contractProcessNumber: remuneration.contractEmployee.contract.processNumber,
		resource: {
			firmId: remuneration.firmId,
			employeeId: remuneration.contractEmployee.employeeId,
		} satisfies RemunerationAccessResource,
	};
}
