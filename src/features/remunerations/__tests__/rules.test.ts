import { describe, expect, it } from "vitest";
import { REMUNERATION_ERRORS } from "../constants/errors";
import {
	assertRemunerationAmountPositive,
	assertRemunerationEffectivePercentageRange,
	assertRemunerationWriteRules,
} from "../rules/write";

describe("remuneration write rules", () => {
	it("does not throw for a valid remuneration payload", () => {
		expect(() =>
			assertRemunerationWriteRules({
				amount: 1500,
				effectivePercentage: 0.4,
			}),
		).not.toThrow();
	});

	it("throws the amount error when amount is not positive", () => {
		expect(() => assertRemunerationAmountPositive(0)).toThrow(
			REMUNERATION_ERRORS.REMUNERATION_AMOUNT_TOO_LOW,
		);
	});

	it("throws the percentage-too-low error when percentage is negative", () => {
		expect(() => assertRemunerationEffectivePercentageRange(-0.1)).toThrow(
			REMUNERATION_ERRORS.REMUNERATION_PERCENTAGE_TOO_LOW,
		);
	});

	it("throws the percentage-too-high error when percentage exceeds one", () => {
		expect(() => assertRemunerationEffectivePercentageRange(1.1)).toThrow(
			REMUNERATION_ERRORS.REMUNERATION_PERCENTAGE_TOO_HIGH,
		);
	});
});
