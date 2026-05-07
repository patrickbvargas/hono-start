import { describe, expect, it, vi } from "vitest";

const {
	betterAuthMock,
	prismaAdapterMock,
	sendPasswordResetEmailMock,
	tanstackStartCookiesMock,
} = vi.hoisted(() => ({
	betterAuthMock: vi.fn((config) => ({
		config,
	})),
	prismaAdapterMock: vi.fn(() => "adapter"),
	sendPasswordResetEmailMock: vi.fn().mockResolvedValue(undefined),
	tanstackStartCookiesMock: vi.fn(() => "cookie-plugin"),
}));

vi.mock("better-auth", () => ({
	betterAuth: betterAuthMock,
}));

vi.mock("better-auth/adapters/prisma", () => ({
	prismaAdapter: prismaAdapterMock,
}));

vi.mock("better-auth/tanstack-start", () => ({
	tanstackStartCookies: tanstackStartCookiesMock,
}));

vi.mock("@/shared/lib/prisma", () => ({
	prisma: {},
}));

vi.mock("../password-reset-email", () => ({
	sendPasswordResetEmail: sendPasswordResetEmailMock,
}));

vi.mock("../../config/env", () => ({
	env: {
		BETTER_AUTH_SECRET: "x".repeat(32),
		BETTER_AUTH_URL: "http://localhost:3000",
	},
}));

import {
	AUTH_DEFAULT_SESSION_MAX_AGE_SECONDS,
	AUTH_REMEMBERED_SESSION_MAX_AGE_SECONDS,
	auth,
} from "../auth";

describe("auth configuration", () => {
	it("keeps documented session durations", () => {
		expect(AUTH_DEFAULT_SESSION_MAX_AGE_SECONDS).toBe(60 * 60 * 24);
		expect(AUTH_REMEMBERED_SESSION_MAX_AGE_SECONDS).toBe(60 * 60 * 24 * 7);
	});

	it("wires password reset emails through the shared sender", async () => {
		const config = betterAuthMock.mock.calls[0]?.[0];

		if (!config?.emailAndPassword?.sendResetPassword) {
			throw new Error("Expected sendResetPassword config");
		}

		await config.emailAndPassword.sendResetPassword({
			user: {
				email: "carlos@example.com",
			},
			url: "http://localhost:3000/recuperar-senha?token=abc123",
		});

		expect(sendPasswordResetEmailMock).toHaveBeenCalledWith({
			email: "carlos@example.com",
			resetUrl: "http://localhost:3000/recuperar-senha?token=abc123",
		});
		expect(auth).toEqual({
			config: expect.any(Object),
		});
	});
});
