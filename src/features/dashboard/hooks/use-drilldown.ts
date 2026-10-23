import { useRef } from "react";
import { useOverlay } from "@/shared/hooks/use-overlay";
import {
	type DashboardDrilldownSelection,
	dashboardDrilldownSelectionSchema,
} from "../schemas/drilldown";
import type { DashboardBreakdownItem } from "../schemas/model";

export interface DashboardDrilldownTarget {
	selection: DashboardDrilldownSelection;
	title: string;
	expectedAmount: number;
}

export function useDashboardDrilldown() {
	const { overlay } = useOverlay<DashboardDrilldownTarget>();
	const returnFocus = useRef<(() => HTMLElement | SVGElement | null) | null>(
		null,
	);
	const open = (
		target: DashboardDrilldownTarget,
		source?: HTMLElement | SVGElement,
	) => {
		const trigger = source ?? document.activeElement;
		const chartId = trigger
			?.closest("[data-chart]")
			?.getAttribute("data-chart");
		const label = trigger?.getAttribute("aria-label");
		const index = trigger?.getAttribute("data-drilldown-index");
		returnFocus.current = () => {
			if (trigger instanceof HTMLElement || trigger instanceof SVGElement) {
				if (trigger.isConnected) {
					return trigger;
				}
			}
			if (chartId && label) {
				return document.querySelector<SVGElement>(
					`[data-chart="${CSS.escape(chartId)}"] [aria-label="${CSS.escape(label)}"]${index ? `[data-drilldown-index="${CSS.escape(index)}"]` : ""}`,
				);
			}
			return null;
		};
		overlay.details.open(target);
	};
	const openBreakdown = (
		kind: Exclude<DashboardDrilldownSelection["kind"], "monthly" | "metric">,
		item: DashboardBreakdownItem,
		title: string,
		trigger?: SVGElement,
	) =>
		open(
			{
				selection: dashboardDrilldownSelectionSchema.parse({
					kind,
					value: item.value,
				}),
				title: `${title} · ${item.label}`,
				expectedAmount: item.total,
			},
			trigger,
		);
	return { openBreakdown, open, details: overlay.details, returnFocus };
}
