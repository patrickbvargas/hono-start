import { describe, expect, it } from "vitest";
import {
	canReadDashboardFirmResult,
	type DashboardScope,
	getDashboardFeeRevenueWhere,
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

describe("dashboard client and contract filters", () => {
	const selected: DashboardScope = {
		...scope,
		search: { ...scope.search, clientId: "7", contractId: "42" },
	};
	it("intersects both selections with assigned receipt visibility", () => {
		const expected = {
			firmId: 1,
			contract: {
				clientId: 7,
				AND: [{ id: 42 }],
				assignments: { some: { employeeId: 10 } },
			},
		};
		expect(getDashboardRevenueWhere(selected)).toMatchObject(expected);
		expect(getDashboardFeeRevenueWhere(selected)).toMatchObject(expected);
	});
	it("preserves denied visibility when selecting a contract without an employee binding", () => {
		expect(
			getDashboardRevenueWhere({ ...selected, employeeId: undefined }),
		).toMatchObject({ contract: { id: -1, AND: [{ id: 42 }] } });
	});
	it("filters own remuneration by both client and contract", () => {
		expect(getDashboardRemunerationWhere(selected)).toMatchObject({
			firmId: 1,
			contractEmployee: {
				employeeId: 10,
				contract: { clientId: 7, AND: [{ id: 42 }] },
			},
		});
	});
	it("hides the firm result for either selection", () => {
		const all: DashboardScope = {
			...scope,
			canReadCashFlow: true,
			access: {
				revenue: true,
				remuneration: true,
				expense: true,
				revenueAll: true,
				remunerationAll: true,
			},
			search: { ...scope.search, employeeId: "" },
		};
		expect(canReadDashboardFirmResult(all)).toBe(true);
		expect(
			canReadDashboardFirmResult({
				...all,
				search: { ...all.search, clientId: "7" },
			}),
		).toBe(false);
		expect(
			canReadDashboardFirmResult({
				...all,
				search: { ...all.search, contractId: "42" },
			}),
		).toBe(false);
	});
});
