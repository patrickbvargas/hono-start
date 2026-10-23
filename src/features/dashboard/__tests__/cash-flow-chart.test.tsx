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
	};
});

vi.mock("recharts", async () => {
	const actual = await vi.importActual<typeof import("recharts")>("recharts");
	return {
		...actual,
		BarChart: ({
			children,
			data,
		}: {
			children: ReactNode;
			data: unknown[];
		}) => (
			<div data-testid="bar-chart" data-items={JSON.stringify(data)}>
				{children}
			</div>
		),
		Bar: ({
			dataKey,
			fill,
			stroke,
		}: {
			dataKey: string;
			fill: string;
			stroke: string;
		}) => (
			<div
				data-testid="balance-bar"
				data-key={dataKey}
				data-fill={fill}
				data-stroke={stroke}
			/>
		),
		CartesianGrid: () => null,
		ReferenceLine: () => null,
		XAxis: () => null,
		YAxis: ({
			hide,
			tickFormatter,
		}: {
			hide?: boolean;
			tickFormatter: (value: number) => string;
		}) =>
			hide ? null : <div data-testid="currency-axis">{tickFormatter(0)}</div>,
	};
});

import { DashboardCashFlowChart } from "../components/cash-flow-chart";

describe("DashboardCashFlowChart", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders chart inside shared Card wrapper", () => {
		render(
			<DashboardCashFlowChart
				items={[
					{ month: "2026-01", entry: 300, output: 60, balance: 240 },
					{ month: "2026-02", entry: 0, output: 80, balance: -80 },
				]}
			/>,
		);

		expect(screen.getByText("Saldo mensal")).toBeTruthy();
		expect(screen.queryByTestId("currency-axis")).toBeNull();
		expect(screen.queryByText("Jan/2026 a Mar/2026")).toBeNull();
		expect(screen.getByTestId("chart-container")).toBeTruthy();
		expect(
			JSON.parse(screen.getByTestId("bar-chart").dataset.items ?? "[]"),
		).toEqual([
			{ month: "2026-01", entry: 300, output: 60, balance: 240 },
			{ month: "2026-02", entry: 0, output: 80, balance: -80 },
		]);
		const area = screen.getByTestId("balance-bar");
		expect(area.dataset.key).toBe("balance");
		expect(area.dataset.fill).toBe("var(--color-balance)");
		expect(area.dataset.stroke).toBe("var(--color-balance)");
	});

	it("renders explicit empty state in pt-BR when all values are zero", () => {
		render(
			<DashboardCashFlowChart
				items={[
					{ month: "2026-01", entry: 0, output: 0, balance: 0 },
					{ month: "2026-02", entry: 0, output: 0, balance: 0 },
				]}
			/>,
		);

		expect(
			screen.getByText("Nenhum valor encontrado para os filtros selecionados."),
		).toBeTruthy();
	});
});
