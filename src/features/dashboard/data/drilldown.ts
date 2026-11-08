import { Prisma } from "@/generated/prisma/client";
import {
	type DashboardDrilldownInput,
	type DashboardDrilldownRow,
	dashboardDrilldownResultSchema,
} from "../schemas/drilldown";
import {
	getDashboardPeriod,
	getMonthKey,
	isDateInsidePeriod,
} from "../utils/period";
import { getInstallmentBucket } from "./analysis";
import { assertDashboardDrilldownScope } from "./assert-drilldown";
import { buildDashboardProjection } from "./projection";
import { getDashboardRecords } from "./records";
import type { DashboardScope } from "./scope";
export function buildDashboardDrilldownResult(rows: DashboardDrilldownRow[]) {
	rows.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
	const sum = (predicate: (row: DashboardDrilldownRow) => boolean) =>
		Number(
			rows
				.filter(predicate)
				.reduce((total, row) => total.add(row.amount), new Prisma.Decimal(0)),
		);
	return dashboardDrilldownResultSchema.parse({
		data: rows,
		total: rows.length,
		amount: sum(() => true),
		entries: sum((row) => row.amount > 0),
		deductions: sum((row) => row.amount < 0),
	});
}
export async function getDashboardDrilldown(
	scope: DashboardScope,
	input: DashboardDrilldownInput,
) {
	assertDashboardDrilldownScope(scope, input);
	const { rows, open } = buildDashboardProjection(
		await getDashboardRecords(scope),
		new Date(input.referenceAt),
	);
	const selection = input.selection;
	const period = getDashboardPeriod(scope.search);
	const matching = (
		selection.kind === "aging" || selection.kind === "forecast" ? open : rows
	).filter((row) => {
		if (selection.kind === "aging" || selection.kind === "forecast") {
			const bucket = getInstallmentBucket(
				new Date(row.date),
				new Date(input.referenceAt),
			);
			return (
				bucket?.kind === selection.kind && bucket.value === selection.value
			);
		}
		if (!isDateInsidePeriod(new Date(row.date), period)) {
			return false;
		}
		if (
			(selection.kind === "monthly" || selection.kind === "employee-month") &&
			selection.month &&
			getMonthKey(new Date(row.date)) !== selection.month
		) {
			return false;
		}
		if (selection.kind === "metric" || selection.kind === "monthly") {
			const series =
				selection.kind === "metric" ? selection.value : selection.series;
			return series === "planned"
				? row.source === "planned"
				: series === "remuneration"
					? row.source === "commission"
					: row.source === "cash" &&
						(series === "result" ||
							(series === "expense" || series === "output"
								? row.direction === "output"
								: row.direction === "entry")) &&
						(selection.kind !== "monthly" ||
							!selection.revenueType ||
							row.typeValue === selection.revenueType);
		}
		if (selection.kind === "area" || selection.kind === "type") {
			return (
				(selection.kind === "area" ? row.areaValue : row.typeValue) ===
					selection.value &&
				(selection.series === "remuneration"
					? row.source === "commission"
					: row.source === "cash" && row.direction === "entry")
			);
		}
		if (selection.kind === "client") {
			return (
				row.source === "cash" &&
				row.direction === "entry" &&
				String(row.clientId ?? 0) === selection.value
			);
		}
		if (selection.kind === "function") {
			return (
				row.source === "commission" && row.assignmentValue === selection.value
			);
		}
		if (selection.kind === "employee-month") {
			return (
				row.source === "commission" && row.employeeId === selection.employeeId
			);
		}
		return (
			row.source === "cash" &&
			row.direction === "output" &&
			row.categoryValue === selection.value
		);
	});
	return buildDashboardDrilldownResult(
		matching.map((row) => ({
			...row,
			amount: Number(
				row.amount.mul(
					((selection.kind === "metric" && selection.value === "result") ||
						(selection.kind === "monthly" && selection.series === "result")) &&
						row.direction === "output"
						? -1
						: 1,
				),
			),
		})),
	);
}
