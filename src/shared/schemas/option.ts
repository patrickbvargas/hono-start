import * as z from "zod";
import { entityIdSchema } from "./entity";

export const optionSchema = entityIdSchema
	.safeExtend({
		value: z.string().min(1, "Valor é obrigatória"),
		label: z.string().min(1, "Label é obrigatória"),
		isActive: z.boolean().default(false),
	})
	.transform((data) => ({
		id: data.id,
		value: data.value,
		label: data.label,
		isDisabled: !data.isActive,
	}));

export type Option = z.infer<typeof optionSchema>;
