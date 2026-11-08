import { assertCan, isContractWritable } from "@/shared/session";
import type { getRequiredServerLoggedUserSession } from "@/shared/session/server";
import type { assertAttachmentOwnerExists } from "../data/queries";
import { assertAttachmentOwnerCanReceiveUpload } from "../rules/owner";

type Session = Awaited<ReturnType<typeof getRequiredServerLoggedUserSession>>;
type Owner = Awaited<ReturnType<typeof assertAttachmentOwnerExists>>;
export function assertAttachmentOwnerSubjectReadAccess(
	session: Session,
	owner: Owner,
) {
	const resource = owner.access.resource;
	switch (owner.owner.ownerKind) {
		case "person":
			assertCan(session, [
				"org:people:read",
				"org:clients:read",
				"org:suppliers:read",
				"org:employees:read",
			]);
			break;
		case "contract":
			assertCan(
				session,
				["org:contracts:read_all", "org:contracts:read_assigned"],
				resource,
			);
			break;
		case "expense":
			assertCan(session, "org:expenses:read", resource);
			break;
		case "receivable":
			assertCan(
				session,
				["org:receivables:read_all", "org:receivables:read_assigned"],
				resource,
			);
			break;
		case "receipt":
			assertCan(
				session,
				["org:receipts:read_all", "org:receipts:read_assigned"],
				resource,
			);
			break;
		case "payment":
			assertCan(
				session,
				["org:payments:read_all", "org:payments:read_own"],
				resource,
			);
			break;
		case "payable":
		case "remuneration-payable":
			assertCan(
				session,
				["org:payables:read_all", "org:payables:read_own"],
				resource,
			);
			break;
	}
}
export function assertAttachmentOwnerReadAccess(
	session: Session,
	owner: Owner,
) {
	assertCan(session, "org:attachments:read", owner.access.resource);
	assertAttachmentOwnerSubjectReadAccess(session, owner);
}
export function assertAttachmentOwnerUploadAccess(
	session: Session,
	owner: Owner,
) {
	if (!["person", "contract", "expense"].includes(owner.owner.ownerKind)) {
		throw new Error("A consulta de anexos financeiros é somente leitura.");
	}
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
