import type { EmployeeType, UserRole } from "@/generated/prisma/client";
import type { EmployeeCreate, EmployeeUpdate } from "../schemas/form";
import {
	ADMIN_ASSISTANT_TYPE_VALUE,
	LAWYER_TYPE_VALUE,
} from "../schemas/option";

type EmployeeMutationInput = EmployeeCreate | EmployeeUpdate;

interface EmployeeLookupSelection {
	role: UserRole;
	type: EmployeeType;
}

interface EmployeeLookupValidationOptions {
	currentRoleId?: number;
	currentTypeId?: number;
}

export function normalizeEmployeeInput<T extends EmployeeMutationInput>(
	input: T,
	typeValue: string,
) {
	const normalizedOabNumber = input.oabNumber?.trim().toUpperCase() ?? "";

	return {
		...input,
		oabNumber:
			typeValue === ADMIN_ASSISTANT_TYPE_VALUE ? "" : normalizedOabNumber,
	};
}

export function validateEmployeeLookupSelections(
	selection: EmployeeLookupSelection,
	options: EmployeeLookupValidationOptions = {},
) {
	if (!selection.type.isActive && selection.type.id !== options.currentTypeId) {
		throw new Error("Selecione uma função ativa");
	}

	if (!selection.role.isActive && selection.role.id !== options.currentRoleId) {
		throw new Error("Selecione um perfil ativo");
	}
}

export function validateEmployeeBusinessRules<T extends EmployeeMutationInput>(
	input: T,
	typeValue: string,
) {
	if (typeValue === LAWYER_TYPE_VALUE && !input.oabNumber) {
		throw new Error("OAB é obrigatória para advogados");
	}

	if (
		typeValue !== LAWYER_TYPE_VALUE &&
		typeValue !== ADMIN_ASSISTANT_TYPE_VALUE &&
		input.oabNumber
	) {
		throw new Error("OAB só pode ser informada para advogados");
	}
}
