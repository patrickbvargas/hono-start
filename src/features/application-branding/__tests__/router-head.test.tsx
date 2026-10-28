// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	HeadContent,
	Outlet,
	RouterProvider,
} from "@tanstack/react-router";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { getApplicationBrandingQueryOptions } from "../api/queries";
import { ApplicationBrandingHead } from "../components/application-branding-head";

vi.mock("@tanstack/react-start", () => ({
	createServerFn: () => ({
		handler: (handler: () => Promise<unknown>) => handler,
	}),
}));
afterEach(() => {
	cleanup();
	vi.unstubAllEnvs();
	vi.unstubAllGlobals();
});
it("composes titles from real router matches without losing HeadContent metadata", async () => {
	vi.stubEnv("VITE_CLERK_PUBLISHABLE_KEY", "pk_test_example");
	vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	client.setQueryData(getApplicationBrandingQueryOptions().queryKey, {
		name: "Legal",
		imageUrl: undefined,
		faviconUrl: undefined,
	});
	const root = createRootRoute({
		head: () => ({
			meta: [{ name: "description", content: "Preserved metadata" }],
		}),
		component: () => (
			<>
				<HeadContent />
				<ApplicationBrandingHead />
				<Outlet />
			</>
		),
	});
	const home = createRoute({
		getParentRoute: () => root,
		path: "/",
		staticData: { pageTitle: "Clientes" },
		component: () => <div>Clientes</div>,
	});
	const login = createRoute({
		getParentRoute: () => root,
		path: "/login",
		staticData: { pageTitle: "Entrar" },
		component: () => <div>Entrar</div>,
	});
	const router = createRouter({
		routeTree: root.addChildren([home, login]),
		history: createMemoryHistory({ initialEntries: ["/"] }),
	});
	try {
		await router.load();
		render(
			<QueryClientProvider client={client}>
				<RouterProvider router={router} />
			</QueryClientProvider>,
		);
		await waitFor(() => expect(document.title).toBe("Clientes | Legal"));
		await act(async () => {
			await router.navigate({ to: "/login" });
		});
		await waitFor(() => expect(document.title).toBe("Entrar | Legal"));
		expect(document.querySelectorAll("title")).toHaveLength(1);
		expect(
			document
				.querySelector('meta[name="description"]')
				?.getAttribute("content"),
		).toBe("Preserved metadata");
	} finally {
		cleanup();
		client.clear();
	}
});
