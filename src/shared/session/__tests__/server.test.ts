vi.mock("@tanstack/react-start/server", () => ({
	getRequest: () => mocks.request(),
}));

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	request: vi.fn(),
	auth: vi.fn(),
	memberships: vi.fn(),
	organization: vi.fn(),
	firm: vi.fn(),
	employee: vi.fn(),
	providerSession: vi.fn(),
	user: vi.fn(),
}));
vi.mock("@clerk/tanstack-react-start/server", () => ({
	auth: mocks.auth,
	clerkClient: () => ({
		organizations: {
			getOrganizationMembershipList: mocks.memberships,
			getOrganization: mocks.organization,
		},
		sessions: { getSession: mocks.providerSession },
		users: { getUser: mocks.user },
	}),
}));
vi.mock("@/shared/lib/prisma", () => ({
	prisma: {
		employee: { findFirst: mocks.employee },
		firm: { findUnique: mocks.firm },
	},
}));

import {
	authMiddleware,
	getOptionalServerLoggedUserSession,
	getRequiredServerLoggedUserSession,
	getServerSessionAccess,
} from "../server";

describe("Clerk domain session", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mocks.organization.mockResolvedValue({ privateMetadata: { firmId: 42 } });
		mocks.firm.mockResolvedValue({ id: 42, name: "Selected branch" });
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
			firmId: 42,
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
	it("uses current grants and an employee inside the configured organization Firm", async () => {
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
	it("denies an account without employee binding even with general grants", async () => {
		mocks.user.mockResolvedValue({ privateMetadata: {} });
		expect(await getServerSessionAccess()).toEqual({
			status: "configuration_required",
			issues: ["employee_missing"],
		});
		expect(await getOptionalServerLoggedUserSession()).toBeNull();
		await expect(getRequiredServerLoggedUserSession()).rejects.toThrow(
			"Configuração de acesso incompleta",
		);
		expect(mocks.employee).not.toHaveBeenCalled();
	});
	it("reports both missing fields without private values", async () => {
		mocks.user.mockResolvedValue({ privateMetadata: {} });
		mocks.organization.mockResolvedValue({ privateMetadata: {} });
		expect(await getServerSessionAccess()).toEqual({
			status: "configuration_required",
			issues: ["employee_missing", "firm_missing"],
		});
		expect(mocks.firm).not.toHaveBeenCalled();
		expect(mocks.employee).not.toHaveBeenCalled();
	});
	it("reports both unavailable references", async () => {
		mocks.employee.mockResolvedValue(null);
		mocks.firm.mockResolvedValue(null);
		expect(await getServerSessionAccess()).toEqual({
			status: "configuration_required",
			issues: ["firm_unavailable", "employee_unavailable"],
		});
	});
	it("reads corrected metadata on the next request", async () => {
		const validUser = await mocks.user();
		mocks.user.mockResolvedValue({ ...validUser, privateMetadata: {} });
		expect((await getServerSessionAccess()).status).toBe(
			"configuration_required",
		);
		mocks.user.mockResolvedValue(validUser);
		expect((await getServerSessionAccess()).status).toBe("ready");
	});
	it("does not reveal configuration for a revoked membership", async () => {
		mocks.memberships.mockResolvedValue({ data: [] });
		mocks.user.mockResolvedValue({ privateMetadata: {} });
		mocks.organization.mockResolvedValue({ privateMetadata: {} });
		expect(await getServerSessionAccess()).toEqual({
			status: "unauthenticated",
		});
	});
	it.each([
		undefined,
		null,
		"",
		"7",
		-1,
		0,
		1.5,
		true,
		{},
		Number.MAX_SAFE_INTEGER + 1,
	])("identifies malformed or missing employeeId %j", async (employeeId) => {
		mocks.user.mockResolvedValue({ privateMetadata: { employeeId } });
		expect(await getServerSessionAccess()).toEqual({
			status: "configuration_required",
			issues: [
				employeeId === undefined ? "employee_missing" : "employee_invalid",
			],
		});
	});
	it("reports an inactive, deleted or nonexistent Employee without issuing a session", async () => {
		mocks.employee.mockResolvedValue(null);
		expect(await getServerSessionAccess()).toEqual({
			status: "configuration_required",
			issues: ["employee_unavailable"],
		});
		expect(mocks.employee).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { id: 7, deletedAt: null, isActive: true },
			}),
		);
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
			"Configuração de acesso incompleta",
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
	it("uses exactly the Firm configured by the active Organization", async () => {
		const session = await getRequiredServerLoggedUserSession();
		expect(session.firm).toEqual({ id: 42, name: "Selected branch" });
		expect(mocks.organization).toHaveBeenCalledWith({
			organizationId: "org_one",
		});
		expect(mocks.firm).toHaveBeenCalledWith({
			where: { id: 42 },
			select: { id: true, name: true },
		});
	});
	it.each([
		undefined,
		null,
		"42",
		0,
		-1,
		1.5,
		true,
		{},
		Number.MAX_SAFE_INTEGER + 1,
	])(
		"denies invalid Organization firmId %j before reading business data",
		async (firmId) => {
			mocks.organization.mockResolvedValue({ privateMetadata: { firmId } });
			expect(await getOptionalServerLoggedUserSession()).toBeNull();
			expect(mocks.firm).not.toHaveBeenCalled();
			expect(mocks.employee).not.toHaveBeenCalled();
		},
	);
	it("does not trust public or unsafe Organization metadata", async () => {
		mocks.organization.mockResolvedValue({
			privateMetadata: {},
			publicMetadata: { firmId: 42 },
			unsafeMetadata: { firmId: 42 },
		});
		expect(await getOptionalServerLoggedUserSession()).toBeNull();
		expect(mocks.firm).not.toHaveBeenCalled();
	});
	it("denies an Organization mapped to a nonexistent Firm", async () => {
		mocks.firm.mockResolvedValue(null);
		expect(await getOptionalServerLoggedUserSession()).toBeNull();
		expect((await getServerSessionAccess()).status).toBe(
			"configuration_required",
		);
	});
	it("does not execute protected functions for an unmapped Organization", async () => {
		mocks.organization.mockResolvedValue({ privateMetadata: {} });
		const next = vi.fn();
		const server = authMiddleware.options.server as unknown as (options: {
			next: typeof next;
		}) => Promise<unknown>;
		await expect(server({ next })).rejects.toThrow(
			"Configuração de acesso incompleta",
		);
		expect(next).not.toHaveBeenCalled();
	});
	it("refreshes metadata between requests and never falls back after removal", async () => {
		expect((await getRequiredServerLoggedUserSession()).firm.id).toBe(42);
		mocks.organization.mockResolvedValue({ privateMetadata: { firmId: 93 } });
		mocks.firm.mockResolvedValue({ id: 93, name: "Other branch" });
		const changed = await getRequiredServerLoggedUserSession();
		expect(changed.firm.id).toBe(93);
		expect(changed.employee.id).toBe(7);
		mocks.organization.mockResolvedValue({ privateMetadata: {} });
		expect(await getOptionalServerLoggedUserSession()).toBeNull();
		expect(mocks.organization).toHaveBeenCalledTimes(3);
	});
	it("switches unit while preserving the global actor and current membership grants", async () => {
		mocks.memberships.mockResolvedValue({
			data: [
				{
					publicUserData: { userId: "user_one" },
					permissions: [
						"org:clients:read",
						"org:contracts:read_assigned",
						"org:remunerations:read_own",
						"org:dashboard:read_own",
					],
				},
			],
		});
		expect((await getRequiredServerLoggedUserSession()).employee.id).toBe(7);
		mocks.auth.mockResolvedValue({
			userId: "user_one",
			orgId: "org_other",
			sessionId: "sess_one",
			isAuthenticated: true,
		});
		mocks.organization.mockResolvedValue({ privateMetadata: { firmId: 93 } });
		mocks.firm.mockResolvedValue({ id: 93, name: "Other branch" });
		const session = await getRequiredServerLoggedUserSession();
		expect(session.clerk.organizationId).toBe("org_other");
		expect(session.firm.id).toBe(93);
		expect(session.employee.id).toBe(7);
		expect(session.employeeType).toMatchObject({ value: "LAWYER" });
		expect(session.permissions).toEqual([
			"org:clients:read",
			"org:contracts:read_assigned",
			"org:remunerations:read_own",
			"org:dashboard:read_own",
		]);
	});
	it("fails closed when Organization verification is unavailable", async () => {
		mocks.organization.mockRejectedValue(new Error("unavailable"));
		await expect(getRequiredServerLoggedUserSession()).rejects.toThrow();
		expect(mocks.firm).not.toHaveBeenCalled();
		expect(mocks.employee).not.toHaveBeenCalled();
	});
});
