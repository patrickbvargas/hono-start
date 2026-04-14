import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
	hasExactErrorMessage,
	isPrismaUniqueConstraintError,
} from "@/shared/lib/error-mapping";
import { prisma } from "@/shared/lib/prisma";
import {
	assertCanManageEmployees,
	getServerEmployeeScope,
	getServerLoggedUserSession,
} from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { employeeUpdateInputSchema } from "../schemas/form";
import {
	resolveEmployeeLookupSelections,
	validateEmployeeLookupSelections,
} from "./lookups";

const updateEmployee = createServerFn({ method: "POST" })
	.inputValidator(employeeUpdateInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = getServerLoggedUserSession();
			assertCanManageEmployees(session);
			const { firmId } = getServerEmployeeScope();
			const existing = await prisma.employee.findFirst({
				where: { id: data.id, firmId, deletedAt: null },
			});
			if (!existing) throw new Error("Funcionário não encontrado");

			const { type, role } = await resolveEmployeeLookupSelections(
				prisma,
				data,
			);
			validateEmployeeLookupSelections(
				{ type, role },
				{ currentTypeId: existing.typeId, currentRoleId: existing.roleId },
			);

			await prisma.employee.update({
				where: { id: data.id },
				data: {
					fullName: data.fullName,
					email: data.email,
					typeId: type.id,
					roleId: role.id,
					oabNumber: data.oabNumber || null,
					remunerationPercentage: data.remunerationPercent,
					referralPercentage: data.referrerPercent,
					isActive: data.isActive,
				},
			});
			return { success: true };
		} catch (error) {
			console.error("[updateEmployee]", error);
			if (isPrismaUniqueConstraintError(error, ["email"])) {
				throw new Error("Este email já está em uso");
			}

			if (
				hasExactErrorMessage(error, [
					"Funcionário não encontrado",
					"Função não encontrada",
					"Perfil não encontrado",
					"Selecione uma função ativa",
					"Selecione um perfil ativo",
				])
			) {
				throw error;
			}
			throw new Error("Erro ao atualizar funcionário");
		}
	});

export const updateEmployeeOptions = () =>
	mutationOptions({
		mutationFn: updateEmployee,
	});
