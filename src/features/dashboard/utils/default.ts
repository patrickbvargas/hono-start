import type { DashboardSearch } from "../schemas/search";

const now = new Date();
const currentYear = now.getUTCFullYear();

export const dashboardSearchDefaults: DashboardSearch = {
	dateFrom: `${currentYear}-01-01`,
	dateTo: `${currentYear}-12-31`,
	employeeId: "",
	legalArea: "",
	revenueType: "",
};
