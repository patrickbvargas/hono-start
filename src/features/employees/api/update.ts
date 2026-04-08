import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/shared/lib/prisma";
import type { MutationReturnType } from "@/shared/types/api";
import { employeeUpdateSchema } from "../schemas/form";

const updateEmployee = createServerFn({ method: "POST" })
	.inputValidator(employeeUpdateSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			// TODO: replace with session firmId
			const firmId = 1;
			const existing = await prisma.employee.findFirst({
				where: { id: data.id, firmId, deletedAt: null },
			});
			if (!existing) throw new Error("Funcionário não encontrado");
			await prisma.employee.update({
				where: { id: data.id },
				data: {
					fullName: data.fullName,
					email: data.email,
					typeId: data.type,
					roleId: data.role,
					oabNumber: data.oabNumber || null,
					remunerationPercentage: data.remunerationPercent,
					referralPercentage: data.referrerPercent,
				},
			});
			return { success: true };
		} catch (error) {
			console.error("[updateEmployee]", error);
			if (
				error instanceof Error &&
				error.message === "Funcionário não encontrado"
			)
				throw error;
			throw new Error("Erro ao atualizar funcionário");
		}
	});

export const updateEmployeeOptions = () =>
	mutationOptions({
		mutationFn: updateEmployee,
	});
