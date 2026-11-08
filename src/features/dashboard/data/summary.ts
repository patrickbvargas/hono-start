import { Prisma } from "@/generated/prisma/client";
import { formatter } from "@/shared/lib/formatter";
import {
	type DashboardSummary,
	dashboardSummarySchema,
} from "../schemas/model";
import {
	addMonths,
	formatMonthShortYearLabel,
	getComparisonBoundaries,
	getDashboardPeriod,
	getFinancialEvolutionMonthRange,
	getMonthKey,
	isDateInsidePeriod,
} from "../utils/period";
import { getFinancialReferenceDate, getInstallmentBucket } from "./analysis";
import { buildDashboardProjection, type FinancialRow } from "./projection";
import type { DashboardRecords } from "./records";
import {
	calculateChangePercent,
	type GroupTotal,
	mapBreakdown,
	pushGroupTotal,
} from "./revenue";
import { canReadDashboardFirmResult } from "./scope";
export function buildDashboardSummary(
	records: DashboardRecords,
): DashboardSummary {
	const { scope } = records;
	const titlesById = new Map(
		records.receivables.map((title) => [title.id, title]),
	);
	const period = getDashboardPeriod(scope.search);
	const reference = getFinancialReferenceDate(period);
	const { rows, open } = buildDashboardProjection(records, reference);
	const selected = rows.filter((row) =>
		isDateInsidePeriod(new Date(row.date), period),
	);
	const range = getFinancialEvolutionMonthRange(scope.search);
	const previous = getComparisonBoundaries(scope.search);
	const previousPeriod = {
		hasPeriod: true,
		dateFrom: previous.previousStart,
		dateTo: new Date(previous.previousEndExclusive.getTime() - 1),
	};
	const old = rows.filter((row) =>
		isDateInsidePeriod(new Date(row.date), previousPeriod),
	);
	const sum = (items: FinancialRow[]) =>
		items.reduce((total, row) => total.add(row.amount), new Prisma.Decimal(0));
	const planned = (items: FinancialRow[]) =>
		items.filter((row) => row.source === "planned");
	const receipts = (items: FinancialRow[]) =>
		items.filter((row) => row.source === "cash" && row.direction === "entry");
	const payments = (items: FinancialRow[]) =>
		items.filter((row) => row.source === "cash" && row.direction === "output");
	const commissions = (items: FinancialRow[]) =>
		items.filter((row) => row.source === "commission");
	const breakdown = (
		items: FinancialRow[],
		dimension: (row: FinancialRow) => { value: string; label: string },
	) => {
		const groups = new Map<string, GroupTotal>();
		for (const row of items) {
			pushGroupTotal(groups, { ...dimension(row), total: row.amount });
		}
		return mapBreakdown(groups, sum(items));
	};
	const legalAreas = breakdown(receipts(selected), (row) => ({
		value: row.areaValue ?? "DIRECT",
		label: row.area ?? "Sem vínculo com contrato",
	}));
	const types = breakdown(receipts(selected), (row) => ({
		value: row.typeValue ?? "DIRECT",
		label: row.type ?? "Direto",
	}));
	const withCommission = (
		items: typeof legalAreas,
		dimension: "areaValue" | "typeValue",
	) =>
		items.map((item) => ({
			...item,
			remuneration: Number(
				sum(
					commissions(selected).filter(
						(row) => (row[dimension] ?? "DIRECT") === item.value,
					),
				),
			),
		}));
	const showResult = canReadDashboardFirmResult(scope);
	const net = (items: FinancialRow[]) =>
		sum(receipts(items)).minus(sum(payments(items)));
	const metric = (
		label: string,
		drilldown: "planned" | "revenue" | "remuneration" | "expense" | "result",
		current: Prisma.Decimal,
		before: Prisma.Decimal,
		description: string,
	) => ({
		label,
		drilldown,
		value: Number(current),
		formattedValue: formatter.currency(Number(current)),
		description,
		tone: "default" as const,
		currentValue: Number(current),
		previousValue: Number(before),
		formattedCurrentValue: formatter.currency(Number(current)),
		formattedPreviousValue: formatter.currency(Number(before)),
		previousLabel: previous.previousLabel,
		previousPeriodLabel: previous.previousPeriodLabel,
		changePercent: calculateChangePercent(current, before),
	});
	const months: Array<{ key: string; label: string }> = [];
	for (
		let date = range.startMonth;
		date <= range.endMonth;
		date = addMonths(date, 1)
	) {
		months.push({
			key: getMonthKey(date),
			label: formatMonthShortYearLabel(date),
		});
	}
	const chartRows = rows.filter((row) =>
		isDateInsidePeriod(new Date(row.date), period),
	);
	const cashTable = months.map((month) => {
		const current = chartRows.filter(
			(row) => getMonthKey(new Date(row.date)) === month.key,
		);
		const incoming = receipts(current);
		const outgoing = payments(current);
		const entry = sum(incoming),
			output = sum(outgoing);
		return {
			month: month.key,
			monthLabel: month.label,
			administrative: Number(
				sum(incoming.filter((row) => row.typeValue === "ADMINISTRATIVE")),
			),
			judicial: Number(
				sum(incoming.filter((row) => row.typeValue === "JUDICIAL")),
			),
			succumbency: Number(
				sum(incoming.filter((row) => row.typeValue === "SUCCUMBENCY")),
			),
			entry: Number(entry),
			remuneration: Number(sum(outgoing.filter((row) => row.isRemuneration))),
			expense: Number(sum(outgoing.filter((row) => !row.isRemuneration))),
			output: Number(output),
			balance: Number(entry.minus(output)),
		};
	});
	const employeeGroups = new Map<
		number,
		{ name: string; rows: FinancialRow[] }
	>();
	for (const row of commissions(chartRows)) {
		if (row.employeeId) {
			const group = employeeGroups.get(row.employeeId) ?? {
				name: row.employee ?? "",
				rows: [],
			};
			group.rows.push(row);
			employeeGroups.set(row.employeeId, group);
		}
	}
	const remunerationTable = [...employeeGroups]
		.sort((a, b) => a[1].name.localeCompare(b[1].name, "pt-BR") || a[0] - b[0])
		.map(([employeeId, group]) => ({
			employeeId,
			employeeName: group.name,
			months: Object.fromEntries(
				months.map((month) => [
					month.key,
					Number(
						sum(
							group.rows.filter(
								(row) => getMonthKey(new Date(row.date)) === month.key,
							),
						),
					),
				]),
			),
			total: Number(sum(group.rows)),
			formattedTotal: formatter.currency(Number(sum(group.rows))),
		}));
	const bucketGroups = (kind: "aging" | "forecast") => {
		const labels =
			kind === "aging"
				? ["Até 30 dias", "31–60 dias", "61–90 dias", "Acima de 90 dias"]
				: ["Próximos 30 dias", "31–60 dias", "61–90 dias"];
		return labels.map((label) => {
			const amount = sum(
				open.filter((row) => {
					const bucket = getInstallmentBucket(new Date(row.date), reference);
					return bucket?.kind === kind && bucket.value === label;
				}),
			);
			return {
				label,
				value: label,
				total: Number(amount),
				formattedTotal: formatter.currency(Number(amount)),
				percentage: 0,
			};
		});
	};
	const aging = bucketGroups("aging");
	const totalReceived = sum(receipts(selected));
	return dashboardSummarySchema.parse({
		isAdmin: scope.isAdmin,
		scopeLabel: scope.isAdmin ? "Visão geral" : "Minha visão",
		visibility: {
			revenue: scope.access?.revenue === true,
			remuneration: scope.access?.remuneration === true,
			expense: scope.access?.expense === true,
			evolution:
				scope.access?.revenue === true && scope.access?.remuneration === true,
		},
		metrics: [
			...(showResult
				? [
						metric(
							"Resultado do período",
							"result",
							net(selected),
							net(old),
							"Caixa recebido menos caixa pago, incluindo estornos. Não representa saldo bancário.",
						),
					]
				: []),
			...(scope.access?.revenue
				? [
						metric(
							"Títulos previstos",
							"planned",
							sum(planned(selected)),
							sum(planned(old)),
							"Títulos ativos por vencimento, incluindo entrada e extras.",
						),
					]
				: []),
			...(scope.access?.receipts
				? [
						metric(
							"Recebimentos",
							"revenue",
							totalReceived,
							sum(receipts(old)),
							"Caixa efetivo recebido, descontando estornos na data da reversão.",
						),
					]
				: []),
			...(scope.access?.remuneration
				? [
						metric(
							"Remunerações geradas",
							"remuneration",
							sum(commissions(selected)),
							sum(commissions(old)),
							"Obrigações geradas menos cancelamentos. Pagamentos compõem as saídas.",
						),
					]
				: []),
			...(scope.access?.expense && scope.access.payments
				? [
						metric(
							"Pagamentos",
							"expense",
							sum(payments(selected)),
							sum(payments(old)),
							"Caixa efetivo pago, incluindo remunerações e estornos.",
						),
					]
				: []),
		],
		legalAreaRevenue: withCommission(legalAreas, "areaValue"),
		revenueTypeRevenue: withCommission(types, "typeValue"),
		remunerationMonths: months,
		remunerationTable,
		remunerationSubtotal: remunerationTable.length
			? {
					label: "Subtotal",
					months: Object.fromEntries(
						months.map((month) => [
							month.key,
							Number(
								sum(
									commissions(chartRows).filter(
										(row) => getMonthKey(new Date(row.date)) === month.key,
									),
								),
							),
						]),
					),
					total: Number(sum(commissions(chartRows))),
					formattedTotal: formatter.currency(
						Number(sum(commissions(chartRows))),
					),
				}
			: null,
		remunerationByCollaborator: scope.access?.remunerationAll
			? breakdown(commissions(selected), (row) => ({
					label: row.employee ?? "",
					value: String(row.employeeId),
				}))
			: undefined,
		remunerationByAssignment: breakdown(commissions(selected), (row) => ({
			label: row.assignment ?? "Outros",
			value: row.assignmentValue ?? "OTHER",
		})),
		expenseRevenue: breakdown(payments(selected), (row) => ({
			label: row.category ?? "Outros",
			value: row.categoryValue ?? "OTHER",
		})),
		operatingRatios: showResult
			? {
					margin: totalReceived.eq(0)
						? null
						: Number(net(selected).div(totalReceived).mul(100)),
					remunerationShare: totalReceived.eq(0)
						? null
						: Number(sum(commissions(selected)).div(totalReceived).mul(100)),
					expenses: formatter.currency(Number(sum(payments(selected)))),
				}
			: null,
		analysis: scope.access?.revenue
			? {
					referenceAt: reference.toISOString(),
					referenceLabel: formatter.calendarDate(reference.toISOString()),
					overdueTotal: formatter.currency(
						aging
							.reduce(
								(total, row) => total.add(row.total),
								new Prisma.Decimal(0),
							)
							.toNumber(),
					),
					aging,
					forecast: bucketGroups("forecast"),
					clients: breakdown(receipts(selected), (row) => ({
						label: row.client ?? "Direto",
						value: String(row.clientId ?? 0),
					})),
				}
			: undefined,
		overdueInstallments: open
			.filter(
				(row) =>
					row.process &&
					getInstallmentBucket(new Date(row.date), reference)?.kind === "aging",
			)
			.map((row) => {
				const contract = titlesById.get(row.record.id)
					?.contractRevenueReceivable?.contract;
				return {
					contractId: contract?.id ?? 0,
					contractProcessNumber: row.process,
					clientName: row.client,
					lawyerName:
						contract?.assignments.find(
							(assignment) => assignment.assignmentType.value === "RESPONSIBLE",
						)?.employeeProfile.person.fullName ?? "—",
					legalArea: row.area ?? "—",
					revenueType: row.type ?? "—",
					titleId: row.record.id,
					dueDate: row.date,
					installmentAmount: Number(row.amount),
					formattedInstallmentAmount: formatter.currency(Number(row.amount)),
					totalValue: row.faceAmount ?? 0,
					formattedTotalValue: formatter.currency(row.faceAmount ?? 0),
				};
			}),
		financialEvolutionLabel: range.label,
		financialEvolution: cashTable.map((row) => ({
			month: row.month,
			revenue: row.entry,
			remuneration: Number(
				sum(
					commissions(chartRows).filter(
						(item) => getMonthKey(new Date(item.date)) === row.month,
					),
				),
			),
		})),
		cashFlow: showResult
			? {
					totalBalance: Number(net(selected)),
					formattedTotalBalance: formatter.currency(Number(net(selected))),
					chartLabel: range.label,
					chart: cashTable.map((row) => ({
						month: row.month,
						entry: row.entry,
						output: row.output,
						balance: row.balance,
					})),
					table: cashTable,
				}
			: null,
	});
}
