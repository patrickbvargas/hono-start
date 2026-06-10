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

import { DashboardCashFlowChart } from "../components/cash-flow-chart";

describe("DashboardCashFlowChart", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders chart inside shared Card wrapper", () => {
		render(
			<DashboardCashFlowChart
				description="Jan/2026 a Mar/2026"
				items={[
					{ month: "2026-01", entry: 300, output: 60, balance: 240 },
					{ month: "2026-02", entry: 0, output: 80, balance: -80 },
				]}
			/>,
		);

		expect(screen.getByText("Fluxo de caixa")).toBeTruthy();
		expect(screen.getByText("Jan/2026 a Mar/2026")).toBeTruthy();
		expect(screen.getByTestId("chart-container")).toBeTruthy();
	});

	it("renders explicit empty state in pt-BR when all values are zero", () => {
		render(
			<DashboardCashFlowChart
				description="Jan/2026 a Fev/2026"
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
