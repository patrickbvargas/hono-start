import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";
import { remunerationSearchSchema } from "./search";

const remunerationManualOverrideShape = {
	amount: z.number().positive("Valor deve ser maior que zero"),
	effectivePercentage: z
		.number()
		.min(0, "Percentual não pode ser negativo")
		.max(1, "Percentual deve ser menor ou igual a 100%"),
};

export const remunerationUpdateInputSchema = entityIdSchema.safeExtend(
	remunerationManualOverrideShape,
);

export const remunerationIdInputSchema = entityIdSchema;

export const remunerationExportInputSchema =
	remunerationSearchSchema.safeExtend({
		format: z.enum(["pdf", "spreadsheet"]),
	});

export type RemunerationUpdateInput = z.infer<
	typeof remunerationUpdateInputSchema
>;
export type RemunerationIdInput = z.infer<typeof remunerationIdInputSchema>;
export type RemunerationExportInput = z.infer<
	typeof remunerationExportInputSchema
>;
