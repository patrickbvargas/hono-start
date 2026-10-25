import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";
import { ATTACHMENT_ERRORS } from "../constants/errors";
import {
	ATTACHMENT_MAX_BATCH_FILES,
	ATTACHMENT_OWNER_KINDS,
} from "../constants/values";
import {
	assertAttachmentFileAccepted,
	assertAttachmentTypeMatchesFile,
} from "../rules/file";
import { assertSingleAttachmentOwnerContext } from "../rules/owner";

const attachmentOwnerBaseInputSchema = z.object({
	clientId: entityIdSchema.shape.id.optional(),
	employeeId: entityIdSchema.shape.id.optional(),
	contractId: entityIdSchema.shape.id.optional(),
	expenseId: entityIdSchema.shape.id.optional(),
	feeId: entityIdSchema.shape.id.optional(),
	remunerationId: entityIdSchema.shape.id.optional(),
});

function addOwnerContextError(ctx: z.RefinementCtx) {
	ctx.addIssue({
		code: "custom",
		message: "Selecione exatamente um contexto para o anexo.",
		path: ["clientId"],
	});
}

function attachmentOwnerRefinement(
	data: AttachmentOwnerInput,
	ctx: z.RefinementCtx,
) {
	try {
		assertSingleAttachmentOwnerContext(data);
	} catch {
		addOwnerContextError(ctx);
	}
}

const attachmentFileBaseInputSchema = z.object({
	type: z.string().trim().min(1, "Tipo de anexo é obrigatório"),
	fileName: z.string().trim().min(1, "Arquivo é obrigatório"),
	mimeType: z.string().trim().min(1, "Tipo do arquivo é obrigatório"),
	fileSize: z.number().int().positive("Arquivo é obrigatório"),
	fileBase64: z.string().trim().min(1, "Arquivo é obrigatório"),
});

const attachmentFormFileSchema = z.custom<File | null>(
	(value) => value === null || value instanceof File,
	"Arquivo é obrigatório",
);

const attachmentFormBaseInputSchema = attachmentOwnerBaseInputSchema.safeExtend(
	{
		file: attachmentFormFileSchema,
	},
);

function attachmentFileRefinement(
	data: AttachmentUploadInput,
	ctx: z.RefinementCtx,
) {
	try {
		assertAttachmentFileAccepted(data);
	} catch (error) {
		if (!(error instanceof Error)) {
			throw error;
		}

		ctx.addIssue({
			code: "custom",
			path:
				error.message === ATTACHMENT_ERRORS.FILE_TOO_LARGE
					? ["fileSize"]
					: ["fileName"],
			message: error.message,
		});
	}

	try {
		assertAttachmentTypeMatchesFile(data);
	} catch (error) {
		if (!(error instanceof Error)) {
			throw error;
		}

		ctx.addIssue({
			code: "custom",
			path: ["type"],
			message: error.message,
		});
	}
}

function attachmentFormFileRefinement(
	data: AttachmentFormInput,
	ctx: z.RefinementCtx,
) {
	if (!data.file) {
		ctx.addIssue({
			code: "custom",
			path: ["file"],
			message: "Arquivo é obrigatório",
		});
		return;
	}

	try {
		assertAttachmentFileAccepted({
			fileName: data.file.name,
			mimeType: data.file.type,
			fileSize: data.file.size,
		});
	} catch (error) {
		if (!(error instanceof Error)) {
			throw error;
		}

		ctx.addIssue({
			code: "custom",
			path: ["file"],
			message: error.message,
		});
	}
}

export const attachmentOwnerInputSchema =
	attachmentOwnerBaseInputSchema.superRefine(attachmentOwnerRefinement);

export const attachmentListInputSchema = attachmentOwnerInputSchema;

export const attachmentFormInputSchema =
	attachmentFormBaseInputSchema.superRefine((data, ctx) => {
		attachmentOwnerRefinement(data, ctx);
		attachmentFormFileRefinement(data, ctx);
	});

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
export type AttachmentFormInput = z.infer<typeof attachmentFormInputSchema>;
export type AttachmentUploadInput = z.infer<typeof attachmentUploadInputSchema>;
export type AttachmentIdInput = z.infer<typeof attachmentIdInputSchema>;
export type AttachmentOwnerKind = z.infer<typeof attachmentOwnerKindSchema>;

export const attachmentBatchFormInputSchema = attachmentOwnerBaseInputSchema
	.safeExtend({
		files: z
			.array(
				z.custom<File>((value) => value instanceof File, "Arquivo inválido"),
			)
			.min(1, "Selecione pelo menos um arquivo")
			.max(
				ATTACHMENT_MAX_BATCH_FILES,
				"Selecione no máximo 25 arquivos por envio",
			),
	})
	.superRefine((data, ctx) => {
		attachmentOwnerRefinement(data, ctx);
		data.files.forEach((file) => {
			try {
				assertAttachmentFileAccepted({
					fileName: file.name,
					mimeType: file.type,
					fileSize: file.size,
				});
			} catch (error) {
				if (!(error instanceof Error)) {
					throw error;
				}
				ctx.addIssue({
					code: "custom",
					path: ["files"],
					message: `${file.name}: ${error.message}`,
				});
			}
		});
	});
export type AttachmentBatchFormInput = z.infer<
	typeof attachmentBatchFormInputSchema
>;

export const attachmentBatchUploadInputSchema = attachmentOwnerBaseInputSchema
	.safeExtend({
		files: z
			.array(
				attachmentFileBaseInputSchema.superRefine(attachmentFileRefinement),
			)
			.min(1, "Selecione pelo menos um arquivo")
			.max(
				ATTACHMENT_MAX_BATCH_FILES,
				"Selecione no máximo 25 arquivos por envio",
			),
	})
	.superRefine(attachmentOwnerRefinement);
export type AttachmentBatchUploadInput = z.infer<
	typeof attachmentBatchUploadInputSchema
>;
