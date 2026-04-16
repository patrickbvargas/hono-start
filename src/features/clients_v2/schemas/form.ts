import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";
import { validateClientDocumentRules } from "../rules/document";

const ONLY_DIGITS_REGEX = /\D/g;

const clientBaseInputSchema = z.object({
	fullName: z.string().trim().min(1, "Nome é obrigatório"),
	document: z
		.string()
		.trim()
		.min(1, "Documento é obrigatório")
		.transform((value) => value.replace(ONLY_DIGITS_REGEX, "")),
	email: z.string().trim(),
	phone: z.string().trim(),
	type: z.string().trim().min(1, "Tipo de cliente é obrigatório"),
	isActive: z.boolean(),
});

const clientBusinessRulesRefinement = (
	data: ClientBaseInput,
	ctx: z.RefinementCtx,
) => {
	const issues = validateClientDocumentRules(data);

	for (const issue of issues) {
		ctx.addIssue({
			code: "custom",
			message: issue.message,
			path: issue.path,
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

export type ClientBaseFormInput = z.input<typeof clientBaseInputSchema>;
export type ClientCreateFormInput = z.input<typeof clientCreateInputSchema>;
export type ClientUpdateFormInput = z.input<typeof clientUpdateInputSchema>;
export type ClientBaseInput = z.output<typeof clientBaseInputSchema>;
export type ClientCreateInput = z.output<typeof clientCreateInputSchema>;
export type ClientUpdateInput = z.output<typeof clientUpdateInputSchema>;
export type ClientIdInput = z.infer<typeof clientIdInputSchema>;
