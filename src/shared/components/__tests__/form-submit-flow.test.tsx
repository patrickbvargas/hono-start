// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as z from "zod";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { EntityForm } from "../entity-form";

afterEach(cleanup);

function Example({ onSave }: { onSave: () => void }) {
	const form = useAppForm({
		defaultValues: { name: "" },
		validators: {
			onSubmit: z.object({ name: z.string().min(1, "Informe o nome") }),
		},
		onSubmit: onSave,
	});
	return (
		<form.Form form={form}>
			<EntityForm
				title="Exemplo"
				state={{ isOpen: true, close: vi.fn(), onOpenChange: vi.fn() }}
				footer={<form.Submit />}
			>
				<form.AppField name="name">
					{(field) => <field.Input label="Nome" isRequired />}
				</form.AppField>
			</EntityForm>
		</form.Form>
	);
}

describe("portal form submission", () => {
	it("submits exactly once through the associated native form", async () => {
		const onSave = vi.fn();
		render(<Example onSave={onSave} />);
		fireEvent.change(screen.getByRole("textbox", { name: /Nome/ }), {
			target: { value: "Nome válido" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
		await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
	});

	it("keeps the draft and focuses the invalid field after submit", async () => {
		const onSave = vi.fn();
		render(<Example onSave={onSave} />);
		fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
		await waitFor(() =>
			expect(
				screen.getByText("Revise os campos indicados antes de salvar."),
			).not.toBeNull(),
		);
		await waitFor(() =>
			expect(document.activeElement).toBe(
				screen.getByRole("textbox", { name: /Nome/ }),
			),
		);
		expect(onSave).not.toHaveBeenCalled();
	});
});
