import type { Prisma } from "@/generated/prisma/client";
import {
	getEntityActiveWhere,
	getEntityDeletedWhere,
	withDeterministicTieBreaker,
} from "@/shared/lib/entity-management";
import { prisma } from "@/shared/lib/prisma";
import { financialTotalsSchema } from "@/shared/schemas/financial-totals";
import { type Option, optionSchema } from "@/shared/schemas/option";
import type {
	FinancialQueryPaginatedReturnType,
	QueryManyReturnType,
	QueryOneReturnType,
} from "@/shared/types/api";
import type {
	EntityFilterParams,
	EntitySearchParams,
	EntityUniqueParams,
} from "@/shared/types/entity";
import { EXPENSE_ERRORS } from "../constants/errors";
import type { ExpenseFilter } from "../schemas/filter";
import {
	type ExpenseDetail,
	type ExpenseSummary,
	expenseDetailSchema,
	expenseSummarySchema,
} from "../schemas/model";
import type { ExpenseSearch } from "../schemas/search";

function buildExpenseWhere({
	firmId,
	filter,
}: EntityFilterParams<ExpenseFilter>): Prisma.ExpenseWhereInput {
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
		...(filter.supplierId ? { supplierId: filter.supplierId } : {}),
		...(filter.query
			? {
					OR: [
						{
							notes: {
								contains: filter.query,
								mode: "insensitive" as const,
							},
						},
						{
							supplier: {
								person: {
									fullName: {
										contains: filter.query,
										mode: "insensitive" as const,
									},
								},
							},
						},
					],
				}
			: {}),
		...(filter.dateFrom || filter.dateTo ? { createdAt: dateFilter } : {}),
	};
}

function mapExpenseSummary(row: {
	id: number;
	negotiatedAmount: Prisma.Decimal;
	notes: string | null;
	isActive: boolean;
	deletedAt: Date | null;
	createdAt: Date;
	supplier: {
		id: number;
		person: {
			fullName: string;
			document: string | null;
		};
	};
}) {
	return expenseSummarySchema.parse({
		id: row.id,
		supplierId: row.supplier.id,
		supplierName: row.supplier.person.fullName,
		supplierDocument: row.supplier.person.document,
		negotiatedAmount: Number(row.negotiatedAmount),
		notes: row.notes,
		isActive: row.isActive,
		isSoftDeleted: Boolean(row.deletedAt),
		createdAt: row.createdAt.toISOString(),
	});
}

export async function getExpenses({
	firmId,
	search,
}: EntitySearchParams<ExpenseSearch>): Promise<
	FinancialQueryPaginatedReturnType<ExpenseSummary>
> {
	const where = buildExpenseWhere({ firmId, filter: search });

	const sortMap: Record<string, Prisma.ExpenseOrderByWithRelationInput> = {
		id: { id: search.direction },
		supplierName: { supplier: { person: { fullName: search.direction } } },
		negotiatedAmount: { negotiatedAmount: search.direction },
		createdAt: { createdAt: search.direction },
	};
	const orderBy = withDeterministicTieBreaker(
		sortMap[search.column] ?? { createdAt: "desc" },
		{ id: "asc" },
	);

	const [rows, total, aggregate] = await Promise.all([
		prisma.expense.findMany({
			where,
			include: {
				supplier: {
					select: {
						id: true,
						person: {
							select: {
								fullName: true,
								document: true,
							},
						},
					},
				},
			},
			orderBy,
			skip: (search.page - 1) * search.limit,
			take: search.limit,
		}),
		prisma.expense.count({ where }),
		prisma.expense.aggregate({ where, _sum: { negotiatedAmount: true } }),
	]);

	return {
		data: rows.map(mapExpenseSummary),
		total,
		...financialTotalsSchema.parse({
			totalAmount: Number(aggregate._sum.negotiatedAmount ?? 0),
		}),
		page: search.page,
		pageSize: search.limit,
	};
}

export async function getExpenseById({
	firmId,
	id,
}: EntityUniqueParams): Promise<QueryOneReturnType<ExpenseDetail>> {
	const row = await prisma.expense.findFirst({
		where: { id, firmId },
		include: {
			supplier: {
				select: {
					id: true,
					person: {
						select: {
							fullName: true,
							document: true,
						},
					},
				},
			},
		},
	});

	if (!row) {
		throw new Error(EXPENSE_ERRORS.DETAIL_NOT_FOUND);
	}

	return expenseDetailSchema.parse({
		id: row.id,
		supplierId: row.supplier.id,
		supplierName: row.supplier.person.fullName,
		supplierDocument: row.supplier.person.document,
		negotiatedAmount: Number(row.negotiatedAmount),
		notes: row.notes,
		isActive: row.isActive,
		isSoftDeleted: Boolean(row.deletedAt),
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt?.toISOString() ?? null,
	});
}

export async function getExpenseSuppliers(): Promise<
	QueryManyReturnType<Option>
> {
	const rows = await prisma.supplierProfile.findMany({
		where: {
			person: {
				deletedAt: null,
			},
		},
		include: {
			person: {
				select: {
					fullName: true,
					document: true,
					isActive: true,
				},
			},
		},
		orderBy: [{ isActive: "desc" }, { person: { fullName: "asc" } }],
	});

	return optionSchema.array().parse(
		rows.map((row) => ({
			id: row.id,
			value: String(row.id),
			label: row.person.fullName,
			isActive: row.isActive && row.person.isActive,
		})),
	);
}

export async function getSupplierProfileById(id: number) {
	return prisma.supplierProfile.findUnique({
		where: { id },
		include: {
			person: true,
		},
	});
}

export async function getExpenseAccessResourceById(firmId: number, id: number) {
	const expense = await prisma.expense.findFirst({
		where: { id, firmId },
		select: {
			id: true,
			firmId: true,
			deletedAt: true,
		},
	});

	if (!expense) {
		return null;
	}

	return {
		id: expense.id,
		deletedAt: expense.deletedAt,
		resource: { firmId: expense.firmId },
	};
}
