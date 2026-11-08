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
import { afterEach, expect, it } from "vitest";
import { RouteError } from "../route-error";
import { RouteNotFound } from "../route-not-found";
import { buttonVariants } from "../ui";

afterEach(cleanup);

const errors: Record<string, unknown> = {
	network: new Error("Falha ao carregar"),
	session: new Error("Sessão expirada"),
	permission: new Error("Sem permissão de acesso"),
	generic: new Error("Falha inesperada"),
	unknown: null,
};

it.each([...Object.keys(errors), "not-found"])(
	"uses the shared small button styling for the %s return action",
	async (kind) => {
		const root = createRootRoute({ component: Outlet });
		const home = createRoute({
			getParentRoute: () => root,
			path: "/",
			component: () => <p>Início</p>,
		});
		const feedback = createRoute({
			getParentRoute: () => root,
			path: "/feedback",
			component: () =>
				kind !== "not-found" ? (
					<RouteError error={errors[kind]} />
				) : (
					<RouteNotFound />
				),
		});
		const settings = createRoute({
			getParentRoute: () => root,
			path: "/configuracoes",
			component: () => <p>Configurações</p>,
		});
		const router = createRouter({
			routeTree: root.addChildren([home, feedback, settings]),
			history: createMemoryHistory({ initialEntries: ["/feedback"] }),
		});
		await act(async () => {
			await router.load();
			render(<RouterProvider router={router} />);
		});
		const link = screen.getByRole("link", {
			name: kind === "not-found" ? "Voltar ao início" : "Abrir configurações",
		});
		expect(link.className).toBe(buttonVariants({ size: "sm" }));
		if (kind !== "not-found")
			expect(
				screen.getByRole("button", { name: "Tentar novamente" }),
			).toBeTruthy();
		expect(link.classList.contains("underline")).toBe(false);
		expect(link.querySelector("svg")).toBeNull();
		await act(async () => {
			fireEvent.click(link);
		});
		expect(
			await screen.findByText(
				kind === "not-found" ? "Início" : "Configurações",
			),
		).toBeTruthy();
	},
);
