import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
	assertCan,
	getServerLoggedUserSession,
	getServerScope,
	isContractWritable,
} from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { ATTACHMENT_ERRORS } from "../constants/errors";
import { createAttachment, deleteAttachment } from "../data/mutations";
import {
	assertAttachmentOwnerExists,
	getAttachmentAccessById,
} from "../data/queries";
import {
	attachmentIdInputSchema,
	attachmentUploadInputSchema,
} from "../schemas/form";

function assertAttachmentOwnerUploadAccess(
	session: ReturnType<typeof getServerLoggedUserSession>,
	owner: Awaited<ReturnType<typeof assertAttachmentOwnerExists>>,
) {
	if (owner.access.deletedAt) {
		throw new Error(ATTACHMENT_ERRORS.OWNER_NOT_FOUND);
	}

	assertCan(session, "attachment.upload", owner.access.resource);

	if (owner.owner.ownerKind === "employee") {
		assertCan(session, "employee.manage", owner.access.resource);
	}

	if (owner.owner.ownerKind === "contract") {
		if (!isContractWritable(owner.access.resource)) {
			throw new Error("Contrato não permite novos anexos.");
		}

		assertCan(session, "contract.update", owner.access.resource);
	}
}

const createAttachmentFn = createServerFn({ method: "POST" })
	.inputValidator(attachmentUploadInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = getServerLoggedUserSession();
			const { firmId } = getServerScope("attachment");
			const owner = await assertAttachmentOwnerExists({ firmId, input: data });

			assertAttachmentOwnerUploadAccess(session, owner);

			return await createAttachment({
				actor: {
					id: session.employee.id,
					name: session.user.fullName,
					email: session.user.email,
				},
				firmId,
				input: data,
			});
		} catch (error) {
			console.error("[createAttachment]", error);
			if (
				error instanceof Error &&
				Object.values(ATTACHMENT_ERRORS).includes(
					error.message as (typeof ATTACHMENT_ERRORS)[keyof typeof ATTACHMENT_ERRORS],
				)
			) {
				throw error;
			}

			throw new Error(ATTACHMENT_ERRORS.UPLOAD_FAILED);
		}
	});

const deleteAttachmentFn = createServerFn({ method: "POST" })
	.inputValidator(attachmentIdInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = getServerLoggedUserSession();
			const { firmId } = getServerScope("attachment");
			const access = await getAttachmentAccessById(firmId, data.id);

			if (!access) {
				throw new Error(ATTACHMENT_ERRORS.DETAIL_NOT_FOUND);
			}

			assertCan(session, "attachment.delete", access.resource);

			return await deleteAttachment({
				actor: {
					id: session.employee.id,
					name: session.user.fullName,
					email: session.user.email,
				},
				firmId,
				id: data.id,
			});
		} catch (error) {
			console.error("[deleteAttachment]", error);
			if (
				error instanceof Error &&
				Object.values(ATTACHMENT_ERRORS).includes(
					error.message as (typeof ATTACHMENT_ERRORS)[keyof typeof ATTACHMENT_ERRORS],
				)
			) {
				throw error;
			}

			throw new Error(ATTACHMENT_ERRORS.DELETE_FAILED);
		}
	});

export const createAttachmentMutationOptions = () =>
	mutationOptions({ mutationFn: createAttachmentFn });

export const deleteAttachmentMutationOptions = () =>
	mutationOptions({ mutationFn: deleteAttachmentFn });
