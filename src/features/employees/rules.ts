import type { ValidationIssue } from "@/shared/types/validation";
import { LAWYER_TYPE_VALUE } from "./constants";
import { EMPLOYEE_ERRORS } from "./constants/errors";

export interface EmployeeValidationInput {
	oabNumber?: string;
	referrerPercent: number;
	remunerationPercent: number;
	type: string;
}

function getEmployeeReferrerPercentIssue(
	input: EmployeeValidationInput,
): ValidationIssue | null {
	if (input.referrerPercent <= input.remunerationPercent) {
		return null;
	}

	return {
		path: ["referrerPercent"],
		message: EMPLOYEE_ERRORS.EMPLOYEE_REFERRAL_PERCENTAGE_TOO_HIGH,
	};
}

function getEmployeeOabRequiredIssue(
	input: EmployeeValidationInput,
): ValidationIssue | null {
	if (input.type !== LAWYER_TYPE_VALUE || input.oabNumber) {
		return null;
	}

	return {
		path: ["oabNumber"],
		message: EMPLOYEE_ERRORS.EMPLOYEE_OAB_REQUIRED,
	};
}

export function validateEmployeeWriteRules(
	input: EmployeeValidationInput,
): ValidationIssue[] {
	const issues: ValidationIssue[] = [];

	const referrerPercentIssue = getEmployeeReferrerPercentIssue(input);
	if (referrerPercentIssue) {
		issues.push(referrerPercentIssue);
	}

	const oabRequiredIssue = getEmployeeOabRequiredIssue(input);
	if (oabRequiredIssue) {
		issues.push(oabRequiredIssue);
	}

	return issues;
}
