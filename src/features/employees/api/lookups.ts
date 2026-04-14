import type {
	EmployeeType,
	PrismaClient,
	UserRole,
} from "@/generated/prisma/client";

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

	if (!type) throw new Error("Função não encontrada");
	if (!role) throw new Error("Perfil não encontrado");

	return { type, role };
}
