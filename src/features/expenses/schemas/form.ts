import * as z from "zod";
import { TEXT_LIMITS } from "@/shared/constants/text-limits";
import { entityIdSchema } from "@/shared/schemas/entity";
import { assertExpenseAmountPositive } from "../rules/write";

const expenseBaseInputSchema = z.object({
	supplierId: z.string().trim().min(1, "Fornecedor é obrigatório"),
	negotiatedAmount: z.number().positive("Valor deve ser maior que zero"),
	notes: z
		.string()
		.trim()
		.max(TEXT_LIMITS.notes, "Observações devem ter no máximo 5.000 caracteres")
		.optional()
		.or(z.literal("")),
	isActive: z.boolean(),
});

const expenseBusinessRulesRefinement = (
	data: ExpenseBaseInput,
	ctx: z.RefinementCtx,
) => {
	try {
		assertExpenseAmountPositive(data.negotiatedAmount);
	} catch (error) {
		ctx.addIssue({
			code: "custom",
			path: ["negotiatedAmount"],
			message: error instanceof Error ? error.message : "Valor inválido",
		});
	}
};

export const expenseCreateInputSchema = expenseBaseInputSchema.superRefine(
	expenseBusinessRulesRefinement,
);

export const expenseUpdateInputSchema = entityIdSchema
	.safeExtend(expenseBaseInputSchema.shape)
	.superRefine(expenseBusinessRulesRefinement);

export const expenseIdInputSchema = entityIdSchema;

export type ExpenseBaseInput = z.infer<typeof expenseBaseInputSchema>;
export type ExpenseCreateInput = z.infer<typeof expenseCreateInputSchema>;
export type ExpenseUpdateInput = z.infer<typeof expenseUpdateInputSchema>;
export type ExpenseIdInput = z.infer<typeof expenseIdInputSchema>;
