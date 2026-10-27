import { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getApplicationBrandingQueryOptions } from "../api/queries";

vi.mock("@tanstack/react-start", () => ({
	createServerFn: () => ({
		handler: (handler: () => Promise<unknown>) => handler,
	}),
}));
beforeEach(() =>
	vi.stubEnv(
		"VITE_CLERK_PUBLISHABLE_KEY",
		`pk_test_${Buffer.from("example.clerk.accounts.dev$").toString("base64")}`,
	),
);
afterEach(() => {
	vi.unstubAllGlobals();
	vi.unstubAllEnvs();
});

describe("application branding", () => {
	it("reads and validates public Clerk branding without credentials", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					display_config: {
						application_name: " Hono Legal ",
						logo_image_url: "https://example.com/logo.png",
					},
				}),
			),
		);
		vi.stubGlobal("fetch", fetchMock);
		const client = new QueryClient();
		const result = await client.fetchQuery(
			getApplicationBrandingQueryOptions("example.clerk.accounts.dev"),
		);
		expect(result).toEqual({
			name: "Hono Legal",
			imageUrl: "https://example.com/logo.png",
		});
		expect(fetchMock).toHaveBeenCalledWith(
			"https://example.clerk.accounts.dev/v1/environment",
			expect.objectContaining({
				credentials: "omit",
				cache: "no-store",
				signal: expect.any(AbortSignal),
			}),
		);
		client.clear();
	});

	it("accepts missing logo and rejects malformed branding", async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(
				new Response(
					JSON.stringify({
						display_config: { application_name: "Hono", logo_image_url: null },
					}),
				),
			)
			.mockResolvedValueOnce(
				new Response(
					JSON.stringify({ display_config: { application_name: 123 } }),
				),
			);
		vi.stubGlobal("fetch", fetchMock);
		const client = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		expect(
			await client.fetchQuery(
				getApplicationBrandingQueryOptions("first.example.com"),
			),
		).toEqual({ name: "Hono", imageUrl: undefined });
		await expect(
			client.fetchQuery(
				getApplicationBrandingQueryOptions("second.example.com"),
			),
		).rejects.toThrow();
		client.clear();
	});
});
