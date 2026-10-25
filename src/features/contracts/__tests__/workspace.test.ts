import { describe, expect, it } from "vitest";
import type { LoggedUserSession } from "@/shared/session";
import type { ContractDetail } from "../schemas/model";
import { contractWorkspaceSearchSchema } from "../schemas/workspace";
import { canReadContractReceipts } from "../utils/workflow-access";

describe("contract workspace boundaries", () => {
	it("validates tabs and keeps return list context", () => {
		expect(contractWorkspaceSearchSchema.parse({ tab: "unknown" }).tab).toBe(
			"overview",
		);
		const parsed = contractWorkspaceSearchSchema.parse({
			tab: "finance",
			returnTo: { query: "Maria", page: 2 },
		});
		expect(parsed.returnTo?.query).toBe("Maria");
		expect(parsed.returnTo?.page).toBe(2);
	});
	it.each(["RESPONSIBLE", "RECOMMENDED", "ADMIN_ASSISTANT"])(
		"allows eligible active %s receipt readers",
		(assignmentTypeValue) => {
			const session = {
				permissions: ["org:fees:read_assigned"],
				employee: { id: 7 },
			} as LoggedUserSession;
			const contract = {
				assignments: [
					{
						employeeId: 7,
						assignmentTypeValue,
						isActive: true,
						isSoftDeleted: false,
					},
				],
			} as ContractDetail;
			expect(canReadContractReceipts(session, contract)).toBe(true);
			contract.assignments[0].isActive = false;
			expect(canReadContractReceipts(session, contract)).toBe(false);
		},
	);
	it("does not grant receipt access for referral-only participation or missing grants", () => {
		const contract = {
			assignments: [
				{
					employeeId: 7,
					assignmentTypeValue: "RECOMMENDING",
					isActive: true,
					isSoftDeleted: false,
				},
			],
		} as ContractDetail;
		const session = {
			permissions: ["org:fees:read_assigned"],
			employee: { id: 7 },
		} as LoggedUserSession;
		expect(canReadContractReceipts(session, contract)).toBe(false);
		session.permissions = [];
		expect(canReadContractReceipts(session, contract)).toBe(false);
	});
});
