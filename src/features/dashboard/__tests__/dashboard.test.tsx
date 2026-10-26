// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/components/ui", () => ({
	CardTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
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

vi.mock("../components/revenue-remuneration-breakdown-chart", () => ({
	RevenueRemunerationBreakdownChart: ({ title }: { title: string }) => (
		<div>{title}</div>
	),
}));

vi.mock("../components/drilldown/modal", () => ({
	DashboardDrilldownModal: () => <div>Detalhes financeiros</div>,
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

vi.mock("../components/overdue-table", () => ({
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

vi.mock("../components/financial-evolution-chart", () => ({
	FinancialEvolutionChart: () => <div>Resultado mensal</div>,
}));

vi.mock("../components/monthly-revenue-remuneration-chart", () => ({
	MonthlyRevenueRemunerationChart: () => <div>Resumo mensal</div>,
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

	it.each([true, false])(
		"keeps the standard charts visible with detailed analyses set to %s",
		(showDetails) => {
			const { container } = render(
				<Dashboard
					showDetails={showDetails}
					data={{
						isAdmin: true,
						analysis: {
							referenceLabel: "31/01/2026",
							overdueTotal: "R$ 0,00",
							aging: [],
							forecast: [],
							clients: [],
						},
						remunerationByAssignment: [],
						remunerationByCollaborator: [],
						visibility: {
							revenue: true,
							remuneration: true,
							expense: true,
							evolution: true,
						},
						scopeLabel: "Visão geral",
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
								label: "Honorários previstos",
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
								contractId: 1,
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
							chart: [
								{ month: "2026-01", entry: 300, output: 60, balance: 240 },
							],
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
			expect(screen.getByText("Resumo por área")).toBeTruthy();
			expect(screen.getByText("Resumo por tipo")).toBeTruthy();
			expect(screen.getByText("Resumo mensal")).toBeTruthy();
			expect(container.textContent?.indexOf("Resultado mensal")).toBeLessThan(
				container.textContent?.indexOf("Resumo mensal") ??
					Number.POSITIVE_INFINITY,
			);
			if (!showDetails) {
				expect(screen.queryByText("Remuneração por função")).toBeNull();
				expect(screen.queryByText("Honorários a receber")).toBeNull();
				expect(screen.queryByText("Honorários em atraso")).toBeNull();
				expect(screen.queryByText("Honorários por cliente")).toBeNull();
				expect(screen.queryByText("Despesas por categoria")).toBeNull();
				expect(screen.queryByTestId("dashboard-cash-flow-table")).toBeNull();
				expect(screen.queryByTestId("dashboard-remuneration-table")).toBeNull();
				expect(
					screen.queryByTestId("dashboard-overdue-installments-table"),
				).toBeNull();
				return;
			}
			const detailTitles = [
				"Remunerações por colaborador",
				"Remuneração por função",
				"Honorários em atraso",
				"Honorários a receber",
				"Honorários por cliente",
			];
			const positions = detailTitles.map(
				(title) => container.textContent?.indexOf(title) ?? -1,
			);
			expect(positions.every((position) => position >= 0)).toBe(true);
			expect(positions).toEqual([...positions].sort((a, b) => a - b));
			expect(
				screen.getByTestId("dashboard-metric-cards").textContent,
			).toContain("Saldo total | Honorários previstos / 2 cards");
			expect(
				screen.getByTestId("dashboard-remuneration-table").textContent,
			).toContain("1 meses / 1 linhas / subtotal 60");
			expect(
				screen.getByTestId("dashboard-overdue-installments-table").textContent,
			).toContain("1 linhas atraso");
			expect(
				screen.getByTestId("dashboard-metric-cards").textContent,
			).toContain("Saldo total");
			expect(screen.queryByText("Fluxo de caixa")).toBeNull();
			expect(screen.queryByText("Precisa de atenção")).toBeNull();
			expect(
				screen.getByTestId("dashboard-cash-flow-table").textContent,
			).toContain("1 meses fluxo");
			expect(container.textContent?.indexOf("Saldo total")).toBeLessThan(
				container.textContent?.indexOf("Honorários previstos") ??
					Number.POSITIVE_INFINITY,
			);
		},
	);

	it("shows expense breakdowns without dashboard-wide access", () => {
		render(
			<Dashboard
				showDetails
				data={{
					isAdmin: false,
					visibility: {
						revenue: false,
						remuneration: false,
						expense: true,
						evolution: false,
					},
					scopeLabel: "Minha visão",
					metrics: [],
					legalAreaRevenue: [],
					revenueTypeRevenue: [],
					expenseRevenue: [
						{
							label: "Folha",
							value: "PAYROLL",
							total: 80,
							formattedTotal: "R$ 80,00",
							percentage: 100,
						},
					],
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
		expect(screen.getByText("Despesas por categoria")).toBeTruthy();
		expect(screen.queryByText("Resumo mensal")).toBeNull();
		expect(screen.queryByText("Resultado mensal")).toBeNull();
	});

	it("hides cash-flow surfaces for regular users", () => {
		render(
			<Dashboard
				data={{
					isAdmin: false,
					visibility: {
						revenue: true,
						remuneration: true,
						expense: false,
						evolution: true,
					},
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
		expect(screen.queryByText("Resultado mensal")).toBeNull();
		expect(screen.getByText("Resumo mensal")).toBeTruthy();
	});
});

it.each([true, false])(
	"shows expense-only chart without depending on detailed preference (%s)",
	(showDetails) => {
		cleanup();
		render(
			<Dashboard
				showDetails={showDetails}
				data={{
					isAdmin: false,
					visibility: {
						expense: true,
						revenue: false,
						remuneration: false,
						evolution: false,
					},
					scopeLabel: "Despesas",
					metrics: [],
					legalAreaRevenue: [],
					revenueTypeRevenue: [],
					expenseRevenue: [],
					remunerationMonths: [],
					remunerationTable: [],
					remunerationSubtotal: null,
					overdueInstallments: [],
					financialEvolutionLabel: "",
					financialEvolution: [],
					cashFlow: null,
				}}
			/>,
		);
		expect(screen.getAllByText("Despesas por categoria")).toHaveLength(1);
	},
);
