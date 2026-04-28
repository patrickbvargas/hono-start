import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock, getRequestHeadersMock, prismaMock } = vi.hoisted(() => ({
	authMock: {
		api: {
			getSession: vi.fn(),
			signOut: vi.fn(),
		},
	},
	getRequestHeadersMock: vi.fn(),
	prismaMock: {
		employee: {
			findFirst: vi.fn(),
		},
	},
}));

vi.mock("@tanstack/react-start/server", () => ({
	getRequestHeaders: getRequestHeadersMock,
}));

vi.mock("@/shared/lib/auth", () => ({
	AUTH_DEFAULT_SESSION_MAX_AGE_SECONDS: 60 * 60 * 24,
	auth: authMock,
}));

vi.mock("@/shared/lib/prisma", () => ({
	prisma: prismaMock,
}));

import {
	getOptionalServerLoggedUserSession,
	getRequiredServerLoggedUserSession,
} from "../server";

const requestHeaders = new Headers({
	cookie: "session=token",
});

const activeEmployee = {
	id: 7,
	fullName: "Carlos Mendes",
	email: "carlos@example.com",
	firm: {
		id: 1,
		name: "Matriz",
	},
	role: {
		id: 2,
		value: "USER",
		label: "Usuário",
	},
	type: {
		id: 3,
		value: "LAWYER",
		label: "Advogado",
	},
};

describe("server session helpers", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		getRequestHeadersMock.mockReturnValue(requestHeaders);
		authMock.api.signOut.mockResolvedValue(undefined);
		authMock.api.getSession.mockResolvedValue(null);
		prismaMock.employee.findFirst.mockResolvedValue(activeEmployee);
	});

	it("returns null when there is no authenticated BetterAuth session", async () => {
		await expect(getOptionalServerLoggedUserSession()).resolves.toBeNull();
		expect(prismaMock.employee.findFirst).not.toHaveBeenCalled();
	});

	it("expires non-remembered sessions after the default 24h window", async () => {
		authMock.api.getSession.mockResolvedValue({
			session: {
				createdAt: new Date("2026-04-25T00:00:00.000Z"),
				expiresAt: new Date("2026-05-02T00:00:00.000Z"),
				rememberMe: false,
			},
			user: {
				employeeId: 7,
			},
		});

		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-04-27T12:00:00.000Z"));

		await expect(getOptionalServerLoggedUserSession()).resolves.toBeNull();

		expect(authMock.api.signOut).toHaveBeenCalledWith({
			headers: requestHeaders,
		});
		expect(prismaMock.employee.findFirst).not.toHaveBeenCalled();

		vi.useRealTimers();
	});

	it("keeps remembered sessions valid until the stored BetterAuth expiration", async () => {
		authMock.api.getSession.mockResolvedValue({
			session: {
				createdAt: new Date("2026-04-25T00:00:00.000Z"),
				expiresAt: new Date("2026-04-30T00:00:00.000Z"),
				rememberMe: true,
			},
			user: {
				employeeId: 7,
			},
		});

		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-04-27T12:00:00.000Z"));

		await expect(getOptionalServerLoggedUserSession()).resolves.toEqual({
			user: {
				id: 7,
				fullName: "Carlos Mendes",
				email: "carlos@example.com",
			},
			employee: {
				id: 7,
			},
			firm: activeEmployee.firm,
			employeeType: activeEmployee.type,
			role: activeEmployee.role,
		});

		expect(prismaMock.employee.findFirst).toHaveBeenCalledOnce();
		expect(authMock.api.signOut).not.toHaveBeenCalled();

		vi.useRealTimers();
	});

	it("signs out orphaned auth sessions that no longer map to an active employee", async () => {
		authMock.api.getSession.mockResolvedValue({
			session: {
				createdAt: new Date("2026-04-27T00:00:00.000Z"),
				expiresAt: new Date("2026-04-30T00:00:00.000Z"),
				rememberMe: true,
			},
			user: {
				employeeId: 999,
			},
		});
		prismaMock.employee.findFirst.mockResolvedValue(null);

		await expect(getOptionalServerLoggedUserSession()).resolves.toBeNull();

		expect(authMock.api.signOut).toHaveBeenCalledWith({
			headers: requestHeaders,
		});
	});

	it("throws the pt-BR unauthenticated message for required sessions", async () => {
		await expect(getRequiredServerLoggedUserSession()).rejects.toThrow(
			"Sua sessão expirou. Faça login novamente.",
		);
	});
});
