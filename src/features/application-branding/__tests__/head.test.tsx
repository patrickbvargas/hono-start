// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getApplicationBrandingQueryOptions } from "../api/queries";
import { ApplicationBrandingHead } from "../components/application-branding-head";

const route = vi.hoisted(() => ({
	pageTitle: "Clientes" as string | undefined,
}));
vi.mock("@tanstack/react-router", () => ({
	useMatches: ({
		select,
	}: {
		select: (matches: { staticData: { pageTitle?: string } }[]) => unknown;
	}) =>
		select([
			{ staticData: {} },
			{ staticData: { pageTitle: route.pageTitle } },
		]),
}));
vi.mock("@tanstack/react-start", () => ({
	createServerFn: () => ({
		handler: (handler: () => Promise<unknown>) => handler,
	}),
}));
let client: QueryClient;
let images: HTMLImageElement[];
function createMockImage() {
	const image = document.createElement("img");
	images.push(image);
	return image;
}
function head() {
	return (
		<QueryClientProvider client={client}>
			<ApplicationBrandingHead />
		</QueryClientProvider>
	);
}
beforeEach(() => {
	route.pageTitle = "Clientes";
	images = [];
	vi.stubEnv("VITE_CLERK_PUBLISHABLE_KEY", "pk_test_example");
	vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
	vi.stubGlobal("Image", vi.fn(createMockImage));
	client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});
afterEach(() => {
	cleanup();
	client.clear();
	vi.useRealTimers();
	vi.unstubAllGlobals();
	vi.unstubAllEnvs();
});
function setBranding(name: string, faviconUrl?: string) {
	client.setQueryData(getApplicationBrandingQueryOptions().queryKey, {
		name,
		imageUrl: undefined,
		faviconUrl,
	});
}
describe("global document branding", () => {
	it("uses defaults during first-load failure", async () => {
		render(head(), { container: document.head });
		await waitFor(() =>
			expect(
				client.getQueryState(getApplicationBrandingQueryOptions().queryKey)
					?.status,
			).toBe("error"),
		);
		expect(document.title).toBe("Clientes | Hono");
		expect(
			document.querySelector('link[rel="icon"]')?.getAttribute("href"),
		).toBe("/favicon.ico");
	});
	it("updates one title with navigation, login and branding changes", async () => {
		setBranding("Legal");
		const view = render(head(), { container: document.head });
		expect(document.title).toBe("Clientes | Legal");
		route.pageTitle = "Entrar";
		view.rerender(head());
		expect(document.title).toBe("Entrar | Legal");
		act(() => setBranding("New Legal"));
		await waitFor(() => expect(document.title).toBe("Entrar | New Legal"));
		route.pageTitle = undefined;
		view.rerender(head());
		expect(document.title).toBe("New Legal");
		expect(document.querySelectorAll("title")).toHaveLength(1);
	});
	it("falls back for broken favicon and recovers with new URL", async () => {
		setBranding("Legal", "https://example.com/broken.ico");
		render(head(), { container: document.head });
		act(() => images[0].dispatchEvent(new Event("error")));
		expect(
			document.querySelector('link[rel="icon"]')?.getAttribute("href"),
		).toBe("/favicon.ico");
		act(() => setBranding("Legal", "https://example.com/good.ico"));
		await waitFor(() => expect(images).toHaveLength(2));
		act(() => images[1].dispatchEvent(new Event("load")));
		await waitFor(() =>
			expect(
				document.querySelector('link[rel="icon"]')?.getAttribute("href"),
			).toBe("https://example.com/good.ico"),
		);
		act(() => setBranding("Legal"));
		await waitFor(() =>
			expect(
				document.querySelector('link[rel="icon"]')?.getAttribute("href"),
			).toBe("/favicon.ico"),
		);
	});
	it("times out stalled favicons and removes image handlers", () => {
		vi.useFakeTimers();
		setBranding("Legal", "https://example.com/stalled.ico");
		const view = render(head(), { container: document.head });
		act(() => vi.advanceTimersByTime(10000));
		act(() => images[0].dispatchEvent(new Event("load")));
		expect(
			document.querySelector('link[rel="icon"]')?.getAttribute("href"),
		).toBe("/favicon.ico");
		view.unmount();
		expect(images[0].onload).toBeNull();
		expect(images[0].onerror).toBeNull();
	});
});
