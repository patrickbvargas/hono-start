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
});
