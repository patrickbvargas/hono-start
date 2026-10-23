import type { ChartConfig } from "@/shared/components/ui";

export const CASH_FLOW_CHART_CONFIG = {
	balance: {
		label: "Saldo",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig;

export const FINANCIAL_EVOLUTION_CHART_CONFIG = {
	revenue: {
		label: "Receita",
		color: "var(--chart-1)",
	},
	remuneration: {
		label: "Remuneração",
		color: "var(--chart-2)",
	},
} satisfies ChartConfig;

export const BREAKDOWN_BAR_CHART_CONFIG = {
	total: {
		label: "Receita",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig;
