vi.mock("@tanstack/react-start/server", () => ({
	getRequest: () => new Request("http://localhost"),
}));

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	auth: vi.fn(),
	memberships: vi.fn(),
	employee: vi.fn(),
	providerSession: vi.fn(),
	user: vi.fn(),
}));
vi.mock("@clerk/tanstack-react-start/server", () => ({
	auth: mocks.auth,
	clerkClient: () => ({
		organizations: { getOrganizationMembershipList: mocks.memberships },
		sessions: { getSession: mocks.providerSession },
		users: { getUser: mocks.user },
	}),
}));
vi.mock("@/shared/lib/prisma", () => ({
	prisma: { employee: { findFirst: mocks.employee } },
}));

import {
	getOptionalServerLoggedUserSession,
	getRequiredServerLoggedUserSession,
} from "../server";

describe("Clerk domain session", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mocks.providerSession.mockResolvedValue({
			status: "active",
			userId: "user_one",
		});
		mocks.user.mockResolvedValue({ banned: false, locked: false });
		mocks.auth.mockResolvedValue({
			userId: "user_one",
			orgId: "org_one",
			sessionId: "sess_one",
			isAuthenticated: true,
		});
		mocks.memberships.mockResolvedValue({
			data: [
				{
					publicUserData: { userId: "user_one" },
					role: "org:custom",
					permissions: ["org:clients:read", "org:sys_domains:manage"],
				},
			],
		});
		mocks.employee.mockResolvedValue({
			id: 7,
			fullName: "Carlos",
			email: "carlos@example.com",
			firm: { id: 1, name: "Firm" },
			type: { id: 2, value: "LAWYER", label: "Advogado" },
		});
	});
	it("uses current grants and same-organization active mapping", async () => {
		const session = await getRequiredServerLoggedUserSession();
		expect(session.permissions).toEqual(["org:clients:read"]);
		expect(session.role.value).toBe("org:custom");
		expect(mocks.employee).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					clerkUserId: "user_one",
					firm: { clerkOrganizationId: "org_one" },
					deletedAt: null,
					isActive: true,
				},
			}),
		);
	});
	it.each([
		{ userId: null },
		{ orgId: null },
		{ sessionId: null },
		{ isAuthenticated: false },
	])("denies incomplete/pending identity %j", async (invalid) => {
		mocks.auth.mockResolvedValue({
			userId: "user_one",
			orgId: "org_one",
			sessionId: "sess_one",
			isAuthenticated: true,
			...invalid,
		});
		expect(await getOptionalServerLoggedUserSession()).toBeNull();
		expect(mocks.employee).not.toHaveBeenCalled();
	});
	it("denies provider-revoked session despite a valid old JWT", async () => {
		mocks.providerSession.mockResolvedValue({
			status: "revoked",
			userId: "user_one",
		});
		expect(await getOptionalServerLoggedUserSession()).toBeNull();
	});
	it("denies removed membership without waiting for webhook", async () => {
		mocks.memberships.mockResolvedValue({ data: [] });
		expect(await getOptionalServerLoggedUserSession()).toBeNull();
		expect(mocks.employee).not.toHaveBeenCalled();
	});
	it("denies missing domain mapping", async () => {
		mocks.employee.mockResolvedValue(null);
		await expect(getRequiredServerLoggedUserSession()).rejects.toThrow(
			"Sua sessão expirou",
		);
	});
	it("fails closed on provider outage", async () => {
		mocks.memberships.mockRejectedValue(new Error("unavailable"));
		await expect(getRequiredServerLoggedUserSession()).rejects.toThrow();
		expect(mocks.employee).not.toHaveBeenCalled();
	});
	it("does not reuse grants across requests", async () => {
		expect((await getRequiredServerLoggedUserSession()).permissions).toContain(
			"org:clients:read",
		);
		mocks.memberships.mockResolvedValue({
			data: [
				{
					publicUserData: { userId: "user_one" },
					role: "org:custom",
					permissions: [],
				},
			],
		});
		expect((await getRequiredServerLoggedUserSession()).permissions).toEqual(
			[],
		);
	});
});
