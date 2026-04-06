import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db";
import type { MutationReturnType } from "@/shared/types/api";
import { employeeDeleteSchema } from "../schemas/form";

const restoreEmployee = createServerFn({ method: "POST" })
	.inputValidator(employeeDeleteSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			// TODO: replace with session firmId
			const firmId = 1;
			const existing = await db.employee.findFirst({
				where: { id: data.id, firmId, NOT: { deletedAt: null } },
			});
			if (!existing) throw new Error("Funcionário não encontrado");
			await db.employee.update({
				where: { id: data.id },
				data: { deletedAt: null },
			});
			return { success: true };
		} catch (error) {
			console.error("[restoreEmployee]", error);
			if (error instanceof Error && error.message.includes("não encontrado"))
				throw error;
			throw new Error("Erro ao restaurar funcionário");
		}
	});

export const restoreEmployeeOptions = () =>
	mutationOptions({
		mutationFn: restoreEmployee,
	});
