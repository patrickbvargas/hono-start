import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { employeeCreateSchema } from "../schemas/form";

export const createEmployee = createServerFn({ method: "POST" })
	.inputValidator(employeeCreateSchema)
	.handler(async () => true);

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
