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
	ScrollArea: ({ children }: { children: ReactNode }) => <div>{children}</div>,
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

vi.mock("../components/cash-flow-chart", () => ({
	DashboardCashFlowChart: () => <div>Fluxo de caixa</div>,
}));

vi.mock("../components/cash-flow-table", () => ({
	DashboardCashFlowTable: ({ rows }: { rows: Array<{ month: string }> }) => (
		<div data-testid="dashboard-cash-flow-table">{rows.length} meses fluxo</div>
	),
}));

vi.mock("../components/metric-cards", () => ({
	DashboardMetricCards: ({
		metrics,
	}: {
		metrics: Array<{ label: string }>;
	}) => (
		<div data-testid="dashboard-metric-cards">
			{metrics.map((metric) => metric.label).join(" | ")} / {metrics.length}{" "}
			cards
		</div>
	),
}));

vi.mock("../components/overdue-installments-table", () => ({
	DashboardOverdueInstallmentsTable: ({
		rows,
	}: {
		rows: Array<{ installmentNumber: number }>;
	}) => (
		<div data-testid="dashboard-overdue-installments-table">
			{rows.length} linhas atraso
		</div>
	),
}));

vi.mock("../components/financial-evolution", () => ({
	FinancialEvolutionChart: () => <div>Evolução financeira</div>,
}));

vi.mock("../components/remuneration-table", () => ({
	DashboardRemunerationTable: ({
		months,
		rows,
		subtotal,
	}: {
		months: Array<{ key: string; label: string }>;
		rows: Array<{ employeeId: number }>;
		subtotal: { total: number } | null;
	}) => (
		<div data-testid="dashboard-remuneration-table">
			{months.length} meses / {rows.length} linhas / subtotal{" "}
			{subtotal?.total ?? 0}
		</div>
	),
}));

import { Dashboard } from "../components/dashboard";

describe("Dashboard", () => {
	afterEach(() => {
		cleanup();
	});

	it("replaces recent activity with the remuneration table", () => {
		const { container } = render(
			<Dashboard
				data={{
					isAdmin: true,
					scopeLabel: "Visão da firma",
					metrics: [
						{
							label: "Saldo total",
							value: 240,
							formattedValue: "R$ 240,00",
							description: "Entradas menos saídas no período",
							tone: "default",
							previousLabel: "Período anterior",
							currentValue: 240,
							previousValue: 30,
							formattedCurrentValue: "R$ 240,00",
							formattedPreviousValue: "R$ 30,00",
							previousPeriodLabel: "01/01/2025 a 31/01/2025",
							changePercent: 700,
						},
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
					remunerationMonths: [{ key: "2026-01", label: "Jan/26" }],
					remunerationTable: [
						{
							employeeId: 10,
							employeeName: "Maria Silva",
							months: { "2026-01": 60 },
							total: 60,
							formattedTotal: "R$ 60,00",
						},
					],
					remunerationSubtotal: {
						label: "Subtotal",
						months: { "2026-01": 60 },
						total: 60,
						formattedTotal: "R$ 60,00",
					},
					overdueInstallments: [
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
					],
					financialEvolutionLabel: "Jan/2026 a Jan/2026",
					financialEvolution: [
						{
							month: "2026-01",
							revenue: 300,
							remuneration: 60,
						},
					],
					cashFlow: {
						totalBalance: 240,
						formattedTotalBalance: "R$ 240,00",
						chartLabel: "Jan/2026 a Jan/2026",
						chart: [{ month: "2026-01", entry: 300, output: 60, balance: 240 }],
						table: [
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
						],
					},
				}}
			/>,
		);

		expect(screen.queryByText("Atividade recente")).toBeNull();
		expect(screen.getByTestId("dashboard-metric-cards").textContent).toContain(
			"Saldo total | Receita prevista / 2 cards",
		);
		expect(
			screen.getByTestId("dashboard-remuneration-table").textContent,
		).toContain("1 meses / 1 linhas / subtotal 60");
		expect(
			screen.getByTestId("dashboard-overdue-installments-table").textContent,
		).toContain("1 linhas atraso");
		expect(screen.getByTestId("dashboard-metric-cards").textContent).toContain(
			"Saldo total",
		);
		expect(screen.getByText("Fluxo de caixa")).toBeTruthy();
		expect(
			screen.getByTestId("dashboard-cash-flow-table").textContent,
		).toContain("1 meses fluxo");
		expect(container.textContent?.indexOf("Saldo total")).toBeLessThan(
			container.textContent?.indexOf("Receita prevista") ??
				Number.POSITIVE_INFINITY,
		);
	});

	it("hides cash-flow surfaces for regular users", () => {
		render(
			<Dashboard
				data={{
					isAdmin: false,
					scopeLabel: "Minha visão",
					metrics: [],
					legalAreaRevenue: [],
					revenueTypeRevenue: [],
					remunerationMonths: [],
					remunerationTable: [],
					remunerationSubtotal: null,
					overdueInstallments: [],
					financialEvolutionLabel: "Jan/2026 a Jan/2026",
					financialEvolution: [],
					cashFlow: null,
				}}
			/>,
		);

		expect(screen.queryByText("Saldo total")).toBeNull();
		expect(screen.queryByText("Fluxo de caixa")).toBeNull();
		expect(screen.queryByTestId("dashboard-cash-flow-table")).toBeNull();
	});
});
