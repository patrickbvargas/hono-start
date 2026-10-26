// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConfirmDialog } from "../confirm-dialog";
import { EntityActions } from "../entity-actions";
import { EntityDetail } from "../entity-detail";
import { Button, Dialog, DialogContent, DialogTitle } from "../ui";

vi.mock("@/shared/session", () => ({
	useOptionalLoggedUserSession: () => null,
	hasPermission: () => true,
}));

afterEach(cleanup);

function Fixture({ nested = false }: { nested?: boolean }) {
	const [open, setOpen] = useState(true);
	const [edit, setEdit] = useState(false);
	const [remove, setRemove] = useState(false);
	const modal = edit ? (
		<Dialog open={edit} onOpenChange={setEdit}>
			<DialogContent>
				<DialogTitle>Editar ou anexar</DialogTitle>
				<input aria-label="Nome" />
			</DialogContent>
		</Dialog>
	) : null;
	return (
		<div>
			{open ? (
				<EntityDetail.Root
					state={{
						isOpen: open,
						onOpenChange: setOpen,
						close: () => setOpen(false),
					}}
				>
					<EntityDetail.Header>
						<EntityDetail.Title>Resumo</EntityDetail.Title>
					</EntityDetail.Header>
					<EntityActions
						canEdit
						canDelete
						onEdit={() => setEdit(true)}
						onDelete={() => setRemove(true)}
					/>
					<Button onClick={() => setEdit(true)}>Anexar</Button>
					<EntityDetail.Footer />
					{nested ? modal : null}
				</EntityDetail.Root>
			) : null}
			{nested ? null : modal}
			{remove ? (
				<ConfirmDialog
					state={{
						isOpen: remove,
						onOpenChange: setRemove,
						close: () => setRemove(false),
					}}
					description="Tem certeza que deseja excluir?"
					onConfirm={() => setRemove(false)}
				/>
			) : null}
		</div>
	);
}

function clickBackdrop(slot: string) {
	const backdrop = Array.from(
		document.querySelectorAll(`[data-slot="${slot}"]`),
	).at(-1);
	if (!backdrop) {
		throw new Error(`Missing ${slot}`);
	}
	fireEvent.mouseDown(backdrop, { button: 0 });
	fireEvent.mouseUp(backdrop, { button: 0 });
	fireEvent.click(backdrop, { button: 0 });
}

function DrilldownSummary() {
	const [detailOpen, setDetailOpen] = useState(false);
	const [open, setOpen] = useState(true);
	return (
		<Dialog
			open={open}
			modal={!detailOpen}
			onOpenChange={(next, details) => {
				if (detailOpen) {
					details.cancel();
					return;
				}
				setOpen(next);
			}}
		>
			<DialogContent portalClassName={detailOpen ? "z-40" : undefined}>
				<DialogTitle>Drilldown</DialogTitle>
				<Button onClick={() => setDetailOpen(true)}>Ver resumo</Button>
			</DialogContent>
			{detailOpen ? (
				<EntityDetail.Root
					state={{
						isOpen: true,
						onOpenChange: setDetailOpen,
						close: () => setDetailOpen(false),
					}}
				>
					<EntityDetail.Title>Resumo do registro</EntityDetail.Title>
					<EntityDetail.Footer />
				</EntityDetail.Root>
			) : null}
		</Dialog>
	);
}

function NestedSummaries() {
	const [parent, setParent] = useState(true);
	const [child, setChild] = useState(false);
	return parent ? (
		<EntityDetail.Root
			state={{
				isOpen: parent,
				onOpenChange: setParent,
				close: () => setParent(false),
			}}
		>
			<EntityDetail.Title>Contrato</EntityDetail.Title>
			<Button onClick={() => setChild(true)}>Ver cliente</Button>
			<EntityDetail.Footer />
			{child ? (
				<EntityDetail.Root
					state={{
						isOpen: child,
						onOpenChange: setChild,
						close: () => setChild(false),
					}}
				>
					<EntityDetail.Title>Cliente</EntityDetail.Title>
					<EntityDetail.Footer />
				</EntityDetail.Root>
			) : null}
		</EntityDetail.Root>
	) : null;
}

describe("EntityDetail dismissal", () => {
	it("renders a dismissible drawer backdrop above its drilldown parent", async () => {
		render(<DrilldownSummary />);
		fireEvent.click(screen.getByRole("button", { name: "Ver resumo" }));
		await screen.findByText("Resumo do registro");
		expect(
			document.querySelector('[data-slot="drawer-overlay"]'),
		).not.toBeNull();
		clickBackdrop("drawer-overlay");
		await waitFor(() =>
			expect(screen.queryByText("Resumo do registro")).toBeNull(),
		);
		expect(screen.getByText("Drilldown")).toBeTruthy();
		expect(screen.getByRole("button", { name: "Ver resumo" })).toBeTruthy();
	});
	it("dismisses a sibling modal backdrop without dismissing the summary", async () => {
		render(<Fixture />);
		fireEvent.click(screen.getByRole("button", { name: "Anexar" }));
		await screen.findByRole("textbox", { name: "Nome" });
		clickBackdrop("dialog-overlay");
		await waitFor(() => expect(screen.queryByRole("textbox")).toBeNull());
		expect(screen.getByText("Resumo")).toBeTruthy();
	});
	it("dismisses only the innermost summary from the backdrop", async () => {
		render(<NestedSummaries />);
		fireEvent.click(screen.getByRole("button", { name: "Ver cliente" }));
		await screen.findByText("Cliente");
		clickBackdrop("drawer-overlay");
		await waitFor(() => expect(screen.queryByText("Cliente")).toBeNull());
		expect(screen.getByText("Contrato")).toBeTruthy();
		clickBackdrop("drawer-overlay");
		await waitFor(() => expect(screen.queryByText("Contrato")).toBeNull());
	});
	it("closes on its backdrop", async () => {
		render(<Fixture />);
		clickBackdrop("drawer-overlay");
		await waitFor(() => expect(screen.queryByText("Resumo")).toBeNull());
	});
	it.each([false, true])(
		"preserves summary while editing and dismissing a modal (nested=%s)",
		async (nested) => {
			render(<Fixture nested={nested} />);
			if (nested) {
				fireEvent.click(screen.getByRole("button", { name: "Anexar" }));
			} else {
				fireEvent.click(screen.getByRole("button", { name: "Ações" }));
				fireEvent.click(
					await screen.findByRole("menuitem", { name: "Editar" }),
				);
			}
			const input = await screen.findByRole("textbox", { name: "Nome" });
			input.focus();
			fireEvent.change(input, { target: { value: "Maria" } });
			expect(document.activeElement).toBe(input);
			expect(screen.getByText("Resumo")).toBeTruthy();
			fireEvent.keyDown(input, { key: "Escape" });
			await waitFor(() => expect(screen.queryByRole("textbox")).toBeNull());
			expect(screen.getByText("Resumo")).toBeTruthy();
			clickBackdrop("drawer-overlay");
			await waitFor(() => expect(screen.queryByText("Resumo")).toBeNull());
		},
	);
	it("preserves summary when cancelling deletion from actions", async () => {
		render(<Fixture />);
		fireEvent.click(screen.getByRole("button", { name: "Ações" }));
		fireEvent.click(await screen.findByRole("menuitem", { name: "Excluir" }));
		fireEvent.click(await screen.findByRole("button", { name: "Cancelar" }));
		expect(screen.getByText("Resumo")).toBeTruthy();
		clickBackdrop("drawer-overlay");
		await waitFor(() => expect(screen.queryByText("Resumo")).toBeNull());
	});
});
