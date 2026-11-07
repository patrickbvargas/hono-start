import * as z from "zod";
import { TEXT_LIMITS } from "@/shared/constants/text-limits";
import { FINANCIAL_TITLE_ERRORS } from "../constants/errors";
import { TITLE_KINDS, TITLE_MAX_AMOUNT } from "../constants/values";
import { getAmountCents, getTitlePlanCents } from "../utils/payment-plan";

const profileIdInputSchema = z
	.number({ error: "ID é obrigatório" })
	.int("ID inválido")
	.positive("ID é obrigatório");
const notesInputSchema = z
	.string({ error: "Informe observações válidas" })
	.trim()
	.max(TEXT_LIMITS.notes, "Observações devem ter no máximo 5.000 caracteres");

export const titleInputSchema = z.object({
	amount: z
		.number({ error: FINANCIAL_TITLE_ERRORS.AMOUNT_INVALID })
		.positive(FINANCIAL_TITLE_ERRORS.AMOUNT_INVALID)
		.max(TITLE_MAX_AMOUNT, FINANCIAL_TITLE_ERRORS.AMOUNT_INVALID)
		.refine(
			(value) => /^\d+(\.\d{1,2})?$/.test(String(value)),
			FINANCIAL_TITLE_ERRORS.AMOUNT_INVALID,
		),
	dueDate: z.iso.date("Data de vencimento inválida"),
	analytic: z
		.string({ error: "Categoria financeira é obrigatória" })
		.trim()
		.min(1, "Categoria financeira é obrigatória"),
	expectedPaymentMethod: z
		.string({ error: "Forma de pagamento é obrigatória" })
		.trim()
		.min(1, "Forma de pagamento é obrigatória"),
	kind: z.enum(TITLE_KINDS, { error: "Selecione o tipo do título" }),
	notes: notesInputSchema.optional(),
});

export const revenueReceivableGenerationInputSchema = z.object({
	revenueId: profileIdInputSchema,
	titles: z.array(titleInputSchema).min(1, "Informe pelo menos um título"),
});

export const expensePayableGenerationInputSchema = z.object({
	expenseId: profileIdInputSchema,
	titles: z.array(titleInputSchema).min(1, "Informe pelo menos um título"),
});

export const directReceivableCreateInputSchema = titleInputSchema.extend({
	debtorId: profileIdInputSchema,
	notes: notesInputSchema.min(1, FINANCIAL_TITLE_ERRORS.NOTES_REQUIRED),
});

export const directPayableCreateInputSchema = titleInputSchema.extend({
	beneficiaryId: profileIdInputSchema,
	notes: notesInputSchema.min(1, FINANCIAL_TITLE_ERRORS.NOTES_REQUIRED),
});

export type TitleInput = z.infer<typeof titleInputSchema>;
export type RevenueReceivableGenerationInput = z.infer<
	typeof revenueReceivableGenerationInputSchema
>;
export type ExpensePayableGenerationInput = z.infer<
	typeof expensePayableGenerationInputSchema
>;
export type DirectReceivableCreateInput = z.infer<
	typeof directReceivableCreateInputSchema
>;
export type DirectPayableCreateInput = z.infer<
	typeof directPayableCreateInputSchema
>;

export const revenueTitleScheduleInputSchema = z
	.object({
		negotiatedAmount: titleInputSchema.shape.amount,
		downPaymentAmount: z
			.number({ error: FINANCIAL_TITLE_ERRORS.AMOUNT_INVALID })
			.min(0, "Entrada não pode ser negativa")
			.max(TITLE_MAX_AMOUNT, FINANCIAL_TITLE_ERRORS.AMOUNT_INVALID)
			.refine(
				(value) => /^\d+(\.\d{1,2})?$/.test(String(value)),
				FINANCIAL_TITLE_ERRORS.AMOUNT_INVALID,
			),
		downPaymentDueDate: z.string({ error: "Informe o vencimento da entrada" }),
		installmentCount: z
			.number({ error: "Informe a quantidade de parcelas" })
			.int("Quantidade de parcelas deve ser inteira")
			.positive("Informe a quantidade de parcelas"),
		firstDueDate: titleInputSchema.shape.dueDate,
		analytic: titleInputSchema.shape.analytic,
		expectedPaymentMethod: titleInputSchema.shape.expectedPaymentMethod,
	})
	.superRefine((data, ctx) => {
		if (
			data.downPaymentAmount > 0 &&
			!z.iso.date().safeParse(data.downPaymentDueDate).success
		) {
			ctx.addIssue({
				code: "custom",
				path: ["downPaymentDueDate"],
				message: "Informe o vencimento da entrada",
			});
		}
		if (
			data.downPaymentAmount >= data.negotiatedAmount ||
			data.installmentCount >
				Number(
					getAmountCents(data.negotiatedAmount) -
						getAmountCents(data.downPaymentAmount),
				)
		) {
			ctx.addIssue({
				code: "custom",
				path: ["downPaymentAmount"],
				message:
					"Entrada e quantidade devem permitir parcelas de pelo menos R$ 0,01.",
			});
		}
	});

export const revenueTitlePlanInputSchema = revenueTitleScheduleInputSchema
	.safeExtend({
		revenueId: profileIdInputSchema,
		titles: revenueReceivableGenerationInputSchema.shape.titles,
	})
	.superRefine((data, ctx) => {
		if (
			getTitlePlanCents(data.titles) !== getAmountCents(data.negotiatedAmount)
		) {
			ctx.addIssue({
				code: "custom",
				path: ["titles"],
				message: FINANCIAL_TITLE_ERRORS.CLOSURE_BALANCE_MISMATCH,
			});
		}
	});
