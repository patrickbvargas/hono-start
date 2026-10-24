import { prisma } from "@/shared/lib/prisma";
import {
	buildDashboardPaymentDateWhere,
	createMonthEnd,
	getComparisonBoundaries,
	getDashboardPeriod,
	getFinancialEvolutionMonthRange,
} from "../utils/period";
import { dashboardRevenueSelect } from "./revenue-select";
import type { DashboardScope } from "./scope";
import {
	getDashboardExpenseWhere,
	getDashboardFeeRevenueWhere,
	getDashboardRemunerationWhere,
	getDashboardRevenueWhere,
} from "./scope";

async function readAuthorized<T>(
	allowed: boolean,
	read: () => Promise<T[]>,
): Promise<T[]> {
	return allowed ? read() : [];
}

export async function getDashboardRecords(scope: DashboardScope) {
	const {
		currentStart,
		nextStart,
		previousStart,
		previousEndExclusive,
		previousLabel,
		previousPeriodLabel,
	} = getComparisonBoundaries(scope.search);
	const period = getDashboardPeriod(scope.search);
	const paymentDateWhere = buildDashboardPaymentDateWhere(period);
	const revenueWhere = getDashboardRevenueWhere(scope);
	const remunerationWhere = getDashboardRemunerationWhere(scope);
	const expenseWhere = getDashboardExpenseWhere(scope);
	const firmWhere = {
		firmId: scope.firmId,
		deletedAt: null,
		isActive: true,
	};
	const chartMonthRange = getFinancialEvolutionMonthRange(scope.search);
	const chartWindowStart = period.dateFrom
		? new Date(
				Math.max(
					period.dateFrom.getTime(),
					chartMonthRange.startMonth.getTime(),
				),
			)
		: chartMonthRange.startMonth;
	const chartWindowEnd = period.dateTo
		? new Date(
				Math.min(
					period.dateTo.getTime(),
					createMonthEnd(chartMonthRange.endMonth).getTime(),
				),
			)
		: createMonthEnd(chartMonthRange.endMonth);

	const [
		revenues,
		currentFees,
		previousFees,
		allRemunerations,
		currentRemunerations,
		previousRemunerations,
		chartDownPayments,
		chartFees,
		chartRemunerations,
		tableRemunerations,
		allExpenses,
		currentExpenses,
		previousExpenses,
		chartCashFlowDownPayments,
		chartCashFlowFees,
		chartCashFlowExpenses,
	] = await Promise.all([
		readAuthorized(scope.access?.revenue === true, () =>
			prisma.revenue.findMany({
				where: revenueWhere,
				select: dashboardRevenueSelect,
			}),
		),
		readAuthorized(scope.access?.revenue === true, () =>
			prisma.fee.findMany({
				where: {
					...firmWhere,
					paymentDate: {
						gte: currentStart,
						lt: nextStart,
					},
					revenue: getDashboardFeeRevenueWhere(scope),
				},
				select: {
					amount: true,
				},
			}),
		),
		readAuthorized(scope.access?.revenue === true, () =>
			prisma.fee.findMany({
				where: {
					...firmWhere,
					paymentDate: {
						gte: previousStart,
						lt: previousEndExclusive,
					},
					revenue: getDashboardFeeRevenueWhere(scope),
				},
				select: {
					amount: true,
				},
			}),
		),
		readAuthorized(scope.access?.remuneration === true, () =>
			prisma.remuneration.findMany({
				where: {
					...remunerationWhere,
					...(paymentDateWhere ? { paymentDate: paymentDateWhere } : {}),
				},
				select: {
					amount: true,
				},
			}),
		),
		readAuthorized(scope.access?.remuneration === true, () =>
			prisma.remuneration.findMany({
				where: {
					...remunerationWhere,
					paymentDate: {
						gte: currentStart,
						lt: nextStart,
					},
				},
				select: {
					amount: true,
				},
			}),
		),
		readAuthorized(scope.access?.remuneration === true, () =>
			prisma.remuneration.findMany({
				where: {
					...remunerationWhere,
					paymentDate: {
						gte: previousStart,
						lt: previousEndExclusive,
					},
				},
				select: {
					amount: true,
				},
			}),
		),
		readAuthorized(scope.access?.revenue === true, () =>
			prisma.revenue.findMany({
				where: {
					...revenueWhere,
					paymentStartDate: {
						gte: chartWindowStart,
						lte: chartWindowEnd,
					},
				},
				select: {
					downPaymentValue: true,
					paymentStartDate: true,
				},
			}),
		),
		readAuthorized(scope.access?.revenue === true, () =>
			prisma.fee.findMany({
				where: {
					...firmWhere,
					paymentDate: {
						gte: chartWindowStart,
						lte: chartWindowEnd,
					},
					revenue: getDashboardFeeRevenueWhere(scope),
				},
				select: {
					amount: true,
					paymentDate: true,
				},
			}),
		),
		readAuthorized(scope.access?.remuneration === true, () =>
			prisma.remuneration.findMany({
				where: {
					...remunerationWhere,
					paymentDate: {
						gte: chartWindowStart,
						lte: chartWindowEnd,
					},
				},
				select: {
					amount: true,
					paymentDate: true,
				},
			}),
		),
		readAuthorized(scope.access?.remuneration === true, () =>
			prisma.remuneration.findMany({
				where: {
					...remunerationWhere,
					...(paymentDateWhere ? { paymentDate: paymentDateWhere } : {}),
				},
				select: {
					amount: true,
					paymentDate: true,
					contractEmployee: {
						select: {
							contract: {
								select: { legalArea: { select: { label: true, value: true } } },
							},
							assignmentType: { select: { label: true, value: true } },
							employee: {
								select: {
									id: true,
									fullName: true,
								},
							},
						},
					},
					fee: {
						select: {
							revenue: {
								select: { type: { select: { label: true, value: true } } },
							},
						},
					},
				},
			}),
		),
		scope.access?.expense === true
			? readAuthorized(scope.access?.expense === true, () =>
					prisma.expense.findMany({
						where: {
							...expenseWhere,
							...(paymentDateWhere ? { expenseDate: paymentDateWhere } : {}),
						},
						select: {
							amount: true,
							category: { select: { label: true, value: true } },
						},
					}),
				)
			: Promise.resolve([]),
		scope.access?.expense === true
			? readAuthorized(scope.access?.expense === true, () =>
					prisma.expense.findMany({
						where: {
							...expenseWhere,
							expenseDate: {
								gte: currentStart,
								lt: nextStart,
							},
						},
						select: {
							amount: true,
						},
					}),
				)
			: Promise.resolve([]),
		scope.access?.expense === true
			? readAuthorized(scope.access?.expense === true, () =>
					prisma.expense.findMany({
						where: {
							...expenseWhere,
							expenseDate: {
								gte: previousStart,
								lt: previousEndExclusive,
							},
						},
						select: {
							amount: true,
						},
					}),
				)
			: Promise.resolve([]),
		scope.access?.expense === true
			? readAuthorized(scope.access?.revenue === true, () =>
					prisma.revenue.findMany({
						where: {
							...revenueWhere,
							paymentStartDate: {
								gte: chartWindowStart,
								lte: chartWindowEnd,
							},
						},
						select: {
							downPaymentValue: true,
							paymentStartDate: true,
							type: {
								select: {
									value: true,
								},
							},
						},
					}),
				)
			: Promise.resolve([]),
		scope.access?.expense === true
			? readAuthorized(scope.access?.revenue === true, () =>
					prisma.fee.findMany({
						where: {
							...firmWhere,
							paymentDate: {
								gte: chartWindowStart,
								lte: chartWindowEnd,
							},
							revenue: getDashboardFeeRevenueWhere(scope),
						},
						select: {
							amount: true,
							paymentDate: true,
							revenue: {
								select: {
									type: {
										select: {
											value: true,
										},
									},
								},
							},
						},
					}),
				)
			: Promise.resolve([]),
		scope.access?.expense === true
			? readAuthorized(scope.access?.expense === true, () =>
					prisma.expense.findMany({
						where: {
							...expenseWhere,
							expenseDate: {
								gte: chartWindowStart,
								lte: chartWindowEnd,
							},
						},
						select: {
							amount: true,
							expenseDate: true,
						},
					}),
				)
			: Promise.resolve([]),
	]);

	return {
		scope,
		currentStart,
		nextStart,
		previousStart,
		previousEndExclusive,
		previousLabel,
		previousPeriodLabel,
		period,
		chartMonthRange,
		revenues,
		currentFees,
		previousFees,
		allRemunerations,
		currentRemunerations,
		previousRemunerations,
		chartDownPayments,
		chartFees,
		chartRemunerations,
		tableRemunerations,
		allExpenses,
		currentExpenses,
		previousExpenses,
		chartCashFlowDownPayments,
		chartCashFlowFees,
		chartCashFlowExpenses,
	};
}
