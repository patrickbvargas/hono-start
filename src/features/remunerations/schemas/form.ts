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
	const assertions = [
		{
			path: ["amount"],
			run: () => assertRemunerationAmountPositive(data.amount),
		},
		{
			path: ["effectivePercentage"],
			run: () =>
				assertRemunerationEffectivePercentageRange(data.effectivePercentage),
		},
	] as const;

	for (const assertion of assertions) {
		try {
			assertion.run();
		} catch (error) {
			if (!(error instanceof Error)) {
				throw error;
			}

			ctx.addIssue({
				code: "custom",
				message: error.message,
				path: [...assertion.path],
			});
		}
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
