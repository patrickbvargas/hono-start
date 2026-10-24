// @vitest-environment jsdom

import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	Outlet,
	RouterProvider,
} from "@tanstack/react-router";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { NavigationLink } from "../navigation-link";

afterEach(cleanup);
describe("NavigationLink", () => {
	it("keeps internal navigation and exposes a decorative navigation icon", async () => {
		const root = createRootRoute({ component: Outlet });
		const index = createRoute({
			getParentRoute: () => root,
			path: "/",
			component: () => (
				<NavigationLink
					to="/clientes"
					state={{ resetFilterPanel: true }}
					search={{
						page: 1,
						limit: 25,
						column: "fullName",
						direction: "asc",
						query: "Ana",
						type: [],
						active: "all",
						status: "active",
					}}
				>
					Ana
				</NavigationLink>
			),
		});
		const target = createRoute({
			getParentRoute: () => root,
			path: "/clientes",
			component: () => <p>Listagem de clientes</p>,
		});
		const router = createRouter({
			routeTree: root.addChildren([index, target]),
			history: createMemoryHistory({ initialEntries: ["/"] }),
		});
		await act(async () => {
			await router.load();
			render(<RouterProvider router={router} />);
		});
		const link = screen.getByRole("link", { name: "Ana" });
		expect(link.querySelector('svg[aria-hidden="true"]')).toBeTruthy();
		await act(async () => {
			fireEvent.click(link);
		});
		expect(await screen.findByText("Listagem de clientes")).toBeTruthy();
		expect(router.state.location.search).toHaveProperty("query", "Ana");
		expect(router.state.location.state.resetFilterPanel).toBe(true);
	});
});
