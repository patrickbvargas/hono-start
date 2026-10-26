import { describe, expect, it } from "vitest";
import { isExpenseOnlyDashboard } from "../utils/visibility";

describe("expense-only dashboard", () => {
	it.each([
		[false, false, true],
		[true, false, false],
		[false, true, false],
		[true, true, false],
	])(
		"revenue=%s remuneration=%s => expense only=%s",
		(revenue, remuneration, expected) => {
			expect(
				isExpenseOnlyDashboard({
					revenue,
					remuneration,
					expense: true,
					evolution: false,
				}),
			).toBe(expected);
		},
	);
	it("does not infer expense-only access from missing or empty data", () => {
		expect(isExpenseOnlyDashboard(undefined)).toBe(false);
		expect(
			isExpenseOnlyDashboard({
				revenue: false,
				remuneration: false,
				expense: false,
				evolution: false,
			}),
		).toBe(false);
	});
});
