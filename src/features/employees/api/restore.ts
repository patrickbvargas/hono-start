import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { hasExactErrorMessage } from "@/shared/lib/error-mapping";
import { prisma } from "@/shared/lib/prisma";
import {
	assertCanManageEmployees,
	getServerEmployeeScope,
	getServerLoggedUserSession,
} from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { employeeIdInputSchema } from "../schemas/form";

const restoreEmployee = createServerFn({ method: "POST" })
	.inputValidator(employeeIdInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = getServerLoggedUserSession();
			assertCanManageEmployees(session);
			const { firmId } = getServerEmployeeScope();
			const existing = await prisma.employee.findFirst({
				where: { id: data.id, firmId, NOT: { deletedAt: null } },
			});
			if (!existing) throw new Error("Funcionário não encontrado");
			await prisma.employee.update({
				where: { id: data.id },
				data: { deletedAt: null },
			});
			return { success: true };
		} catch (error) {
			console.error("[restoreEmployee]", error);
			if (
				hasExactErrorMessage(error, [
					"Funcionário não encontrado",
					"Apenas administradores podem gerenciar funcionários",
				])
			)
				throw error;
			throw new Error("Erro ao restaurar funcionário");
		}
	});

export const restoreEmployeeOptions = () =>
	mutationOptions({
		mutationFn: restoreEmployee,
	});
