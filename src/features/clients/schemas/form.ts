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

export const clientCreateSchema = z
	.object(clientBaseShape)
	.superRefine(documentRefinement);

export const clientUpdateSchema = entityIdSchema
	.safeExtend(clientBaseShape)
	.superRefine(documentRefinement);

export const clientByIdSchema = entityIdSchema;

export type ClientCreate = z.infer<typeof clientCreateSchema>;
export type ClientUpdate = z.infer<typeof clientUpdateSchema>;
export type ClientById = z.infer<typeof clientByIdSchema>;
