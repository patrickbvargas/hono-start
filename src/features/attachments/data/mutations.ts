import type { AuditLogActor } from "@/features/audit-logs/data/mutations";
import { createAuditLog } from "@/features/audit-logs/data/mutations";
import {
	createAttachmentStoragePath,
	removeAttachmentFile,
	uploadAttachmentFile,
} from "@/shared/lib/attachment-storage";
import { prisma } from "@/shared/lib/prisma";
import type { MutationReturnType } from "@/shared/types/api";
import { ATTACHMENT_ERRORS } from "../constants/errors";
import {
	type AttachmentUploadInput,
	getAttachmentOwnerContext,
} from "../schemas/form";
import { getAttachmentTypeByValue } from "./queries";

export async function createAttachment(params: {
	actor?: AuditLogActor;
	firmId: number;
	input: AttachmentUploadInput;
}): Promise<MutationReturnType> {
	const type = await getAttachmentTypeByValue(params.input.type);

	if (!type) {
		throw new Error(ATTACHMENT_ERRORS.TYPE_NOT_FOUND);
	}

	if (!type.isActive) {
		throw new Error(ATTACHMENT_ERRORS.TYPE_INACTIVE);
	}

	const owner = getAttachmentOwnerContext(params.input);
	const storagePath = createAttachmentStoragePath({
		firmId: params.firmId,
		ownerId: owner.ownerId,
		ownerKind: owner.ownerKind,
		fileName: params.input.fileName,
	});
	const buffer = Buffer.from(params.input.fileBase64, "base64");

	try {
		await uploadAttachmentFile({
			contentType: params.input.mimeType,
			data: buffer,
			path: storagePath,
		});
	} catch (error) {
		console.error("[createAttachment:upload]", error);
		throw new Error(ATTACHMENT_ERRORS.STORAGE_UPLOAD_FAILED);
	}

	try {
		await prisma.$transaction(async (tx) => {
			const attachment = await tx.attachment.create({
				data: {
					firmId: params.firmId,
					typeId: type.id,
					fileName: params.input.fileName,
					storagePath,
					mimeType: params.input.mimeType,
					fileSize: params.input.fileSize,
					isActive: params.input.isActive,
					...(owner.ownerKind === "client" ? { clientId: owner.ownerId } : {}),
					...(owner.ownerKind === "employee"
						? { employeeId: owner.ownerId }
						: {}),
					...(owner.ownerKind === "contract"
						? { contractId: owner.ownerId }
						: {}),
				},
			});

			await createAuditLog(tx, {
				firmId: params.firmId,
				actor: params.actor,
				action: "CREATE",
				entityType: "Attachment",
				entityId: attachment.id,
				entityName: attachment.fileName,
				changeData: {
					fileName: params.input.fileName,
					fileSize: params.input.fileSize,
					mimeType: params.input.mimeType,
					ownerKind: owner.ownerKind,
					ownerId: owner.ownerId,
					type: params.input.type,
				},
				description: `Uploaded attachment ${attachment.fileName}.`,
			});
		});

		return { success: true };
	} catch (error) {
		console.error("[createAttachment:persistence]", error);

		try {
			await removeAttachmentFile({ path: storagePath });
		} catch (cleanupError) {
			console.error("[createAttachment:cleanup]", cleanupError);
		}

		throw new Error(ATTACHMENT_ERRORS.PERSISTENCE_FAILED);
	}
}

export async function deleteAttachment(params: {
	actor?: AuditLogActor;
	firmId: number;
	id: number;
}): Promise<MutationReturnType> {
	const attachment = await prisma.attachment.findFirst({
		where: { id: params.id, firmId: params.firmId },
		select: {
			id: true,
			fileName: true,
			deletedAt: true,
		},
	});

	if (!attachment) {
		throw new Error(ATTACHMENT_ERRORS.DETAIL_NOT_FOUND);
	}

	await prisma.$transaction(async (tx) => {
		await tx.attachment.update({
			where: { id: params.id },
			data: { deletedAt: new Date() },
		});

		await createAuditLog(tx, {
			firmId: params.firmId,
			actor: params.actor,
			action: "DELETE",
			entityType: "Attachment",
			entityId: attachment.id,
			entityName: attachment.fileName,
			changeData: { before: attachment },
			description: `Deleted attachment ${attachment.fileName}.`,
		});
	});

	return { success: true };
}
