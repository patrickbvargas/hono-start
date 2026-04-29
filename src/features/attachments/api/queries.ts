import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import type { Option } from "@/shared/schemas/option";
import { assertCan, authMiddleware } from "@/shared/session";
import {
	getRequiredServerLoggedUserSession,
	getServerScope,
} from "@/shared/session/server";
import type { QueryManyReturnType } from "@/shared/types/api";
import { ATTACHMENT_ERRORS } from "../constants/errors";
import {
	assertAttachmentOwnerExists,
	getAttachmentsByOwner,
	getAttachmentTypes,
} from "../data/queries";
import {
	type AttachmentListInput,
	attachmentListInputSchema,
} from "../schemas/form";
import type { AttachmentSummary } from "../schemas/model";

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
	types: () => [...attachmentKeys.all, "types"] as const,
};

function assertAttachmentOwnerReadAccess(
	session: Awaited<ReturnType<typeof getRequiredServerLoggedUserSession>>,
	owner: Awaited<ReturnType<typeof assertAttachmentOwnerExists>>,
) {
	assertCan(session, "attachment.view", owner.access.resource);

	if (owner.owner.ownerKind === "employee") {
		assertCan(session, "employee.manage", owner.access.resource);
	}

	if (owner.owner.ownerKind === "contract") {
		assertCan(session, "contract.view", owner.access.resource);
	}
}

const getAttachmentsByOwnerFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(attachmentListInputSchema)
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

const getAttachmentTypesFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async (): Promise<QueryManyReturnType<Option>> => {
		try {
			await getRequiredServerLoggedUserSession();
			return await getAttachmentTypes();
		} catch (error) {
			console.error("[getAttachmentTypes]", error);
			throw new Error(ATTACHMENT_ERRORS.LOOKUP_GET_FAILED);
		}
	});

export const getAttachmentsByOwnerQueryOptions = (
	input: AttachmentListInput,
) => {
	return queryOptions({
		queryKey: attachmentKeys.list(input),
		queryFn: () => getAttachmentsByOwnerFn({ data: input }),
	});
};

export const getAttachmentTypesQueryOptions = () =>
	queryOptions({
		queryKey: attachmentKeys.types(),
		queryFn: getAttachmentTypesFn,
		staleTime: "static",
	});
