import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";

const payloadSchema = z.object({
	id: z.number(),
});

export const deleteEmployee = createServerFn({ method: "GET" })
	.inputValidator(payloadSchema)
	.handler(async () => true);

export const deleteEmployeeOptions = () =>
	mutationOptions({
		mutationFn: deleteEmployee,
		onError: (error) => {
			console.error(error);
			alert("Ocorreu um erro ao excluir o funcionário");
		},
	});
