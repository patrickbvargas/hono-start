// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui";
import { EntityDetail } from "../entity-detail";

const OPEN_STATE = {
	isOpen: true,
	onOpenChange: () => {},
	close: () => {},
};

const pendingContent = new Promise<never>(() => {});

function SuspendsForever(): React.ReactNode {
	throw pendingContent;
}

describe("EntityDetail", () => {
	afterEach(() => {
		cleanup();
	});

	it("keeps surrounding content visible while detail content suspends", () => {
		render(
			<div>
				<div>Tabela de clientes</div>
				<EntityDetail.Root state={OPEN_STATE}>
					<React.Suspense
						fallback={
							<EntityDetail.Content>
								<EntityDetail.Header>
									<EntityDetail.Title>
										<EntityDetail.SkeletonTitle />
									</EntityDetail.Title>
								</EntityDetail.Header>
								<EntityDetail.Body>
									<EntityDetail.SkeletonFields rows={2} />
								</EntityDetail.Body>
								<EntityDetail.Footer />
							</EntityDetail.Content>
						}
					>
						<SuspendsForever />
					</React.Suspense>
				</EntityDetail.Root>
			</div>,
		);

		expect(screen.getByText("Tabela de clientes")).not.toBeNull();
		expect(screen.getByRole("button", { name: "Fechar" })).not.toBeNull();
	});

	it("does not request close when a modal input receives focus above the drawer", () => {
		const onOpenChange = vi.fn();
		const inputId = `entity-detail-dialog-name-${Date.now()}`;

		render(
			<div
				data-slot="root-container"
				className="relative h-dvh w-dvw overflow-hidden"
			>
				<EntityDetail.Root
					state={{
						isOpen: true,
						onOpenChange,
						close: () => {},
					}}
				>
					<EntityDetail.Content>
						<EntityDetail.Header>
							<EntityDetail.Title>Cliente</EntityDetail.Title>
						</EntityDetail.Header>
						<EntityDetail.Body>
							<div>Drawer aberto</div>
						</EntityDetail.Body>
					</EntityDetail.Content>
				</EntityDetail.Root>

				<Dialog open>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Editar cliente</DialogTitle>
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
		expect(onOpenChange).not.toHaveBeenCalledWith(false);
	});
	it("labels nested details Voltar and dismisses only the related drawer", () => {
		const parentChange = vi.fn();
		const childChange = vi.fn();
		render(
			<EntityDetail.Root state={{ ...OPEN_STATE, onOpenChange: parentChange }}>
				<EntityDetail.Content>
					<EntityDetail.Header>
						<EntityDetail.Title>Contrato de origem</EntityDetail.Title>
					</EntityDetail.Header>
					<EntityDetail.Footer />
					<EntityDetail.Root
						state={{ ...OPEN_STATE, onOpenChange: childChange }}
					>
						<EntityDetail.Content>
							<EntityDetail.Header>
								<EntityDetail.Title>Cliente relacionado</EntityDetail.Title>
							</EntityDetail.Header>
							<EntityDetail.Footer />
						</EntityDetail.Content>
					</EntityDetail.Root>
				</EntityDetail.Content>
			</EntityDetail.Root>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
		expect(childChange).toHaveBeenCalledWith(false, expect.anything());
		expect(parentChange).not.toHaveBeenCalled();
	});
	it("reserves separate responsive page-link slots and action geometry while loading", () => {
		const { container } = render(
			<EntityDetail.Root state={OPEN_STATE}>
				<EntityDetail.SkeletonHeader withActions withPageLink />
				<EntityDetail.Body>
					<EntityDetail.SkeletonPageLink />
				</EntityDetail.Body>
			</EntityDetail.Root>,
		);
		const drawer = screen.getByRole("dialog", { name: "Carregando detalhes" });
		expect(
			drawer.querySelector('[data-slot="drawer-header"]')?.className,
		).toContain("flex-row");
		expect(drawer.querySelector(".hidden.h-4.w-24.shrink-0")).toBeTruthy();
		expect(drawer.querySelector(".size-7.shrink-0")).toBeTruthy();
		expect(drawer.querySelector(".h-5.items-center")).toBeTruthy();
		expect(container.querySelector("a")).toBeNull();
	});

	it("names the detail drawer while loading", () => {
		render(
			<EntityDetail.Root state={OPEN_STATE}>
				<EntityDetail.Content>
					<EntityDetail.SkeletonHeader />
					<EntityDetail.Footer />
				</EntityDetail.Content>
			</EntityDetail.Root>,
		);
		expect(
			screen.getByRole("dialog", { name: "Carregando detalhes" }),
		).toBeTruthy();
	});
});
