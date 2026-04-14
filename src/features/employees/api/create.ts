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
import { employeeCreateInputSchema } from "../schemas/form";
import {
	resolveEmployeeLookupSelections,
	validateEmployeeLookupSelections,
} from "./lookups";

const createEmployee = createServerFn({ method: "POST" })
	.inputValidator(employeeCreateInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = getServerLoggedUserSession();
			assertCanManageEmployees(session);
			const { firmId } = getServerEmployeeScope();

			const { type, role } = await resolveEmployeeLookupSelections(
				prisma,
				data,
			);
			validateEmployeeLookupSelections({ type, role });

			await prisma.employee.create({
				data: {
					firmId,
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
		} catch (error: unknown) {
			console.error("[createEmployee]", error);
			if (isPrismaUniqueConstraintError(error, ["email"])) {
				throw new Error("Este email já está em uso");
			}

			if (
				hasExactErrorMessage(error, [
					"Função não encontrada",
					"Perfil não encontrado",
					"Selecione uma função ativa",
					"Selecione um perfil ativo",
				])
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
