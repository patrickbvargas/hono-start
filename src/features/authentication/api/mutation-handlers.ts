import "dotenv/config";
import { getRequest } from "@tanstack/react-start/server";
import { prisma } from "@/shared/lib/prisma";
import {
	getSupabaseCredentialAccessState,
	isSupabaseAuthUserBannedError,
} from "@/shared/lib/supabase-admin";
import {
	createClearedRememberMeCookie,
	createRememberMeCookie,
	createSupabaseServerClient,
} from "@/shared/lib/supabase-server";
import { AUTHENTICATION_ERRORS } from "../constants/errors";
import { resolveAuthenticationEmail } from "../data/mutations";
import type {
	ChangePasswordInput,
	ForcedChangePasswordInput,
	LoginInput,
} from "../schemas/form";

const UNKNOWN_LOGIN_EMAIL = "desconhecido@example.invalid";

interface MutationStatus {
	success: true;
}

interface LoginMutationStatus extends MutationStatus {
	mustChangePassword: boolean;
}

class AuthenticationAccessRevokedError extends Error {
	constructor() {
		super(AUTHENTICATION_ERRORS.ACCESS_REVOKED);
		this.name = "AuthenticationAccessRevokedError";
	}
}

function createSafeFailure(errorMessage: string): never {
	throw new Error(errorMessage);
}

function includesSerializedError(error: unknown, code: string) {
	if (typeof error === "string") {
		return error.includes(code);
	}

	if (error instanceof Error) {
		const ownProperties = Object.getOwnPropertyNames(error);
		const serializedError = JSON.stringify(error, ownProperties);
		return (
			error.message.includes(code) ||
			(serializedError ? serializedError.includes(code) : false)
		);
	}

	if (!error || typeof error !== "object") {
		return false;
	}

	return JSON.stringify(error).includes(code);
}

async function authenticateWithEmail(
	input: LoginInput,
	email: string,
	hasKnownIdentity: boolean,
): Promise<LoginMutationStatus> {
	const { client, flushResponseCookies } = createSupabaseServerClient({
		rememberMe: input.rememberMe,
	});
	const { data, error } = await client.auth.signInWithPassword({
		email,
		password: input.password,
	});

	if (error || !data.user?.id) {
		if (error && hasKnownIdentity && isSupabaseAuthUserBannedError(error)) {
			throw new AuthenticationAccessRevokedError();
		}

		createSafeFailure(AUTHENTICATION_ERRORS.INVALID_CREDENTIALS);
	}

	const employee = await prisma.employee.findFirst({
		where: {
			email,
			authUserId: data.user.id,
			deletedAt: null,
			isActive: true,
		},
		select: {
			id: true,
			mustChangePassword: true,
		},
	});

	if (!employee) {
		await client.auth.signOut({
			scope: "local",
		});
		flushResponseCookies([createClearedRememberMeCookie()]);
		createSafeFailure(AUTHENTICATION_ERRORS.INVALID_CREDENTIALS);
	}

	flushResponseCookies([createRememberMeCookie(input.rememberMe)]);

	return {
		success: true,
		mustChangePassword: employee.mustChangePassword,
	};
}

export async function loginMutationHandler({
	data,
}: {
	data: LoginInput;
}): Promise<LoginMutationStatus> {
	try {
		const resolvedIdentity = await resolveAuthenticationEmail(data.identifier);
		const email = resolvedIdentity?.email ?? UNKNOWN_LOGIN_EMAIL;

		const loginResult = await authenticateWithEmail(
			data,
			email,
			Boolean(resolvedIdentity),
		);

		return loginResult;
	} catch (error) {
		console.error("[authentication:login]", error);

		if (error instanceof AuthenticationAccessRevokedError) {
			createSafeFailure(AUTHENTICATION_ERRORS.ACCESS_REVOKED);
		}

		createSafeFailure(AUTHENTICATION_ERRORS.INVALID_CREDENTIALS);
	}
}

export async function logoutMutationHandler(): Promise<MutationStatus> {
	try {
		const { client, flushResponseCookies } = createSupabaseServerClient();
		const { error } = await client.auth.signOut({
			scope: "local",
		});

		if (error) {
			throw error;
		}

		flushResponseCookies([createClearedRememberMeCookie()]);

		return { success: true };
	} catch (error) {
		console.error("[authentication:logout]", error);
		createSafeFailure(AUTHENTICATION_ERRORS.LOGOUT_FAILED);
	}
}

export async function changePasswordMutationHandler({
	data,
}: {
	data: ChangePasswordInput;
}): Promise<MutationStatus> {
	try {
		const { client, flushResponseCookies } = createSupabaseServerClient();
		const { error } = await client.auth.updateUser({
			current_password: data.currentPassword,
			password: data.newPassword,
		});

		if (error) {
			throw error;
		}

		if (data.revokeOtherSessions) {
			const { error: revokeError } = await client.auth.signOut({
				scope: "others",
			});

			if (revokeError) {
				throw revokeError;
			}
		}

		flushResponseCookies();
		return { success: true };
	} catch (error) {
		console.error("[authentication:change-password]", error);

		if (
			includesSerializedError(error, "current password") ||
			includesSerializedError(error, "Current password")
		) {
			createSafeFailure(AUTHENTICATION_ERRORS.CHANGE_PASSWORD_INVALID_CURRENT);
		}

		createSafeFailure(AUTHENTICATION_ERRORS.CHANGE_PASSWORD_FAILED);
	}
}

export async function forcedChangePasswordMutationHandler({
	data,
}: {
	data: ForcedChangePasswordInput;
}): Promise<MutationStatus> {
	try {
		const { client, flushResponseCookies } = createSupabaseServerClient();
		const {
			data: { user },
			error: userError,
		} = await client.auth.getUser();

		if (userError || !user?.id) {
			createSafeFailure(AUTHENTICATION_ERRORS.CHANGE_PASSWORD_FAILED);
		}

		const employee = await prisma.employee.findFirst({
			where: {
				authUserId: user.id,
			},
			select: {
				id: true,
				mustChangePassword: true,
			},
		});

		if (!employee?.mustChangePassword) {
			createSafeFailure(AUTHENTICATION_ERRORS.FORCED_CHANGE_PASSWORD_FORBIDDEN);
		}

		const { error: updateError } = await client.auth.updateUser({
			password: data.newPassword,
		});

		if (updateError) {
			throw updateError;
		}

		await prisma.$transaction(async (tx) => {
			await tx.employee.update({
				where: {
					id: employee.id,
				},
				data: {
					mustChangePassword: false,
				},
			});

			if (data.revokeOtherSessions) {
				const { error: revokeError } = await client.auth.signOut({
					scope: "others",
				});

				if (revokeError) {
					throw revokeError;
				}
			}
		});

		flushResponseCookies();
		return { success: true };
	} catch (error) {
		console.error("[authentication:forced-change-password]", error);

		if (
			error instanceof Error &&
			error.message === AUTHENTICATION_ERRORS.FORCED_CHANGE_PASSWORD_FORBIDDEN
		) {
			createSafeFailure(AUTHENTICATION_ERRORS.FORCED_CHANGE_PASSWORD_FORBIDDEN);
		}

		createSafeFailure(AUTHENTICATION_ERRORS.CHANGE_PASSWORD_FAILED);
	}
}

export async function requestPasswordResetMutationHandler({
	data,
}: {
	data: {
		identifier: string;
	};
}): Promise<MutationStatus> {
	try {
		const resolvedIdentity = await resolveAuthenticationEmail(data.identifier);
		const accessState = resolvedIdentity
			? await getSupabaseCredentialAccessState(resolvedIdentity.authUserId)
			: null;
		const email =
			resolvedIdentity && accessState?.isAccessActive
				? resolvedIdentity.email
				: null;

		if (email) {
			const requestUrl = new URL(getRequest().url);
			const { client, flushResponseCookies } = createSupabaseServerClient();
			const { error } = await client.auth.resetPasswordForEmail(email, {
				redirectTo: `${requestUrl.origin}/recuperar-senha`,
			});

			if (error) {
				throw error;
			}

			flushResponseCookies();
		}

		return { success: true };
	} catch (error) {
		console.error("[authentication:request-password-reset]", error);
		createSafeFailure(AUTHENTICATION_ERRORS.RESET_REQUEST_FAILED);
	}
}

export async function resetPasswordMutationHandler({
	data,
}: {
	data: {
		code: string;
		newPassword: string;
		confirmPassword: string;
	};
}): Promise<MutationStatus> {
	try {
		const { client, flushResponseCookies } = createSupabaseServerClient();
		const { error: exchangeError } = await client.auth.exchangeCodeForSession(
			data.code,
		);

		if (exchangeError) {
			throw exchangeError;
		}

		const { error: updateError } = await client.auth.updateUser({
			password: data.newPassword,
		});

		if (updateError) {
			throw updateError;
		}

		await client.auth.signOut({
			scope: "local",
		});
		flushResponseCookies([createClearedRememberMeCookie()]);

		return { success: true };
	} catch (error) {
		console.error("[authentication:reset-password]", error);
		createSafeFailure(AUTHENTICATION_ERRORS.RESET_INVALID_TOKEN);
	}
}
