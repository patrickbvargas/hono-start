// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { afterEach, expect, it, vi } from "vitest";

vi.mock("@/shared/components/ui", async () => {
	const actual = await vi.importActual<typeof import("@/shared/components/ui")>(
		"@/shared/components/ui",
	);
	return {
		...actual,
		ChartContainer: ({
			config,
			...props
		}: ComponentProps<"div"> & { config: unknown }) => (
			<div
				data-testid="chart"
				data-config={JSON.stringify(config)}
				{...props}
			/>
		),
		ChartTooltip: () => null,
		ChartTooltipContent: () => null,
		ChartLegend: () => null,
		ChartLegendContent: () => null,
	};
});
vi.mock("recharts", async () => {
	const actual = await vi.importActual<typeof import("recharts")>("recharts");
	const Chart = ({ children }: { children: ReactNode }) => (
		<div>{children}</div>
	);
	return {
		...actual,
		BarChart: Chart,
		ComposedChart: Chart,
		Bar: () => null,
		Line: () => null,
		LabelList: () => null,
		XAxis: () => null,
		YAxis: () => null,
	};
});

import { FinancialEvolutionChart } from "../components/financial-evolution-chart";
import { MonthlyRevenueRemunerationChart } from "../components/monthly-revenue-remuneration-chart";
import { RevenueRemunerationBreakdownChart } from "../components/revenue-remuneration-breakdown-chart";

afterEach(cleanup);

it.each([1, 6, 12])(
	"reserves readable category widths with shared horizontal scrolling for %i months",
	(count) => {
		const items = Array.from({ length: count }, (_, index) => ({
			month: `2026-${String(index + 1).padStart(2, "0")}`,
			revenue: 100,
			remuneration: 20,
			expense: 30,
			result: 70,
		}));
		render(
			<>
				<FinancialEvolutionChart items={items} />
				<MonthlyRevenueRemunerationChart items={items} isAdmin />
				<RevenueRemunerationBreakdownChart
					items={items.map((item) => ({
						label: item.month,
						value: item.month,
						formattedTotal: "100",
						percentage: 100 / count,
						total: item.revenue,
						remuneration: item.remuneration,
					}))}
					title="Areas"
					dimension="area"
					isAdmin
				/>
			</>,
		);
		const charts = screen.getAllByTestId("chart");
		expect(charts).toHaveLength(3);
		for (const chart of charts) {
			expect(chart.classList.contains("h-full")).toBe(true);
			expect(
				chart.closest('[data-slot="card"]')?.classList.contains("h-80"),
			).toBe(true);
			expect(chart.parentElement?.classList.contains("pb-5")).toBe(true);
			expect(chart.style.minWidth).toBe(`${count * 132 + 48}px`);
			const area = chart.closest('[data-slot="scroll-area"]');
			expect(
				area?.querySelector('[data-slot="scroll-area-viewport"]'),
			).toBeTruthy();
		}
		const configs = charts.map((chart) =>
			JSON.parse(chart.dataset.config ?? "{}"),
		);
		expect(configs[0].expense.color).toBe(configs[1].remuneration.color);
		expect(configs[0].expense.color).toBe(configs[2].remuneration.color);
	},
);
