import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/shared/lib/prisma";
import {
	assertCanManageEmployees,
	getServerEmployeeScope,
	getServerLoggedUserSession,
} from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { employeeCreateSchema } from "../schemas/form";
import {
	normalizeEmployeeInput,
	validateEmployeeBusinessRules,
	validateEmployeeLookupSelections,
} from "../utils/validation";

const createEmployee = createServerFn({ method: "POST" })
	.inputValidator(employeeCreateSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = getServerLoggedUserSession();
			assertCanManageEmployees(session);
			const { firmId } = getServerEmployeeScope();
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

			validateEmployeeLookupSelections({ type, role });
			const payload = normalizeEmployeeInput(data, type.value);
			validateEmployeeBusinessRules(payload, type.value);

			await prisma.employee.create({
				data: {
					firmId,
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
		} catch (error: unknown) {
			console.error("[createEmployee]", error);
			if (
				error instanceof Error &&
				error.message.includes("Unique constraint") &&
				error.message.includes("email")
			) {
				throw new Error("Este email já está em uso");
			}
			if (
				error instanceof Error &&
				(error.message.includes("Selecione uma") ||
					error.message.includes("não encontrada") ||
					error.message.includes("OAB"))
			) {
				throw error;
			}
			throw new Error("Erro ao criar funcionário");
		}
	});

export const createEmployeeOptions = () =>
	mutationOptions({
		mutationFn: createEmployee,
	});
