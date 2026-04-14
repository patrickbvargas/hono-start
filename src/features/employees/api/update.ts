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
	resolveEmployeeLookupSelections,
	validateEmployeeLookupSelections,
} from "./lookups";

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
