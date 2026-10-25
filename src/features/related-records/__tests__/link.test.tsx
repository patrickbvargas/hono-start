// @vitest-environment jsdom

import {
	createMemoryHistory,
	createRootRoute,
	createRouter,
	RouterProvider,
} from "@tanstack/react-router";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { OverlayState } from "@/shared/types/overlay";

vi.mock("../components/details", () => ({
	RelatedRecordDetails: ({
		kind,
		id,
		state,
	}: {
		kind: string;
		id: number;
		state: OverlayState;
	}) => (
		<section aria-label="Detalhe relacionado">
			<input aria-label="Estado local do detalhe" defaultValue="" />
			<p>
				{kind} #{id}
			</p>
			<button onClick={state.close}>Fechar relacionado</button>
		</section>
	),
}));

import { RelatedRecordLink } from "../components/link";

afterEach(cleanup);
describe("contextual related details", () => {
	it("opens contracts through a workspace link instead of a detail overlay", async () => {
		const route = createRootRoute({
			component: () => (
				<RelatedRecordLink kind="contract" id={42}>
					Contrato relacionado
				</RelatedRecordLink>
			),
		});
		const router = createRouter({
			routeTree: route,
			history: createMemoryHistory({ initialEntries: ["/"] }),
		});
		await router.load();
		render(<RouterProvider router={router} />);
		const link = await screen.findByRole("link", {
			name: "Contrato relacionado",
		});
		expect(link.getAttribute("href")).toBe("/contratos/42?tab=overview");
		expect(link.getAttribute("title")).toBe(
			"Abrir página do contrato Contrato relacionado",
		);
		expect(screen.queryByLabelText("Detalhe relacionado")).toBeNull();
	});
	it.each(["client", "employee", "fee"] as const)(
		"opens and closes %s without replacing source screen or URL",
		async (kind) => {
			const url = window.location.href;
			render(
				<main>
					<h1>Contrato de origem</h1>
					<input aria-label="Busca de contratos" defaultValue="PROC-123" />
					<RelatedRecordLink kind={kind} id={42}>
						Registro relacionado
					</RelatedRecordLink>
				</main>,
			);
			expect(
				screen
					.getByRole("button", { name: "Registro relacionado" })
					.querySelector("svg"),
			).toBeNull();
			expect(
				screen
					.getByRole("button", { name: "Registro relacionado" })
					.getAttribute("aria-haspopup"),
			).toBe("dialog");
			expect(
				screen
					.getByRole("button", { name: "Registro relacionado" })
					.getAttribute("aria-expanded"),
			).toBe("false");
			expect(screen.queryByLabelText("Detalhe relacionado")).toBeNull();
			fireEvent.click(
				screen.getByRole("button", { name: "Registro relacionado" }),
			);
			expect(await screen.findByText(`${kind} #42`)).toBeTruthy();
			expect(
				screen
					.getByRole("button", { name: "Registro relacionado" })
					.getAttribute("aria-expanded"),
			).toBe("true");
			expect(window.location.href).toBe(url);
			fireEvent.click(
				screen.getByRole("button", { name: "Fechar relacionado" }),
			);
			expect(screen.queryByLabelText("Detalhe relacionado")).toBeNull();
			expect(
				screen.getByRole("heading", { name: "Contrato de origem" }),
			).toBeTruthy();
			expect(
				(screen.getByLabelText("Busca de contratos") as HTMLInputElement).value,
			).toBe("PROC-123");
			expect(window.location.href).toBe(url);
		},
	);
	it("preserves open detail state during parent rerenders", async () => {
		const { rerender } = render(
			<RelatedRecordLink kind="client" id={42}>
				Cliente
			</RelatedRecordLink>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Cliente" }));
		expect(await screen.findByLabelText("Detalhe relacionado")).toBeTruthy();
		expect(
			screen.queryByRole("heading", { name: "Carregando detalhes" }),
		).toBeNull();
		fireEvent.change(screen.getByLabelText("Estado local do detalhe"), {
			target: { value: "preservado" },
		});
		rerender(
			<RelatedRecordLink kind="client" id={42}>
				Cliente atualizado
			</RelatedRecordLink>,
		);
		expect(
			(screen.getByLabelText("Estado local do detalhe") as HTMLInputElement)
				.value,
		).toBe("preservado");
	});
});
