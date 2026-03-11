import * as z from "zod";

export const optionSchema = z
	.object({
		id: z.union([z.string(), z.number()]),
		description: z.string().min(1, "Descrição é obrigatória"),
	})
	.transform((option) => ({
		value: option.id.toString(),
		label: option.description,
	}));

export type Option = z.infer<typeof optionSchema>;
