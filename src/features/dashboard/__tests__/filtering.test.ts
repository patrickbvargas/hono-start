import { describe, expect, it } from "vitest";
import {
	buildDashboardPaymentDateWhere,
	getEffectiveDashboardEmployeeId,
} from "../data/queries";
import { dashboardSearchSchema } from "../schemas/search";
import {
	getDashboardActivePeriodShortcut,
	getDashboardPeriodShortcutById,
} from "../utils/period-shortcuts";

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

	it("marks the current-year shortcut as active for default search values", () => {
		const currentYear = new Date().getUTCFullYear();

		expect(
			getDashboardActivePeriodShortcut({
				dateFrom: `${currentYear}-01-01`,
				dateTo: `${currentYear}-12-31`,
			}),
		).toBe("currentYear");
	});

	it("uses the canonical last-6-month shortcut range", () => {
		const shortcut = getDashboardPeriodShortcutById(
			"last6Months",
			new Date("2026-05-05T12:00:00.000Z"),
		);

		expect(shortcut).toMatchObject({
			id: "last6Months",
			label: "6 meses",
			dateFrom: "2025-12-05",
			dateTo: "2026-05-05",
		});
		expect(getDashboardActivePeriodShortcut(shortcut)).toBe("last6Months");
	});

	it("uses the canonical last-12-month shortcut range", () => {
		const shortcut = getDashboardPeriodShortcutById(
			"last12Months",
			new Date("2026-05-05T12:00:00.000Z"),
		);

		expect(shortcut).toMatchObject({
			id: "last12Months",
			label: "12 meses",
			dateFrom: "2025-06-05",
			dateTo: "2026-05-05",
		});
		expect(getDashboardActivePeriodShortcut(shortcut)).toBe("last12Months");
	});

	it("clears shortcut selection for custom manual ranges", () => {
		expect(
			getDashboardActivePeriodShortcut({
				dateFrom: "2026-02-01",
				dateTo: "2026-04-15",
			}),
		).toBeNull();
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
