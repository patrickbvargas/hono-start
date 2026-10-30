import { assertCan, isContractWritable } from "@/shared/session";
import type { getRequiredServerLoggedUserSession } from "@/shared/session/server";
import type { assertAttachmentOwnerExists } from "../data/queries";
import { assertAttachmentOwnerCanReceiveUpload } from "../rules/owner";

export function assertAttachmentOwnerReadAccess(
	session: Awaited<ReturnType<typeof getRequiredServerLoggedUserSession>>,
	owner: Awaited<ReturnType<typeof assertAttachmentOwnerExists>>,
) {
	assertCan(session, "org:attachments:read", owner.access.resource);
	assertAttachmentOwnerSubjectReadAccess(session, owner);
}

export function assertAttachmentOwnerSubjectReadAccess(
	session: Awaited<ReturnType<typeof getRequiredServerLoggedUserSession>>,
	owner: Awaited<ReturnType<typeof assertAttachmentOwnerExists>>,
) {
	if (owner.owner.ownerKind === "person") {
		assertCan(session, [
			"org:people:read",
			"org:clients:read",
			"org:suppliers:read",
			"org:employees:read",
		]);
	}
	if (owner.owner.ownerKind === "fee") {
		assertCan(
			session,
			["org:fees:read_all", "org:fees:read_assigned"],
			owner.access.resource,
		);
	}
	if (owner.owner.ownerKind === "remuneration") {
		assertCan(
			session,
			["org:remunerations:read_all", "org:remunerations:read_own"],
			owner.access.resource,
		);
	}
	if (owner.owner.ownerKind === "client") {
		assertCan(session, "org:clients:read", owner.access.resource);
	}

	if (owner.owner.ownerKind === "employee") {
		assertCan(session, "org:employees:read", owner.access.resource);
	}

	if (owner.owner.ownerKind === "contract") {
		assertCan(
			session,
			["org:contracts:read_all", "org:contracts:read_assigned"],
			owner.access.resource,
		);
	}

	if (owner.owner.ownerKind === "expense") {
		assertCan(session, "org:expenses:read", owner.access.resource);
	}
}

export function assertAttachmentOwnerUploadAccess(
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
	if (owner.owner.ownerKind === "person") {
		assertCan(session, "org:people:update");
	}
	if (
		owner.owner.ownerKind === "fee" ||
		owner.owner.ownerKind === "remuneration"
	) {
		assertAttachmentOwnerSubjectReadAccess(session, owner);
	}
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
