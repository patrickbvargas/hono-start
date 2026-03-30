import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import type { MutationReturnType } from "@/shared/types/api";
import { employeeUpdateSchema } from "../schemas/form";

const updateEmployee = createServerFn({ method: "POST" })
	.inputValidator(employeeUpdateSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			// TODO: implement actual database update
			console.log("[updateEmployee]", data);
			return { success: true };
		} catch (error) {
			console.error("[updateEmployee]", error);
			throw new Error("Erro ao atualizar funcionário");
		}
	});

export const updateEmployeeOptions = () =>
	mutationOptions({
		mutationFn: updateEmployee,
		onSuccess: () => {
			alert("Funcionário atualizado com sucesso");
		},
		onError: (error) => {
			console.error(error);
			alert("Ocorreu um erro ao atualizar o funcionário");
		},
	});
