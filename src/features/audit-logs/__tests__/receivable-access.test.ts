import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LoggedUserSession } from "@/shared/session";

const mocks = vi.hoisted(() => ({ titles: vi.fn() }));
vi.mock("@/shared/lib/prisma", () => ({
	prisma: { clientProfile: {}, receivable: { findMany: mocks.titles } },
}));

import { getAuditAccessWhere } from "../data/access";

const session = {
	permissions: ["org:audit_logs:read", "org:receivables:read_assigned"],
	firm: { id: 3 },
	employee: { id: 7 },
	employeeType: { value: "LAWYER" },
} as LoggedUserSession;
beforeEach(() => {
	mocks.titles.mockReset().mockResolvedValue([{ id: 2 }]);
});
describe("receivable audit scope", () => {
	it("authorizes persisted entity IDs even when creation events have no owner FK", async () => {
		const where = await getAuditAccessWhere(session);
		expect(where.OR).toContainEqual({
			firmId: 3,
			entityType: "Receivable",
			entityId: { in: ["2"] },
		});
		expect(mocks.titles).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					firmId: 3,
					contractRevenueReceivable: {
						contract: expect.objectContaining({
							firmId: 3,
							assignments: expect.objectContaining({
								some: expect.objectContaining({
									employeeProfileId: 7,
									deletedAt: null,
									isActive: true,
								}),
							}),
						}),
					},
				},
			}),
		);
	});
	it("does not enumerate titles without their read grant", async () => {
		await getAuditAccessWhere({
			...session,
			permissions: ["org:audit_logs:read"],
		});
		expect(mocks.titles).not.toHaveBeenCalled();
	});
});
