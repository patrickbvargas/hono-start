import { betterAuth } from "better-auth";
import "dotenv/config";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { prisma } from "@/shared/lib/prisma";
import { env } from "../config/env";

export const AUTH_DEFAULT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;
export const AUTH_REMEMBERED_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function logPasswordResetUrl(email: string, url: string) {
	console.info(`[auth:password-reset] ${email} -> ${url}`);
}

export const auth = betterAuth({
	appName: "Hono",
	baseURL: env.BETTER_AUTH_URL,
	secret: env.BETTER_AUTH_SECRET,
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
		disableSignUp: true,
		minPasswordLength: 8,
		resetPasswordTokenExpiresIn: 60 * 60,
		revokeSessionsOnPasswordReset: true,
		sendResetPassword: async ({ user, url }) => {
			logPasswordResetUrl(user.email, url);
		},
	},
	session: {
		expiresIn: AUTH_REMEMBERED_SESSION_MAX_AGE_SECONDS,
		updateAge: AUTH_DEFAULT_SESSION_MAX_AGE_SECONDS,
		additionalFields: {
			rememberMe: {
				type: "boolean",
				required: false,
				defaultValue: false,
				input: false,
			},
		},
	},
	user: {
		additionalFields: {
			employeeId: {
				type: "number",
				required: false,
				input: false,
			},
		},
	},
	plugins: [tanstackStartCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
