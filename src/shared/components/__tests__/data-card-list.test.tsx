// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import type { KeyboardEvent, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/shared/components/ui", () => ({
	Card: ({
		children,
		onClick,
		onKeyDown,
		role,
		tabIndex,
	}: {
		children: ReactNode;
		onClick?: () => void;
		onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
		role?: string;
		tabIndex?: number;
	}) => (
		<div
			data-slot="card"
			role={role}
			tabIndex={tabIndex}
			onClick={onClick}
			onKeyDown={onKeyDown}
		>
			{children}
		</div>
	),
	CardAction: ({ children, ...props }: { children: ReactNode }) => (
		<div data-slot="card-action" {...props}>
			{children}
		</div>
	),
	CardContent: ({ children }: { children: ReactNode }) => (
		<div data-slot="card-content">{children}</div>
	),
	CardDescription: ({ children }: { children: ReactNode }) => (
		<div data-slot="card-description">{children}</div>
	),
	CardHeader: ({ children }: { children: ReactNode }) => (
		<div data-slot="card-header">{children}</div>
	),
	CardTitle: ({ children }: { children: ReactNode }) => (
		<div data-slot="card-title">{children}</div>
	),
	ScrollArea: ({ children }: { children: ReactNode }) => (
		<div data-slot="scroll-area">{children}</div>
	),
	Skeleton: () => <div data-slot="skeleton" />,
}));

import { DataCardList } from "../data-card-list";

describe("DataCardList", () => {
	it("renders the actionable empty slot and hides the empty pagination footer", () => {
		const clear = vi.fn();
		const { rerender } = render(
			<DataCardList
				data={[]}
				getRowKey={(_, index) => index}
				renderTitle={() => null}
				renderFields={() => []}
				emptyState={
					<button type="button" onClick={clear}>
						Limpar filtros
					</button>
				}
				footerContent={<div>Paginação vazia</div>}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
		expect(clear).toHaveBeenCalledOnce();
		expect(screen.queryByText("Nenhum registro encontrado.")).toBeNull();
		expect(screen.queryByText("Paginação vazia")).toBeNull();
		rerender(
			<DataCardList
				data={[{ id: 1 }]}
				getRowKey={(row) => row.id}
				renderTitle={() => "Registro"}
				renderFields={() => []}
				emptyState={<button type="button">Limpar filtros</button>}
			/>,
		);
		expect(screen.queryByRole("button", { name: "Limpar filtros" })).toBeNull();
	});
	it("renders card data and triggers the card action", () => {
		const onCardAction = vi.fn();

		render(
			<DataCardList
				data={[{ id: 7, name: "Cliente A", status: "Ativo" }]}
				getRowKey={(item) => item.id}
				renderTitle={(item) => item.name}
				renderDescription={(item) => `#${item.id}`}
				renderFields={(item) => [{ term: "Status", definition: item.status }]}
				onCardAction={onCardAction}
				footerContent={<div>Paginação</div>}
			/>,
		);

		fireEvent.click(screen.getByRole("button"));

		expect(screen.getByText("Cliente A")).toBeTruthy();
		expect(screen.getByText("#7")).toBeTruthy();
		expect(screen.getByText("Status")).toBeTruthy();
		expect(screen.getByText("Ativo")).toBeTruthy();
		expect(screen.getByText("Paginação")).toBeTruthy();
		expect(onCardAction).toHaveBeenCalledWith({
			id: 7,
			name: "Cliente A",
			status: "Ativo",
		});
	});

	it("renders the shared empty state message", () => {
		render(
			<DataCardList
				data={[]}
				getRowKey={(_, index) => index}
				renderTitle={() => null}
				renderFields={() => []}
			/>,
		);

		expect(screen.getByText("Nenhum registro encontrado.")).toBeTruthy();
	});
	it("keeps nested field actions separate from card navigation", () => {
		const navigate = vi.fn();
		const summary = vi.fn();
		render(
			<DataCardList
				data={[{ id: 1 }]}
				getRowKey={(row) => row.id}
				renderTitle={() => "Pendência"}
				renderFields={() => [
					{
						term: "Contrato",
						definition: (
							<button type="button" onClick={summary}>
								Ver contrato
							</button>
						),
					},
				]}
				onCardAction={navigate}
			/>,
		);
		const button = screen.getByRole("button", { name: "Ver contrato" });
		fireEvent.click(button);
		fireEvent.keyDown(button, { key: "Enter" });
		expect(summary).toHaveBeenCalledOnce();
		expect(navigate).not.toHaveBeenCalled();
	});
});
