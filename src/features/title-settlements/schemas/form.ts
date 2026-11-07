import * as z from "zod";
import { SETTLEMENT_ERRORS } from "../constants/errors";
import { getSettlementToday } from "../utils/date";

const amountInputSchema = z
	.number({ error: "Informe um valor válido" })
	.min(0, "Valor não pode ser negativo")
	.max(999_999_999_999.99, "Valor excede o limite")
	.refine(
		(value) => /^\d+(\.\d{1,2})?$/.test(String(value)),
		"Informe no máximo duas casas decimais",
	);
const effectiveDateInputSchema = z.iso
	.date("Informe uma data válida")
	.refine((value) => value <= getSettlementToday(), SETTLEMENT_ERRORS.DATE);
export const settlementTargetInputSchema = z.object({
	direction: z.enum(["receivable", "payable"]),
	titleId: z.number().int().positive(),
});
export type SettlementTargetInput = z.infer<typeof settlementTargetInputSchema>;
export const settlementCreateInputSchema = settlementTargetInputSchema
	.extend({
		requestKey: z.uuid(),
		effectiveDate: effectiveDateInputSchema,
		actualPaymentMethod: z
			.string()
			.trim()
			.min(1, "Selecione o meio de pagamento real"),
		principalAbated: amountInputSchema.refine(
			(value) => value > 0,
			SETTLEMENT_ERRORS.BALANCE,
		),
		discount: amountInputSchema,
		interest: amountInputSchema,
		penalty: amountInputSchema,
		generatesRemuneration: z.boolean(),
	})
	.superRefine((value, ctx) => {
		if (value.discount > value.principalAbated) {
			ctx.addIssue({
				code: "custom",
				path: ["discount"],
				message: "Desconto não pode superar o principal",
			});
		}
		if (
			value.principalAbated - value.discount + value.interest + value.penalty >
			999_999_999_999.99
		) {
			ctx.addIssue({
				code: "custom",
				path: ["principalAbated"],
				message: "Caixa efetivo excede o limite",
			});
		}
		if (value.direction === "payable" && value.generatesRemuneration) {
			ctx.addIssue({
				code: "custom",
				path: ["generatesRemuneration"],
				message: "Pagamento não gera remuneração",
			});
		}
	});
export type SettlementCreateInput = z.infer<typeof settlementCreateInputSchema>;
export const settlementReverseInputSchema = settlementTargetInputSchema.extend({
	movementId: z.number().int().positive(),
	requestKey: z.uuid(),
	effectiveDate: effectiveDateInputSchema,
	reason: z
		.string()
		.trim()
		.min(1, "Informe o motivo do estorno")
		.max(5000, "Motivo deve ter no máximo 5.000 caracteres"),
});
export type SettlementReverseInput = z.infer<
	typeof settlementReverseInputSchema
>;
