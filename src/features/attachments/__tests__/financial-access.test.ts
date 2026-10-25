import { describe, expect, it } from "vitest";
import type {
	ContractAccessResource,
	LoggedUserSession,
	RemunerationAccessResource,
} from "@/shared/session";
import {
	assertAttachmentOwnerReadAccess,
	assertAttachmentOwnerSubjectReadAccess,
	assertAttachmentOwnerUploadAccess,
} from "../api/access";
import type { assertAttachmentOwnerExists } from "../data/queries";

type Owner = Awaited<ReturnType<typeof assertAttachmentOwnerExists>>;

const session: LoggedUserSession = {
	permissions: [
		"org:attachments:read",
		"org:attachments:upload",
		"org:attachments:delete",
		"org:fees:read_assigned",
		"org:remunerations:read_own",
	],
	clerk: {
		userId: "user_test",
		organizationId: "org_test",
		sessionId: "sess_test",
	},
	user: { fullName: "Advogado", email: "lawyer@example.com" },
	employee: { id: 7 },
	firm: { id: 1, name: "Matriz" },
	employeeType: { id: 1, value: "LAWYER", label: "Advogado" },
};

function feeOwner(employeeId = 7, statusValue = "COMPLETED"): Owner {
	const resource: ContractAccessResource = {
		firmId: 1,
		statusValue,
		assignments: [
			{
				employeeId,
				employeeTypeValue: "LAWYER",
				assignmentTypeValue: "RESPONSIBLE",
			},
		],
	};
	return {
		owner: { ownerKind: "fee", ownerId: 10 },
		access: {
			id: 10,
			firmId: 1,
			deletedAt: null,
			resource,
		},
	};
}

function remunerationOwner(employeeId = 7): Owner {
	const resource: RemunerationAccessResource = { firmId: 1, employeeId };
	return {
		owner: { ownerKind: "remuneration", ownerId: 20 },
		access: {
			id: 20,
			firmId: 1,
			deletedAt: null,
			resource,
		},
	};
}

describe("financial evidence authorization", () => {
	it.each(["ACTIVE", "COMPLETED", "CANCELLED"])(
		"allows scoped fee evidence without monetary updates on %s contracts",
		(status) => {
			expect(() =>
				assertAttachmentOwnerUploadAccess(session, feeOwner(7, status)),
			).not.toThrow();
		},
	);
	it("allows own remuneration evidence without remuneration update permission", () => {
		expect(() =>
			assertAttachmentOwnerUploadAccess(session, remunerationOwner()),
		).not.toThrow();
		expect(() =>
			assertAttachmentOwnerReadAccess(session, remunerationOwner()),
		).not.toThrow();
	});
	it.each([feeOwner(8), remunerationOwner(8)])(
		"denies out-of-scope metadata, upload and deletion subject access",
		(owner) => {
			expect(() => assertAttachmentOwnerReadAccess(session, owner)).toThrow();
			expect(() => assertAttachmentOwnerUploadAccess(session, owner)).toThrow();
			expect(() =>
				assertAttachmentOwnerSubjectReadAccess(session, owner),
			).toThrow();
		},
	);
	it.each([feeOwner(), remunerationOwner()])(
		"denies absent grants, missing employee binding and other firms",
		(owner) => {
			expect(() =>
				assertAttachmentOwnerReadAccess(
					{ ...session, permissions: ["org:attachments:read"] },
					owner,
				),
			).toThrow();
			expect(() =>
				assertAttachmentOwnerUploadAccess(
					{
						...session,
						permissions: ["org:fees:read_all", "org:remunerations:read_all"],
					},
					owner,
				),
			).toThrow();
			expect(() =>
				assertAttachmentOwnerReadAccess(
					{ ...session, employee: { id: null } },
					owner,
				),
			).toThrow();
			expect(() =>
				assertAttachmentOwnerReadAccess(
					{ ...session, firm: { id: 2, name: "Filial" } },
					owner,
				),
			).toThrow();
		},
	);
	it.each([feeOwner(), remunerationOwner()])(
		"retains evidence reads but rejects new upload for deleted financial ancestry",
		(owner) => {
			owner.access.deletedAt = new Date();
			expect(() => assertAttachmentOwnerUploadAccess(session, owner)).toThrow();
			expect(() =>
				assertAttachmentOwnerReadAccess(session, owner),
			).not.toThrow();
		},
	);
	it("rejects recommending-only fee access", () => {
		const owner = feeOwner();
		if ("assignments" in owner.access.resource) {
			owner.access.resource.assignments = [
				{
					employeeId: 7,
					employeeTypeValue: "LAWYER",
					assignmentTypeValue: "RECOMMENDING",
				},
			];
		}
		expect(() => assertAttachmentOwnerReadAccess(session, owner)).toThrow();
	});
});
