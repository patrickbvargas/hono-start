// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DashboardBreakdownChart } from "../components/breakdown-chart";

vi.mock("../components/breakdown-chart/bar", () => ({
	BreakdownBarChart: () => <div>Gráfico horizontal</div>,
}));
vi.mock("../components/breakdown-chart/column", () => ({
	BreakdownColumnChart: () => <div>Gráfico vertical</div>,
}));
vi.mock("../components/breakdown-chart/donut", () => ({
	BreakdownDonutChart: () => <div>Gráfico rosca</div>,
}));

afterEach(cleanup);

describe("breakdown empty state", () => {
	it.each(["bar", "column", "donut"] as const)(
		"shows the empty message for zero-valued %s groups",
		(variant) => {
			render(
				<DashboardBreakdownChart
					title="Recebimentos futuros em aberto"
					variant={variant}
					emptyLabel="Sem parcelas futuras nos próximos 90 dias."
					items={[
						{
							label: "Até 30 dias",
							value: "30",
							total: 0,
							formattedTotal: "R$ 0,00",
							percentage: 0,
						},
					]}
				/>,
			);
			expect(
				screen.getByText("Sem parcelas futuras nos próximos 90 dias."),
			).toBeTruthy();
			expect(screen.queryByText(/^Gráfico /)).toBeNull();
		},
	);

	it("keeps nonzero groups even when their combined total is zero", () => {
		render(
			<DashboardBreakdownChart
				title="Receita por área"
				variant="column"
				emptyLabel="Sem dados."
				items={[100, -100].map((total, index) => ({
					label: `Área ${index}`,
					value: String(index),
					total,
					formattedTotal: String(total),
					percentage: 0,
				}))}
			/>,
		);
		expect(screen.getByText("Gráfico vertical")).toBeTruthy();
		expect(screen.queryByText("Sem dados.")).toBeNull();
	});
});
