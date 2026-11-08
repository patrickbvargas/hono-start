import * as z from "zod";
import { TEXT_LIMITS } from "@/shared/constants/text-limits";
import { entityIdSchema } from "@/shared/schemas/entity";
import {
	assertContractHasActiveAssignment,
	assertContractHasActiveRevenue,
	assertContractRevenueLimit,
	assertContractUniqueActiveAssignments,
	assertContractUniqueActiveRevenueTypes,
} from "../rules/write";

export const contractAssignmentInputSchema = z.object({
	id: z.number().int().positive().optional(),
	employeeId: z.string().trim().min(1, "Colaborador é obrigatório"),
	assignmentType: z.string().trim().min(1, "Atribuição é obrigatório"),
	isActive: z.boolean(),
});

export const contractRevenueInputSchema = z.object({
	id: z.number().int().positive().optional(),
	type: z.string().trim().min(1, "Tipo de receita é obrigatório"),
	totalValue: z.number().positive("Valor total deve ser maior que zero"),
	notes: z.string().trim().max(TEXT_LIMITS.notes).optional(),
	isActive: z.boolean(),
});

const contractBaseInputSchema = z.object({
	clientId: z.string().trim().min(1, "Cliente é obrigatório"),
	processNumber: z
		.string()
		.trim()
		.min(1, "Processo é obrigatório")
		.max(
			TEXT_LIMITS.processNumber,
			"Processo deve ter no máximo 100 caracteres",
		),
	legalArea: z.string().trim().min(1, "Área é obrigatória"),
	status: z.string().trim().min(1, "Status é obrigatório"),
	feePercentage: z
		.number()
		.min(0, "Percentual não pode ser negativo")
		.max(1, "Percentual não pode ser maior que 100%"),
	notes: z
		.string()
		.trim()
		.max(TEXT_LIMITS.notes, "Observações devem ter no máximo 5.000 caracteres")
		.optional()
		.or(z.literal("")),
	allowStatusChange: z.boolean(),
	isActive: z.boolean(),
	assignments: z
		.array(contractAssignmentInputSchema)
		.min(1, "Informe pelo menos um colaborador"),
	revenues: z
		.array(contractRevenueInputSchema)
		.min(1, "Informe pelo menos uma receita"),
});

type ContractBaseInput = z.output<typeof contractBaseInputSchema>;

const contractBusinessRulesRefinement = (
	data: ContractBaseInput,
	ctx: z.RefinementCtx,
) => {
	const checks: Array<{ run: () => void; path: (string | number)[] }> = [
		{
			run: () => assertContractHasActiveAssignment(data.assignments),
			path: ["assignments"],
		},
		{
			run: () => assertContractHasActiveRevenue(data.revenues),
			path: ["revenues"],
		},
		{
			run: () => assertContractRevenueLimit(data.revenues),
			path: ["revenues"],
		},
		{
			run: () => assertContractUniqueActiveRevenueTypes(data.revenues),
			path: ["revenues"],
		},
		{
			run: () => assertContractUniqueActiveAssignments(data.assignments),
			path: ["assignments"],
		},
	];

	for (const check of checks) {
		try {
			check.run();
		} catch (error) {
			if (!(error instanceof Error)) {
				throw error;
			}

			ctx.addIssue({
				code: "custom",
				path: check.path,
				message: error.message,
			});
		}
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
