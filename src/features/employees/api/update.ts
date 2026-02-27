import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { employeeUpdateSchema } from "../schemas/form";

export const updateEmployee = createServerFn({ method: "POST" })
	.inputValidator(employeeUpdateSchema)
	.handler(async () => true);

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
