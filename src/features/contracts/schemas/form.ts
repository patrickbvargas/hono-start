import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";

const contractAssignmentInputSchema = z.object({
	id: z.number().optional(),
	employeeId: z.string().trim().min(1, "Colaborador é obrigatório"),
	assignmentType: z.string().trim().min(1, "Tipo de atribuição é obrigatório"),
	isActive: z.boolean(),
});

const contractRevenueInputSchema = z.object({
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

const contractBaseShape = {
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
};

export const contractCreateSchema = z.object(contractBaseShape);

export const contractUpdateSchema =
	entityIdSchema.safeExtend(contractBaseShape);

export const contractByIdSchema = entityIdSchema;

export type ContractAssignmentInput = z.infer<
	typeof contractAssignmentInputSchema
>;
export type ContractRevenueInput = z.infer<typeof contractRevenueInputSchema>;
export type ContractCreate = z.infer<typeof contractCreateSchema>;
export type ContractUpdate = z.infer<typeof contractUpdateSchema>;
export type ContractById = z.infer<typeof contractByIdSchema>;
