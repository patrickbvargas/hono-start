import type { DashboardSearch } from "../schemas/search";
import { getCurrentYearDateRange } from "./period-shortcuts";

const currentYearDateRange = getCurrentYearDateRange();

export const dashboardSearchDefaults: DashboardSearch = {
	dateFrom: currentYearDateRange.dateFrom,
	dateTo: currentYearDateRange.dateTo,
	employeeId: "",
	legalArea: "",
	revenueType: "",
};
