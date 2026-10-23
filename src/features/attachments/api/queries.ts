import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
	authMiddleware,
	getRequiredServerLoggedUserSession,
	getServerScope,
} from "@/shared/session/server";
import type { QueryManyReturnType } from "@/shared/types/api";
import { ATTACHMENT_ERRORS } from "../constants/errors";
import {
	assertAttachmentOwnerExists,
	getAttachmentsByOwner,
} from "../data/queries";
import {
	type AttachmentListInput,
	attachmentListInputSchema,
} from "../schemas/form";
import type { AttachmentSummary } from "../schemas/model";
import { assertAttachmentOwnerReadAccess } from "./access";

export const attachmentKeys = {
	all: ["attachments"] as const,
	list: (input: AttachmentListInput) => {
		const owner =
			input.clientId ??
			input.employeeId ??
			input.contractId ??
			attachmentKeys.all[0];

		return [...attachmentKeys.all, "list", owner, input] as const;
	},
};

const getAttachmentsByOwnerFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(attachmentListInputSchema)
	.handler(
		async ({ data }): Promise<QueryManyReturnType<AttachmentSummary>> => {
			try {
				const session = await getRequiredServerLoggedUserSession();
				const { firmId } = await getServerScope("attachment");
				const owner = await assertAttachmentOwnerExists({
					firmId,
					input: data,
				});

				assertAttachmentOwnerReadAccess(session, owner);

				return await getAttachmentsByOwner({ firmId, input: data });
			} catch (error) {
				console.error("[getAttachmentsByOwner]", error);
				if (
					error instanceof Error &&
					error.message === ATTACHMENT_ERRORS.OWNER_NOT_FOUND
				) {
					throw error;
				}

				throw new Error(ATTACHMENT_ERRORS.LIST_FAILED);
			}
		},
	);

export const getAttachmentsByOwnerQueryOptions = (
	input: AttachmentListInput,
) => {
	return queryOptions({
		queryKey: attachmentKeys.list(input),
		queryFn: () => getAttachmentsByOwnerFn({ data: input }),
	});
};
