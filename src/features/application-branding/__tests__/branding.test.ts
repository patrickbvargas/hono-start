import { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getApplicationBrandingQueryOptions } from "../api/queries";
import { applicationBrandingSchema } from "../schemas/model";

vi.mock("@tanstack/react-start", () => ({
	createServerFn: () => ({
		handler: (handler: () => Promise<unknown>) => handler,
	}),
}));
beforeEach(() => {
	vi.stubEnv(
		"VITE_CLERK_PUBLISHABLE_KEY",
		`pk_test_${Buffer.from("example.clerk.accounts.dev$").toString("base64")}`,
	);
});
afterEach(() => {
	vi.unstubAllGlobals();
	vi.unstubAllEnvs();
});

describe("application branding", () => {
	it("reads public branding without credentials and enables focus/reconnect refresh", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			Response.json({
				display_config: {
					application_name: " Hono Legal ",
					logo_image_url: "https://example.com/logo.png",
					favicon_image_url: "https://example.com/favicon.ico",
				},
			}),
		);
		vi.stubGlobal("fetch", fetchMock);
		const client = new QueryClient();
		try {
			const options = getApplicationBrandingQueryOptions();
			expect(options.refetchOnWindowFocus).toBe("always");
			expect(options.refetchOnReconnect).toBe("always");
			expect(await client.fetchQuery(options)).toEqual({
				name: "Hono Legal",
				imageUrl: "https://example.com/logo.png",
				faviconUrl: "https://example.com/favicon.ico",
			});
			expect(fetchMock).toHaveBeenCalledWith(
				"https://example.clerk.accounts.dev/v1/environment",
				expect.objectContaining({
					credentials: "omit",
					cache: "no-store",
					signal: expect.any(AbortSignal),
				}),
			);
		} finally {
			client.clear();
		}
	});
	it.each([undefined, null, "", "   ", 123])(
		"falls back for invalid name %j without discarding valid images",
		(application_name) => {
			expect(
				applicationBrandingSchema.parse({
					display_config: {
						application_name,
						logo_image_url: "https://example.com/logo.png",
						favicon_image_url: "https://example.com/favicon.ico",
					},
				}),
			).toEqual({
				name: "Hono",
				imageUrl: "https://example.com/logo.png",
				faviconUrl: "https://example.com/favicon.ico",
			});
		},
	);
	it.each([
		null,
		"",
		"bad-url",
		"javascript:alert(1)",
		"data:image/png;base64,AA",
		123,
	])(
		"falls back for invalid images %j without discarding valid name",
		(image) => {
			expect(
				applicationBrandingSchema.parse({
					display_config: {
						application_name: "Legal",
						logo_image_url: image,
						favicon_image_url: image,
					},
				}),
			).toEqual({ name: "Legal", imageUrl: undefined, faviconUrl: undefined });
		},
	);
	it("uses defaults for missing fields and rejects invalid envelopes", () => {
		expect(applicationBrandingSchema.parse({ display_config: {} })).toEqual({
			name: "Hono",
			imageUrl: undefined,
			faviconUrl: undefined,
		});
		expect(
			applicationBrandingSchema.safeParse({ error: "unavailable" }).success,
		).toBe(false);
	});
	it("isolates invalid logo from valid favicon", () => {
		expect(
			applicationBrandingSchema.parse({
				display_config: {
					application_name: "Legal",
					logo_image_url: "invalid",
					favicon_image_url: "https://example.com/icon.ico",
				},
			}),
		).toEqual({
			name: "Legal",
			imageUrl: undefined,
			faviconUrl: "https://example.com/icon.ico",
		});
	});
	it("retains successful cache after failed refresh then accepts updated branding", async () => {
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockResolvedValueOnce(
					Response.json({ display_config: { application_name: "Legal" } }),
				)
				.mockResolvedValueOnce(new Response("Unavailable", { status: 503 }))
				.mockResolvedValueOnce(
					Response.json({ display_config: { application_name: "New Legal" } }),
				),
		);
		const client = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		try {
			const options = getApplicationBrandingQueryOptions();
			const original = await client.fetchQuery(options);
			await expect(client.fetchQuery(options)).rejects.toThrow();
			expect(client.getQueryData(options.queryKey)).toEqual(original);
			expect((await client.fetchQuery(options)).name).toBe("New Legal");
		} finally {
			client.clear();
		}
	});
	it("does not fetch invalid configured hosts", async () => {
		vi.stubEnv(
			"VITE_CLERK_PUBLISHABLE_KEY",
			`pk_test_${Buffer.from("evil.example/path$").toString("base64")}`,
		);
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
		const client = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		try {
			await expect(
				client.fetchQuery(getApplicationBrandingQueryOptions()),
			).rejects.toThrow("Identidade da aplicação inválida.");
			expect(fetchMock).not.toHaveBeenCalled();
		} finally {
			client.clear();
		}
	});
});
