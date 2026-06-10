// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/components/data-table", () => ({
	DataTable: ({
		columns,
		data,
		emptyMessage,
	}: {
		columns: Array<{ id?: string; header?: string }>;
		data: Array<unknown>;
		emptyMessage?: string;
	}) =>
		data.length > 0 ? (
			<div data-testid="data-table">
				<div>
					{columns.map((column) => (
						<span key={String(column.id ?? column.header)}>
							{column.header ?? column.id} |{" "}
						</span>
					))}
				</div>
				<div>{data.length} linhas</div>
			</div>
		) : (
			<div>{emptyMessage}</div>
		),
}));

vi.mock("@/shared/components/ui", () => ({
	Card: ({ children }: { children: ReactNode }) => (
		<div data-slot="card">{children}</div>
	),
	CardContent: ({ children }: { children: ReactNode }) => (
		<div data-slot="card-content">{children}</div>
	),
	CardHeader: ({ children }: { children: ReactNode }) => (
		<div data-slot="card-header">{children}</div>
	),
	CardTitle: ({ children }: { children: ReactNode }) => (
		<div data-slot="card-title">{children}</div>
	),
}));

import { DashboardCashFlowTable } from "../components/cash-flow-table";

describe("DashboardCashFlowTable", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders monthly cash-flow table columns", () => {
		render(
			<DashboardCashFlowTable
				rows={[
					{
						month: "2026-01",
						monthLabel: "Jan/26",
						administrative: 300,
						judicial: 0,
						succumbency: 0,
						entry: 300,
						remuneration: 60,
						expense: 0,
						output: 60,
						balance: 240,
					},
				]}
			/>,
		);

		expect(screen.getByText("Fluxo de caixa mensal")).toBeTruthy();
		expect(
			screen.getByText("Fluxo de caixa mensal").closest('[data-slot="card"]'),
		).toBeTruthy();
		expect(screen.getByTestId("data-table").textContent).toContain("Mês");
		expect(screen.getByText("Administrativo")).toBeTruthy();
		expect(screen.getByText("Judicial")).toBeTruthy();
		expect(screen.getByText("Sucumbência")).toBeTruthy();
		expect(screen.getByText("Entrada")).toBeTruthy();
		expect(screen.getByText("Remuneração")).toBeTruthy();
		expect(screen.getByText("Despesa")).toBeTruthy();
		expect(screen.getByText("Saída")).toBeTruthy();
		expect(screen.getByText("Saldo")).toBeTruthy();
	});

	it("renders explicit empty state in pt-BR when no rows exist", () => {
		render(<DashboardCashFlowTable rows={[]} />);

		expect(
			screen.getByText("Nenhum dado de fluxo de caixa encontrado."),
		).toBeTruthy();
		expect(screen.queryByTestId("data-table")).toBeNull();
	});
});
