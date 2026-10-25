import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { hasSafeMutationErrorMessage } from "@/shared/lib/error-mapping";
import { assertCan } from "@/shared/session";
import {
	authMiddleware,
	getRequiredServerLoggedUserSession,
	getServerScope,
} from "@/shared/session/server";
import type { MutationReturnType } from "@/shared/types/api";
import { ATTACHMENT_ERRORS } from "../constants/errors";
import { createAttachments, deleteAttachment } from "../data/mutations";
import {
	assertAttachmentOwnerExists,
	getAttachmentAccessById,
} from "../data/queries";
import {
	attachmentBatchUploadInputSchema,
	attachmentIdInputSchema,
} from "../schemas/form";
import {
	assertAttachmentOwnerSubjectReadAccess,
	assertAttachmentOwnerUploadAccess,
} from "./access";

const createAttachmentFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(attachmentBatchUploadInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			const { firmId } = await getServerScope("attachment");
			const owner = await assertAttachmentOwnerExists({ firmId, input: data });

			assertAttachmentOwnerUploadAccess(session, owner);

			return await createAttachments({
				actor: {
					id: session.employee.id ?? undefined,
					name: session.user.fullName,
					email: session.user.email,
				},
				firmId,
				input: data,
			});
		} catch (error) {
			console.error("[createAttachment]", error);
			if (hasSafeMutationErrorMessage(error, ATTACHMENT_ERRORS)) {
				throw error;
			}

			throw new Error(ATTACHMENT_ERRORS.UPLOAD_FAILED);
		}
	});

const deleteAttachmentFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(attachmentIdInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			const { firmId } = await getServerScope("attachment");
			const access = await getAttachmentAccessById(firmId, data.id);

			if (!access) {
				throw new Error(ATTACHMENT_ERRORS.DETAIL_NOT_FOUND);
			}

			assertCan(session, "org:attachments:delete", access.resource);
			const owner = await assertAttachmentOwnerExists({
				firmId,
				input: access.ownerInput,
			});
			assertAttachmentOwnerSubjectReadAccess(session, owner);

			return await deleteAttachment({
				actor: {
					id: session.employee.id ?? undefined,
					name: session.user.fullName,
					email: session.user.email,
				},
				firmId,
				id: data.id,
			});
		} catch (error) {
			console.error("[deleteAttachment]", error);
			if (hasSafeMutationErrorMessage(error, ATTACHMENT_ERRORS)) {
				throw error;
			}

			throw new Error(ATTACHMENT_ERRORS.DELETE_FAILED);
		}
	});

export const createAttachmentMutationOptions = () =>
	mutationOptions({ mutationFn: createAttachmentFn });

export const deleteAttachmentMutationOptions = () =>
	mutationOptions({ mutationFn: deleteAttachmentFn });
