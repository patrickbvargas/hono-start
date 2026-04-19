import { CalendarDate } from "@internationalized/date";
import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";
import {
	assertFeeAmountPositive,
	assertFeeInstallmentNumber,
} from "../rules/write";

const feeBaseInputSchema = z.object({
	contractId: z.string().trim().min(1, "Contrato é obrigatório"),
	revenueId: z.string().trim().min(1, "Receita é obrigatória"),
	paymentDate: z.instanceof(CalendarDate, {
		error: "Data de pagamento é obrigatória",
	}),
	amount: z.number().positive("Valor deve ser maior que zero"),
	installmentNumber: z
		.number()
		.int("Parcela inválida")
		.min(1, "Parcela deve ser maior que zero"),
	generatesRemuneration: z.boolean(),
	isActive: z.boolean(),
});

const feeBusinessRulesRefinement = (
	data: FeeBaseInput,
	ctx: z.RefinementCtx,
) => {
	try {
		assertFeeAmountPositive(data.amount);
	} catch (error) {
		ctx.addIssue({
			code: "custom",
			path: ["amount"],
			message: error instanceof Error ? error.message : "Valor inválido",
		});
	}

	try {
		assertFeeInstallmentNumber(data.installmentNumber);
	} catch (error) {
		ctx.addIssue({
			code: "custom",
			path: ["installmentNumber"],
			message: error instanceof Error ? error.message : "Valor inválido",
		});
	}
};

export const feeCreateInputSchema = feeBaseInputSchema.superRefine(
	feeBusinessRulesRefinement,
);

export const feeUpdateInputSchema = entityIdSchema
	.safeExtend(feeBaseInputSchema.shape)
	.superRefine(feeBusinessRulesRefinement);

export const feeIdInputSchema = entityIdSchema;

export type FeeBaseInput = z.output<typeof feeBaseInputSchema>;
export type FeeCreateInput = z.output<typeof feeCreateInputSchema>;
export type FeeUpdateInput = z.output<typeof feeUpdateInputSchema>;
export type FeeIdInput = z.infer<typeof feeIdInputSchema>;
