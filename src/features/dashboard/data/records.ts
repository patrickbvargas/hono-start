import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/prisma";
import {
	type DashboardScope,
	getDashboardPayableWhere,
	getDashboardReceivableWhere,
} from "./scope";

const contractSelect = {
	id: true,
	processNumber: true,
	customer: { select: { id: true, person: { select: { fullName: true } } } },
	legalArea: { select: { label: true, value: true } },
	assignments: {
		where: { isActive: true, deletedAt: null },
		orderBy: { id: "asc" },
		select: {
			employeeProfile: { select: { person: { select: { fullName: true } } } },
			assignmentType: { select: { value: true } },
		},
	},
} satisfies Prisma.ContractSelect;
const movementSelect = {
	id: true,
	principalAbated: true,
	effectiveAmount: true,
	effectiveDate: true,
	reversal: { select: { effectiveDate: true } },
};
const receivableSelect = {
	id: true,
	amount: true,
	dueDate: true,
	cancelledAt: true,
	kind: true,
	debtor: { select: { person: { select: { fullName: true } } } },
	analytic: { select: { label: true, value: true } },
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
			receipt: {
				select: {
					receivable: {
						select: {
							contractRevenueReceivable: {
								select: {
									revenue: {
										select: {
											revenueType: { select: { label: true, value: true } },
										},
									},
								},
							},
						},
					},
				},
			},
		},
	},
} satisfies Prisma.PayableSelect;
export async function getDashboardRecords(scope: DashboardScope) {
	return prisma.$transaction(
		async (tx) => {
			const receivables = scope.access?.revenue
				? await tx.receivable.findMany({
						where: getDashboardReceivableWhere(scope),
						select: receivableSelect,
						orderBy: { id: "asc" },
					})
				: [];
			const payables =
				scope.access?.remuneration || scope.access?.expense
					? await tx.payable.findMany({
							where: getDashboardPayableWhere(scope),
							select: payableSelect,
							orderBy: { id: "asc" },
						})
					: [];
			return { scope, receivables, payables };
		},
		{ isolationLevel: "RepeatableRead", timeout: 15_000 },
	);
}
export type DashboardRecords = Awaited<ReturnType<typeof getDashboardRecords>>;
export type DashboardReceivable = DashboardRecords["receivables"][number];
export type DashboardPayable = DashboardRecords["payables"][number];
type Movement = {
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
