// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/components/ui", () => ({
	Badge: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	CardAction: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	CardContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	CardHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	Tooltip: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	TooltipContent: ({ children }: { children: ReactNode }) => (
		<div>{children}</div>
	),
	TooltipProvider: ({ children }: { children: ReactNode }) => (
		<div>{children}</div>
	),
	TooltipTrigger: ({ children }: { children: ReactNode }) => (
		<div>{children}</div>
	),
}));

vi.mock("../components/breakdown-chart", () => ({
	DashboardBreakdownChart: ({ title }: { title: string }) => <div>{title}</div>,
}));

vi.mock("../components/financial-evolution", () => ({
	FinancialEvolutionChart: () => <div>Evolução financeira</div>,
}));

vi.mock("../components/remuneration-table", () => ({
	DashboardRemunerationTable: ({
		months,
		rows,
	}: {
		months: Array<{ key: string; label: string }>;
		rows: Array<{ employeeId: number }>;
	}) => (
		<div data-testid="dashboard-remuneration-table">
			{months.length} meses / {rows.length} linhas
		</div>
	),
}));

import { Dashboard } from "../components";

describe("Dashboard", () => {
	afterEach(() => {
		cleanup();
	});

	it("replaces recent activity with the remuneration table", () => {
		render(
			<Dashboard
				data={{
					isAdmin: true,
					scopeLabel: "Visão da firma",
					metrics: [
						{
							label: "Receita prevista",
							value: 1000,
							formattedValue: "R$ 1.000,00",
							description: "Total planejado para recebimento no período",
							tone: "default",
							previousLabel: "Período anterior",
							currentValue: 1000,
							previousValue: 0,
							formattedCurrentValue: "R$ 1.000,00",
							formattedPreviousValue: "R$ 0,00",
							previousPeriodLabel: "01/01/2025 a 31/01/2025",
							changePercent: 100,
						},
					],
					legalAreaRevenue: [],
					revenueTypeRevenue: [],
					remunerationMonths: [{ key: "2026-01", label: "Jan/2026" }],
					remunerationTable: [
						{
							employeeId: 10,
							employeeName: "Maria Silva",
							months: { "2026-01": 60 },
							total: 60,
							formattedTotal: "R$ 60,00",
						},
					],
					financialEvolutionLabel: "Jan/2026 a Jan/2026",
					financialEvolution: [
						{
							month: "2026-01",
							revenue: 300,
							remuneration: 60,
						},
					],
				}}
			/>,
		);

		expect(screen.queryByText("Atividade recente")).toBeNull();
		expect(
			screen.getByTestId("dashboard-remuneration-table").textContent,
		).toContain("1 meses / 1 linhas");
	});
});
