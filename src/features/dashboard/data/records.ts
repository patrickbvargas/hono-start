import { prisma } from "@/shared/lib/prisma";
import {
	buildDashboardPaymentDateWhere,
	createMonthEnd,
	getComparisonBoundaries,
	getDashboardPeriod,
	getFinancialEvolutionMonthRange,
} from "../utils/period";
import type { DashboardScope } from "./scope";
import {
	getDashboardExpenseWhere,
	getDashboardFeeRevenueWhere,
	getDashboardRemunerationWhere,
	getDashboardRevenueWhere,
} from "./scope";

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
		prisma.revenue.findMany({
			where: revenueWhere,
			select: {
				id: true,
				totalValue: true,
				downPaymentValue: true,
				paymentStartDate: true,
				totalInstallments: true,
				type: {
					select: {
						label: true,
						value: true,
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
						legalArea: {
							select: {
								label: true,
								value: true,
							},
						},
						assignments: {
							where: {
								deletedAt: null,
								isActive: true,
							},
							select: {
								employee: {
									select: {
										fullName: true,
									},
								},
								assignmentType: {
									select: {
										value: true,
									},
								},
							},
						},
					},
				},
				fees: {
					where: {
						deletedAt: null,
						isActive: true,
					},
					select: {
						amount: true,
						paymentDate: true,
						installmentNumber: true,
					},
				},
			},
		}),
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
		prisma.remuneration.findMany({
			where: {
				...remunerationWhere,
				...(paymentDateWhere ? { paymentDate: paymentDateWhere } : {}),
			},
			select: {
				amount: true,
			},
		}),
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
						employee: {
							select: {
								id: true,
								fullName: true,
							},
						},
					},
				},
			},
		}),
		scope.isAdmin && scope.canReadCashFlow === true
			? prisma.expense.findMany({
					where: {
						...expenseWhere,
						...(paymentDateWhere ? { expenseDate: paymentDateWhere } : {}),
					},
					select: {
						amount: true,
					},
				})
			: Promise.resolve([]),
		scope.isAdmin && scope.canReadCashFlow === true
			? prisma.expense.findMany({
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
				})
			: Promise.resolve([]),
		scope.isAdmin && scope.canReadCashFlow === true
			? prisma.expense.findMany({
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
				})
			: Promise.resolve([]),
		scope.isAdmin && scope.canReadCashFlow === true
			? prisma.revenue.findMany({
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
				})
			: Promise.resolve([]),
		scope.isAdmin && scope.canReadCashFlow === true
			? prisma.fee.findMany({
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
				})
			: Promise.resolve([]),
		scope.isAdmin && scope.canReadCashFlow === true
			? prisma.expense.findMany({
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
				})
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
