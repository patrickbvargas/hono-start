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
	file: (id: number, url: string | null) =>
		[...attachmentKeys.all, "file", id, url] as const,
	list: (input: AttachmentListInput) => {
		const owner =
			input.personId ??
			input.clientId ??
			input.employeeId ??
			input.contractId ??
			input.expenseId ??
			input.feeId ??
			input.remunerationId ??
			attachmentKeys.all[0];

		return [...attachmentKeys.all, "list", owner, input] as const;
	},
};

export function getAttachmentFileQueryOptions(attachment: AttachmentSummary) {
	return queryOptions({
		queryKey: attachmentKeys.file(attachment.id, attachment.downloadUrl),
		queryFn: async ({ signal }) => {
			if (!attachment.downloadUrl) {
				throw new Error(ATTACHMENT_ERRORS.PREVIEW_UNAVAILABLE);
			}
			const response = await fetch(attachment.downloadUrl, {
				signal,
				cache: "no-store",
				credentials: "same-origin",
			});
			const mimeType = response.headers
				.get("Content-Type")
				?.split(";")[0]
				.trim();
			if (
				!response.ok ||
				!mimeType ||
				!["application/pdf", "image/jpeg", "image/png"].includes(mimeType)
			) {
				throw new Error(ATTACHMENT_ERRORS.PREVIEW_FAILED);
			}
			return response.blob();
		},
		gcTime: 0,
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		structuralSharing: false,
	});
}

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
					session,
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
