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
import { ATTACHMENT_MAX_OWNER_FILES } from "../constants/values";
import {
	assertAttachmentTypeCanBeSelected,
	assertAttachmentTypeExists,
} from "../rules/lookups";
import {
	type AttachmentBatchUploadInput,
	type AttachmentUploadInput,
	attachmentBatchUploadInputSchema,
} from "../schemas/form";
import {
	getAttachmentOwnerContext,
	getAttachmentOwnerInput,
} from "../utils/owner";
import { getAttachmentTypeByValue } from "./queries";

export async function createAttachment(params: {
	actor?: AuditLogActor;
	firmId: number;
	input: AttachmentUploadInput;
}): Promise<MutationReturnType> {
	const owner = getAttachmentOwnerContext(params.input);
	return createAttachments({
		...params,
		input: { ...getAttachmentOwnerInput(owner), files: [params.input] },
	});
}

export async function createAttachments(params: {
	actor?: AuditLogActor;
	firmId: number;
	input: AttachmentBatchUploadInput;
}): Promise<MutationReturnType> {
	const input = attachmentBatchUploadInputSchema.parse(params.input);
	const owner = getAttachmentOwnerContext(input);
	const prepared: Array<{
		file: AttachmentBatchUploadInput["files"][number];
		typeId: number;
		storagePath: string;
	}> = [];
	// Resolve every type before staging any binary.
	for (const file of input.files) {
		const type = await getAttachmentTypeByValue(file.type);
		assertAttachmentTypeExists(type);
		assertAttachmentTypeCanBeSelected(type);
		prepared.push({
			file,
			typeId: type.id,
			storagePath: createAttachmentStoragePath({
				firmId: params.firmId,
				ownerId: owner.ownerId,
				ownerKind: owner.ownerKind,
				fileName: file.fileName,
			}),
		});
	}
	const staged: string[] = [];
	async function cleanupStagedFiles() {
		for (const path of staged) {
			try {
				await removeAttachmentFile({ path });
			} catch (error) {
				console.error("[createAttachments:cleanup]", error);
			}
		}
	}
	try {
		for (const item of prepared) {
			await uploadAttachmentFile({
				contentType: item.file.mimeType,
				data: Buffer.from(item.file.fileBase64, "base64"),
				path: item.storagePath,
			});
			staged.push(item.storagePath);
		}
	} catch (error) {
		console.error("[createAttachments:upload]", error);
		await cleanupStagedFiles();
		throw new Error(
			isAttachmentStorageCapacityError(error)
				? ATTACHMENT_ERRORS.STORAGE_CAPACITY_EXCEEDED
				: ATTACHMENT_ERRORS.STORAGE_UPLOAD_FAILED,
		);
	}
	try {
		await prisma.$transaction(
			async (tx) => {
				const lockKey = `attachments:${params.firmId}:${owner.ownerKind}:${owner.ownerId}`;
				await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`;
				const count = await tx.attachment.count({
					where: {
						firmId: params.firmId,
						deletedAt: null,
						...getAttachmentOwnerInput(owner),
					},
				});
				if (count + prepared.length > ATTACHMENT_MAX_OWNER_FILES) {
					throw new Error(ATTACHMENT_ERRORS.OWNER_LIMIT_REACHED);
				}
				for (const item of prepared) {
					const attachment = await tx.attachment.create({
						data: {
							firmId: params.firmId,
							typeId: item.typeId,
							fileName: item.file.fileName,
							storagePath: item.storagePath,
							mimeType: item.file.mimeType,
							fileSize: item.file.fileSize,
							isActive: true,
							...getAttachmentOwnerInput(owner),
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
							fileName: item.file.fileName,
							fileSize: item.file.fileSize,
							mimeType: item.file.mimeType,
							ownerKind: owner.ownerKind,
							ownerId: owner.ownerId,
							type: item.file.type,
						},
						description: `Uploaded attachment ${attachment.fileName}.`,
					});
				}
			},
			{ timeout: 30000 },
		);
		return { success: true };
	} catch (error) {
		console.error("[createAttachments:persistence]", error);
		await cleanupStagedFiles();
		if (
			error instanceof Error &&
			error.message === ATTACHMENT_ERRORS.OWNER_LIMIT_REACHED
		) {
			throw error;
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
