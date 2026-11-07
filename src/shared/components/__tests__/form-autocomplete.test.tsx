// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { useAppForm } from "@/shared/hooks/use-app-form";

afterEach(cleanup);

function Example() {
	const form = useAppForm({ defaultValues: { method: "PIX" } });
	return (
		<form.Form form={form}>
			<form.AppField name="method">
				{(field) => (
					<field.Autocomplete
						label="Forma de pagamento"
						options={[{ value: "PIX", label: "Pix" }]}
					/>
				)}
			</form.AppField>
			<form.Subscribe selector={(state) => state.values.method}>
				{(value) => (
					<output aria-label="Valor selecionado">
						{JSON.stringify(value)}
					</output>
				)}
			</form.Subscribe>
		</form.Form>
	);
}

it("clears single selection to an empty string instead of an array", () => {
	render(<Example />);
	expect(screen.getByLabelText("Valor selecionado").textContent).toBe('"PIX"');
	fireEvent.click(screen.getByRole("button", { name: "Limpar seleção" }));
	expect(screen.getByLabelText("Valor selecionado").textContent).toBe('""');
});
