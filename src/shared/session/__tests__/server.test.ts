vi.mock("@tanstack/react-start/server", () => ({
	getRequest: () => mocks.request(),
}));

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	request: vi.fn(),
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
	prisma: {
		employee: { findFirst: mocks.employee },
		firm: { findFirst: async () => ({ id: 1, name: "Matriz" }) },
	},
}));

import {
	authMiddleware,
	getOptionalServerLoggedUserSession,
	getRequiredServerLoggedUserSession,
} from "../server";

describe("Clerk domain session", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mocks.request.mockImplementation(() => new Request("http://localhost"));
		mocks.providerSession.mockResolvedValue({
			status: "active",
			userId: "user_one",
		});
		mocks.user.mockResolvedValue({
			privateMetadata: { employeeId: 7 },
			banned: false,
			locked: false,
			primaryEmailAddressId: "email_one",
			emailAddresses: [{ id: "email_one", emailAddress: "carlos@example.com" }],
		});
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
			type: { id: 2, value: "LAWYER", label: "Advogado" },
		});
	});
	it("injects verified context into protected server functions", async () => {
		const next = vi.fn(async ({ context }) => context);
		const server = authMiddleware.options.server as unknown as (options: {
			next: typeof next;
		}) => Promise<unknown>;
		await server({ next });
		expect(next).toHaveBeenCalledWith({
			context: {
				session: expect.objectContaining({
					employee: { id: 7 },
					permissions: ["org:clients:read"],
				}),
			},
		});
	});
	it("stops unauthenticated server functions before feature execution", async () => {
		mocks.auth.mockResolvedValue({ isAuthenticated: false });
		const next = vi.fn();
		const server = authMiddleware.options.server as unknown as (options: {
			next: typeof next;
		}) => Promise<unknown>;
		await expect(server({ next })).rejects.toThrow("Sua sessão expirou");
		expect(next).not.toHaveBeenCalled();
	});
	it("uses current grants and active employee mapping independently of firm organization", async () => {
		const session = await getRequiredServerLoggedUserSession();
		expect(session.permissions).toEqual(["org:clients:read"]);
		expect(session).not.toHaveProperty("role");
		expect(session.user).not.toHaveProperty("id");
		expect(session.employee).toEqual({ id: 7 });
		expect(mocks.employee).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					id: 7,
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
	it("allows an account without employee binding for general capabilities", async () => {
		mocks.user.mockResolvedValue({
			privateMetadata: {},
			banned: false,
			locked: false,
			emailAddresses: [{ emailAddress: "admin@example.com" }],
		});
		mocks.memberships.mockResolvedValue({
			data: [
				{
					publicUserData: { userId: "user_one" },
					role: "org:custom",
					permissions: [
						"org:clients:read",
						"org:remunerations:read_own",
						"org:contracts:read_assigned",
					],
				},
			],
		});
		const session = await getRequiredServerLoggedUserSession();
		expect(session.employee.id).toBeNull();
		expect(session.permissions).toEqual(["org:clients:read"]);
		expect(mocks.employee).not.toHaveBeenCalled();
	});
	it.each(["7", -1, 0, 1.5])(
		"rejects invalid metadata employeeId %s",
		async (employeeId) => {
			mocks.user.mockResolvedValue({
				privateMetadata: { employeeId },
				emailAddresses: [],
			});
			expect(await getOptionalServerLoggedUserSession()).toBeNull();
		},
	);
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
	it("reuses the verified context only within the same request", async () => {
		mocks.request.mockReturnValue(new Request("http://localhost"));
		const [first, second] = await Promise.all([
			getRequiredServerLoggedUserSession(),
			getRequiredServerLoggedUserSession(),
		]);
		expect(first).toBe(second);
		expect(mocks.auth).toHaveBeenCalledTimes(1);
		expect(mocks.memberships).toHaveBeenCalledTimes(1);
		expect(mocks.user).toHaveBeenCalledTimes(1);
		expect(mocks.employee).toHaveBeenCalledTimes(1);
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
