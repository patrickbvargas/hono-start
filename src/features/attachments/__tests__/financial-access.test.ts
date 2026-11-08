import { describe, expect, it } from "vitest";
import type { LoggedUserSession } from "@/shared/session";
import {
	assertAttachmentOwnerReadAccess,
	assertAttachmentOwnerUploadAccess,
} from "../api/access";
import type { assertAttachmentOwnerExists } from "../data/queries";

const session = {
	firm: { id: 1 },
	employee: { id: 7 },
	person: { id: 71 },
	employeeType: { value: "LAWYER" },
	permissions: [
		"org:attachments:read",
		"org:attachments:upload",
		"org:receipts:read_assigned",
		"org:payments:read_own",
	],
} as LoggedUserSession;
type Owner = Awaited<ReturnType<typeof assertAttachmentOwnerExists>>;
function owner(
	kind: Owner["owner"]["ownerKind"],
	assigned = true,
	firmId = 1,
	beneficiaryPersonId = 71,
): Owner {
	return {
		owner: { ownerKind: kind, ownerId: 2 },
		access: {
			id: 2,
			firmId,
			deletedAt: null,
			resource: {
				firmId,
				beneficiaryPersonId,
				isRemuneration: true,
				contract: { firmId, isAssignedToActor: assigned },
			},
		},
	};
}
describe("financial evidence authorization", () => {
	it("requires independent receipt grants and assigned title scope", () => {
		expect(() =>
			assertAttachmentOwnerReadAccess(session, owner("receipt")),
		).not.toThrow();
		expect(() =>
			assertAttachmentOwnerReadAccess(session, owner("receipt", false)),
		).toThrow();
		expect(() =>
			assertAttachmentOwnerReadAccess(
				{
					...session,
					permissions: [
						"org:attachments:read",
						"org:receivables:read_assigned",
					],
				},
				owner("receipt"),
			),
		).toThrow();
	});
	it("permits payment evidence only for own assigned remuneration", () => {
		expect(() =>
			assertAttachmentOwnerReadAccess(session, owner("payment")),
		).not.toThrow();
		expect(() =>
			assertAttachmentOwnerReadAccess(session, owner("payment", false)),
		).toThrow();
		expect(() =>
			assertAttachmentOwnerReadAccess(session, owner("payment", true, 1, 99)),
		).toThrow();
		expect(() =>
			assertAttachmentOwnerReadAccess(session, owner("payment", true, 2)),
		).toThrow();
	});
	it.each([
		"receipt",
		"payment",
		"remuneration-payable",
		"receivable",
		"payable",
	] as const)("keeps %s evidence read only in current interface", (kind) => {
		expect(() =>
			assertAttachmentOwnerUploadAccess(session, owner(kind)),
		).toThrow(/somente leitura/);
	});
});
