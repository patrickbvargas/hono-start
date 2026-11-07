import { describe, expect, it } from "vitest";
import {
	settlementCreateInputSchema,
	settlementReverseInputSchema,
} from "../schemas/form";
import { getRemunerationDueDate, getSettlementToday } from "../utils/date";

const input = {
	direction: "receivable",
	titleId: 1,
	requestKey: "e0606906-6993-4135-96da-12b147290044",
	effectiveDate: "2026-01-01",
	actualPaymentMethod: "PIX",
	principalAbated: 100,
	discount: 0,
	interest: 0,
	penalty: 0,
	generatesRemuneration: false,
};
describe("settlement boundary", () => {
	it.each([
		{ principalAbated: 0 },
		{ discount: 101 },
		{ interest: -1 },
		{ penalty: -1 },
		{ principalAbated: 1.001 },
		{ effectiveDate: "2099-01-01" },
		{ effectiveDate: "2026-02-30" },
		{ actualPaymentMethod: "" },
		{ requestKey: "invalid" },
		{ direction: "payable", generatesRemuneration: true },
		{ interest: 999_999_999_999.99 },
	])("rejects invalid input %j", (change) => {
		expect(
			settlementCreateInputSchema.safeParse({ ...input, ...change }).success,
		).toBe(false);
	});
	it("accepts zero-cash full discount and rejects blank reversal reason", () => {
		expect(
			settlementCreateInputSchema.safeParse({ ...input, discount: 100 })
				.success,
		).toBe(true);
		expect(
			settlementReverseInputSchema.safeParse({
				...input,
				movementId: 2,
				reason: "  ",
			}).success,
		).toBe(false);
	});
	it("uses São Paulo calendar day across UTC midnight", () => {
		expect(getSettlementToday(new Date("2026-11-08T01:00:00Z"))).toBe(
			"2026-11-07",
		);
	});
	it.each([
		["2026-01-25", 25, 5, "2026-02-05"],
		["2026-01-26", 25, 5, "2026-03-05"],
		["2026-01-25", 25, 31, "2026-02-28"],
		["2028-01-25", 25, 31, "2028-02-29"],
		["2026-12-26", 25, 31, "2027-02-28"],
	])("computes due date for %s", (date, cutoff, day, expected) => {
		expect(
			getRemunerationDueDate(date, cutoff, day).toISOString().slice(0, 10),
		).toBe(expected);
	});
});
