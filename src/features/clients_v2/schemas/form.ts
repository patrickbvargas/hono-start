import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";
import { CLIENT_DOCUMENT_REGEX } from "../constants/values";

const clientBaseInputSchema = z.object({
	fullName: z.string().trim().min(1, "Nome é obrigatório"),
	document: z
		.string()
		.trim()
		.min(1, "Documento é obrigatório")
		.transform((value) => value.replace(CLIENT_DOCUMENT_REGEX, "")),
	email: z.string().trim(),
	phone: z.string().trim(),
	type: z.string().trim().min(1, "Tipo de cliente é obrigatório"),
	isActive: z.boolean(),
});

export const clientCreateInputSchema = clientBaseInputSchema;

export const clientUpdateInputSchema = entityIdSchema.safeExtend(
	clientBaseInputSchema.shape,
);

export const clientIdInputSchema = entityIdSchema;

export type ClientIdInput = z.infer<typeof clientIdInputSchema>;
export type ClientBaseInput = z.infer<typeof clientBaseInputSchema>;
export type ClientCreateInput = z.infer<typeof clientCreateInputSchema>;
export type ClientUpdateInput = z.infer<typeof clientUpdateInputSchema>;
