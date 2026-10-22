import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { assertCan, isContractWritable } from "@/shared/session";
import { authMiddleware } from "@/shared/session/middleware";
import {
	getRequiredServerLoggedUserSession,
	getServerScope,
} from "@/shared/session/server";
import type { MutationReturnType } from "@/shared/types/api";
import { ATTACHMENT_ERRORS } from "../constants/errors";
import { createAttachment, deleteAttachment } from "../data/mutations";
import {
	assertAttachmentOwnerExists,
	getAttachmentAccessById,
} from "../data/queries";
import { assertAttachmentOwnerCanReceiveUpload } from "../rules/owner";
import {
	attachmentIdInputSchema,
	attachmentUploadInputSchema,
} from "../schemas/form";

function assertAttachmentOwnerUploadAccess(
	session: Awaited<ReturnType<typeof getRequiredServerLoggedUserSession>>,
	owner: Awaited<ReturnType<typeof assertAttachmentOwnerExists>>,
) {
	assertAttachmentOwnerCanReceiveUpload({
		deletedAt: owner.access.deletedAt,
		ownerKind: owner.owner.ownerKind,
		isWritableContract:
			owner.owner.ownerKind === "contract"
				? isContractWritable(owner.access.resource)
				: undefined,
	});

	assertCan(session, "org:attachments:upload", owner.access.resource);
	if (owner.owner.ownerKind === "client") {
		assertCan(session, "org:clients:update", owner.access.resource);
	}

	if (owner.owner.ownerKind === "employee") {
		assertCan(session, "org:employees:update", owner.access.resource);
	}

	if (owner.owner.ownerKind === "contract") {
		assertCan(
			session,
			["org:contracts:update_all", "org:contracts:update_assigned"],
			owner.access.resource,
		);
	}

	if (owner.owner.ownerKind === "expense") {
		assertCan(session, "org:expenses:update", owner.access.resource);
	}
}

const createAttachmentFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(attachmentUploadInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			const { firmId } = await getServerScope("attachment");
			const owner = await assertAttachmentOwnerExists({ firmId, input: data });

			assertAttachmentOwnerUploadAccess(session, owner);

			return await createAttachment({
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
			if (owner.owner.ownerKind === "contract") {
				assertCan(
					session,
					["org:contracts:read_all", "org:contracts:read_assigned"],
					owner.access.resource,
				);
			}
			if (owner.owner.ownerKind === "employee") {
				assertCan(session, "org:employees:read", owner.access.resource);
			}
			if (owner.owner.ownerKind === "client") {
				assertCan(session, "org:clients:read", owner.access.resource);
			}
			if (owner.owner.ownerKind === "expense") {
				assertCan(session, "org:expenses:read", owner.access.resource);
			}

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
