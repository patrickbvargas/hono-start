import type { ValidationIssue } from "@/shared/types/validation";
import { LAWYER_TYPE_VALUE } from "../constants";

export interface EmployeeValidationInput {
	oabNumber?: string;
	referrerPercent: number;
	remunerationPercent: number;
	type: string;
}

function getEmployeeReferrerPercentMessage(input: EmployeeValidationInput) {
	if (input.referrerPercent > input.remunerationPercent) {
		return "Percentual de indicação não pode exceder o percentual de remuneração";
	}

	return null;
}

function getEmployeeOabRequiredMessage(input: EmployeeValidationInput) {
	if (input.type === LAWYER_TYPE_VALUE && !input.oabNumber) {
		return "OAB é obrigatória";
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
