import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { assertDashboardDrilldownScope } from "../rules/drilldown";
import type {
	DashboardDrilldownInput,
	DashboardDrilldownRow,
} from "../schemas/drilldown";
import { dashboardDrilldownResultSchema } from "../schemas/drilldown";
import {
	buildDashboardPaymentDateWhere,
	createMonthEnd,
	getDashboardPeriod,
	getFinancialEvolutionMonthRange,
	isDateInsidePeriod,
} from "../utils/period";
import { getInstallmentBucket } from "./analysis";
import { dashboardRevenueSelect } from "./revenue-select";
import { buildRevenueSchedule } from "./schedule";
import {
	type DashboardScope,
	getDashboardExpenseWhere,
	getDashboardRemunerationWhere,
	getDashboardRevenueWhere,
} from "./scope";

export function buildDashboardDrilldownResult(rows: DashboardDrilldownRow[]) {
	rows.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
	const amount = rows.reduce(
		(sum, row) => sum.add(row.amount),
		new Prisma.Decimal(0),
	);
	const entries = rows.reduce(
		(sum, row) => (row.amount > 0 ? sum.add(row.amount) : sum),
		new Prisma.Decimal(0),
	);
	const deductions = rows.reduce(
		(sum, row) => (row.amount < 0 ? sum.add(row.amount) : sum),
		new Prisma.Decimal(0),
	);
	return dashboardDrilldownResultSchema.parse({
		data: rows,
		total: rows.length,
		amount: Number(amount),
		entries: Number(entries),
		deductions: Number(deductions),
	});
}

export async function getDashboardDrilldown(
	scope: DashboardScope,
	input: DashboardDrilldownInput,
) {
	assertDashboardDrilldownScope(scope, input);
	const selection = input.selection;
	let period = getDashboardPeriod(scope.search);
	if (selection.kind === "monthly" || selection.kind === "employee-month") {
		const range = getFinancialEvolutionMonthRange(scope.search);
		const start = selection.month
			? new Date(`${selection.month}-01T00:00:00.000Z`)
			: range.startMonth;
		const end = createMonthEnd(selection.month ? start : range.endMonth);
		period = {
			hasPeriod: true,
			dateFrom: new Date(
				Math.max(
					start.getTime(),
					period.dateFrom?.getTime() ?? start.getTime(),
				),
			),
			dateTo: new Date(
				Math.min(end.getTime(), period.dateTo?.getTime() ?? end.getTime()),
			),
		};
	}
	const dateWhere = buildDashboardPaymentDateWhere(period);
	const rows = await prisma.$transaction(
		async (tx) => {
			const result: DashboardDrilldownRow[] = [];
			const periodSelection =
				selection.kind === "monthly" || selection.kind === "metric";
			const series =
				selection.kind === "monthly"
					? selection.series
					: selection.kind === "metric"
						? selection.value
						: undefined;
			const receipts =
				!["function", "expense", "employee-month"].includes(selection.kind) &&
				(!periodSelection ||
					series === "revenue" ||
					series === "planned" ||
					series === "result");
			if (receipts) {
				const revenues = await tx.revenue.findMany({
					where: getDashboardRevenueWhere(scope),
					select: dashboardRevenueSelect,
				});
				for (const revenue of revenues) {
					if (
						(selection.kind === "area" &&
							revenue.contract.legalArea.value !== selection.value) ||
						(selection.kind === "type" &&
							revenue.type.value !== selection.value) ||
						(selection.kind === "client" &&
							String(revenue.contract.client.id) !== selection.value) ||
						(selection.kind === "monthly" &&
							selection.revenueType &&
							revenue.type.value !== selection.revenueType)
					) {
						continue;
					}
					const context = {
						client: revenue.contract.client.fullName,
						process: revenue.contract.processNumber,
						type: revenue.type.label,
						description: revenue.type.label,
					};
					if (selection.kind === "aging" || selection.kind === "forecast") {
						const reference = new Date(input.referenceAt);
						for (const installment of buildRevenueSchedule(
							revenue,
							reference,
						)) {
							const bucket = getInstallmentBucket(
								installment.dueDate,
								reference,
							);
							if (
								installment.outstanding.lte(0) ||
								bucket?.kind !== selection.kind ||
								bucket.value !== selection.value
							) {
								continue;
							}
							result.push({
								...context,
								id: `installment:${revenue.id}:${installment.installmentNumber}`,
								date: installment.dueDate.toISOString(),
								kind: "Parcela",
								installment: installment.installmentNumber,
								faceAmount: Number(installment.amount),
								paid: Number(installment.amount.minus(installment.outstanding)),
								amount: Number(installment.outstanding),
							});
						}
					} else {
						if (
							revenue.downPaymentValue &&
							!revenue.downPaymentValue.equals(0) &&
							isDateInsidePeriod(revenue.paymentStartDate, period)
						) {
							result.push({
								...context,
								id: `down-payment:${revenue.id}`,
								date: revenue.paymentStartDate.toISOString(),
								kind: "Entrada inicial",
								amount: Number(revenue.downPaymentValue),
							});
						}
						if (selection.kind === "metric" && selection.value === "planned") {
							for (const item of buildRevenueSchedule(
								revenue,
								new Date(input.referenceAt),
							)) {
								if (isDateInsidePeriod(item.dueDate, period)) {
									result.push({
										...context,
										id: `scheduled:${revenue.id}:${item.installmentNumber}`,
										date: item.dueDate.toISOString(),
										kind: "Parcela prevista",
										installment: item.installmentNumber,
										amount: Number(item.amount),
									});
								}
							}
						} else {
							for (const fee of revenue.fees) {
								if (isDateInsidePeriod(fee.paymentDate, period)) {
									result.push({
										...context,
										id: `fee:${revenue.id}:${fee.installmentNumber}`,
										date: fee.paymentDate.toISOString(),
										kind: "Recebimento",
										installment: fee.installmentNumber,
										amount: Number(fee.amount),
									});
								}
							}
						}
					}
				}
			}
			if (
				selection.kind === "function" ||
				selection.kind === "employee-month" ||
				(periodSelection && series === "remuneration")
			) {
				const remunerations = await tx.remuneration.findMany({
					where: {
						...getDashboardRemunerationWhere(scope),
						...(selection.kind === "employee-month"
							? {
									AND: [
										{ contractEmployee: { employeeId: selection.employeeId } },
									],
								}
							: {}),
						...(dateWhere ? { paymentDate: dateWhere } : {}),
					},
					select: {
						id: true,
						amount: true,
						paymentDate: true,
						contractEmployee: {
							select: {
								employee: { select: { fullName: true } },
								assignmentType: { select: { label: true, value: true } },
								contract: { select: { processNumber: true } },
							},
						},
					},
				});
				for (const row of remunerations) {
					if (
						selection.kind === "function" &&
						row.contractEmployee.assignmentType.value !== selection.value
					) {
						continue;
					}
					result.push({
						id: `remuneration:${row.id}`,
						date: row.paymentDate.toISOString(),
						kind: "Remuneração gerada",
						description: row.contractEmployee.employee.fullName,
						employee: row.contractEmployee.employee.fullName,
						assignment: row.contractEmployee.assignmentType.label,
						process: row.contractEmployee.contract.processNumber,
						amount: Number(row.amount),
					});
				}
			}
			if (
				selection.kind === "expense" ||
				(periodSelection &&
					(series === "expense" || series === "result" || series === "output"))
			) {
				const expenses = await tx.expense.findMany({
					where: {
						...getDashboardExpenseWhere(scope),
						...(dateWhere ? { expenseDate: dateWhere } : {}),
					},
					select: {
						id: true,
						expenseDate: true,
						amount: true,
						notes: true,
						category: { select: { label: true, value: true } },
					},
				});
				for (const row of expenses) {
					if (
						selection.kind === "expense" &&
						row.category.value !== selection.value
					) {
						continue;
					}
					result.push({
						id: `expense:${row.id}`,
						date: row.expenseDate.toISOString(),
						kind: "Despesa",
						description: row.notes ?? row.category.label,
						category: row.category.label,
						amount:
							Number(row.amount) *
							(periodSelection && series === "result" ? -1 : 1),
					});
				}
			}
			return result;
		},
		{ isolationLevel: "RepeatableRead" },
	);
	return buildDashboardDrilldownResult(rows);
}
