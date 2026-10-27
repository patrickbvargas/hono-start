// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { EntityForm } from "../entity-form";

afterEach(cleanup);

function Example({ close }: { close: () => void }) {
	const form = useAppForm({ defaultValues: { name: "" } });
	return (
		<form.Form form={form}>
			<EntityForm
				title="Novo registro"
				state={{ isOpen: true, close, onOpenChange: close }}
			>
				<form.AppField name="name">
					{(field) => <field.Input label="Nome" />}
				</form.AppField>
			</EntityForm>
		</form.Form>
	);
}

describe("form discard protection", () => {
	it("keeps form fields inside the shared scroll viewport and the header outside", () => {
		render(<Example close={vi.fn()} />);
		const input = screen.getByRole("textbox", { name: "Nome" });
		expect(input.closest('[data-slot="scroll-area-viewport"]')).toBeTruthy();
		expect(
			screen
				.getByRole("heading", { name: "Novo registro" })
				.closest('[data-slot="scroll-area"]'),
		).toBeNull();
	});
	it("closes untouched forms immediately", () => {
		const close = vi.fn();
		render(<Example close={close} />);
		fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
		expect(close).toHaveBeenCalledOnce();
	});
	it("preserves edits until discard is explicitly confirmed", () => {
		const close = vi.fn();
		render(<Example close={close} />);
		const input = screen.getByRole("textbox", {
			name: "Nome",
		}) as HTMLInputElement;
		fireEvent.change(input, { target: { value: "Rascunho" } });
		fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
		expect(close).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole("button", { name: "Continuar editando" }));
		expect(input.value).toBe("Rascunho");
		fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
		fireEvent.click(
			screen.getByRole("button", { name: "Descartar alterações" }),
		);
		expect(close).toHaveBeenCalledOnce();
	});
});
