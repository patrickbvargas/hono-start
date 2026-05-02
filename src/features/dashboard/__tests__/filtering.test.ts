import { describe, expect, it } from "vitest";
import {
	buildDashboardPaymentDateWhere,
	getEffectiveDashboardEmployeeId,
} from "../data/queries";
import { dashboardSearchSchema } from "../schemas/search";

describe("dashboard filtering", () => {
	it("parses empty URL search with safe defaults", () => {
		const currentYear = new Date().getUTCFullYear();

		expect(dashboardSearchSchema.parse({})).toEqual({
			dateFrom: `${currentYear}-01-01`,
			dateTo: `${currentYear}-12-31`,
			employeeId: "",
			legalArea: "",
			revenueType: "",
		});
	});

	it("rejects inverted date ranges", () => {
		expect(() =>
			dashboardSearchSchema.parse({
				dateFrom: "2026-04-20",
				dateTo: "2026-04-01",
				employeeId: "",
				legalArea: "",
				revenueType: "",
			}),
		).toThrowError("A data inicial deve ser anterior à data final");
	});

	it("builds payment-date filters from the selected period", () => {
		const where = buildDashboardPaymentDateWhere({
			dateFrom: new Date("2026-04-01T00:00:00.000Z"),
			dateTo: new Date("2026-04-30T23:59:59.999Z"),
			hasPeriod: true,
		});

		expect(where).toEqual({
			gte: new Date("2026-04-01T00:00:00.000Z"),
			lte: new Date("2026-04-30T23:59:59.999Z"),
		});
	});

	it("uses administrator employee filter when provided", () => {
		expect(
			getEffectiveDashboardEmployeeId({
				isAdmin: true,
				requestedEmployeeId: 12,
				sessionEmployeeId: 10,
			}),
		).toBe(12);
	});

	it("keeps regular users scoped to the authenticated employee", () => {
		expect(
			getEffectiveDashboardEmployeeId({
				isAdmin: false,
				requestedEmployeeId: 12,
				sessionEmployeeId: 10,
			}),
		).toBe(10);
	});
});
