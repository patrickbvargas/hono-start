import { LAWYER_TYPE_VALUE } from "../constants";
import { EMPLOYEE_ERRORS } from "../constants/errors";

interface EmployeeOabInput {
	oabNumber?: string;
	type: string;
}

export function assertLawyerHasOab({ oabNumber, type }: EmployeeOabInput) {
	if (type === LAWYER_TYPE_VALUE && !oabNumber) {
		throw new Error(EMPLOYEE_ERRORS.OAB_REQUIRED);
	}
}
