import { useCallback, useEffect, useRef } from "react";
import { useOverlay } from "@/shared/hooks/use-overlay";
import type { FinancialDrilldownSelection } from "../schemas/drilldown";
import type { BreakdownItem } from "../schemas/model";

export interface FinancialDrilldownTarget {
	selection: FinancialDrilldownSelection;
	title: string;
	expectedAmount: number;
}

export function useFinancialDrilldown() {
	const { overlay } = useOverlay<FinancialDrilldownTarget>();
	const detailsRef = useRef(overlay.details);
	useEffect(() => {
		detailsRef.current = overlay.details;
	}, [overlay.details]);

	const returnFocus = useRef<(() => HTMLElement | SVGElement | null) | null>(
		null,
	);

	const open = useCallback(
		(target: FinancialDrilldownTarget, source?: HTMLElement | SVGElement) => {
			const trigger =
				source ?? (document.activeElement as HTMLElement | SVGElement | null);
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

			detailsRef.current.open(target);
		},
		[],
	);

	const openBreakdown = useCallback(
		(
			kind: "aging" | "forecast" | "category",
			item: BreakdownItem,
			title: string,
			trigger?: SVGElement,
		) => {
			const selection: FinancialDrilldownSelection =
				kind === "category"
					? { kind: "category", value: item.value }
					: kind === "aging"
						? {
								kind: "aging",
								value: item.value as
									| "Até 30 dias"
									| "31–60 dias"
									| "61–90 dias"
									| "Acima de 90 dias",
							}
						: {
								kind: "forecast",
								value: item.value as
									| "Próximos 30 dias"
									| "31–60 dias"
									| "61–90 dias",
							};

			return open(
				{
					selection,
					title: `${title} · ${item.label}`,
					expectedAmount: item.total,
				},
				trigger,
			);
		},
		[open],
	);

	return { openBreakdown, open, details: overlay.details, returnFocus };
}
