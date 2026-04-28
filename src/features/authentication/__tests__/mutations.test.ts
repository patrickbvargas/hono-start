import { beforeEach, describe, expect, it, vi } from "vitest";
import { AUTHENTICATION_ERRORS } from "../constants/errors";

const {
	authMock,
	clearFailedLoginAttemptsMock,
	countRecentFailedLoginAttemptsMock,
	getRequestHeadersMock,
	prismaMock,
	recordFailedLoginAttemptMock,
	resolveAuthenticationEmailMock,
} = vi.hoisted(() => ({
	authMock: {
		api: {
			requestPasswordReset: vi.fn(),
			resetPassword: vi.fn(),
			signInEmail: vi.fn(),
			signOut: vi.fn(),
		},
	},
	clearFailedLoginAttemptsMock: vi.fn(),
	countRecentFailedLoginAttemptsMock: vi.fn(),
	getRequestHeadersMock: vi.fn(),
	prismaMock: {
		session: {
			update: vi.fn(),
		},
	},
	recordFailedLoginAttemptMock: vi.fn(),
	resolveAuthenticationEmailMock: vi.fn(),
}));

function createServerFnMock() {
	const builder = {
		inputValidator: () => builder,
		handler: (...handlers: Array<(args: unknown) => unknown>) => {
			const handler = handlers.at(-1);

			if (!handler) {
				throw new Error("Expected server function handler");
			}

			return async (args?: unknown) => handler(args ?? {});
		},
	};

	return builder;
}

vi.mock("@tanstack/react-start", () => ({
	createServerFn: createServerFnMock,
}));

vi.mock("@tanstack/start-client-core", () => ({
	createServerFn: createServerFnMock,
}));

vi.mock("@tanstack/react-start/server", () => ({
	getRequestHeaders: getRequestHeadersMock,
}));

vi.mock("@/shared/config/env", () => ({
	env: {
		BETTER_AUTH_URL: "http://localhost:3000",
	},
}));

vi.mock("@/shared/lib/auth", () => ({
	auth: authMock,
}));

vi.mock("@/shared/lib/prisma", () => ({
	prisma: prismaMock,
}));

vi.mock("../data/mutations", () => ({
	clearFailedLoginAttempts: clearFailedLoginAttemptsMock,
	countRecentFailedLoginAttempts: countRecentFailedLoginAttemptsMock,
	recordFailedLoginAttempt: recordFailedLoginAttemptMock,
	resolveAuthenticationEmail: resolveAuthenticationEmailMock,
}));

import {
	loginMutationHandler,
	requestPasswordResetMutationHandler,
	resetPasswordMutationHandler,
} from "../api/mutation-handlers";

const requestHeaders = new Headers({
	cookie: "session=token",
});

describe("authentication server mutations", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		getRequestHeadersMock.mockReturnValue(requestHeaders);
		countRecentFailedLoginAttemptsMock.mockResolvedValue(0);
		resolveAuthenticationEmailMock.mockResolvedValue("carlos@example.com");
		authMock.api.signInEmail.mockResolvedValue({
			token: "session-token",
			user: {
				employeeId: 7,
			},
		});
		prismaMock.session.update.mockResolvedValue({});
		authMock.api.requestPasswordReset.mockResolvedValue({});
		authMock.api.resetPassword.mockResolvedValue({});
		authMock.api.signOut.mockResolvedValue({});
	});

	it("blocks login after five failed attempts within one minute", async () => {
		countRecentFailedLoginAttemptsMock.mockResolvedValue(5);

		await expect(
			loginMutationHandler({
				data: {
					identifier: "carlos@example.com",
					password: "Senha123!",
					rememberMe: false,
				},
			}),
		).rejects.toThrow(AUTHENTICATION_ERRORS.TOO_MANY_ATTEMPTS);

		expect(authMock.api.signInEmail).not.toHaveBeenCalled();
		expect(recordFailedLoginAttemptMock).not.toHaveBeenCalled();
	});

	it("persists the remember-me flag on successful login and clears lockout history", async () => {
		await expect(
			loginMutationHandler({
				data: {
					identifier: "123456",
					password: "Senha123!",
					rememberMe: true,
				},
			}),
		).resolves.toEqual({ success: true });

		expect(authMock.api.signInEmail).toHaveBeenCalledWith({
			headers: requestHeaders,
			body: {
				email: "carlos@example.com",
				password: "Senha123!",
				rememberMe: true,
			},
		});
		expect(prismaMock.session.update).toHaveBeenCalledWith({
			where: {
				token: "session-token",
			},
			data: {
				rememberMe: true,
			},
		});
		expect(clearFailedLoginAttemptsMock).toHaveBeenCalledWith("123456");
		expect(recordFailedLoginAttemptMock).not.toHaveBeenCalled();
	});

	it("records a failed attempt and returns the safe invalid-credentials message", async () => {
		authMock.api.signInEmail.mockRejectedValue(new Error("boom"));

		await expect(
			loginMutationHandler({
				data: {
					identifier: "RS-123456",
					password: "Senha123!",
					rememberMe: false,
				},
			}),
		).rejects.toThrow(AUTHENTICATION_ERRORS.INVALID_CREDENTIALS);

		expect(recordFailedLoginAttemptMock).toHaveBeenCalledWith("RS123456");
		expect(clearFailedLoginAttemptsMock).not.toHaveBeenCalled();
	});

	it("starts password reset with the public reset route and does not enumerate missing accounts", async () => {
		await expect(
			requestPasswordResetMutationHandler({
				data: {
					identifier: "carlos@example.com",
				},
			}),
		).resolves.toEqual({ success: true });

		expect(authMock.api.requestPasswordReset).toHaveBeenCalledWith({
			headers: requestHeaders,
			body: {
				email: "carlos@example.com",
				redirectTo: "http://localhost:3000/recuperar-senha",
			},
		});

		resolveAuthenticationEmailMock.mockResolvedValueOnce(null);

		await expect(
			requestPasswordResetMutationHandler({
				data: {
					identifier: "inexistente@example.com",
				},
			}),
		).resolves.toEqual({ success: true });

		expect(authMock.api.requestPasswordReset).toHaveBeenCalledTimes(1);
	});

	it("maps reset-password failures to the safe invalid-token message", async () => {
		authMock.api.resetPassword.mockRejectedValue(new Error("expired"));

		await expect(
			resetPasswordMutationHandler({
				data: {
					token: "expired-token",
					newPassword: "SenhaNova123!",
					confirmPassword: "SenhaNova123!",
				},
			}),
		).rejects.toThrow(AUTHENTICATION_ERRORS.RESET_INVALID_TOKEN);
	});
});
