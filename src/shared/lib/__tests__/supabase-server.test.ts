import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerClientMock, getRequestHeadersMock, setResponseHeaderMock } =
	vi.hoisted(() => ({
		createServerClientMock: vi.fn(),
		getRequestHeadersMock: vi.fn(),
		setResponseHeaderMock: vi.fn(),
	}));

vi.mock("../../config/env", () => ({
	env: {
		SUPABASE_PUBLISHABLE_KEY: "publishable-key",
		SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
		SUPABASE_STORAGE_SERVICE_KEY: undefined,
		SUPABASE_URL: "https://example.supabase.co",
	},
}));

vi.mock("@supabase/ssr", () => ({
	createServerClient: createServerClientMock,
}));

vi.mock("@tanstack/react-start/server", () => ({
	getRequestHeaders: getRequestHeadersMock,
	setResponseHeader: setResponseHeaderMock,
}));

import {
	createRememberMeCookie,
	createSupabaseServerClient,
} from "../supabase-server";

describe("supabase server client", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		getRequestHeadersMock.mockReturnValue(new Headers());
		createServerClientMock.mockImplementation((_url, _key, options) => {
			return {
				options,
			};
		});
	});

	it("flushes cache headers and set-cookie values through TanStack response helpers", () => {
		const { flushResponseCookies } = createSupabaseServerClient();
		const serverClientOptions = createServerClientMock.mock.calls[0]?.[2];

		expect(serverClientOptions).toBeDefined();

		serverClientOptions.cookies.setAll(
			[
				{
					name: "hono-auth-token",
					value: "session-token",
					options: {
						httpOnly: true,
						maxAge: 3600,
						path: "/",
						sameSite: "lax",
					},
				},
			],
			{
				"Cache-Control":
					"private, no-cache, no-store, must-revalidate, max-age=0",
			},
		);

		flushResponseCookies([createRememberMeCookie(true)]);

		expect(setResponseHeaderMock).toHaveBeenCalledWith(
			"Cache-Control",
			"private, no-cache, no-store, must-revalidate, max-age=0",
		);
		expect(setResponseHeaderMock).toHaveBeenCalledWith("set-cookie", [
			expect.stringContaining("hono-auth-token=session-token"),
			expect.stringContaining("hono-remember-me=1"),
		]);
	});
});
