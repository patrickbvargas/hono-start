import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";

const payloadSchema = z.object({
	id: z.number(),
});

export const createEmployee = createServerFn({ method: "POST" })
	.inputValidator(payloadSchema)
	.handler(async () => true);

export const createEmployeeOptions = () =>
	mutationOptions({
		mutationFn: createEmployee,
		onError: (error) => {
			console.error(error);
			alert("Ocorreu um erro ao criar o funcionário");
		},
	});
