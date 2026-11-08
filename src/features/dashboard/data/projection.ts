import type { Prisma } from "@/generated/prisma/client";
import type { DashboardDrilldownRow } from "../schemas/drilldown";
import {
	type DashboardRecords,
	getCashEvents,
	getOutstanding,
} from "./records";
export interface FinancialRow extends Omit<DashboardDrilldownRow, "amount"> {
	amount: Prisma.Decimal;
	area?: string;
	areaValue?: string;
	source: "planned" | "cash" | "commission";
	direction: "entry" | "output";
	isRemuneration?: boolean;
}
export function buildDashboardProjection(
	{ scope, receivables, payables }: DashboardRecords,
	reference: Date,
) {
	const rows: FinancialRow[] = [];
	const open: FinancialRow[] = [];
	for (const title of receivables) {
		const bridge = title.contractRevenueReceivable;
		const contract = bridge?.contract;
		const context = {
			record: { kind: "receivable" as const, id: title.id },
			client: title.debtor.person.fullName,
			clientId: contract?.customer.id,
			process: contract?.processNumber,
			type: bridge?.revenue.revenueType.label,
			typeValue: bridge?.revenue.revenueType.value,
			area: contract?.legalArea.label,
			areaValue: contract?.legalArea.value,
			description: bridge?.revenue.revenueType.label ?? "Título direto",
			direction: "entry" as const,
		};
		const base = {
			...context,
			id: `title:${title.id}`,
			date: title.dueDate.toISOString(),
			kind:
				title.kind === "DOWN_PAYMENT"
					? "Entrada"
					: title.kind === "EXTRA"
						? "Extra"
						: "Parcela",
			source: "planned" as const,
			amount: title.amount,
		};
		if (!title.cancelledAt) {
			rows.push(base);
		}
		const outstanding = getOutstanding(title, title.receipts, reference);
		if (outstanding.gt(0)) {
			open.push({
				...base,
				amount: outstanding,
				faceAmount: Number(title.amount),
				paid: Number(title.amount.minus(outstanding)),
			});
		}
		if (scope.access?.receipts) {
			for (const [index, event] of getCashEvents(title.receipts).entries()) {
				rows.push({
					...context,
					id: `receipt:${title.id}:${index}`,
					date: event.date.toISOString(),
					kind: event.reversed ? "Estorno de recebimento" : "Recebimento",
					source: "cash",
					amount: event.amount,
				});
			}
		}
	}
	for (const title of payables) {
		const commission = title.remunerationPayable;
		const assignment = commission?.contractAssignment;
		const contract = assignment?.contract;
		const context = {
			record: { kind: "payable" as const, id: title.id },
			description: title.beneficiary.person.fullName,
			employee: assignment?.employeeProfile.person.fullName,
			employeeId: assignment?.employeeProfileId,
			assignment: assignment?.assignmentType.label,
			assignmentValue: assignment?.assignmentType.value,
			process: contract?.processNumber,
			client: contract?.customer.person.fullName,
			clientId: contract?.customer.id,
			area: contract?.legalArea.label,
			areaValue: contract?.legalArea.value,
			type: commission?.receipt.receivable.contractRevenueReceivable?.revenue
				.revenueType.label,
			typeValue:
				commission?.receipt.receivable.contractRevenueReceivable?.revenue
					.revenueType.value,
			category: title.analytic.label,
			categoryValue: title.analytic.value,
			direction: "output" as const,
			isRemuneration: Boolean(commission),
		};
		if (commission && scope.access?.remuneration) {
			rows.push({
				...context,
				id: `commission:${title.id}`,
				date: commission.createdAt.toISOString(),
				kind: "Remuneração gerada",
				source: "commission",
				amount: title.amount,
			});
			if (title.cancelledAt) {
				rows.push({
					...context,
					id: `commission-cancel:${title.id}`,
					date: title.cancelledAt.toISOString(),
					kind: "Remuneração cancelada",
					source: "commission",
					amount: title.amount.negated(),
				});
			}
		}
		if (scope.access?.payments) {
			for (const [index, event] of getCashEvents(title.payments).entries()) {
				rows.push({
					...context,
					id: `payment:${title.id}:${index}`,
					date: event.date.toISOString(),
					kind: event.reversed ? "Estorno de pagamento" : "Pagamento",
					source: "cash",
					amount: event.amount,
				});
			}
		}
	}
	return { rows, open };
}
