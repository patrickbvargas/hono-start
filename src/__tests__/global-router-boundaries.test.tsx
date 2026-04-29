// @vitest-environment jsdom

import {
	createRootRoute,
	createRoute,
	createRouter,
	Outlet,
	RouterProvider,
} from "@tanstack/react-router";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function renderRouterAt(path: string) {
	window.history.pushState({}, "", path);

	const rootRoute = createRootRoute({
		component: Outlet,
		errorComponent: ({ error }) => (
			<div>
				global error: {error instanceof Error ? error.message : "unknown"}
			</div>
		),
		notFoundComponent: () => <div>global not found</div>,
	});

	const indexRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "/",
		component: () => <div>home</div>,
	});

	const boomRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "/boom",
		component: () => {
			throw new Error("boom");
		},
	});

	const localOverrideRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "/local",
		errorComponent: ({ error }) => (
			<div>
				local error: {error instanceof Error ? error.message : "unknown"}
			</div>
		),
		component: () => {
			throw new Error("local boom");
		},
	});

	const routeTree = rootRoute.addChildren([
		indexRoute,
		boomRoute,
		localOverrideRoute,
	]);
	const router = createRouter({ routeTree });

	render(<RouterProvider router={router} />);
}

describe("global router boundaries", () => {
	let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		cleanup();
		consoleErrorSpy.mockRestore();
	});

	it("renders the root not found boundary for unmatched routes", async () => {
		renderRouterAt("/missing");

		expect(await screen.findByText("global not found")).not.toBeNull();
	});

	it("renders the root error boundary for uncaught route errors", async () => {
		renderRouterAt("/boom");

		expect(await screen.findByText("global error: boom")).not.toBeNull();
	});

	it("keeps route-level error overrides working when explicitly configured", async () => {
		renderRouterAt("/local");

		expect(await screen.findByText("local error: local boom")).not.toBeNull();
		expect(screen.queryByText("global error: local boom")).toBeNull();
	});
});
