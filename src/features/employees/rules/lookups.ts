import type {
	EmployeeType,
	PrismaClient,
	UserRole,
} from "@/generated/prisma/client";
import { EMPLOYEE_ERRORS } from "../constants/errors";

interface EmployeeLookupSelection {
	role: UserRole;
	type: EmployeeType;
}

interface EmployeeLookupSelectionInput {
	role: string;
	type: string;
}

interface EmployeeLookupValidationOptions {
	currentRoleId?: number;
	currentTypeId?: number;
}

export function assertLookupSelectionsAreActive(
	selection: EmployeeLookupSelection,
	options: EmployeeLookupValidationOptions = {},
) {
	if (!selection.type.isActive && selection.type.id !== options.currentTypeId) {
		throw new Error(EMPLOYEE_ERRORS.TYPE_INACTIVE);
	}

	if (!selection.role.isActive && selection.role.id !== options.currentRoleId) {
		throw new Error(EMPLOYEE_ERRORS.ROLE_INACTIVE);
	}
}

export async function resolveEmployeeLookupSelections(
	prisma: PrismaClient,
	input: EmployeeLookupSelectionInput,
) {
	const [type, role] = await Promise.all([
		prisma.employeeType.findUnique({
			where: { value: input.type },
		}),
		prisma.userRole.findUnique({
			where: { value: input.role },
		}),
	]);

	if (!type) throw new Error(EMPLOYEE_ERRORS.TYPE_NOT_FOUND);
	if (!role) throw new Error(EMPLOYEE_ERRORS.ROLE_NOT_FOUND);

	return { type, role };
}
