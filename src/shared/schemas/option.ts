import * as z from "zod";
import { entityIdSchema } from "./entity";

export const optionSchema = entityIdSchema.safeExtend({
	value: z.string().min(1, "Valor é obrigatória"),
	label: z.string().min(1, "Label é obrigatória"),
});

export type Option = z.infer<typeof optionSchema>;
