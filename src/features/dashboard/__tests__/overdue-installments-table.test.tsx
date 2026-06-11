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
					{columns.map((column) => column.header ?? column.id).join(" | ")}
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

import { DashboardOverdueInstallmentsTable } from "../components/overdue-installments-table";

describe("DashboardOverdueInstallmentsTable", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders overdue-installment review columns inside shared Card wrapper", () => {
		render(
			<DashboardOverdueInstallmentsTable
				rows={[
					{
						contractProcessNumber: "PROC-1",
						clientName: "Cliente 1",
						lawyerName: "Maria Silva",
						legalArea: "Previdenciário",
						revenueType: "Administrativo",
						installmentNumber: 3,
						dueDate: "2026-04-10T00:00:00.000Z",
						installmentAmount: 2000,
						formattedInstallmentAmount: "R$ 2.000,00",
						totalValue: 15000,
						formattedTotalValue: "R$ 15.000,00",
					},
				]}
			/>,
		);

		expect(screen.getByText("Parcelas em possível inadimplência")).toBeTruthy();
		expect(
			screen
				.getByText("Parcelas em possível inadimplência")
				.closest('[data-slot="card"]'),
		).toBeTruthy();
		expect(screen.getByTestId("data-table").textContent).toContain(
			"Processo | Cliente | Advogado | Área | Tipo receita | Parcela | Vencimento | Valor parcela | Valor total",
		);
	});

	it("renders explicit empty state in pt-BR when no overdue rows exist", () => {
		render(<DashboardOverdueInstallmentsTable rows={[]} />);

		expect(
			screen.getByText(
				"Nenhuma parcela em possível inadimplência encontrada para os filtros selecionados.",
			),
		).toBeTruthy();
		expect(screen.queryByTestId("data-table")).toBeNull();
	});
});
