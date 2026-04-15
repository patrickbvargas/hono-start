import { describe, expect, it } from "vitest";
import { REMUNERATION_ERRORS } from "../constants/errors";
import { validateRemunerationWriteRules } from "../rules";

describe("validateRemunerationWriteRules", () => {
	it("returns no issues for a valid remuneration payload", () => {
		expect(
			validateRemunerationWriteRules({
				amount: 1500,
				effectivePercentage: 0.4,
			}),
		).toEqual([]);
	});

	it("returns the amount error when amount is not positive", () => {
		expect(
			validateRemunerationWriteRules({
				amount: 0,
				effectivePercentage: 0.4,
			}),
		).toEqual([
			{
				path: ["amount"],
				message: REMUNERATION_ERRORS.REMUNERATION_AMOUNT_TOO_LOW,
			},
		]);
	});

	it("returns the percentage-too-low error when percentage is negative", () => {
		expect(
			validateRemunerationWriteRules({
				amount: 1500,
				effectivePercentage: -0.1,
			}),
		).toEqual([
			{
				path: ["effectivePercentage"],
				message: REMUNERATION_ERRORS.REMUNERATION_PERCENTAGE_TOO_LOW,
			},
		]);
	});

	it("returns the percentage-too-high error when percentage exceeds one", () => {
		expect(
			validateRemunerationWriteRules({
				amount: 1500,
				effectivePercentage: 1.1,
			}),
		).toEqual([
			{
				path: ["effectivePercentage"],
				message: REMUNERATION_ERRORS.REMUNERATION_PERCENTAGE_TOO_HIGH,
			},
		]);
	});
});
