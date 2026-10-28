// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useAppForm } from "@/shared/hooks/use-app-form";

function Harness() {
	const form = useAppForm({ defaultValues: { files: [] as File[] } });
	return (
		<form.AppField name="files">
			{(field) => (
				<field.File
					multiple
					maxFiles={5}
					label="Arquivos"
					browseLabel="Selecionar arquivos"
				/>
			)}
		</form.AppField>
	);
}
function file(index: number) {
	return new File(["test"], `${index}.pdf`, { type: "application/pdf" });
}

describe("multiple file picker", () => {
	afterEach(cleanup);
	it("appends selections, enforces limit without truncation and removes files", async () => {
		render(<Harness />);
		const input = screen.getByLabelText("Arquivos") as HTMLInputElement;
		expect(input.multiple).toBe(true);
		fireEvent.change(input, { target: { files: [file(1), file(2), file(3)] } });
		expect(
			screen.getByRole("status", {
				name: "Carregando arquivos selecionados...",
			}),
		).toBeTruthy();
		await waitFor(() =>
			expect(screen.getByText("3 de 5 arquivos selecionados")).toBeTruthy(),
		);
		fireEvent.change(input, { target: { files: [file(4), file(5), file(6)] } });
		await waitFor(() =>
			expect(screen.getByRole("alert").textContent).toContain("no máximo 5"),
		);
		expect(screen.queryByText("6.pdf")).toBeNull();
		fireEvent.change(input, { target: { files: [file(4), file(5)] } });
		await waitFor(() =>
			expect(screen.getByText("5 de 5 arquivos selecionados")).toBeTruthy(),
		);
		fireEvent.click(screen.getByRole("button", { name: "Remover 2.pdf" }));
		expect(screen.getByText("4 de 5 arquivos selecionados")).toBeTruthy();
		expect(screen.queryByText("2.pdf")).toBeNull();
	});
	it("accepts multiple files through drag and drop", async () => {
		render(<Harness />);
		fireEvent.drop(screen.getByRole("presentation"), {
			dataTransfer: { files: [file(1), file(2)] },
		});
		await waitFor(() =>
			expect(screen.getByText("2 de 5 arquivos selecionados")).toBeTruthy(),
		);
	});
});
