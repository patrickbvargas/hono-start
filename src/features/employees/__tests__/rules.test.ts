import { describe, expect, it } from "vitest";
import { LAWYER_TYPE_VALUE } from "../constants";
import { EMPLOYEE_ERRORS } from "../constants/errors";
import { validateEmployeeWriteRules } from "../rules";

describe("validateEmployeeWriteRules", () => {
	it("returns both issues when a lawyer is missing OAB and has invalid referral percentage", () => {
		expect(
			validateEmployeeWriteRules({
				type: LAWYER_TYPE_VALUE,
				oabNumber: "",
				remunerationPercent: 0.2,
				referrerPercent: 0.3,
			}),
		).toEqual([
			{
				path: ["referrerPercent"],
				message: EMPLOYEE_ERRORS.EMPLOYEE_REFERRAL_PERCENTAGE_TOO_HIGH,
			},
			{
				path: ["oabNumber"],
				message: EMPLOYEE_ERRORS.EMPLOYEE_OAB_REQUIRED,
			},
		]);
	});

	it("requires oab for lawyers", () => {
		expect(
			validateEmployeeWriteRules({
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
			validateEmployeeWriteRules({
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
			validateEmployeeWriteRules({
				type: LAWYER_TYPE_VALUE,
				oabNumber: "RS123456",
				remunerationPercent: 0.4,
				referrerPercent: 0.2,
			}),
		).toEqual([]);
	});
});
