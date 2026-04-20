import type { EmployeeType, UserRole } from "@/generated/prisma/client";
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

export function assertRoleExists(
	role: UserRole | null,
): asserts role is UserRole {
	if (!role) {
		throw new Error(EMPLOYEE_ERRORS.ROLE_NOT_FOUND);
	}
}

export function assertRoleCanBeSelected(
	role: UserRole,
	currentRoleId?: number,
) {
	if (!role.isActive && role.id !== currentRoleId) {
		throw new Error(EMPLOYEE_ERRORS.ROLE_INACTIVE);
	}
}
