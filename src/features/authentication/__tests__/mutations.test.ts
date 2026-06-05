import { beforeEach, describe, expect, it, vi } from "vitest";
import { AUTHENTICATION_ERRORS } from "../constants/errors";

const {
	createSupabaseServerClientMock,
	employeeFindFirstMock,
	flushResponseCookiesMock,
	getRequestMock,
	resolveAuthenticationEmailMock,
	signOutMock,
	supabaseClientMock,
	transactionMock,
	updateEmployeeMock,
} = vi.hoisted(() => ({
	createSupabaseServerClientMock: vi.fn(),
	employeeFindFirstMock: vi.fn(),
	flushResponseCookiesMock: vi.fn(),
	getRequestMock: vi.fn(),
	resolveAuthenticationEmailMock: vi.fn(),
	signOutMock: vi.fn(),
	supabaseClientMock: {
		auth: {
			exchangeCodeForSession: vi.fn(),
			getUser: vi.fn(),
			resetPasswordForEmail: vi.fn(),
			signInWithPassword: vi.fn(),
			signOut: vi.fn(),
			updateUser: vi.fn(),
		},
	},
	transactionMock: vi.fn(),
	updateEmployeeMock: vi.fn(),
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
	getRequest: getRequestMock,
}));

vi.mock("@/shared/lib/prisma", () => ({
	prisma: {
		$transaction: transactionMock,
		employee: {
			findFirst: employeeFindFirstMock,
			update: updateEmployeeMock,
		},
	},
}));

vi.mock("@/shared/lib/supabase-server", () => ({
	createClearedRememberMeCookie: () => ({
		name: "hono-remember-me",
		options: {
			httpOnly: true,
			maxAge: 0,
			path: "/",
			sameSite: "lax",
			secure: false,
		},
		value: "",
	}),
	createRememberMeCookie: (rememberMe: boolean) => ({
		name: "hono-remember-me",
		options: {
			httpOnly: true,
			maxAge: rememberMe ? 604800 : 86400,
			path: "/",
			sameSite: "lax",
			secure: false,
		},
		value: rememberMe ? "1" : "0",
	}),
	createSupabaseServerClient: createSupabaseServerClientMock,
}));

vi.mock("../data/mutations", () => ({
	resolveAuthenticationEmail: resolveAuthenticationEmailMock,
}));

import {
	changePasswordMutationHandler,
	forcedChangePasswordMutationHandler,
	loginMutationHandler,
	logoutMutationHandler,
	requestPasswordResetMutationHandler,
	resetPasswordMutationHandler,
} from "../api/mutation-handlers";

describe("authentication server mutations", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		supabaseClientMock.auth.signInWithPassword.mockResolvedValue({
			data: {
				user: { id: "11111111-1111-1111-1111-111111111111" },
			},
			error: null,
		});
		supabaseClientMock.auth.updateUser.mockResolvedValue({ error: null });
		supabaseClientMock.auth.getUser.mockResolvedValue({
			data: {
				user: { id: "11111111-1111-1111-1111-111111111111" },
			},
			error: null,
		});
		supabaseClientMock.auth.resetPasswordForEmail.mockResolvedValue({
			error: null,
		});
		supabaseClientMock.auth.exchangeCodeForSession.mockResolvedValue({
			error: null,
		});
		signOutMock.mockResolvedValue({ error: null });
		supabaseClientMock.auth.signOut = signOutMock;

		createSupabaseServerClientMock.mockReturnValue({
			client: supabaseClientMock,
			flushResponseCookies: flushResponseCookiesMock,
			rememberMe: false,
		});

		resolveAuthenticationEmailMock.mockResolvedValue({
			email: "carlos@example.com",
			isAccessEnabled: true,
		});
		employeeFindFirstMock.mockResolvedValue({
			id: 7,
			isAccessEnabled: true,
			mustChangePassword: true,
		});
		updateEmployeeMock.mockResolvedValue({});
		transactionMock.mockImplementation(async (callback) =>
			callback({
				employee: {
					update: updateEmployeeMock,
				},
			}),
		);
		getRequestMock.mockReturnValue({
			url: "http://localhost:3000/recuperar-senha",
		});
	});

	it("authenticates with Supabase password flow and persists remember-me intent", async () => {
		await expect(
			loginMutationHandler({
				data: {
					identifier: "123456",
					password: "Senha123!",
					rememberMe: true,
				},
			}),
		).resolves.toEqual({ success: true, mustChangePassword: true });

		expect(supabaseClientMock.auth.signInWithPassword).toHaveBeenCalledWith({
			email: "carlos@example.com",
			password: "Senha123!",
		});
		expect(flushResponseCookiesMock).toHaveBeenCalledWith([
			expect.objectContaining({
				name: "hono-remember-me",
				value: "1",
			}),
		]);
	});

	it("records a failed attempt and returns the safe invalid-credentials message", async () => {
		supabaseClientMock.auth.signInWithPassword.mockResolvedValue({
			data: {
				user: null,
			},
			error: new Error("boom"),
		});

		await expect(
			loginMutationHandler({
				data: {
					identifier: "RS-123456",
					password: "Senha123!",
					rememberMe: false,
				},
			}),
		).rejects.toThrow(AUTHENTICATION_ERRORS.INVALID_CREDENTIALS);
	});

	it("treats unavailable access as invalid credentials", async () => {
		resolveAuthenticationEmailMock.mockResolvedValueOnce(null);
		supabaseClientMock.auth.signInWithPassword.mockResolvedValueOnce({
			data: {
				user: null,
			},
			error: new Error("blocked"),
		});

		await expect(
			loginMutationHandler({
				data: {
					identifier: "carlos@example.com",
					password: "Senha123!",
					rememberMe: false,
				},
			}),
		).rejects.toThrow(AUTHENTICATION_ERRORS.INVALID_CREDENTIALS);

		expect(supabaseClientMock.auth.signInWithPassword).toHaveBeenCalledWith({
			email: "desconhecido@example.invalid",
			password: "Senha123!",
		});
	});

	it("returns a dedicated message when a valid user has revoked access", async () => {
		resolveAuthenticationEmailMock.mockResolvedValueOnce({
			email: "carlos@example.com",
			isAccessEnabled: false,
		});
		employeeFindFirstMock.mockResolvedValueOnce({
			id: 7,
			isAccessEnabled: false,
			mustChangePassword: false,
		});

		await expect(
			loginMutationHandler({
				data: {
					identifier: "carlos@example.com",
					password: "Senha123!",
					rememberMe: false,
				},
			}),
		).rejects.toThrow(AUTHENTICATION_ERRORS.ACCESS_REVOKED);

		expect(signOutMock).toHaveBeenCalledWith({
			scope: "local",
		});
		expect(flushResponseCookiesMock).toHaveBeenCalledWith([
			expect.objectContaining({
				name: "hono-remember-me",
				value: "",
			}),
		]);
	});

	it("starts password reset with Supabase recovery flow and does not enumerate missing accounts", async () => {
		await expect(
			requestPasswordResetMutationHandler({
				data: {
					identifier: "carlos@example.com",
				},
			}),
		).resolves.toEqual({ success: true });

		expect(supabaseClientMock.auth.resetPasswordForEmail).toHaveBeenCalledWith(
			"carlos@example.com",
			{
				redirectTo: "http://localhost:3000/recuperar-senha",
			},
		);

		resolveAuthenticationEmailMock.mockResolvedValueOnce(null);

		await expect(
			requestPasswordResetMutationHandler({
				data: {
					identifier: "inexistente@example.com",
				},
			}),
		).resolves.toEqual({ success: true });

		expect(supabaseClientMock.auth.resetPasswordForEmail).toHaveBeenCalledTimes(
			1,
		);
	});

	it("maps reset-password failures to the safe invalid-token message", async () => {
		supabaseClientMock.auth.exchangeCodeForSession.mockResolvedValue({
			error: new Error("expired"),
		});

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

	it("changes password for the authenticated user using Supabase updateUser", async () => {
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

		expect(supabaseClientMock.auth.updateUser).toHaveBeenCalledWith({
			current_password: "Senha123!",
			password: "SenhaNova123!",
		});
		expect(signOutMock).toHaveBeenCalledWith({
			scope: "others",
		});
	});

	it("maps invalid current-password failures to the safe pt-BR message", async () => {
		supabaseClientMock.auth.updateUser.mockResolvedValue({
			error: new Error("Current password is incorrect"),
		});

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

	it("forces a flagged authenticated user to set a new password and clears the employee flag", async () => {
		await expect(
			forcedChangePasswordMutationHandler({
				data: {
					newPassword: "SenhaNova123!",
					confirmPassword: "SenhaNova123!",
					revokeOtherSessions: true,
				},
			}),
		).resolves.toEqual({ success: true });

		expect(supabaseClientMock.auth.updateUser).toHaveBeenCalledWith({
			password: "SenhaNova123!",
		});
		expect(updateEmployeeMock).toHaveBeenCalledWith({
			where: {
				id: 7,
			},
			data: {
				mustChangePassword: false,
			},
		});
		expect(signOutMock).toHaveBeenCalledWith({
			scope: "others",
		});
	});

	it("rejects forced password change when the employee is not flagged", async () => {
		employeeFindFirstMock.mockResolvedValueOnce({
			id: 7,
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

	it("logs out using Supabase signOut and clears the remember-me cookie", async () => {
		await expect(logoutMutationHandler()).resolves.toEqual({ success: true });

		expect(signOutMock).toHaveBeenCalledWith({
			scope: "local",
		});
		expect(flushResponseCookiesMock).toHaveBeenCalledWith([
			expect.objectContaining({
				name: "hono-remember-me",
				value: "",
			}),
		]);
	});
});
