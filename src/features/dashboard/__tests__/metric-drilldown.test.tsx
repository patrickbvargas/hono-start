// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { DashboardMetricCards } from "../components/metric-cards";
import type { DashboardMetric } from "../schemas/model";

afterEach(cleanup);

const metric: DashboardMetric = {
	drilldown: "revenue",
	label: "Receita recebida",
	value: 150,
	formattedValue: "R$ 150,00",
	description: "Recebimentos no período.",
	tone: "success",
	previousLabel: "Período anterior",
	currentValue: 150,
	previousValue: 100,
	formattedCurrentValue: "R$ 150,00",
	formattedPreviousValue: "R$ 100,00",
	previousPeriodLabel: "2025",
	changePercent: 50,
};

it("opens the metric selection while help and comparison controls remain independent", () => {
	const select = vi.fn();
	render(<DashboardMetricCards metrics={[metric]} onSelect={select} />);
	fireEvent.click(
		screen.getByRole("button", { name: "Sobre Receita recebida" }),
	);
	fireEvent.click(
		screen.getByRole("button", { name: "Comparação de Receita recebida" }),
	);
	expect(select).not.toHaveBeenCalled();
	const trigger = screen.getByRole("button", {
		name: "Detalhar Receita recebida",
	});
	fireEvent.click(trigger);
	expect(select).toHaveBeenCalledExactlyOnceWith(metric, trigger);
});

it("does not add an activation control without a configured source", () => {
	render(
		<DashboardMetricCards
			metrics={[{ ...metric, drilldown: undefined }]}
			onSelect={vi.fn()}
		/>,
	);
	expect(
		screen.queryByRole("button", { name: "Detalhar Receita recebida" }),
	).toBeNull();
});
