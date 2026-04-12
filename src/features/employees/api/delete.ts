import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/shared/lib/prisma";
import {
	assertCanManageEmployees,
	getServerEmployeeScope,
	getServerLoggedUserSession,
} from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { employeeByIdSchema } from "../schemas/form";

const deleteEmployee = createServerFn({ method: "POST" })
	.inputValidator(employeeByIdSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = getServerLoggedUserSession();
			assertCanManageEmployees(session);
			const { firmId } = getServerEmployeeScope();
			const existing = await prisma.employee.findFirst({
				where: { id: data.id, firmId, deletedAt: null },
			});
			if (!existing) throw new Error("Funcionário não encontrado");
			await prisma.employee.update({
				where: { id: data.id },
				data: { deletedAt: new Date() },
			});
			return { success: true };
		} catch (error) {
			console.error("[deleteEmployee]", error);
			if (
				error instanceof Error &&
				(error.message.includes("não encontrado") ||
					error.message.includes("possui"))
			)
				throw error;
			throw new Error("Erro ao excluir funcionário");
		}
	});

export const deleteEmployeeOptions = () =>
	mutationOptions({
		mutationFn: deleteEmployee,
	});
