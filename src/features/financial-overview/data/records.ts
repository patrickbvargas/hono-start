import { Prisma, type TitleKind } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/prisma";
import type { FinancialOverviewSearch } from "../schemas/search";

export interface FinancialOverviewScope {
	firmId: number;
	search: FinancialOverviewSearch;
}

const movementSelect = {
	id: true,
	principalAbated: true,
	effectiveAmount: true,
	effectiveDate: true,
	reversal: { select: { effectiveDate: true } },
};

const contractSelect = {
	id: true,
	processNumber: true,
	customer: { select: { id: true, person: { select: { fullName: true } } } },
	legalArea: { select: { label: true, value: true } },
} satisfies Prisma.ContractSelect;

const receivableSelect = {
	id: true,
	amount: true,
	dueDate: true,
	cancelledAt: true,
	kind: true,
	debtor: { select: { person: { select: { fullName: true } } } },
	analytic: { select: { label: true, value: true } },
	expectedPaymentMethod: { select: { label: true, value: true } },
	receipts: { select: movementSelect },
	contractRevenueReceivable: {
		select: {
			contract: { select: contractSelect },
			revenue: {
				select: { revenueType: { select: { label: true, value: true } } },
			},
		},
	},
} satisfies Prisma.ReceivableSelect;

const payableSelect = {
	id: true,
	amount: true,
	dueDate: true,
	cancelledAt: true,
	kind: true,
	beneficiary: { select: { person: { select: { fullName: true } } } },
	analytic: { select: { label: true, value: true } },
	expectedPaymentMethod: { select: { label: true, value: true } },
	payments: { select: movementSelect },
	remunerationPayable: {
		select: {
			createdAt: true,
			contractAssignment: {
				select: {
					employeeProfileId: true,
					employeeProfile: {
						select: { person: { select: { fullName: true } } },
					},
					assignmentType: { select: { label: true, value: true } },
					contract: { select: contractSelect },
				},
			},
		},
	},
} satisfies Prisma.PayableSelect;

export type ReceivableRecord = Prisma.ReceivableGetPayload<{
	select: typeof receivableSelect;
}>;

export type PayableRecord = Prisma.PayableGetPayload<{
	select: typeof payableSelect;
}>;

export interface FinancialOverviewRecords {
	scope: FinancialOverviewScope;
	receivables: ReceivableRecord[];
	payables: PayableRecord[];
}

export type Movement = {
	principalAbated: Prisma.Decimal;
	effectiveAmount: Prisma.Decimal;
	effectiveDate: Date;
	reversal: { effectiveDate: Date } | null;
};

export function getOutstanding(
	title: { amount: Prisma.Decimal; cancelledAt: Date | null },
	movements: Movement[],
	reference: Date,
): Prisma.Decimal {
	if (title.cancelledAt && title.cancelledAt <= reference) {
		return new Prisma.Decimal(0);
	}
	const principal = movements
		.filter(
			(row) =>
				row.effectiveDate <= reference &&
				(!row.reversal || row.reversal.effectiveDate > reference),
		)
		.reduce((sum, row) => sum.add(row.principalAbated), new Prisma.Decimal(0));
	return Prisma.Decimal.max(0, title.amount.minus(principal));
}

export function getCashEvents<T extends Movement>(movements: T[]) {
	return movements.flatMap((row) => [
		{ date: row.effectiveDate, amount: row.effectiveAmount, reversed: false },
		...(row.reversal
			? [
					{
						date: row.reversal.effectiveDate,
						amount: row.effectiveAmount.negated(),
						reversed: true,
					},
				]
			: []),
	]);
}

export async function getFinancialOverviewRecords(
	scope: FinancialOverviewScope,
): Promise<FinancialOverviewRecords> {
	return prisma.$transaction(async (tx) => {
		const selectedCategories = [
			...(scope.search.analytic ? [scope.search.analytic] : []),
			...(scope.search.categories ?? []),
		];

		const categoryFilter =
			selectedCategories.length > 0
				? { analytic: { value: { in: selectedCategories } } }
				: {};

		const paymentMethodFilter =
			scope.search.paymentMethods && scope.search.paymentMethods.length > 0
				? {
						expectedPaymentMethod: {
							value: { in: scope.search.paymentMethods },
						},
					}
				: {};

		const validKinds = (scope.search.kinds ?? []).filter(
			(k): k is TitleKind =>
				k === "DOWN_PAYMENT" || k === "INSTALLMENT" || k === "EXTRA",
		);

		const kindFilter =
			validKinds.length > 0 ? { kind: { in: validKinds } } : {};

		const receivableLegalAreaFilter =
			scope.search.legalAreas && scope.search.legalAreas.length > 0
				? {
						contractRevenueReceivable: {
							contract: {
								legalArea: { value: { in: scope.search.legalAreas } },
							},
						},
					}
				: {};

		const payableLegalAreaFilter =
			scope.search.legalAreas && scope.search.legalAreas.length > 0
				? {
						remunerationPayable: {
							contractAssignment: {
								contract: {
									legalArea: { value: { in: scope.search.legalAreas } },
								},
							},
						},
					}
				: {};

		const payableWhere: Prisma.PayableWhereInput = {
			firmId: scope.firmId,
			...categoryFilter,
			...paymentMethodFilter,
			...kindFilter,
			...payableLegalAreaFilter,
		};

		const receivableWhere: Prisma.ReceivableWhereInput = {
			firmId: scope.firmId,
			...categoryFilter,
			...paymentMethodFilter,
			...kindFilter,
			...receivableLegalAreaFilter,
		};

		const [receivables, payables] = await Promise.all([
			tx.receivable.findMany({
				where: receivableWhere,
				select: receivableSelect,
				orderBy: { dueDate: "asc" },
			}),
			tx.payable.findMany({
				where: payableWhere,
				select: payableSelect,
				orderBy: { dueDate: "asc" },
			}),
		]);

		return { scope, receivables, payables };
	});
}
