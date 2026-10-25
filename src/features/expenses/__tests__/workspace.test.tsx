// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { OverlayState } from "@/shared/types/overlay";

const state = vi.hoisted(() => ({ deleted: false }));
vi.mock("@tanstack/react-router", () => ({
	Link: ({ children }: { children: ReactNode }) => (
		<a href="/despesas">{children}</a>
	),
}));
vi.mock("@/shared/components/wrapper", () => ({
	Wrapper: ({
		children,
		actions,
	}: {
		children: ReactNode;
		actions?: ReactNode;
	}) => (
		<main>
			<header>{actions}</header>
			{children}
		</main>
	),
	WrapperBody: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/features/attachments", () => ({
	AttachmentSection: () => <p>Arquivos da despesa</p>,
}));
vi.mock("@/features/audit-logs", () => ({
	EntityAuditHistory: () => <p>Histórico da despesa</p>,
}));
vi.mock("../components/details/overview", () => ({
	ExpenseOverview: () => <p>Dados da despesa</p>,
}));
vi.mock("../hooks/use-workspace", async () => {
	const { useOverlay } = await import("@/shared/hooks/use-overlay");
	return {
		useExpenseWorkspace: () => ({
			...useOverlay<number>(),
			expense: {
				id: 42,
				category: "Aluguel",
				amount: 1500,
				isActive: true,
				isSoftDeleted: state.deleted,
			},
			canEdit: !state.deleted,
			canDelete: !state.deleted,
			canRestore: state.deleted,
		}),
	};
});
vi.mock("../components/delete", () => ({
	ExpenseDelete: ({
		id,
		state: overlay,
		onSuccess,
	}: {
		id: number;
		state: OverlayState;
		onSuccess: () => void;
	}) => (
		<div role="dialog" aria-label={`Excluir despesa ${id}`}>
			<button onClick={onSuccess}>Confirmar exclusão</button>
			<button onClick={overlay.close}>Cancelar</button>
		</div>
	),
}));
vi.mock("../components/form", () => ({
	ExpenseForm: ({ id, onSuccess }: { id: number; onSuccess: () => void }) => (
		<div role="dialog" aria-label={`Editar despesa ${id}`}>
			<button onClick={onSuccess}>Salvar</button>
		</div>
	),
}));
vi.mock("../components/restore", () => ({
	ExpenseRestore: ({
		id,
		onSuccess,
	}: {
		id: number;
		onSuccess: () => void;
	}) => (
		<div role="dialog" aria-label={`Restaurar despesa ${id}`}>
			<button onClick={onSuccess}>Confirmar restauração</button>
		</div>
	),
}));

import { ExpenseWorkspace } from "../components/workspace";

beforeEach(() => {
	state.deleted = false;
});
afterEach(cleanup);
describe("expense page lifecycle composition", () => {
	it("keeps the page on cancel and returns only after confirmed successful deletion", () => {
		const onDeleted = vi.fn();
		render(
			<ExpenseWorkspace
				id={42}
				search={{ tab: "overview" }}
				onDeleted={onDeleted}
				onTabChange={vi.fn()}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
		expect(
			screen.getByRole("dialog", { name: "Excluir despesa 42" }),
		).toBeTruthy();
		expect(onDeleted).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
		expect(screen.queryByRole("dialog")).toBeNull();
		expect(screen.getByText("Dados da despesa")).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
		fireEvent.click(screen.getByRole("button", { name: "Confirmar exclusão" }));
		expect(onDeleted).toHaveBeenCalledOnce();
	});
	it("keeps edit and restore in existing overlays without leaving the page", () => {
		const onDeleted = vi.fn();
		const { rerender } = render(
			<ExpenseWorkspace
				id={42}
				search={{ tab: "overview" }}
				onDeleted={onDeleted}
				onTabChange={vi.fn()}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Editar" }));
		expect(
			screen.getByRole("dialog", { name: "Editar despesa 42" }),
		).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
		expect(screen.queryByRole("dialog")).toBeNull();
		state.deleted = true;
		rerender(
			<ExpenseWorkspace
				id={42}
				search={{ tab: "overview" }}
				onDeleted={onDeleted}
				onTabChange={vi.fn()}
			/>,
		);
		expect(screen.queryByRole("button", { name: "Editar" })).toBeNull();
		fireEvent.click(screen.getByRole("button", { name: "Restaurar" }));
		fireEvent.click(
			screen.getByRole("button", { name: "Confirmar restauração" }),
		);
		expect(screen.queryByRole("dialog")).toBeNull();
		expect(onDeleted).not.toHaveBeenCalled();
	});
});
