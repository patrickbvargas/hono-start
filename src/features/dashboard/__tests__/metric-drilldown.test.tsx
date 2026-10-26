// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { DashboardMetricCards } from "../components/metric-cards";
import type { DashboardMetric } from "../schemas/model";

afterEach(cleanup);

const metric: DashboardMetric = {
	drilldown: "revenue",
	label: "Honorários recebidos",
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
		screen.getByRole("button", { name: "Sobre Honorários recebidos" }),
	);
	fireEvent.click(
		screen.getByRole("button", { name: "Comparação de Honorários recebidos" }),
	);
	expect(select).not.toHaveBeenCalled();
	const trigger = screen.getByRole("button", {
		name: "Detalhar Honorários recebidos",
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
		screen.queryByRole("button", { name: "Detalhar Honorários recebidos" }),
	).toBeNull();
});

it("keeps metric titles on one line with an ellipsis and preserves the full title", () => {
	render(<DashboardMetricCards metrics={[metric]} />);
	const label = screen.getByText(metric.label);
	expect(label.classList.contains("truncate")).toBe(true);
	expect(label.title).toBe(metric.label);
	expect(label.parentElement?.classList.contains("min-w-0")).toBe(true);
});
