import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";

const feeBaseShape = {
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
};

export const feeCreateInputSchema = z.object(feeBaseShape);

export const feeUpdateInputSchema = entityIdSchema.safeExtend(feeBaseShape);

export const feeIdInputSchema = entityIdSchema;

export type FeeCreateInput = z.infer<typeof feeCreateInputSchema>;
export type FeeUpdateInput = z.infer<typeof feeUpdateInputSchema>;
export type FeeIdInput = z.infer<typeof feeIdInputSchema>;
