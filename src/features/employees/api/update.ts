import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";

const payloadSchema = z.object({
	id: z.number(),
});

export const updateEmployee = createServerFn({ method: "POST" })
	.inputValidator(payloadSchema)
	.handler(async () => true);

export const updateEmployeeOptions = () =>
	mutationOptions({
		mutationFn: updateEmployee,
		onError: (error) => {
			console.error(error);
			alert("Ocorreu um erro ao atualizar o funcionário");
		},
	});
