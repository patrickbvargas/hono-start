import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";
import { assertExpenseAmountPositive } from "../rules/write";

const expenseBaseInputSchema = z.object({
	category: z.string().trim().min(1, "Categoria é obrigatória"),
	expenseDate: z.iso.date("Data é obrigatória"),
	amount: z.number().positive("Valor deve ser maior que zero"),
	notes: z.string().trim(),
	isActive: z.boolean(),
});

const expenseBusinessRulesRefinement = (
	data: ExpenseBaseInput,
	ctx: z.RefinementCtx,
) => {
	try {
		assertExpenseAmountPositive(data.amount);
	} catch (error) {
		ctx.addIssue({
			code: "custom",
			path: ["amount"],
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

export type ExpenseBaseInput = z.output<typeof expenseBaseInputSchema>;
export type ExpenseCreateInput = z.output<typeof expenseCreateInputSchema>;
export type ExpenseUpdateInput = z.output<typeof expenseUpdateInputSchema>;
export type ExpenseIdInput = z.infer<typeof expenseIdInputSchema>;
