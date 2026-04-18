import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";
import {
	assertFeeAmountPositive,
	assertFeeInstallmentNumber,
} from "../rules/write";

const feeBaseInputSchema = z.object({
	contractId: z.string().trim().min(1, "Contrato é obrigatório"),
	revenueId: z.string().trim().min(1, "Receita é obrigatória"),
	paymentDate: z.iso.date("Data de pagamento é obrigatória"),
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
	const assertions = [
		{
			path: ["amount"],
			run: () => assertFeeAmountPositive(data.amount),
		},
		{
			path: ["installmentNumber"],
			run: () => assertFeeInstallmentNumber(data.installmentNumber),
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
