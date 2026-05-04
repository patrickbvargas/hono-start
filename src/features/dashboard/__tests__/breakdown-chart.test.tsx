// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/components/ui", async () => {
	const actual = await vi.importActual<typeof import("@/shared/components/ui")>(
		"@/shared/components/ui",
	);

	return {
		...actual,
		ChartContainer: ({ children }: { children: ReactNode }) => (
			<div data-testid="chart-container">{children}</div>
		),
		ChartTooltip: () => null,
		ChartTooltipContent: () => null,
		ChartLegend: () => null,
		ChartLegendContent: () => null,
	};
});

import { DashboardBreakdownChart } from "../components/breakdown-chart";

describe("DashboardBreakdownChart", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders legal-area breakdown data with totals and percentages", () => {
		render(
			<DashboardBreakdownChart
				title="Receita por área"
				variant="bar"
				emptyLabel="Nenhuma receita recebida por área."
				items={[
					{
						label: "Previdenciário",
						value: "SOCIAL_SECURITY",
						total: 300,
						formattedTotal: "R$ 300,00",
						percentage: 75,
					},
					{
						label: "Cível",
						value: "CIVIL",
						total: 100,
						formattedTotal: "R$ 100,00",
						percentage: 25,
					},
				]}
			/>,
		);

		expect(screen.getByText("Receita por área")).toBeTruthy();
		expect(screen.getAllByText("Previdenciário").length).toBeGreaterThan(0);
		expect(screen.getAllByText("Cível").length).toBeGreaterThan(0);
		expect(screen.getByText("75% da receita recebida")).toBeTruthy();
		expect(screen.getByText("R$ 300,00")).toBeTruthy();
	});

	it("renders revenue-type donut breakdown data", () => {
		render(
			<DashboardBreakdownChart
				title="Receita por tipo"
				variant="donut"
				emptyLabel="Nenhuma receita recebida por tipo."
				items={[
					{
						label: "Mensal",
						value: "MONTHLY",
						total: 300,
						formattedTotal: "R$ 300,00",
						percentage: 75,
					},
					{
						label: "Êxito",
						value: "SUCCESS",
						total: 100,
						formattedTotal: "R$ 100,00",
						percentage: 25,
					},
				]}
			/>,
		);

		expect(screen.getByText("Receita por tipo")).toBeTruthy();
		expect(screen.getAllByText("Mensal").length).toBeGreaterThan(0);
		expect(screen.getAllByText("Êxito").length).toBeGreaterThan(0);
		expect(screen.getAllByText("25% da receita recebida").length).toBe(1);
	});

	it("renders empty state instead of chart when no breakdown data exists", () => {
		render(
			<DashboardBreakdownChart
				title="Receita por tipo"
				variant="donut"
				emptyLabel="Nenhuma receita recebida por tipo."
				items={[]}
			/>,
		);

		expect(screen.getByText("Nenhuma receita recebida por tipo.")).toBeTruthy();
		expect(screen.queryByTestId("chart-container")).toBeNull();
	});
});
