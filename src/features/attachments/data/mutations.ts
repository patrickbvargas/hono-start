import type { AuditLogActor } from "@/features/audit-logs/data/mutations";
import { createAuditLog } from "@/features/audit-logs/data/mutations";
import {
	createAttachmentStoragePath,
	isAttachmentStorageCapacityError,
	readAttachmentFile,
	removeAttachmentFile,
	uploadAttachmentFile,
} from "@/shared/lib/attachment-storage";
import { prisma } from "@/shared/lib/prisma";
import type { MutationReturnType } from "@/shared/types/api";
import { ATTACHMENT_ERRORS } from "../constants/errors";
import {
	assertAttachmentTypeCanBeSelected,
	assertAttachmentTypeExists,
} from "../rules/lookups";
import type { AttachmentUploadInput } from "../schemas/form";
import { getAttachmentOwnerContext } from "../utils/owner";
import { getAttachmentTypeByValue } from "./queries";

export async function createAttachment(params: {
	actor?: AuditLogActor;
	firmId: number;
	input: AttachmentUploadInput;
}): Promise<MutationReturnType> {
	const type = await getAttachmentTypeByValue(params.input.type);

	assertAttachmentTypeExists(type);
	assertAttachmentTypeCanBeSelected(type);

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
		throw new Error(
			isAttachmentStorageCapacityError(error)
				? ATTACHMENT_ERRORS.STORAGE_CAPACITY_EXCEEDED
				: ATTACHMENT_ERRORS.STORAGE_UPLOAD_FAILED,
		);
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
					isActive: true,
					...(owner.ownerKind === "client" ? { clientId: owner.ownerId } : {}),
					...(owner.ownerKind === "employee"
						? { employeeId: owner.ownerId }
						: {}),
					...(owner.ownerKind === "contract"
						? { contractId: owner.ownerId }
						: {}),
					...(owner.ownerKind === "expense"
						? { expenseId: owner.ownerId }
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
			firmId: true,
			storagePath: true,
		},
	});

	if (!attachment) {
		throw new Error(ATTACHMENT_ERRORS.DETAIL_NOT_FOUND);
	}

	let backup: Buffer | undefined;
	try {
		try {
			backup = await readAttachmentFile({ path: attachment.storagePath });
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
				throw error;
			}
		}
		await removeAttachmentFile({ path: attachment.storagePath });
	} catch (error) {
		console.error("[deleteAttachment:storage]", error);
		throw new Error(ATTACHMENT_ERRORS.STORAGE_DELETE_FAILED);
	}

	try {
		await prisma.$transaction(async (tx) => {
			await tx.attachment.delete({
				where: { id: params.id },
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
	} catch (error) {
		if (backup) {
			try {
				await uploadAttachmentFile({
					path: attachment.storagePath,
					data: backup,
					contentType: "application/octet-stream",
				});
			} catch (restoreError) {
				console.error("[deleteAttachment:restore]", restoreError);
			}
		}
		console.error("[deleteAttachment:persistence]", error);
		throw new Error(ATTACHMENT_ERRORS.DELETE_FAILED);
	}

	return { success: true };
}
