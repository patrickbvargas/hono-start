import { describe, expect, it } from "vitest";
import {
	getDashboardActivePeriodShortcut,
	getDashboardPeriodShortcuts,
} from "../utils/period-shortcuts";

describe("current month shortcut", () => {
	it.each([
		["2026-10-28", "2026-10-01", "2026-10-31"],
		["2028-02-15", "2028-02-01", "2028-02-29"],
		["2026-12-15", "2026-12-01", "2026-12-31"],
	])("selects the full month for %s", (date, dateFrom, dateTo) => {
		const reference = new Date(`${date}T12:00:00Z`);
		const shortcuts = getDashboardPeriodShortcuts(reference);
		const index = shortcuts.findIndex((item) => item.id === "currentMonth");
		expect(shortcuts[index]).toMatchObject({ dateFrom, dateTo });
		expect(shortcuts[index + 1].id).toBe("currentYear");
		expect(
			getDashboardActivePeriodShortcut({ dateFrom, dateTo }, reference),
		).toBe("currentMonth");
	});
});
