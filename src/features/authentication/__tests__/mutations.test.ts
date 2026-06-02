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
			changePassword: vi.fn(),
			getSession: vi.fn(),
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
		$transaction: vi.fn(),
		account: {
			updateMany: vi.fn(),
		},
		session: {
			deleteMany: vi.fn(),
			update: vi.fn(),
		},
		user: {
			findUnique: vi.fn(),
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
	changePasswordMutationHandler,
	forcedChangePasswordMutationHandler,
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
		authMock.api.changePassword.mockResolvedValue({});
		authMock.api.getSession.mockResolvedValue({
			session: {
				id: "session-id",
			},
			user: {
				id: "auth-user-1",
			},
		});
		prismaMock.session.update.mockResolvedValue({});
		prismaMock.session.deleteMany.mockResolvedValue({});
		prismaMock.user.findUnique.mockResolvedValue({
			mustChangePassword: true,
		});
		prismaMock.user.update.mockResolvedValue({});
		prismaMock.account.updateMany.mockResolvedValue({});
		prismaMock.$transaction.mockImplementation(async (callback) =>
			callback(prismaMock),
		);
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

	it("treats revoked or unavailable access as invalid credentials", async () => {
		resolveAuthenticationEmailMock.mockResolvedValueOnce(null);
		authMock.api.signInEmail.mockRejectedValueOnce(new Error("blocked"));

		await expect(
			loginMutationHandler({
				data: {
					identifier: "carlos@example.com",
					password: "Senha123!",
					rememberMe: false,
				},
			}),
		).rejects.toThrow(AUTHENTICATION_ERRORS.INVALID_CREDENTIALS);

		expect(authMock.api.signInEmail).toHaveBeenCalledWith({
			headers: requestHeaders,
			body: {
				email: "desconhecido@example.invalid",
				password: "Senha123!",
				rememberMe: false,
			},
		});
		expect(recordFailedLoginAttemptMock).toHaveBeenCalledWith(
			"carlos@example.com",
		);
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
					code: "expired-code",
					newPassword: "SenhaNova123!",
					confirmPassword: "SenhaNova123!",
				},
			}),
		).rejects.toThrow(AUTHENTICATION_ERRORS.RESET_INVALID_TOKEN);
	});

	it("changes password for the authenticated user and preserves revoke-other-sessions choice", async () => {
		await expect(
			changePasswordMutationHandler({
				data: {
					currentPassword: "Senha123!",
					newPassword: "SenhaNova123!",
					confirmPassword: "SenhaNova123!",
					revokeOtherSessions: true,
				},
			}),
		).resolves.toEqual({ success: true });

		expect(authMock.api.changePassword).toHaveBeenCalledWith({
			headers: requestHeaders,
			body: {
				currentPassword: "Senha123!",
				newPassword: "SenhaNova123!",
				revokeOtherSessions: true,
			},
		});
	});

	it("maps invalid current-password failures to the safe pt-BR message", async () => {
		authMock.api.changePassword.mockRejectedValue(
			new Error("INVALID_PASSWORD"),
		);

		await expect(
			changePasswordMutationHandler({
				data: {
					currentPassword: "SenhaErrada123!",
					newPassword: "SenhaNova123!",
					confirmPassword: "SenhaNova123!",
					revokeOtherSessions: false,
				},
			}),
		).rejects.toThrow(AUTHENTICATION_ERRORS.CHANGE_PASSWORD_INVALID_CURRENT);
	});

	it("forces a flagged authenticated user to set a new password and may revoke other sessions", async () => {
		await expect(
			forcedChangePasswordMutationHandler({
				data: {
					newPassword: "SenhaNova123!",
					confirmPassword: "SenhaNova123!",
					revokeOtherSessions: true,
				},
			}),
		).resolves.toEqual({ success: true });

		expect(prismaMock.account.updateMany).toHaveBeenCalledWith({
			where: {
				userId: "auth-user-1",
				providerId: "credential",
			},
			data: {
				password: expect.any(String),
			},
		});
		expect(prismaMock.user.update).toHaveBeenCalledWith({
			where: {
				id: "auth-user-1",
			},
			data: {
				mustChangePassword: false,
			},
		});
		expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
			where: {
				userId: "auth-user-1",
				id: {
					not: "session-id",
				},
			},
		});
	});

	it("rejects forced password change when the account is not flagged", async () => {
		prismaMock.user.findUnique.mockResolvedValueOnce({
			mustChangePassword: false,
		});

		await expect(
			forcedChangePasswordMutationHandler({
				data: {
					newPassword: "SenhaNova123!",
					confirmPassword: "SenhaNova123!",
					revokeOtherSessions: false,
				},
			}),
		).rejects.toThrow(AUTHENTICATION_ERRORS.FORCED_CHANGE_PASSWORD_FORBIDDEN);
	});
});
