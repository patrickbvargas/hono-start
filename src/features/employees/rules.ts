import type { ValidationIssue } from "@/shared/types/validation";
import { LAWYER_TYPE_VALUE } from "./constants";
import { EMPLOYEE_ERRORS } from "./constants/errors";

export interface EmployeeValidationInput {
	oabNumber?: string;
	referrerPercent: number;
	remunerationPercent: number;
	type: string;
}

function getEmployeeReferrerPercentMessage(input: EmployeeValidationInput) {
	if (input.referrerPercent > input.remunerationPercent) {
		return EMPLOYEE_ERRORS.EMPLOYEE_REFERRAL_PERCENTAGE_TOO_HIGH;
	}

	return null;
}

function getEmployeeOabRequiredMessage(input: EmployeeValidationInput) {
	if (input.type === LAWYER_TYPE_VALUE && !input.oabNumber) {
		return EMPLOYEE_ERRORS.EMPLOYEE_OAB_REQUIRED;
	}

	return null;
}

export function validateEmployeeBusinessRules(
	input: EmployeeValidationInput,
): ValidationIssue[] {
	const issues: ValidationIssue[] = [];

	const referrerPercentMessage = getEmployeeReferrerPercentMessage(input);
	if (referrerPercentMessage) {
		issues.push({
			path: ["referrerPercent"],
			message: referrerPercentMessage,
		});
	}

	const oabRequiredMessage = getEmployeeOabRequiredMessage(input);
	if (oabRequiredMessage) {
		issues.push({
			path: ["oabNumber"],
			message: oabRequiredMessage,
		});
	}

	return issues;
}
