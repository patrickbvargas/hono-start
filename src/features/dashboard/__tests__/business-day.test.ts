import { expect, it } from "vitest";
import {
	getCurrentYearDateRange,
	getDashboardPeriodShortcuts,
} from "../utils/period-shortcuts";

it("keeps today and year on the Brazilian calendar across UTC midnight", () => {
	const now = new Date("2027-01-01T01:00:00Z");
	expect(getCurrentYearDateRange(now)).toEqual({
		dateFrom: "2026-01-01",
		dateTo: "2026-12-31",
	});
	expect(
		getDashboardPeriodShortcuts(now).find((s) => s.id === "currentYear")?.label,
	).toBe("2026");
});
