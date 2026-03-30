import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import type { MutationReturnType } from "@/shared/types/api";
import { employeeDeleteSchema } from "../schemas/form";

const deleteEmployee = createServerFn({ method: "POST" })
	.inputValidator(employeeDeleteSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			// TODO: implement actual database delete
			console.log("[deleteEmployee]", data);
			return { success: true };
		} catch (error) {
			console.error("[deleteEmployee]", error);
			throw new Error("Erro ao excluir funcionário");
		}
	});

export const deleteEmployeeOptions = () =>
	mutationOptions({
		mutationFn: deleteEmployee,
		onSuccess: () => {
			alert("Funcionário excluído com sucesso");
		},
		onError: (error) => {
			console.error(error);
			alert("Ocorreu um erro ao excluir o funcionário");
		},
	});
