import { describe, expect, it } from "vitest";
import { LAWYER_TYPE_VALUE } from "../constants";
import { EMPLOYEE_ERRORS } from "../constants/errors";
import { validateEmployeeBusinessRules } from "../rules";

describe("validateEmployeeBusinessRules", () => {
	it("requires oab for lawyers", () => {
		expect(
			validateEmployeeBusinessRules({
				type: LAWYER_TYPE_VALUE,
				oabNumber: "",
				remunerationPercent: 0.4,
				referrerPercent: 0.1,
			}),
		).toEqual([
			{
				path: ["oabNumber"],
				message: EMPLOYEE_ERRORS.EMPLOYEE_OAB_REQUIRED,
			},
		]);
	});

	it("rejects referral percentage above remuneration percentage", () => {
		expect(
			validateEmployeeBusinessRules({
				type: LAWYER_TYPE_VALUE,
				oabNumber: "RS123456",
				remunerationPercent: 0.2,
				referrerPercent: 0.3,
			}),
		).toEqual([
			{
				path: ["referrerPercent"],
				message: EMPLOYEE_ERRORS.EMPLOYEE_REFERRAL_PERCENTAGE_TOO_HIGH,
			},
		]);
	});

	it("accepts a valid lawyer payload", () => {
		expect(
			validateEmployeeBusinessRules({
				type: LAWYER_TYPE_VALUE,
				oabNumber: "RS123456",
				remunerationPercent: 0.4,
				referrerPercent: 0.2,
			}),
		).toEqual([]);
	});
});
