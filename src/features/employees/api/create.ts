import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import type { MutationReturnType } from "@/shared/types/api";
import { employeeCreateSchema } from "../schemas/form";

const createEmployee = createServerFn({ method: "POST" })
	.inputValidator(employeeCreateSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			// TODO: implement actual database insert
			console.log("[createEmployee]", data);
			return { success: true };
		} catch (error) {
			console.error("[createEmployee]", error);
			throw new Error("Erro ao criar funcionário");
		}
	});

export const createEmployeeOptions = () =>
	mutationOptions({
		mutationFn: createEmployee,
		onSuccess: () => {
			alert("Funcionário criado com sucesso");
		},
		onError: (error) => {
			console.error(error);
			alert("Ocorreu um erro ao criar o funcionário");
		},
	});
