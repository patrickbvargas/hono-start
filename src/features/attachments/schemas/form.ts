import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";
import { ATTACHMENT_ERRORS } from "../constants/errors";
import {
	ATTACHMENT_ALLOWED_MIME_TYPE_BY_VALUE,
	ATTACHMENT_MAX_FILE_SIZE_BYTES,
	ATTACHMENT_OWNER_KINDS,
} from "../constants/values";

const attachmentOwnerBaseInputSchema = z.object({
	clientId: entityIdSchema.shape.id.optional(),
	employeeId: entityIdSchema.shape.id.optional(),
	contractId: entityIdSchema.shape.id.optional(),
});

function getAttachmentOwnerCount(data: AttachmentOwnerInput) {
	return [data.clientId, data.employeeId, data.contractId].filter(
		(value) => value !== undefined,
	).length;
}

function addOwnerContextError(ctx: z.RefinementCtx) {
	ctx.addIssue({
		code: "custom",
		message: "Selecione exatamente um contexto para o anexo.",
		path: ["clientId"],
	});
}

function getAttachmentTypeFromFile(params: {
	fileName: string;
	mimeType: string;
}) {
	const normalizedMimeType = params.mimeType.trim().toLowerCase();
	const extension = params.fileName.split(".").pop()?.trim().toLowerCase();

	for (const [type, mimeTypes] of Object.entries(
		ATTACHMENT_ALLOWED_MIME_TYPE_BY_VALUE,
	)) {
		if (mimeTypes.includes(normalizedMimeType as never)) {
			return type;
		}
	}

	if (extension === "pdf") {
		return "PDF";
	}

	if (extension === "jpg" || extension === "jpeg") {
		return "JPG";
	}

	if (extension === "png") {
		return "PNG";
	}

	return null;
}

function attachmentOwnerRefinement(
	data: AttachmentOwnerInput,
	ctx: z.RefinementCtx,
) {
	if (getAttachmentOwnerCount(data) !== 1) {
		addOwnerContextError(ctx);
	}
}

const attachmentFileBaseInputSchema = z.object({
	type: z.string().trim().min(1, "Tipo de anexo é obrigatório"),
	fileName: z.string().trim().min(1, "Arquivo é obrigatório"),
	mimeType: z.string().trim().min(1, "Tipo do arquivo é obrigatório"),
	fileSize: z.number().int().positive("Arquivo é obrigatório"),
	fileBase64: z.string().trim().min(1, "Arquivo é obrigatório"),
	isActive: z.boolean(),
});

function attachmentFileRefinement(
	data: AttachmentUploadInput,
	ctx: z.RefinementCtx,
) {
	const inferredType = getAttachmentTypeFromFile({
		fileName: data.fileName,
		mimeType: data.mimeType,
	});

	if (!inferredType) {
		ctx.addIssue({
			code: "custom",
			path: ["fileName"],
			message: ATTACHMENT_ERRORS.INVALID_FILE_TYPE,
		});
	}

	if (data.fileSize > ATTACHMENT_MAX_FILE_SIZE_BYTES) {
		ctx.addIssue({
			code: "custom",
			path: ["fileSize"],
			message: ATTACHMENT_ERRORS.FILE_TOO_LARGE,
		});
	}

	if (inferredType && data.type !== inferredType) {
		ctx.addIssue({
			code: "custom",
			path: ["type"],
			message: ATTACHMENT_ERRORS.TYPE_MISMATCH,
		});
	}
}

export const attachmentOwnerInputSchema =
	attachmentOwnerBaseInputSchema.superRefine(attachmentOwnerRefinement);

export const attachmentListInputSchema = attachmentOwnerInputSchema;

export const attachmentUploadInputSchema = attachmentOwnerBaseInputSchema
	.safeExtend(attachmentFileBaseInputSchema.shape)
	.superRefine((data, ctx) => {
		attachmentOwnerRefinement(data, ctx);
		attachmentFileRefinement(data, ctx);
	});

export const attachmentIdInputSchema = entityIdSchema;

export const attachmentOwnerKindSchema = z.enum(ATTACHMENT_OWNER_KINDS);

export type AttachmentOwnerInput = z.infer<typeof attachmentOwnerInputSchema>;
export type AttachmentListInput = z.infer<typeof attachmentListInputSchema>;
export type AttachmentUploadInput = z.infer<typeof attachmentUploadInputSchema>;
export type AttachmentIdInput = z.infer<typeof attachmentIdInputSchema>;
export type AttachmentOwnerKind = z.infer<typeof attachmentOwnerKindSchema>;

export function getAttachmentOwnerContext(input: AttachmentOwnerInput): {
	ownerId: number;
	ownerKind: AttachmentOwnerKind;
} {
	if (input.clientId) {
		return { ownerKind: "client", ownerId: input.clientId };
	}

	if (input.employeeId) {
		return { ownerKind: "employee", ownerId: input.employeeId };
	}

	return { ownerKind: "contract", ownerId: input.contractId as number };
}

export function getAttachmentOwnerInput(params: {
	ownerId: number;
	ownerKind: AttachmentOwnerKind;
}): AttachmentOwnerInput {
	switch (params.ownerKind) {
		case "client":
			return { clientId: params.ownerId };
		case "employee":
			return { employeeId: params.ownerId };
		case "contract":
			return { contractId: params.ownerId };
	}
}
