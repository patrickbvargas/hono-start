import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";
import { getClientDocumentValidationMessage } from "../utils/validation";

const clientBaseShape = {
	fullName: z.string().trim().min(1, "Nome é obrigatório"),
	document: z.string().trim().min(1, "Documento é obrigatório"),
	email: z.email("Email inválido").optional().or(z.literal("")),
	phone: z.string().trim().optional().or(z.literal("")),
	type: z.string().min(1, "Tipo de cliente é obrigatório"),
	isActive: z.boolean(),
};

const documentRefinement = (
	data: {
		document: string;
		type: string;
	},
	ctx: z.RefinementCtx,
) => {
	const message = getClientDocumentValidationMessage(data.type, data.document);

	if (message) {
		ctx.addIssue({
			code: "custom",
			message,
			path: ["document"],
		});
	}
};

export const clientCreateInputSchema = z
	.object(clientBaseShape)
	.superRefine(documentRefinement);

export const clientUpdateInputSchema = entityIdSchema
	.safeExtend(clientBaseShape)
	.superRefine(documentRefinement);

export const clientIdInputSchema = entityIdSchema;

export type ClientCreateInput = z.infer<typeof clientCreateInputSchema>;
export type ClientUpdateInput = z.infer<typeof clientUpdateInputSchema>;
export type ClientIdInput = z.infer<typeof clientIdInputSchema>;
