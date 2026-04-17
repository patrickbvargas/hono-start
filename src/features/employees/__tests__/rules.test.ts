import { describe, expect, it } from "vitest";
import { LAWYER_TYPE_VALUE } from "../constants";
import { EMPLOYEE_ERRORS } from "../constants/errors";
import { assertLawyerHasOab } from "../rules/oab";
import { assertReferralPercentageWithinRemuneration } from "../rules/referral";

describe("employee rule assertions", () => {
	it("requires oab for lawyers", () => {
		expect(() =>
			assertLawyerHasOab({
				type: LAWYER_TYPE_VALUE,
				oabNumber: "",
			}),
		).toThrowError(EMPLOYEE_ERRORS.OAB_REQUIRED);
	});

	it("rejects referral percentage above remuneration percentage", () => {
		expect(() =>
			assertReferralPercentageWithinRemuneration({
				remunerationPercent: 0.2,
				referrerPercent: 0.3,
			}),
		).toThrowError(EMPLOYEE_ERRORS.REFERRAL_PERCENTAGE_TOO_HIGH);
	});

	it("accepts a valid lawyer payload", () => {
		expect(() =>
			assertLawyerHasOab({
				type: LAWYER_TYPE_VALUE,
				oabNumber: "RS123456",
			}),
		).not.toThrow();
		expect(() =>
			assertReferralPercentageWithinRemuneration({
				remunerationPercent: 0.4,
				referrerPercent: 0.2,
			}),
		).not.toThrow();
	});
});
