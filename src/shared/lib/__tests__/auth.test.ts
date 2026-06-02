import { describe, expect, it, vi } from "vitest";

vi.mock("../../config/env", () => ({
	env: {
		SUPABASE_PUBLISHABLE_KEY: "publishable-key",
		SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
		SUPABASE_STORAGE_SERVICE_KEY: undefined,
		SUPABASE_URL: "https://example.supabase.co",
	},
}));

import {
	AUTH_DEFAULT_SESSION_MAX_AGE_SECONDS,
	AUTH_REMEMBERED_SESSION_MAX_AGE_SECONDS,
	getAuthCookieMaxAge,
	getSupabasePublishableKey,
	getSupabaseServiceRoleKey,
	getSupabaseUrl,
	SUPABASE_AUTH_STORAGE_KEY,
	SUPABASE_REMEMBER_ME_COOKIE_NAME,
} from "../auth";

describe("auth helpers", () => {
	it("keeps documented session durations", () => {
		expect(AUTH_DEFAULT_SESSION_MAX_AGE_SECONDS).toBe(60 * 60 * 24);
		expect(AUTH_REMEMBERED_SESSION_MAX_AGE_SECONDS).toBe(60 * 60 * 24 * 7);
		expect(getAuthCookieMaxAge(false)).toBe(
			AUTH_DEFAULT_SESSION_MAX_AGE_SECONDS,
		);
		expect(getAuthCookieMaxAge(true)).toBe(
			AUTH_REMEMBERED_SESSION_MAX_AGE_SECONDS,
		);
	});

	it("exposes stable Supabase auth identifiers", () => {
		expect(getSupabaseUrl()).toBe("https://example.supabase.co");
		expect(getSupabasePublishableKey()).toBe("publishable-key");
		expect(getSupabaseServiceRoleKey()).toBe("service-role-key");
		expect(SUPABASE_AUTH_STORAGE_KEY).toBe("hono-auth-token");
		expect(SUPABASE_REMEMBER_ME_COOKIE_NAME).toBe("hono-remember-me");
	});
});
