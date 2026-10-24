import * as z from "zod";
import { TEXT_LIMITS } from "@/shared/constants/text-limits";
import { entityIdSchema } from "@/shared/schemas/entity";
import { assertLawyerHasOab } from "../rules/oab";
import { assertReferralPercentageWithinRemuneration } from "../rules/referral";

const employeeBaseInputSchema = z.object({
	fullName: z
		.string()
		.trim()
		.min(1, "Nome é obrigatório")
		.max(TEXT_LIMITS.name, "Nome deve ter no máximo 255 caracteres"),
	oabNumber: z
		.string()
		.trim()
		.max(TEXT_LIMITS.oabNumber, "OAB deve ter no máximo 8 caracteres")
		.regex(/^[A-Z]{2}\d{6}$/, "Formato OAB inválido (ex: RS123456)")
		.optional()
		.or(z.literal("")),
	remunerationPercent: z.coerce
		.number<number>()
		.min(0, "Percentual deve ser maior ou igual a 0%")
		.max(1, "Percentual não pode exceder 100%"),
	referrerPercent: z.coerce
		.number<number>()
		.min(0, "Percentual deve ser maior ou igual a 0%")
		.max(1, "Percentual não pode exceder 100%"),
	type: z.string().min(1, "Função é obrigatória"),
	isActive: z.boolean(),
});
const employeeBusinessRulesRefinement = (
	data: EmployeeBaseInput,
	ctx: z.RefinementCtx,
) => {
	try {
		assertReferralPercentageWithinRemuneration(data);
	} catch (error) {
		ctx.addIssue({
			code: "custom",
			path: ["referrerPercent"],
			message: error instanceof Error ? error.message : "Valor inválido",
		});
	}
	try {
		assertLawyerHasOab(data);
	} catch (error) {
		ctx.addIssue({
			code: "custom",
			path: ["oabNumber"],
			message: error instanceof Error ? error.message : "Valor inválido",
		});
	}
};
export const employeeCreateInputSchema = employeeBaseInputSchema.superRefine(
	employeeBusinessRulesRefinement,
);
export const employeeUpdateInputSchema = entityIdSchema
	.safeExtend(employeeBaseInputSchema.shape)
	.superRefine(employeeBusinessRulesRefinement);

export const employeeIdInputSchema = entityIdSchema;

export type EmployeeBaseInput = z.infer<typeof employeeBaseInputSchema>;
export type EmployeeCreateInput = z.infer<typeof employeeCreateInputSchema>;
export type EmployeeUpdateInput = z.infer<typeof employeeUpdateInputSchema>;
export type EmployeeIdInput = z.infer<typeof employeeIdInputSchema>;
