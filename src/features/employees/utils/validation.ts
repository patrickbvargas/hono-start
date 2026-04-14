import { LAWYER_TYPE_VALUE } from "../constants";

interface EmployeeValidationInput {
	oabNumber?: string;
	referrerPercent: number;
	remunerationPercent: number;
	type: string;
}

export function getEmployeeReferrerPercentMessage(
	input: EmployeeValidationInput,
) {
	if (input.referrerPercent > input.remunerationPercent) {
		return "Percentual de indicação não pode exceder o percentual de remuneração";
	}

	return null;
}

export function getEmployeeOabRequiredMessage(input: EmployeeValidationInput) {
	if (input.type === LAWYER_TYPE_VALUE && !input.oabNumber) {
		return "OAB é obrigatória";
	}

	return null;
}
