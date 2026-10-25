// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { type ReactNode, useEffect } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../wrapper", () => ({
	Wrapper: ({
		children,
		title,
		actions,
	}: {
		children: ReactNode;
		title: string;
		actions?: ReactNode;
	}) => (
		<main>
			<header>{actions}</header>
			<h1>{title}</h1>
			{children}
		</main>
	),
	WrapperBody: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

import { EntityWorkspace, EntityWorkspaceHistory } from "../entity-workspace";

function History({ onMount }: { onMount: () => void }) {
	useEffect(onMount, [onMount]);
	return <p>Histórico carregado</p>;
}
afterEach(cleanup);
describe("record workspace presentation", () => {
	it("groups creation/update metadata with history without repeating lifecycle state", () => {
		render(
			<EntityWorkspaceHistory createdAt="2026-10-25T12:00:00Z" updatedAt={null}>
				<p>Eventos autorizados</p>
			</EntityWorkspaceHistory>,
		);
		expect(screen.getByText("Criado em")).toBeTruthy();
		expect(screen.getByText("Atualizado em")).toBeTruthy();
		expect(screen.getByText("Eventos autorizados")).toBeTruthy();
		expect(screen.queryByText("Situação")).toBeNull();
	});
	it("mounts selected content only and delegates tab changes", () => {
		const mounted = vi.fn();
		const onTabChange = vi.fn();
		const props = {
			title: "Cliente",
			identity: "Maria",
			returnLink: <a href="/clientes?page=3">Voltar para clientes</a>,
			onTabChange,
			sections: [
				{
					value: "overview",
					label: "Visão geral",
					content: <p>Dados do cliente</p>,
				},
				{
					value: "history",
					label: "Histórico",
					content: <History onMount={mounted} />,
				},
			],
		};
		const { rerender } = render(<EntityWorkspace {...props} tab="overview" />);
		expect(screen.getByText("Dados do cliente")).toBeTruthy();
		expect(mounted).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole("tab", { name: "Histórico" }));
		expect(onTabChange).toHaveBeenCalledWith("history");
		rerender(<EntityWorkspace {...props} tab="history" />);
		expect(mounted).toHaveBeenCalledTimes(1);
		expect(screen.queryByText("Dados do cliente")).toBeNull();
		expect(
			screen
				.getByRole("link", { name: "Voltar para clientes" })
				.getAttribute("href"),
		).toBe("/clientes?page=3");
		expect(screen.queryByRole("dialog")).toBeNull();
	});
	it("shows only supplied lifecycle actions and keeps their callbacks distinct", () => {
		const onEdit = vi.fn();
		const onDelete = vi.fn();
		render(
			<EntityWorkspace
				title="Despesa"
				identity="Aluguel"
				tab="overview"
				onTabChange={vi.fn()}
				returnLink={<a href="/despesas">Voltar para despesas</a>}
				sections={[]}
				onEdit={onEdit}
				onDelete={onDelete}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Editar" }));
		expect(
			screen.getByRole("button", { name: "Editar" }).closest("header"),
		).toBeTruthy();
		expect(
			screen
				.getByRole("button", { name: "Editar" })
				.closest('[data-slot="workspace-header"]'),
		).toBeNull();
		expect(onEdit).toHaveBeenCalledOnce();
		expect(onDelete).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
		expect(onDelete).toHaveBeenCalledOnce();
		expect(screen.queryByRole("button", { name: "Restaurar" })).toBeNull();
	});
	it("renders read-only audit records without lifecycle controls", () => {
		render(
			<EntityWorkspace
				title="Registro de auditoria"
				identity="Alteração"
				tab="overview"
				onTabChange={vi.fn()}
				returnLink={<a href="/auditoria">Voltar para auditoria</a>}
				sections={[]}
			/>,
		);
		expect(
			screen.getByRole("heading", { name: "Registro de auditoria" }),
		).toBeTruthy();
		expect(screen.queryByRole("button")).toBeNull();
	});
});
