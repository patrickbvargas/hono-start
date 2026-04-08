import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/shared/lib/prisma";
import type { MutationReturnType } from "@/shared/types/api";
import { employeeCreateSchema } from "../schemas/form";

const createEmployee = createServerFn({ method: "POST" })
	.inputValidator(employeeCreateSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			// TODO: replace with session firmId
			const firmId = 1;
			await prisma.employee.create({
				data: {
					firmId,
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
		} catch (error: unknown) {
			console.error("[createEmployee]", error);
			if (
				error instanceof Error &&
				error.message.includes("Unique constraint") &&
				error.message.includes("email")
			) {
				throw new Error("Este email já está em uso");
			}
			throw new Error("Erro ao criar funcionário");
		}
	});

export const createEmployeeOptions = () =>
	mutationOptions({
		mutationFn: createEmployee,
	});
