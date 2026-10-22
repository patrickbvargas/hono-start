import type { EmployeeType } from "@/generated/prisma/client";
import { EMPLOYEE_ERRORS } from "../constants/errors";

export function assertTypeExists(
	type: EmployeeType | null,
): asserts type is EmployeeType {
	if (!type) {
		throw new Error(EMPLOYEE_ERRORS.TYPE_NOT_FOUND);
	}
}

export function assertTypeCanBeSelected(
	type: EmployeeType,
	currentTypeId?: number,
) {
	if (!type.isActive && type.id !== currentTypeId) {
		throw new Error(EMPLOYEE_ERRORS.TYPE_INACTIVE);
	}
}
