// @vitest-environment jsdom

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

vi.mock("@tanstack/react-router", async (importOriginal) => ({
	...(await importOriginal<typeof import("@tanstack/react-router")>()),
	useNavigate: () => vi.fn(),
	useSearch: () => ({}),
}));

import { RelatedRecordLink } from "../components/link";

afterEach(cleanup);
describe("contextual related details", () => {
	it.each([
		"client",
		"employee",
		"fee",
		"contract",
		"expense",
		"remuneration",
	] as const)(
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
			expect(
				screen
					.getByRole("button", { name: "Registro relacionado" })
					.getAttribute("title"),
			).toBe("Ver resumo de Registro relacionado");
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
