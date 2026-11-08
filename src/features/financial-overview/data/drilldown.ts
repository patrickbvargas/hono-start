import { Prisma } from "@/generated/prisma/client";
import {
	type FinancialDrilldownInput,
	type FinancialDrilldownRow,
	financialDrilldownResultSchema,
} from "../schemas/drilldown";
import { getComparisonBoundaries } from "../utils/period";
import {
	type FinancialOverviewRecords,
	type FinancialOverviewScope,
	getCashEvents,
	getFinancialOverviewRecords,
	getOutstanding,
} from "./records";

function getMonthKey(date: Date): string {
	const y = date.getUTCFullYear();
	const m = String(date.getUTCMonth() + 1).padStart(2, "0");
	return `${y}-${m}`;
}

export function buildFinancialDrilldownResult(rows: FinancialDrilldownRow[]) {
	rows.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
	const sum = (predicate: (row: FinancialDrilldownRow) => boolean) =>
		Number(
			rows
				.filter(predicate)
				.reduce((total, row) => total.add(row.amount), new Prisma.Decimal(0)),
		);
	return financialDrilldownResultSchema.parse({
		data: rows,
		total: rows.length,
		amount: sum(() => true),
		entries: sum((row) => row.amount > 0),
		deductions: sum((row) => row.amount < 0),
	});
}

interface ProjectedItem {
	row: FinancialDrilldownRow;
	rawAmount: Prisma.Decimal;
	direction: "entry" | "output";
	source: "cash" | "open";
	date: Date;
	typeValue?: string;
	isRemuneration?: boolean;
	categoryValue?: string;
}

export async function getFinancialOverviewDrilldown(
	scope: FinancialOverviewScope,
	input: FinancialDrilldownInput,
) {
	const records = await getFinancialOverviewRecords(scope);
	return buildFinancialOverviewDrilldownFromRecords(records, input);
}

export function buildFinancialOverviewDrilldownFromRecords(
	records: FinancialOverviewRecords,
	input: FinancialDrilldownInput,
) {
	const now = new Date();
	const currentMonthKey = getMonthKey(now);
	const reference = new Date(input.referenceAt);
	const selection = input.selection;

	const previous = getComparisonBoundaries(records.scope.search);
	const currentStart = previous.currentStart;
	const currentEnd = new Date(previous.nextStart.getTime() - 1);
	const isInsideCurrentPeriod = (d: Date) =>
		d >= currentStart && d <= currentEnd;

	const allReceiptEvents: ProjectedItem[] = [];
	const allOpenReceivables: ProjectedItem[] = [];

	for (const title of records.receivables) {
		const bridge = title.contractRevenueReceivable;
		const contract = bridge?.contract;
		const typeVal = bridge?.revenue.revenueType.value;
		const typeLab = bridge?.revenue.revenueType.label;

		const baseContext = {
			record: { kind: "receivable" as const, id: title.id },
			client: title.debtor.person.fullName,
			clientId: contract?.customer.id,
			process: contract?.processNumber,
			type: typeLab,
			typeValue: typeVal,
			category: title.analytic.label,
			categoryValue: title.analytic.value,
			description: typeLab ?? title.analytic.label ?? "Recebível",
		};

		// 1. Cash receipt events
		for (const [index, event] of getCashEvents(title.receipts).entries()) {
			allReceiptEvents.push({
				row: {
					...baseContext,
					id: `receipt:${title.id}:${index}`,
					date: event.date.toISOString(),
					kind: event.reversed ? "Estorno de recebimento" : "Recebimento",
					amount: Number(event.amount),
				},
				rawAmount: event.amount,
				direction: "entry",
				source: "cash",
				date: event.date,
				typeValue: typeVal,
			});
		}

		// 2. Open receivables
		const outstanding = getOutstanding(title, title.receipts, reference);
		if (outstanding.gt(0)) {
			allOpenReceivables.push({
				row: {
					...baseContext,
					id: `receivable:${title.id}`,
					date: title.dueDate.toISOString(),
					kind:
						title.kind === "DOWN_PAYMENT"
							? "Entrada"
							: title.kind === "EXTRA"
								? "Extra"
								: "Parcela",
					faceAmount: Number(title.amount),
					paid: Number(title.amount.minus(outstanding)),
					amount: Number(outstanding),
				},
				rawAmount: outstanding,
				direction: "entry",
				source: "open",
				date: title.dueDate,
				typeValue: typeVal,
			});
		}
	}

	const allPaymentEvents: ProjectedItem[] = [];
	const allOpenPayables: ProjectedItem[] = [];

	for (const title of records.payables) {
		const isRemun = Boolean(title.remunerationPayable);
		const commission = title.remunerationPayable;
		const assignment = commission?.contractAssignment;
		const contract = assignment?.contract;
		const catVal = title.analytic.value;
		const catLab = title.analytic.label;

		const baseContext = {
			record: {
				kind: isRemun ? ("payable" as const) : ("expense" as const),
				id: title.id,
			},
			description: title.beneficiary.person.fullName,
			employee: assignment?.employeeProfile.person.fullName,
			employeeId: assignment?.employeeProfileId,
			assignment: assignment?.assignmentType.label,
			assignmentValue: assignment?.assignmentType.value,
			process: contract?.processNumber,
			client: contract?.customer.person.fullName,
			clientId: contract?.customer.id,
			category: catLab,
			categoryValue: catVal,
		};

		// 1. Cash payment events
		for (const [index, event] of getCashEvents(title.payments).entries()) {
			allPaymentEvents.push({
				row: {
					...baseContext,
					id: `payment:${title.id}:${index}`,
					date: event.date.toISOString(),
					kind: event.reversed ? "Estorno de pagamento" : "Pagamento",
					amount: Number(event.amount),
				},
				rawAmount: event.amount,
				direction: "output",
				source: "cash",
				date: event.date,
				isRemuneration: isRemun,
				categoryValue: catVal,
			});
		}

		// 2. Open payables
		const outstanding = getOutstanding(title, title.payments, reference);
		if (outstanding.gt(0)) {
			allOpenPayables.push({
				row: {
					...baseContext,
					id: `payable:${title.id}`,
					date: title.dueDate.toISOString(),
					kind:
						title.kind === "DOWN_PAYMENT"
							? "Entrada"
							: title.kind === "EXTRA"
								? "Extra"
								: "Parcela",
					faceAmount: Number(title.amount),
					paid: Number(title.amount.minus(outstanding)),
					amount: Number(outstanding),
				},
				rawAmount: outstanding,
				direction: "output",
				source: "open",
				date: title.dueDate,
				isRemuneration: isRemun,
				categoryValue: catVal,
			});
		}
	}

	// Filter rules per selection kind
	const selectedRows: FinancialDrilldownRow[] = [];

	if (selection.kind === "metric") {
		const isCurrentOrFuture = (d: Date) => getMonthKey(d) >= currentMonthKey;
		const futureOpenReceivables = allOpenReceivables.filter((r) =>
			isCurrentOrFuture(r.date),
		);
		const futureOpenPayables = allOpenPayables.filter((p) =>
			isCurrentOrFuture(p.date),
		);

		const currentOpenReceivables = futureOpenReceivables.filter((r) =>
			isInsideCurrentPeriod(r.date),
		);
		const openReceivablesToUse =
			currentOpenReceivables.length > 0
				? currentOpenReceivables
				: futureOpenReceivables;

		const currentOpenPayables = futureOpenPayables.filter((p) =>
			isInsideCurrentPeriod(p.date),
		);
		const openPayablesToUse =
			currentOpenPayables.length > 0 ? currentOpenPayables : futureOpenPayables;

		if (selection.value === "realized_balance") {
			// Receipts positive, payments negative
			for (const item of allReceiptEvents) {
				if (isInsideCurrentPeriod(item.date)) {
					selectedRows.push({ ...item.row, amount: Number(item.rawAmount) });
				}
			}
			for (const item of allPaymentEvents) {
				if (isInsideCurrentPeriod(item.date)) {
					selectedRows.push({
						...item.row,
						amount: Number(item.rawAmount.negated()),
					});
				}
			}
		} else if (selection.value === "projected_balance") {
			// Realized cash balance + open receivables - open payables
			for (const item of allReceiptEvents) {
				if (isInsideCurrentPeriod(item.date)) {
					selectedRows.push({ ...item.row, amount: Number(item.rawAmount) });
				}
			}
			for (const item of allPaymentEvents) {
				if (isInsideCurrentPeriod(item.date)) {
					selectedRows.push({
						...item.row,
						amount: Number(item.rawAmount.negated()),
					});
				}
			}
			for (const item of openReceivablesToUse) {
				selectedRows.push({ ...item.row, amount: Number(item.rawAmount) });
			}
			for (const item of openPayablesToUse) {
				selectedRows.push({
					...item.row,
					amount: Number(item.rawAmount.negated()),
				});
			}
		} else if (selection.value === "receivables") {
			for (const item of openReceivablesToUse) {
				selectedRows.push({ ...item.row, amount: Number(item.rawAmount) });
			}
		} else if (selection.value === "payables") {
			for (const item of openPayablesToUse) {
				selectedRows.push({ ...item.row, amount: Number(item.rawAmount) });
			}
		}
	} else if (selection.kind === "monthly") {
		const month = selection.month;
		const series = selection.series;

		if (series === "entryRealized") {
			for (const item of allReceiptEvents) {
				if (getMonthKey(item.date) === month) {
					selectedRows.push({ ...item.row, amount: Number(item.rawAmount) });
				}
			}
		} else if (series === "entryProjected") {
			for (const item of allOpenReceivables) {
				if (getMonthKey(item.date) === month) {
					selectedRows.push({ ...item.row, amount: Number(item.rawAmount) });
				}
			}
		} else if (series === "entryTotal") {
			for (const item of allReceiptEvents) {
				if (getMonthKey(item.date) === month) {
					selectedRows.push({ ...item.row, amount: Number(item.rawAmount) });
				}
			}
			for (const item of allOpenReceivables) {
				if (getMonthKey(item.date) === month) {
					selectedRows.push({ ...item.row, amount: Number(item.rawAmount) });
				}
			}
		} else if (series === "outputRealized") {
			for (const item of allPaymentEvents) {
				if (getMonthKey(item.date) === month) {
					selectedRows.push({ ...item.row, amount: Number(item.rawAmount) });
				}
			}
		} else if (series === "outputProjected") {
			for (const item of allOpenPayables) {
				if (getMonthKey(item.date) === month) {
					selectedRows.push({ ...item.row, amount: Number(item.rawAmount) });
				}
			}
		} else if (series === "outputTotal") {
			for (const item of allPaymentEvents) {
				if (getMonthKey(item.date) === month) {
					selectedRows.push({ ...item.row, amount: Number(item.rawAmount) });
				}
			}
			for (const item of allOpenPayables) {
				if (getMonthKey(item.date) === month) {
					selectedRows.push({ ...item.row, amount: Number(item.rawAmount) });
				}
			}
		} else if (series === "balanceRealized") {
			for (const item of allReceiptEvents) {
				if (getMonthKey(item.date) === month) {
					selectedRows.push({ ...item.row, amount: Number(item.rawAmount) });
				}
			}
			for (const item of allPaymentEvents) {
				if (getMonthKey(item.date) === month) {
					selectedRows.push({
						...item.row,
						amount: Number(item.rawAmount.negated()),
					});
				}
			}
		} else if (series === "balanceTotal") {
			for (const item of allReceiptEvents) {
				if (getMonthKey(item.date) === month) {
					selectedRows.push({ ...item.row, amount: Number(item.rawAmount) });
				}
			}
			for (const item of allOpenReceivables) {
				if (getMonthKey(item.date) === month) {
					selectedRows.push({ ...item.row, amount: Number(item.rawAmount) });
				}
			}
			for (const item of allPaymentEvents) {
				if (getMonthKey(item.date) === month) {
					selectedRows.push({
						...item.row,
						amount: Number(item.rawAmount.negated()),
					});
				}
			}
			for (const item of allOpenPayables) {
				if (getMonthKey(item.date) === month) {
					selectedRows.push({
						...item.row,
						amount: Number(item.rawAmount.negated()),
					});
				}
			}
		} else if (series === "administrative") {
			for (const item of allReceiptEvents) {
				if (
					getMonthKey(item.date) === month &&
					item.typeValue === "ADMINISTRATIVE"
				) {
					selectedRows.push({ ...item.row, amount: Number(item.rawAmount) });
				}
			}
		} else if (series === "judicial") {
			for (const item of allReceiptEvents) {
				if (getMonthKey(item.date) === month && item.typeValue === "JUDICIAL") {
					selectedRows.push({ ...item.row, amount: Number(item.rawAmount) });
				}
			}
		} else if (series === "succumbency") {
			for (const item of allReceiptEvents) {
				if (
					getMonthKey(item.date) === month &&
					item.typeValue === "SUCCUMBENCY"
				) {
					selectedRows.push({ ...item.row, amount: Number(item.rawAmount) });
				}
			}
		} else if (series === "remunerationPaid") {
			for (const item of allPaymentEvents) {
				if (getMonthKey(item.date) === month && item.isRemuneration) {
					selectedRows.push({ ...item.row, amount: Number(item.rawAmount) });
				}
			}
		} else if (series === "expensePaid") {
			for (const item of allPaymentEvents) {
				if (getMonthKey(item.date) === month && !item.isRemuneration) {
					selectedRows.push({ ...item.row, amount: Number(item.rawAmount) });
				}
			}
		}
	} else if (selection.kind === "aging") {
		const getDaysDiff = (due: Date) =>
			Math.round(
				(Date.parse(due.toISOString().slice(0, 10)) -
					Date.parse(reference.toISOString().slice(0, 10))) /
					86400000,
			);

		for (const item of allOpenReceivables) {
			const diff = getDaysDiff(item.date);
			if (diff < 0) {
				const age = -diff;
				let matches = false;
				if (selection.value === "Até 30 dias" && age <= 30) {
					matches = true;
				} else if (selection.value === "31–60 dias" && age > 30 && age <= 60) {
					matches = true;
				} else if (selection.value === "61–90 dias" && age > 60 && age <= 90) {
					matches = true;
				} else if (selection.value === "Acima de 90 dias" && age > 90) {
					matches = true;
				}

				if (matches) {
					selectedRows.push({ ...item.row, amount: Number(item.rawAmount) });
				}
			}
		}
	} else if (selection.kind === "forecast") {
		const getDaysDiff = (due: Date) =>
			Math.round(
				(Date.parse(due.toISOString().slice(0, 10)) -
					Date.parse(reference.toISOString().slice(0, 10))) /
					86400000,
			);

		for (const item of allOpenReceivables) {
			const diff = getDaysDiff(item.date);
			if (diff >= 0) {
				let matches = false;
				if (selection.value === "Próximos 30 dias" && diff <= 30) {
					matches = true;
				} else if (
					selection.value === "31–60 dias" &&
					diff > 30 &&
					diff <= 60
				) {
					matches = true;
				} else if (
					selection.value === "61–90 dias" &&
					diff > 60 &&
					diff <= 90
				) {
					matches = true;
				}

				if (matches) {
					selectedRows.push({ ...item.row, amount: Number(item.rawAmount) });
				}
			}
		}
	} else if (selection.kind === "category") {
		for (const item of allPaymentEvents) {
			if (item.categoryValue === selection.value) {
				selectedRows.push({ ...item.row, amount: Number(item.rawAmount) });
			}
		}
	}

	return buildFinancialDrilldownResult(selectedRows);
}
