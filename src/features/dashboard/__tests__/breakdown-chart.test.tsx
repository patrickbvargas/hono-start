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

vi.mock("recharts", async () => {
	const actual = await vi.importActual<typeof import("recharts")>("recharts");
	return {
		...actual,
		PieChart: ({ children }: { children: ReactNode }) => <svg>{children}</svg>,
		Pie: ({ children }: { children: ReactNode }) => <g>{children}</g>,
		LabelList: ({
			dataKey,
			position,
		}: {
			dataKey: string;
			position: string;
		}) => (
			<g
				data-testid="percentage-labels"
				data-key={dataKey}
				data-position={position}
			/>
		),
		Label: ({
			content,
		}: {
			content: (props: { viewBox: { cx: number; cy: number } }) => ReactNode;
		}) => <g>{content({ viewBox: { cx: 100, cy: 100 } })}</g>,
	};
});

import { DashboardBreakdownChart } from "../components/breakdown-chart";

describe("DashboardBreakdownChart", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders legal-area chart without the redundant breakdown list", () => {
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
		expect(screen.getByTestId("chart-container")).toBeTruthy();
		expect(screen.queryByText("75%")).toBeNull();
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
		expect(screen.queryByText("Mensal")).toBeNull();
		expect(screen.queryByText("Êxito")).toBeNull();
		expect(screen.queryByText("25%")).toBeNull();
		expect(screen.getByText(/400,00/)).toBeTruthy();
		expect(screen.getByText("Total recebido")).toBeTruthy();
		expect(screen.getByTestId("percentage-labels").dataset.key).toBe(
			"percentage",
		);
		expect(screen.getByTestId("percentage-labels").dataset.position).toBe(
			"outside",
		);
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
