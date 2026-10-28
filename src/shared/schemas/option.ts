import * as z from "zod";
import { entityIdSchema } from "./entity";

export const optionSchema = entityIdSchema
	.safeExtend({
		value: z.string().min(1, "Valor é obrigatória"),
		label: z.string().min(1, "Label é obrigatória"),
		isActive: z.boolean().default(false),
		imageUrl: z.url({ protocol: /^https$/ }).optional(),
	})
	.transform((data) => ({
		id: data.id,
		value: data.value,
		label: data.label,
		isDisabled: !data.isActive,
		...(data.imageUrl ? { imageUrl: data.imageUrl } : {}),
	}));

export type Option = z.infer<typeof optionSchema>;
