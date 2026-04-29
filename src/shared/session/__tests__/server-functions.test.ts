import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	getScope,
	type LoggedUserSession,
	SESSION_ADMIN_ROLE_VALUE,
	SESSION_USER_ROLE_VALUE,
} from "@/shared/session";

const { getRequiredServerLoggedUserSessionMock } = vi.hoisted(() => ({
	getRequiredServerLoggedUserSessionMock: vi.fn(),
}));

vi.mock("@/shared/session/server", () => ({
	getRequiredServerLoggedUserSession: getRequiredServerLoggedUserSessionMock,
}));

import { authMiddleware } from "../server-functions";

function createSession(
	overrides: Partial<LoggedUserSession> = {},
): LoggedUserSession {
	return {
		user: {
			id: 1,
			fullName: "Carlos Mendes",
			email: "carlos@example.com",
			...overrides.user,
		},
		employee: {
			id: 7,
			...overrides.employee,
		},
		firm: {
			id: 99,
			name: "Matriz",
			...overrides.firm,
		},
		employeeType: {
			id: 3,
			value: "LAWYER",
			label: "Advogado",
			...overrides.employeeType,
		},
		role: {
			id: 2,
			value: SESSION_ADMIN_ROLE_VALUE,
			label: "Administrador",
			...overrides.role,
		},
	};
}

function createNextResult(context: unknown) {
	return {
		"use functions must return the result of next()": true as const,
		"~types": {
			context: undefined,
			sendContext: undefined,
		},
		context,
		sendContext: undefined,
	};
}

describe("auth middleware", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("injects authenticated session before feature logic", async () => {
		const session = createSession({
			role: {
				id: 3,
				value: SESSION_USER_ROLE_VALUE,
				label: "Usuário",
			},
		});
		getRequiredServerLoggedUserSessionMock.mockResolvedValue(session);
		const next = vi.fn(async ({ context }: { context: unknown }) =>
			createNextResult(context),
		);
		const server = authMiddleware.options.server as unknown as (options: {
			data: undefined;
			context: undefined;
			method: "GET";
			serverFnMeta: unknown;
			signal: AbortSignal;
			next: typeof next;
		}) => Promise<unknown>;

		await server({
			data: undefined,
			context: undefined,
			method: "GET",
			serverFnMeta: {} as never,
			signal: new AbortController().signal,
			next,
		});

		expect(next).toHaveBeenCalledWith({
			context: {
				session,
			},
		});

		expect(getScope(session, "fee")).toEqual({
			firmId: 99,
			employeeId: 7,
		});
	});

	it("fails unauthenticated calls before feature logic runs", async () => {
		getRequiredServerLoggedUserSessionMock.mockRejectedValue(
			new Error("Sua sessão expirou. Faça login novamente."),
		);
		const next = vi.fn();
		const server = authMiddleware.options.server as unknown as (options: {
			data: undefined;
			context: undefined;
			method: "GET";
			serverFnMeta: unknown;
			signal: AbortSignal;
			next: typeof next;
		}) => Promise<unknown>;

		await expect(
			server({
				data: undefined,
				context: undefined,
				method: "GET",
				serverFnMeta: {} as never,
				signal: new AbortController().signal,
				next,
			}),
		).rejects.toThrow("Sua sessão expirou. Faça login novamente.");

		expect(next).not.toHaveBeenCalled();
	});
});
