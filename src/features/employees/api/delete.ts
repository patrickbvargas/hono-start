import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { employeeDeleteSchema } from "../schemas/form";

export const deleteEmployee = createServerFn({ method: "GET" })
	.inputValidator(employeeDeleteSchema)
	.handler(async () => true);

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
