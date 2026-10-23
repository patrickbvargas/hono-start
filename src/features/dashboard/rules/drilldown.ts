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
		selection.kind === "monthly"
			? selection.series
			: selection.kind === "metric"
				? selection.value === "planned"
					? "revenue"
					: selection.value
				: selection.kind === "function"
					? "remuneration"
					: selection.kind === "expense"
						? "expense"
						: "revenue";
	const consolidated = canReadDashboardFirmResult(scope);
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
		selection.kind === "monthly" &&
		(selection.month < getMonthKey(range.startMonth) ||
			selection.month > getMonthKey(range.endMonth))
	) {
		throw new Error(DASHBOARD_ERRORS.DRILLDOWN_INVALID_SELECTION);
	}
	if (
		new Date(input.referenceAt) >
		getFinancialReferenceDate(getDashboardPeriod(scope.search))
	) {
		throw new Error(DASHBOARD_ERRORS.DRILLDOWN_INVALID_REFERENCE);
	}
}
