import type { ChartConfig } from "@/shared/components/ui";
import type { DashboardBreakdownItem } from "../schemas/model";

export function getBreakdownColor(index: number) {
	const palette = [
		"var(--chart-1)",
		"var(--chart-2)",
		"var(--chart-3)",
		"var(--chart-4)",
		"var(--chart-5)",
	];

	return palette[index % palette.length] ?? "var(--chart-1)";
}

export function buildDonutChartConfig(
	items: DashboardBreakdownItem[],
): ChartConfig {
	return items.reduce<ChartConfig>((config, item, index) => {
		config[item.value] = {
			label: item.label,
			color: getBreakdownColor(index),
		};

		return config;
	}, {});
}
