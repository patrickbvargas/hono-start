// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/components/data-table", () => ({
	DataTable: ({
		columns,
		data,
	}: {
		columns: Array<{ id?: string; header?: string }>;
		data: Array<unknown>;
	}) => (
		<div data-testid="data-table">
			<div>
				{columns.map((column) => column.header ?? column.id).join(" | ")}
			</div>
			<div>{data.length} linhas</div>
		</div>
	),
}));

vi.mock("@/shared/components/ui", () => ({
	Card: ({ children }: { children: ReactNode }) => (
		<div data-slot="card">{children}</div>
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
}));

import { DashboardRemunerationTable } from "../components/remuneration-table";

describe("DashboardRemunerationTable", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders table inside shared Card wrapper", () => {
		render(
			<DashboardRemunerationTable
				months={[
					{ key: "2026-01", label: "Jan/26" },
					{ key: "2026-02", label: "Fev/26" },
				]}
				rows={[
					{
						employeeId: 10,
						employeeName: "Maria Silva",
						months: {
							"2026-01": 60,
							"2026-02": 0,
						},
						total: 60,
						formattedTotal: "R$ 60,00",
					},
				]}
			/>,
		);

		expect(screen.getByText("Remunerações")).toBeTruthy();
		expect(
			screen.getByText("Remunerações").closest('[data-slot="card"]'),
		).toBeTruthy();
		expect(screen.getByTestId("data-table").textContent).toContain(
			"Colaborador | Jan/26 | Fev/26 | Total no período",
		);
	});

	it("renders explicit empty state in pt-BR when no rows exist", () => {
		render(<DashboardRemunerationTable months={[]} rows={[]} />);

		expect(
			screen.getByText(
				"Nenhuma remuneração encontrada para os filtros selecionados.",
			),
		).toBeTruthy();
		expect(screen.queryByTestId("data-table")).toBeNull();
	});
});
