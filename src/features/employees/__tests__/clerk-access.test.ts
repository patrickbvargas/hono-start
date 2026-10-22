import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LoggedUserSession } from "@/shared/session";

const mocks = vi.hoisted(() => ({ memberships: vi.fn(), roles: vi.fn() }));
vi.mock("@clerk/tanstack-react-start/server", () => ({
	clerkClient: () => ({
		organizations: { getOrganizationMembershipList: mocks.memberships },
		organizationRoles: { getOrganizationRoleList: mocks.roles },
	}),
}));
vi.mock("@/shared/lib/prisma", () => ({ prisma: {} }));

import {
	assertAssignableClerkRole,
	getAssignableClerkRoles,
} from "../data/clerk-access";

const actor: LoggedUserSession = {
	clerk: {
		userId: "user_actor",
		organizationId: "org_firm",
		sessionId: "sess_actor",
	},
	permissions: ["org:accounts:manage", "org:clients:read"],
	user: { id: 1, fullName: "Actor", email: "actor@example.com" },
	employee: { id: 1 },
	firm: { id: 1, name: "Firm" },
	employeeType: { id: 1, value: "LAWYER", label: "Advogado" },
	role: { id: 0, value: "org:custom", label: "Custom" },
	mustChangePassword: false,
};

describe("Clerk role delegation", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mocks.memberships.mockResolvedValue({
			data: [
				{
					publicUserData: { userId: "user_actor" },
					permissions: actor.permissions,
				},
			],
		});
		mocks.roles.mockResolvedValue({
			data: [
				{ key: "org:reader", permissions: [{ key: "org:clients:read" }] },
				{ key: "org:writer", permissions: [{ key: "org:clients:update" }] },
			],
		});
	});
	it("allows only grants currently held by the actor", async () => {
		expect(
			(await getAssignableClerkRoles(actor)).map((role) => role.key),
		).toEqual(["org:reader"]);
		await expect(
			assertAssignableClerkRole(actor, "org:writer"),
		).rejects.toThrow("Perfil não disponível");
	});
	it("denies old account-manager snapshots after provider removal", async () => {
		mocks.memberships.mockResolvedValue({ data: [] });
		expect(await getAssignableClerkRoles(actor)).toEqual([]);
		expect(mocks.roles).not.toHaveBeenCalled();
	});
	it("cannot grant authority based on the local role name", async () => {
		expect(
			await getAssignableClerkRoles({
				...actor,
				role: { id: 0, value: "org:admin", label: "Admin" },
				permissions: [],
			}),
		).toEqual([]);
		expect(mocks.memberships).not.toHaveBeenCalled();
	});
	it("fails closed when provider role lookup fails", async () => {
		mocks.roles.mockRejectedValue(new Error("unavailable"));
		await expect(getAssignableClerkRoles(actor)).rejects.toThrow();
	});
});
