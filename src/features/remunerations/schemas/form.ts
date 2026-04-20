import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";
import {
	assertRemunerationAmountPositive,
	assertRemunerationEffectivePercentageRange,
} from "../rules/write";
import { remunerationSearchSchema } from "./search";

const remunerationBaseInputSchema = z.object({
	amount: z.number(),
	effectivePercentage: z.number(),
});

const remunerationBusinessRulesRefinement = (
	data: RemunerationUpdateInput,
	ctx: z.RefinementCtx,
) => {
	try {
		assertRemunerationAmountPositive(data.amount);
	} catch (error) {
		ctx.addIssue({
			code: "custom",
			path: ["amount"],
			message: error instanceof Error ? error.message : "Valor inválido",
		});
	}

	try {
		assertRemunerationEffectivePercentageRange(data.effectivePercentage);
	} catch (error) {
		ctx.addIssue({
			code: "custom",
			path: ["effectivePercentage"],
			message: error instanceof Error ? error.message : "Valor inválido",
		});
	}
};

export const remunerationUpdateInputSchema = entityIdSchema
	.safeExtend(remunerationBaseInputSchema.shape)
	.superRefine(remunerationBusinessRulesRefinement);

export const remunerationIdInputSchema = entityIdSchema;

export const remunerationExportInputSchema =
	remunerationSearchSchema.safeExtend({
		format: z.enum(["pdf", "spreadsheet"]),
	});

export type RemunerationBaseInput = z.infer<typeof remunerationBaseInputSchema>;
export type RemunerationUpdateInput = z.infer<
	typeof remunerationUpdateInputSchema
>;
export type RemunerationIdInput = z.infer<typeof remunerationIdInputSchema>;
export type RemunerationExportInput = z.infer<
	typeof remunerationExportInputSchema
>;
