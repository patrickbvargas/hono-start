import type { Prisma } from "@/generated/prisma/client";
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
		...(filter.query
			? {
					notes: {
						contains: filter.query,
						mode: "insensitive" as const,
					},
				}
			: {}),
		...(filter.category
			? {
					category: {
						value: filter.category,
					},
				}
			: {}),
		...(filter.dateFrom || filter.dateTo ? { expenseDate: dateFilter } : {}),
	};
}

function mapExpenseSummary(row: {
	id: number;
	amount: Prisma.Decimal;
	expenseDate: Date;
	isActive: boolean;
	deletedAt: Date | null;
	createdAt: Date;
	category: {
		id: number;
		label: string;
		value: string;
	};
}) {
	return expenseSummarySchema.parse({
		id: row.id,
		category: row.category.label,
		categoryId: row.category.id,
		categoryValue: row.category.value,
		expenseDate: row.expenseDate.toISOString(),
		amount: Number(row.amount),
		isActive: row.isActive,
		isSoftDeleted: Boolean(row.deletedAt),
		createdAt: row.createdAt.toISOString(),
	});
}

export async function getExpenses({
	firmId,
	search,
}: EntitySearchParams<ExpenseSearch>): Promise<
	QueryPaginatedReturnType<ExpenseSummary>
> {
	const where = buildExpenseWhere({ firmId, filter: search });

	const sortMap: Record<string, Prisma.ExpenseOrderByWithRelationInput> = {
		amount: { amount: search.direction },
		category: { category: { label: search.direction } },
		createdAt: { createdAt: search.direction },
		expenseDate: { expenseDate: search.direction },
		id: { id: search.direction },
	};
	const orderBy = withDeterministicTieBreaker(
		sortMap[search.column] ?? { expenseDate: "desc" },
		{ id: "asc" },
	);

	const [rows, total] = await Promise.all([
		prisma.expense.findMany({
			where,
			include: {
				category: {
					select: {
						id: true,
						label: true,
						value: true,
					},
				},
			},
			orderBy,
			skip: (search.page - 1) * search.limit,
			take: search.limit,
		}),
		prisma.expense.count({ where }),
	]);

	return {
		data: rows.map(mapExpenseSummary),
		total,
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
			category: {
				select: {
					id: true,
					label: true,
					value: true,
				},
			},
		},
	});

	if (!row) {
		throw new Error(EXPENSE_ERRORS.DETAIL_NOT_FOUND);
	}

	return expenseDetailSchema.parse({
		id: row.id,
		categoryId: row.category.id,
		category: row.category.label,
		categoryValue: row.category.value,
		expenseDate: row.expenseDate.toISOString(),
		amount: Number(row.amount),
		notes: row.notes,
		isActive: row.isActive,
		isSoftDeleted: Boolean(row.deletedAt),
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt?.toISOString() ?? null,
	});
}

export async function getExpenseCategories(): Promise<
	QueryManyReturnType<Option>
> {
	const rows = await prisma.expenseCategory.findMany({
		orderBy: [{ isActive: "desc" }, { label: "asc" }],
	});

	return optionSchema.array().parse(rows);
}

export async function getExpenseCategoryByValue(value: string) {
	return prisma.expenseCategory.findUnique({
		where: { value },
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
