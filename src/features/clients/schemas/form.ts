import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";
import { CLIENT_DOCUMENT_REGEX } from "../constants/values";
import { assertDocumentMatchesType } from "../rules/document";

const clientBaseInputSchema = z.object({
	fullName: z.string().trim().min(1, "Nome é obrigatório"),
	document: z
		.string()
		.trim()
		.min(1, "Documento é obrigatório")
		.transform((value) => value.replace(CLIENT_DOCUMENT_REGEX, "")),
	email: z.union([z.email("Email inválido"), z.literal("")]),
	phone: z.string().trim(),
	type: z.string().trim().min(1, "Tipo de cliente é obrigatório"),
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
