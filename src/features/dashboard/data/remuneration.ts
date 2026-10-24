import { Prisma } from "@/generated/prisma/client";
import { formatter } from "@/shared/lib/formatter";
import type {
	DashboardRemunerationRow,
	DashboardRemunerationSubtotal,
} from "../schemas/model";
import type { DashboardMonthRange } from "../utils/period";
import {
	addMonths,
	createMonthStart,
	formatMonthShortYearLabel,
	getMonthKey,
} from "../utils/period";

export function buildMonthlyRemunerationTable({
	range,
	rows,
}: {
	range: DashboardMonthRange;
	rows: Array<{
		amount: Prisma.Decimal;
		paymentDate: Date;
		contractEmployee: {
			employee: {
				id: number;
				fullName: string;
			};
		};
	}>;
}): {
	months: Array<{
		key: string;
		label: string;
	}>;
	table: DashboardRemunerationRow[];
	subtotal: DashboardRemunerationSubtotal | null;
} {
	const months: Array<{
		key: string;
		label: string;
	}> = [];

	for (
		let current = range.startMonth;
		current.getTime() <= range.endMonth.getTime();
		current = addMonths(current, 1)
	) {
		months.push({
			key: getMonthKey(current),
			label: formatMonthShortYearLabel(current),
		});
	}

	const rowsByEmployee = new Map<
		number,
		{
			employeeId: number;
			employeeName: string;
			totals: Map<string, Prisma.Decimal>;
		}
	>();

	for (const row of rows) {
		const employee = row.contractEmployee.employee;
		const monthKey = getMonthKey(createMonthStart(row.paymentDate));
		const existing = rowsByEmployee.get(employee.id) ?? {
			employeeId: employee.id,
			employeeName: employee.fullName,
			totals: new Map<string, Prisma.Decimal>(),
		};
		const currentValue = existing.totals.get(monthKey) ?? new Prisma.Decimal(0);

		existing.totals.set(monthKey, currentValue.add(row.amount));
		rowsByEmployee.set(employee.id, existing);
	}

	const table = Array.from(rowsByEmployee.values())
		.sort((first, second) => {
			const nameComparison = first.employeeName.localeCompare(
				second.employeeName,
				"pt-BR",
			);

			if (nameComparison !== 0) {
				return nameComparison;
			}

			return first.employeeId - second.employeeId;
		})
		.map((row) => {
			const monthValues = Object.fromEntries(
				months.map((month) => [
					month.key,
					Number(row.totals.get(month.key) ?? new Prisma.Decimal(0)),
				]),
			);
			const total = months.reduce(
				(sum, month) => sum.add(row.totals.get(month.key) ?? 0),
				new Prisma.Decimal(0),
			);

			return {
				employeeId: row.employeeId,
				employeeName: row.employeeName,
				months: monthValues,
				total: Number(total),
				formattedTotal: formatter.currency(Number(total)),
			};
		});

	const subtotalMonths = Object.fromEntries(
		months.map((month) => [
			month.key,
			Number(
				table.reduce(
					(sum, row) => sum.add(row.months[month.key] ?? 0),
					new Prisma.Decimal(0),
				),
			),
		]),
	);
	const subtotalTotal = months.reduce(
		(sum, month) => sum.add(subtotalMonths[month.key] ?? 0),
		new Prisma.Decimal(0),
	);

	return {
		months,
		table,
		subtotal:
			table.length > 0
				? {
						label: "Subtotal",
						months: subtotalMonths,
						total: Number(subtotalTotal),
						formattedTotal: formatter.currency(Number(subtotalTotal)),
					}
				: null,
	};
}
