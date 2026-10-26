import type { DashboardSummary } from "../schemas/model";
export function isExpenseOnlyDashboard(
	visibility: DashboardSummary["visibility"],
): boolean {
	return (
		visibility?.expense === true &&
		visibility.revenue === false &&
		visibility.remuneration === false
	);
}
