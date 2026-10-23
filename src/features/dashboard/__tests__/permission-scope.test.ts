import { describe, expect, it } from "vitest";
import {
	type DashboardScope,
	getDashboardRemunerationWhere,
	getDashboardRevenueWhere,
} from "../data/scope";

const scope: DashboardScope = {
	firmId: 1,
	employeeId: 10,
	isAdmin: true,
	access: {
		revenue: true,
		remuneration: true,
		expense: false,
		revenueAll: false,
		remunerationAll: false,
	},
	search: {
		dateFrom: "2026-01-01",
		dateTo: "2026-03-31",
		employeeId: "999",
		legalArea: [],
		revenueType: [],
	},
};

describe("dashboard subject permission scopes", () => {
	it("does not let dashboard-wide access override own remuneration", () => {
		expect(getDashboardRemunerationWhere(scope)).toMatchObject({
			firmId: 1,
			contractEmployee: { employeeId: 10 },
		});
	});
	it("does not let dashboard-wide access override assigned receipts", () => {
		expect(getDashboardRevenueWhere(scope)).toMatchObject({
			firmId: 1,
			contract: { assignments: { some: { employeeId: 10 } } },
		});
	});
	it("fails closed without an employee binding", () => {
		expect(
			getDashboardRemunerationWhere({ ...scope, employeeId: undefined }),
		).toMatchObject({ firmId: 1, id: -1 });
		expect(
			getDashboardRevenueWhere({ ...scope, employeeId: undefined }),
		).toMatchObject({ firmId: 1, contract: { id: -1 } });
	});
});
