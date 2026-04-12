import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/shared/lib/prisma";
import {
	assertCanManageEmployees,
	getServerEmployeeScope,
	getServerLoggedUserSession,
} from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { employeeUpdateSchema } from "../schemas/form";
import {
	normalizeEmployeeInput,
	validateEmployeeBusinessRules,
	validateEmployeeLookupSelections,
} from "../utils/validation";

const updateEmployee = createServerFn({ method: "POST" })
	.inputValidator(employeeUpdateSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = getServerLoggedUserSession();
			assertCanManageEmployees(session);
			const { firmId } = getServerEmployeeScope();
			const existing = await prisma.employee.findFirst({
				where: { id: data.id, firmId, deletedAt: null },
			});
			if (!existing) throw new Error("Funcionário não encontrado");
			const [type, role] = await Promise.all([
				prisma.employeeType.findUnique({
					where: { id: data.type },
				}),
				prisma.userRole.findUnique({
					where: { id: data.role },
				}),
			]);
			if (!type) throw new Error("Função não encontrada");
			if (!role) throw new Error("Perfil não encontrado");

			validateEmployeeLookupSelections(
				{ type, role },
				{ currentTypeId: existing.typeId, currentRoleId: existing.roleId },
			);
			const payload = normalizeEmployeeInput(data, type.value);
			validateEmployeeBusinessRules(payload, type.value);

			await prisma.employee.update({
				where: { id: data.id },
				data: {
					fullName: payload.fullName,
					email: payload.email,
					typeId: payload.type,
					roleId: payload.role,
					oabNumber: payload.oabNumber || null,
					remunerationPercentage: payload.remunerationPercent,
					referralPercentage: payload.referrerPercent,
					isActive: payload.isActive,
				},
			});
			return { success: true };
		} catch (error) {
			console.error("[updateEmployee]", error);
			if (
				error instanceof Error &&
				(error.message === "Funcionário não encontrado" ||
					error.message.includes("Selecione uma") ||
					error.message.includes("não encontrada") ||
					error.message.includes("OAB"))
			)
				throw error;
			throw new Error("Erro ao atualizar funcionário");
		}
	});

export const updateEmployeeOptions = () =>
	mutationOptions({
		mutationFn: updateEmployee,
	});
