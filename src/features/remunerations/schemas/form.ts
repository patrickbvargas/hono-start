import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";
import { validateRemunerationWriteRules } from "../rules";
import { remunerationSearchSchema } from "./search";

const remunerationBaseInputSchema = z.object({
	amount: z.number(),
	effectivePercentage: z.number(),
});

const remunerationBusinessRulesRefinement = (
	data: RemunerationUpdateInput,
	ctx: z.RefinementCtx,
) => {
	const issues = validateRemunerationWriteRules(data);

	for (const issue of issues) {
		ctx.addIssue({
			code: "custom",
			message: issue.message,
			path: issue.path,
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
