import { assertCan } from "@/shared/session";
import type { getRequiredServerLoggedUserSession } from "@/shared/session/server";
import type { assertAttachmentOwnerExists } from "../data/queries";

export function assertAttachmentOwnerReadAccess(
	session: Awaited<ReturnType<typeof getRequiredServerLoggedUserSession>>,
	owner: Awaited<ReturnType<typeof assertAttachmentOwnerExists>>,
) {
	assertCan(session, "org:attachments:read", owner.access.resource);
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
