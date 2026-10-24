import { DASHBOARD_ERRORS } from "../constants/errors";
import { getFinancialReferenceDate } from "../data/analysis";
import { canReadDashboardFirmResult, type DashboardScope } from "../data/scope";
import type { DashboardDrilldownInput } from "../schemas/drilldown";
import {
	getDashboardPeriod,
	getFinancialEvolutionMonthRange,
	getMonthKey,
} from "../utils/period";
export function assertDashboardDrilldownScope(
	scope: DashboardScope,
	input: DashboardDrilldownInput,
): void {
	const selection = input.selection;
	const subject =
		(selection.kind === "area" || selection.kind === "type") &&
		selection.series === "remuneration"
			? "remuneration"
			: selection.kind === "monthly"
				? selection.series === "output"
					? "result"
					: selection.series
				: selection.kind === "metric"
					? selection.value === "planned"
						? "revenue"
						: selection.value
					: selection.kind === "function" || selection.kind === "employee-month"
						? "remuneration"
						: selection.kind === "expense"
							? "expense"
							: "revenue";
	const consolidated = canReadDashboardFirmResult(scope);
	if (
		selection.kind === "monthly" &&
		selection.revenueType &&
		selection.series !== "revenue"
	) {
		throw new Error(DASHBOARD_ERRORS.DRILLDOWN_INVALID_SELECTION);
	}
	if (subject === "result" ? !consolidated : scope.access?.[subject] !== true) {
		throw new Error(DASHBOARD_ERRORS.DRILLDOWN_DENIED);
	}
	if (
		selection.kind === "monthly" &&
		(scope.access?.revenue !== true ||
			scope.access?.remuneration !== true ||
			(selection.series === "expense" && !consolidated))
	) {
		throw new Error(DASHBOARD_ERRORS.DRILLDOWN_DENIED);
	}
	const range = getFinancialEvolutionMonthRange(scope.search);
	if (
		(selection.kind === "monthly" || selection.kind === "employee-month") &&
		selection.month !== undefined &&
		(selection.month < getMonthKey(range.startMonth) ||
			selection.month > getMonthKey(range.endMonth))
	) {
		throw new Error(DASHBOARD_ERRORS.DRILLDOWN_INVALID_SELECTION);
	}
	if (
		selection.kind === "employee-month" &&
		((!(scope.isAdmin && scope.access?.remunerationAll === true) &&
			selection.employeeId !== scope.employeeId) ||
			(scope.isAdmin &&
				scope.access?.remunerationAll === true &&
				Boolean(scope.search.employeeId) &&
				selection.employeeId !== Number(scope.search.employeeId)))
	) {
		throw new Error(DASHBOARD_ERRORS.DRILLDOWN_DENIED);
	}
	if (
		new Date(input.referenceAt) >
		getFinancialReferenceDate(getDashboardPeriod(scope.search))
	) {
		throw new Error(DASHBOARD_ERRORS.DRILLDOWN_INVALID_REFERENCE);
	}
}
