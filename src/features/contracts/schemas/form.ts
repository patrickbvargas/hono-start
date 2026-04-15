import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";
import { validateContractWriteRules } from "../rules";

export const contractAssignmentInputSchema = z.object({
	id: z.number().optional(),
	employeeId: z.string().trim().min(1, "Colaborador é obrigatório"),
	assignmentType: z.string().trim().min(1, "Tipo de atribuição é obrigatório"),
	isActive: z.boolean(),
});

export const contractRevenueInputSchema = z.object({
	id: z.number().optional(),
	type: z.string().trim().min(1, "Tipo de receita é obrigatório"),
	totalValue: z.number().positive("Valor total deve ser maior que zero"),
	downPaymentValue: z
		.number()
		.min(0, "Entrada não pode ser negativa")
		.nullable(),
	paymentStartDate: z.iso.date("Data inicial é obrigatória"),
	totalInstallments: z
		.number()
		.int("Quantidade de parcelas inválida")
		.min(1, "Quantidade de parcelas deve ser maior que zero"),
	isActive: z.boolean(),
});

const contractBaseInputSchema = z.object({
	clientId: z.string().trim().min(1, "Cliente é obrigatório"),
	processNumber: z.string().trim().min(1, "Número do processo é obrigatório"),
	legalArea: z.string().trim().min(1, "Área jurídica é obrigatória"),
	status: z.string().trim().min(1, "Status do contrato é obrigatório"),
	feePercentage: z
		.number()
		.min(0, "Percentual não pode ser negativo")
		.max(1, "Percentual não pode ser maior que 100%"),
	notes: z.string().trim().optional().or(z.literal("")),
	allowStatusChange: z.boolean(),
	isActive: z.boolean(),
	assignments: z.array(contractAssignmentInputSchema),
	revenues: z.array(contractRevenueInputSchema),
});

type ContractBaseInput = z.output<typeof contractBaseInputSchema>;

const contractBusinessRulesRefinement = (
	data: ContractBaseInput,
	ctx: z.RefinementCtx,
) => {
	const issues = validateContractWriteRules(data);

	for (const issue of issues) {
		ctx.addIssue({
			code: "custom",
			path: issue.path,
			message: issue.message,
		});
	}
};

export const contractCreateInputSchema = contractBaseInputSchema.superRefine(
	contractBusinessRulesRefinement,
);

export const contractUpdateInputSchema = entityIdSchema
	.safeExtend(contractBaseInputSchema.shape)
	.superRefine(contractBusinessRulesRefinement);

export const contractIdInputSchema = entityIdSchema;

export type ContractAssignmentInput = z.infer<
	typeof contractAssignmentInputSchema
>;
export type ContractRevenueInput = z.infer<typeof contractRevenueInputSchema>;
export type ContractCreateInput = z.infer<typeof contractCreateInputSchema>;
export type ContractUpdateInput = z.infer<typeof contractUpdateInputSchema>;
export type ContractIdInput = z.infer<typeof contractIdInputSchema>;
