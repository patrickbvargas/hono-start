// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
	Button,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerTrigger,
} from "@/shared/components/ui";

describe("Drawer", () => {
	afterEach(() => {
		document.body.innerHTML = "";
	});

	it("supports Base UI render composition", () => {
		render(
			<div
				data-slot="root-container"
				className="relative h-dvh w-dvw overflow-hidden"
			>
				<Drawer>
					<DrawerTrigger render={<Button />}>Abrir drawer</DrawerTrigger>
					<DrawerContent direction="right">
						<div className="p-4">
							<span>Conteudo drawer</span>
							<DrawerClose render={<Button type="button" variant="outline" />}>
								Fechar drawer
							</DrawerClose>
						</div>
					</DrawerContent>
				</Drawer>
			</div>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Abrir drawer" }));
		expect(screen.getByText("Conteudo drawer")).not.toBeNull();

		fireEvent.click(screen.getByRole("button", { name: "Fechar drawer" }));
		expect(screen.queryByText("Conteudo drawer")).toBeNull();
	});

	it("keeps dialog inputs mounted above non-modal drawer content", () => {
		const inputId = `drawer-dialog-name-${Date.now()}`;

		render(
			<div
				data-slot="root-container"
				className="relative h-dvh w-dvw overflow-hidden"
			>
				<Drawer open modal={false}>
					<DrawerContent direction="right">
						<div className="p-4">Drawer aberto</div>
					</DrawerContent>
				</Drawer>

				<Dialog open>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Editar colaborador</DialogTitle>
						</DialogHeader>
						<label htmlFor={inputId}>Nome</label>
						<input id={inputId} />
					</DialogContent>
				</Dialog>
			</div>,
		);

		const input = screen.getByLabelText("Nome");
		input.focus();
		fireEvent.input(input, { target: { value: "Maria" } });

		expect(document.activeElement).toBe(input);
		expect((input as HTMLInputElement).value).toBe("Maria");
		expect(screen.getByText("Drawer aberto")).not.toBeNull();
	});
});
