import type { ChartConfig } from "@/shared/components/ui";

export const FINANCIAL_OVERVIEW_CHART_CONFIG = {
	entryRealized: {
		label: "Entradas realizadas",
		color: "var(--chart-1)",
	},
	entryProjected: {
		label: "Entradas previstas",
		color: "var(--chart-1)",
	},
	outputRealized: {
		label: "Saídas realizadas",
		color: "var(--chart-2)",
	},
	outputProjected: {
		label: "Saídas previstas",
		color: "var(--chart-2)",
	},
	balanceTotal: {
		label: "Saldo líquido",
		color: "var(--chart-3)",
		indicator: "line",
	},
} satisfies ChartConfig;

export const BREAKDOWN_CHART_CONFIG = {
	total: {
		label: "Valor",
		color: "var(--chart-2)",
	},
} satisfies ChartConfig;
