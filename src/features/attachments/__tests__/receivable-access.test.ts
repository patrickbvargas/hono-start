import { describe, expect, it } from "vitest";
import type { LoggedUserSession } from "@/shared/session";
import {
	assertAttachmentOwnerReadAccess,
	assertAttachmentOwnerUploadAccess,
} from "../api/access";
import type { assertAttachmentOwnerExists } from "../data/queries";
import { attachmentOwnerInputSchema } from "../schemas/form";
import {
	getAttachmentOwnerContext,
	getAttachmentOwnerInput,
} from "../utils/owner";

const session = {
	permissions: [
		"org:attachments:read",
		"org:attachments:upload",
		"org:receivables:read_assigned",
	],
	employee: { id: 7 },
	employeeType: { value: "LAWYER" },
	firm: { id: 1 },
} as LoggedUserSession;
function owner(
	assigned = true,
	firmId = 1,
): Awaited<ReturnType<typeof assertAttachmentOwnerExists>> {
	return {
		owner: { ownerKind: "receivable", ownerId: 2 },
		access: {
			id: 2,
			firmId,
			deletedAt: null,
			resource: { firmId, contract: { firmId, isAssignedToActor: assigned } },
		},
	};
}
describe("receivable attachment consultation", () => {
	it("round trips the exclusive owner", () => {
		expect(getAttachmentOwnerContext({ receivableId: 2 })).toEqual({
			ownerKind: "receivable",
			ownerId: 2,
		});
		expect(
			getAttachmentOwnerInput({ ownerKind: "receivable", ownerId: 2 }),
		).toEqual({ receivableId: 2 });
		expect(
			attachmentOwnerInputSchema.safeParse({ receivableId: 2, expenseId: 3 })
				.success,
		).toBe(false);
	});
	it("permits assigned metadata and bytes while denying foreign or unassigned owners", () => {
		expect(() =>
			assertAttachmentOwnerReadAccess(session, owner()),
		).not.toThrow();
		expect(() =>
			assertAttachmentOwnerReadAccess(session, owner(false)),
		).toThrow();
		expect(() =>
			assertAttachmentOwnerReadAccess(session, owner(true, 2)),
		).toThrow();
	});
	it("does not enable uploads merely through consultation support", () => {
		expect(() => assertAttachmentOwnerUploadAccess(session, owner())).toThrow();
	});
});
