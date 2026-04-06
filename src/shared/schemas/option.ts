import * as z from "zod";
import { entityIdSchema } from "./entity";

export const optionSchema = entityIdSchema
	.safeExtend({
		description: z.string().min(1, "Descrição é obrigatória"),
	})
	.transform((option) => ({
		value: option.id.toString(),
		label: option.description,
	}));

export type OptionInput = z.input<typeof optionSchema>;
export type Option = z.infer<typeof optionSchema>;
