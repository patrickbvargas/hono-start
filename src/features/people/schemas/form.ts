import * as z from "zod";
import { TEXT_LIMITS } from "@/shared/constants/text-limits";
import { entityIdSchema } from "@/shared/schemas/entity";
import { assertDocumentMatchesType } from "../rules/document";
import {
	normalizePersonDocument,
	normalizePersonPhone,
} from "../utils/normalization";

const personBaseInputSchema = z.object({
	fullName: z
		.string()
		.trim()
		.min(1, "Nome é obrigatório")
		.max(TEXT_LIMITS.name),
	document: z
		.string()
		.trim()
		.max(TEXT_LIMITS.document)
		.transform(normalizePersonDocument),
	email: z.union([
		z.email("Email inválido").max(TEXT_LIMITS.email),
		z.literal(""),
	]),
	phone: z.string().max(TEXT_LIMITS.phone).transform(normalizePersonPhone),
	type: z.string(),
	isActive: z.boolean(),
	isGeneric: z.boolean(),
	isCustomer: z.boolean().optional(),
	isSupplier: z.boolean().optional(),
	isEmployee: z.boolean().optional(),
	employeeType: z.string(),
	oabNumber: z.string().trim().max(TEXT_LIMITS.oabNumber),
	remunerationPercent: z.number().min(0).max(1),
	referrerPercent: z.number().min(0).max(1),
});
function refine(
	data: z.infer<typeof personBaseInputSchema>,
	ctx: z.RefinementCtx,
) {
	if (!data.isGeneric) {
		try {
			assertDocumentMatchesType(data);
		} catch (error) {
			ctx.addIssue({
				code: "custom",
				path: ["document"],
				message: error instanceof Error ? error.message : "Documento inválido",
			});
		}
		if (!data.type) {
			ctx.addIssue({
				code: "custom",
				path: ["type"],
				message: "Tipo é obrigatório",
			});
		}
	} else if (data.document || data.type || data.isEmployee) {
		ctx.addIssue({
			code: "custom",
			path: ["document"],
			message:
				"Cadastro genérico não possui documento, tipo fiscal ou perfil de colaborador",
		});
	}
	if (data.isEmployee) {
		if (!data.isSupplier) {
			ctx.addIssue({
				code: "custom",
				path: ["isSupplier"],
				message: "Colaborador também deve ser fornecedor",
			});
		}
		if (!data.employeeType) {
			ctx.addIssue({
				code: "custom",
				path: ["employeeType"],
				message: "Função é obrigatória",
			});
		}
		if (
			data.employeeType === "LAWYER" &&
			!/^[A-Z]{2}\d{6}$/.test(data.oabNumber)
		) {
			ctx.addIssue({
				code: "custom",
				path: ["oabNumber"],
				message: "OAB inválida. Informe UF e 6 dígitos",
			});
		}
		if (data.referrerPercent > data.remunerationPercent) {
			ctx.addIssue({
				code: "custom",
				path: ["referrerPercent"],
				message: "Indicação não pode superar remuneração",
			});
		}
	}
	if (!data.isCustomer && !data.isSupplier && !data.isEmployee) {
		ctx.addIssue({
			code: "custom",
			path: ["isCustomer"],
			message: "Selecione pelo menos um papel",
		});
	}
}
export const personCreateInputSchema =
	personBaseInputSchema.superRefine(refine);
export const personUpdateInputSchema = entityIdSchema
	.safeExtend(personBaseInputSchema.shape)
	.superRefine(refine);
export const personIdInputSchema = entityIdSchema;
export type PersonCreateInput = z.infer<typeof personCreateInputSchema>;
export type PersonUpdateInput = z.infer<typeof personUpdateInputSchema>;
