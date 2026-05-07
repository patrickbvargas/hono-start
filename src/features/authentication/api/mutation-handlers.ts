import "dotenv/config";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { hashPassword } from "better-auth/crypto";
import { env } from "@/shared/config/env";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { AUTHENTICATION_ERRORS } from "../constants/errors";
import {
	clearFailedLoginAttempts,
	countRecentFailedLoginAttempts,
	recordFailedLoginAttempt,
	resolveAuthenticationEmail,
} from "../data/mutations";
import type {
	ChangePasswordInput,
	ForcedChangePasswordInput,
	LoginInput,
} from "../schemas/form";
import { normalizeAuthenticationIdentifier } from "../utils/normalization";

const LOCKOUT_THRESHOLD = 5;
const UNKNOWN_LOGIN_EMAIL = "desconhecido@example.invalid";
const PASSWORD_RESET_REDIRECT_URL = `${env.BETTER_AUTH_URL}/recuperar-senha`;

interface MutationStatus {
	success: true;
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

async function authenticateWithEmail(input: LoginInput, email: string) {
	const result = await auth.api.signInEmail({
		headers: getRequestHeaders(),
		body: {
			email,
			password: input.password,
			rememberMe: input.rememberMe,
		},
	});

	if (!result.user.employeeId) {
		await auth.api.signOut({
			headers: getRequestHeaders(),
		});
		createSafeFailure(AUTHENTICATION_ERRORS.INVALID_CREDENTIALS);
	}

	await prisma.session.update({
		where: {
			token: result.token,
		},
		data: {
			rememberMe: input.rememberMe,
		},
	});
}

export async function loginMutationHandler({
	data,
}: {
	data: LoginInput;
}): Promise<MutationStatus> {
	const normalizedIdentifier = normalizeAuthenticationIdentifier(
		data.identifier,
	);
	const failedAttempts =
		await countRecentFailedLoginAttempts(normalizedIdentifier);

	if (failedAttempts >= LOCKOUT_THRESHOLD) {
		createSafeFailure(AUTHENTICATION_ERRORS.TOO_MANY_ATTEMPTS);
	}

	try {
		const email =
			(await resolveAuthenticationEmail(data.identifier)) ??
			UNKNOWN_LOGIN_EMAIL;

		await authenticateWithEmail(data, email);
		await clearFailedLoginAttempts(normalizedIdentifier);

		return { success: true };
	} catch (error) {
		await recordFailedLoginAttempt(normalizedIdentifier);
		console.error("[authentication:login]", error);
		createSafeFailure(AUTHENTICATION_ERRORS.INVALID_CREDENTIALS);
	}
}

export async function logoutMutationHandler(): Promise<MutationStatus> {
	try {
		await auth.api.signOut({
			headers: getRequestHeaders(),
		});

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
		await auth.api.changePassword({
			headers: getRequestHeaders(),
			body: {
				currentPassword: data.currentPassword,
				newPassword: data.newPassword,
				revokeOtherSessions: data.revokeOtherSessions,
			},
		});

		return { success: true };
	} catch (error) {
		console.error("[authentication:change-password]", error);

		if (includesSerializedError(error, "INVALID_PASSWORD")) {
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
		const headers = getRequestHeaders();
		const authSession = await auth.api.getSession({
			headers,
		});

		if (!authSession?.session?.id || !authSession.user?.id) {
			createSafeFailure(AUTHENTICATION_ERRORS.CHANGE_PASSWORD_FAILED);
		}

		const authUser = await prisma.user.findUnique({
			where: {
				id: authSession.user.id,
			},
			select: {
				mustChangePassword: true,
			},
		});

		if (!authUser?.mustChangePassword) {
			createSafeFailure(AUTHENTICATION_ERRORS.FORCED_CHANGE_PASSWORD_FORBIDDEN);
		}

		const passwordHash = await hashPassword(data.newPassword);

		await prisma.$transaction(async (tx) => {
			await tx.account.updateMany({
				where: {
					userId: authSession.user.id,
					providerId: "credential",
				},
				data: {
					password: passwordHash,
				},
			});

			await tx.user.update({
				where: {
					id: authSession.user.id,
				},
				data: {
					mustChangePassword: false,
				},
			});

			if (data.revokeOtherSessions) {
				await tx.session.deleteMany({
					where: {
						userId: authSession.user.id,
						id: {
							not: authSession.session.id,
						},
					},
				});
			}
		});

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
		const email = await resolveAuthenticationEmail(data.identifier);

		if (email) {
			await auth.api.requestPasswordReset({
				headers: getRequestHeaders(),
				body: {
					email,
					redirectTo: PASSWORD_RESET_REDIRECT_URL,
				},
			});
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
		token: string;
		newPassword: string;
		confirmPassword: string;
	};
}): Promise<MutationStatus> {
	try {
		await auth.api.resetPassword({
			headers: getRequestHeaders(),
			body: {
				token: data.token,
				newPassword: data.newPassword,
			},
		});

		return { success: true };
	} catch (error) {
		console.error("[authentication:reset-password]", error);
		createSafeFailure(AUTHENTICATION_ERRORS.RESET_INVALID_TOKEN);
	}
}
