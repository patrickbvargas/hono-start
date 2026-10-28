// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ButtonNew } from "../button-new";
import { ListEmptyState } from "../ui/list-empty-state";

const session = vi.hoisted(() => ({ permissions: [] as string[] }));
vi.mock("@/shared/session", () => ({
	useOptionalLoggedUserSession: () => session,
	hasPermission: (value: typeof session, permission: string) =>
		value.permissions.includes(permission),
}));

afterEach(cleanup);

const copy = {
	title: "Nenhum cliente disponível",
	description: "Os clientes disponíveis para consulta aparecerão aqui.",
};

describe("ListEmptyState", () => {
	it("offers only clearing when filters have no matches", () => {
		const clear = vi.fn();
		render(
			<ListEmptyState
				{...copy}
				hasFilters
				onClearFilters={clear}
				createAction={<button type="button">Novo cliente</button>}
			/>,
		);
		expect(
			screen.getByRole("heading", { name: "Nenhum resultado encontrado" }),
		).toBeTruthy();
		expect(screen.queryByRole("button", { name: "Novo cliente" })).toBeNull();
		fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
		expect(clear).toHaveBeenCalledOnce();
	});

	it("uses the existing create action and permission boundary", () => {
		const open = vi.fn();
		const content = () => (
			<ListEmptyState
				{...copy}
				hasFilters={false}
				onClearFilters={vi.fn()}
				createAction={
					<ButtonNew
						permission="org:clients:create"
						label="Novo cliente"
						onClick={open}
					/>
				}
			/>
		);
		session.permissions = [];
		const { rerender } = render(content());
		expect(screen.queryByRole("button")).toBeNull();
		session.permissions = ["org:clients:create"];
		rerender(content());
		fireEvent.click(screen.getByRole("button", { name: "Novo cliente" }));
		expect(open).toHaveBeenCalledOnce();
		expect(screen.queryByRole("button", { name: "Limpar filtros" })).toBeNull();
	});

	it("shows informative copy without an action for read-only collections", () => {
		render(
			<ListEmptyState
				title="Nenhuma pendência no momento"
				description="Não há pendências nos contratos disponíveis para você."
				hasFilters={false}
				onClearFilters={vi.fn()}
			/>,
		);
		expect(
			screen.getByRole("heading", { name: "Nenhuma pendência no momento" }),
		).toBeTruthy();
		expect(screen.queryByRole("button")).toBeNull();
	});

	it("recovers an empty page before offering clearing or creation", () => {
		const firstPage = vi.fn();
		const clear = vi.fn();
		render(
			<ListEmptyState
				{...copy}
				hasRecords
				hasFilters
				onFirstPage={firstPage}
				onClearFilters={clear}
				createAction={<button type="button">Novo cliente</button>}
			/>,
		);
		expect(
			screen.getByRole("heading", { name: "Nenhum registro nesta página" }),
		).toBeTruthy();
		fireEvent.click(
			screen.getByRole("button", { name: "Ir para a primeira página" }),
		);
		expect(firstPage).toHaveBeenCalledOnce();
		expect(clear).not.toHaveBeenCalled();
		expect(screen.queryByRole("button", { name: "Novo cliente" })).toBeNull();
	});
});
