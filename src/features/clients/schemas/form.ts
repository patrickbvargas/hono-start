import * as z from "zod";
import { TEXT_LIMITS } from "@/shared/constants/text-limits";
import { entityIdSchema } from "@/shared/schemas/entity";
import { assertDocumentMatchesType } from "../rules/document";
import {
	normalizeClientDocument,
	normalizeClientPhone,
} from "../utils/normalization";

const clientBaseInputSchema = z.object({
	fullName: z
		.string()
		.trim()
		.min(1, "Nome é obrigatório")
		.max(TEXT_LIMITS.name, "Nome deve ter no máximo 255 caracteres"),
	document: z
		.string()
		.trim()
		.min(1, "Documento é obrigatório")
		.max(TEXT_LIMITS.document, "Documento deve ter no máximo 18 caracteres")
		.transform(normalizeClientDocument),
	email: z.union([
		z
			.email("Email inválido")
			.max(TEXT_LIMITS.email, "E-mail deve ter no máximo 254 caracteres"),
		z.literal(""),
	]),
	phone: z
		.string()
		.max(TEXT_LIMITS.phone, "Telefone deve ter no máximo 15 caracteres")
		.transform(normalizeClientPhone),
	type: z.string().trim().min(1, "Tipo é obrigatório"),
	isActive: z.boolean(),
});

const clientBusinessRulesRefinement = (
	data: ClientBaseInput,
	ctx: z.RefinementCtx,
) => {
	try {
		assertDocumentMatchesType(data);
	} catch (error) {
		ctx.addIssue({
			code: "custom",
			path: ["document"],
			message: error instanceof Error ? error.message : "Valor inválido",
		});
	}
};

export const clientCreateInputSchema = clientBaseInputSchema.superRefine(
	clientBusinessRulesRefinement,
);

export const clientUpdateInputSchema = entityIdSchema
	.safeExtend(clientBaseInputSchema.shape)
	.superRefine(clientBusinessRulesRefinement);

export const clientIdInputSchema = entityIdSchema;

export type ClientIdInput = z.infer<typeof clientIdInputSchema>;
export type ClientBaseInput = z.infer<typeof clientBaseInputSchema>;
export type ClientCreateInput = z.infer<typeof clientCreateInputSchema>;
export type ClientUpdateInput = z.infer<typeof clientUpdateInputSchema>;
